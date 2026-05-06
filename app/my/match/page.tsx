'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { calculateAringMatch } from '@/lib/aringMatch';
import Image from 'next/image';
import { TopNav, BottomNav } from '@/components/Nav';

const ANON_ID_KEY = 'aring_anon_user_id';

interface MyListing {
  id: string;
  brand: string | null;
  shape: string | null;
  detail: string | null;
  color: string | null;
  material: string | null;
  photo_url: string;
  status: 'open' | 'matched' | 'closed';
  view_count: number;
}

interface MatchSummary {
  similar: number;
  reference: number;
  topScore: number;
}

function statusLabel(s: string) {
  if (s === 'open') return '찾는 중';
  if (s === 'matched') return '매칭 완료';
  return '마감';
}

function statusColor(s: string) {
  if (s === 'open') return 'bg-green-50 text-green-700 border-green-200';
  if (s === 'matched') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-gray-50 text-gray-500 border-gray-200';
}

function scoreRange(top: number) {
  if (top >= 80) return 'aring Match 80~100%';
  if (top >= 60) return 'aring Match 60~79%';
  return 'aring Match 40~59%';
}

function scoreRangeColor(top: number) {
  if (top >= 80) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (top >= 60) return 'bg-green-50 text-green-700 border-green-200';
  return 'bg-blue-50 text-blue-600 border-blue-200';
}

function matchSummaryText(m: MatchSummary | null) {
  if (!m || (m.similar === 0 && m.reference === 0)) {
    return '아직 비슷한 후보를 찾지 못했어요. 함께 기다려 볼까요?';
  }
  return '유사한 후보 ' + m.similar + '개 · 참고 후보 ' + m.reference + '개를 찾았어요';
}

function AnalyzingBadge() {
  return (
    <span className='relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border border-purple-200 text-purple-700 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 overflow-hidden'>
      <span className='pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent' />
      <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' className='animate-spin' style={{ animationDuration: '1.6s' }}>
        <path d='M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83' />
      </svg>
      <span className='relative'>aring Match 분석중</span>
      <span className='relative inline-flex w-3 justify-start'>
        <span className='animate-pulse' style={{ animationDelay: '0ms' }}>.</span>
        <span className='animate-pulse' style={{ animationDelay: '200ms' }}>.</span>
        <span className='animate-pulse' style={{ animationDelay: '400ms' }}>.</span>
      </span>
    </span>
  );
}

export default function MyMatchPage() {
  const router = useRouter();
  const [listings, setListings] = useState<MyListing[]>([]);
  const [matchMap, setMatchMap] = useState<Record<string, MatchSummary>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const userId = session?.user?.id ?? localStorage.getItem(ANON_ID_KEY) ?? '';
      if (!userId) { setLoading(false); return; }
      const { data: myItems } = await supabase!
        .from('listings')
        .select('id, brand, shape, detail, color, material, photo_url, status, view_count')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      const items = (myItems ?? []) as MyListing[];
      if (items.length === 1) {
        router.replace('/match/' + items[0].id);
        return;
      }
      setListings(items);
      if (items.length > 0) {
        const { data: allOpen } = await supabase!
          .from('listings')
          .select('id, brand, shape, detail, color, material')
          .eq('status', 'open')
          .neq('user_id', userId)
          .limit(200);
        const candidates = allOpen ?? [];
        const map: Record<string, MatchSummary> = {};
        for (const item of items) {
          const src = { shape: item.shape ?? '', color: item.color ?? '', material: item.material ?? '', detail: item.detail ?? '', brand: item.brand };
          let sim = 0, ref = 0, top = 0;
          for (const c of candidates) {
            const tgt = { shape: c.shape ?? '', color: c.color ?? '', material: c.material ?? '', detail: c.detail ?? '', brand: c.brand };
            const r = calculateAringMatch(src, tgt);
            if (r.totalScore >= 40) {
              if (r.totalScore >= 60) sim++; else ref++;
              if (r.totalScore > top) top = r.totalScore;
            }
          }
          map[item.id] = { similar: sim, reference: ref, topScore: top };
        }
        setMatchMap(map);
      }
      setLoading(false);
    });
  }, [router]);

  let content: React.ReactNode;

  if (loading) {
    content = (
      <div className='flex items-center justify-center py-32'>
        <div className='w-6 h-6 border-2 border-gray-300 border-t-aring-ink-900 rounded-full animate-spin' />
      </div>
    );
  } else if (listings.length === 0) {
    content = (
      <>
        <div className='px-5 lg:px-8 pt-3 pb-2'>
          <h1 className='text-[22px] font-extrabold tracking-tight text-aring-ink-900'>내 귀걸이 매칭 현황</h1>
          <p className='text-sm text-aring-ink-400 mt-1'>귀걸이 매칭을 기다리는 나의 귀걸이 0건</p>
        </div>
        <div className='mx-4 lg:mx-8 mt-4 rounded-2xl bg-white shadow-card border border-aring-ink-100 flex flex-col items-center justify-center py-16 px-6 text-center'>
          <p className='text-base font-bold text-aring-ink-900 mb-1'>아직 매칭을 기다리는 귀걸이가 없어요</p>
          <p className='text-sm text-aring-ink-400 mb-6 leading-relaxed'>한 짝 남은 귀걸이를 등록하면<br/>비슷한 후보를 찾아볼 수 있어요</p>
          <button onClick={() => router.push('/register')} className='px-6 py-3 bg-aring-ink-900 text-white rounded-full text-sm font-semibold hover:bg-aring-ink-700 transition-colors'>
            귀걸이 등록하러 가기
          </button>
        </div>
      </>
    );
  } else {
    content = (
      <>
        <div className='px-5 lg:px-8 pt-3 pb-2'>
          <h1 className='text-[22px] font-extrabold tracking-tight text-aring-ink-900'>내 귀걸이 매칭 현황</h1>
          <p className='text-sm text-aring-ink-400 mt-1'>귀걸이 매칭을 기다리는 나의 귀걸이 {listings.length}건</p>
        </div>

        <div className='mt-4 px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-4'>
          {listings.map((item, idx) => {
            const m = matchMap[item.id] ?? null;
            const hasMatch = m && m.topScore >= 40;
            return (
              <div
                key={item.id}
                onClick={() => router.push('/match/' + item.id)}
                className='group rounded-2xl bg-white shadow-card border border-aring-ink-100 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all'
              >
                <div className='relative aspect-square bg-aring-ink-100'>
                  {item.photo_url && (
                    <Image
                      src={item.photo_url}
                      alt={item.brand ?? ''}
                      fill
                      sizes='(min-width: 1024px) 50vw, 100vw'
                      className='object-cover'
                    />
                  )}
                  <div className='absolute top-3 left-3 flex items-center gap-1.5'>
                    <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur text-aring-ink-700 shadow-sm'>
                      No.{listings.length - idx}
                    </span>
                    <span className={'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border backdrop-blur ' + statusColor(item.status)}>
                      {statusLabel(item.status)}
                    </span>
                  </div>
                  <div className='absolute bottom-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/40 text-white backdrop-blur'>
                    <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
                      <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'/>
                      <circle cx='12' cy='12' r='3'/>
                    </svg>
                    {item.view_count ?? 0}
                  </div>
                </div>

                <div className='p-4 lg:p-5'>
                  <p className='text-[15px] font-extrabold text-aring-ink-900 truncate'>
                    {item.brand ?? '브랜드 미상'}
                  </p>

                  <p className='mt-2 text-[13px] text-aring-ink-600 leading-relaxed'>
                    {matchSummaryText(m)}
                  </p>

                  <div className='mt-3 flex items-center justify-between gap-2'>
                    {hasMatch ? (
                      <span className={'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ' + scoreRangeColor(m!.topScore)}>
                        {scoreRange(m!.topScore)}
                      </span>
                    ) : (
                      <AnalyzingBadge />
                    )}
                    <span className='inline-flex items-center gap-0.5 text-[11px] font-semibold text-aring-ink-500 group-hover:text-aring-ink-900 transition-colors'>
                      자세히 보기
                      <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
                        <polyline points='9 18 15 12 9 6'/>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <main className='min-h-screen flex justify-center bg-white'>
      <div className='relative w-full max-w-[440px] min-h-screen overflow-hidden sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible bg-white'>
        <div className='pb-28 lg:pb-12'>
          <TopNav />
          {content}
        </div>
        <BottomNav active='my' />
      </div>
    </main>
  );
}
