'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { calculateAringMatch } from '@/lib/aringMatch';
import Image from 'next/image';

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
  if (top >= 40) return 'aring Match 40~59%';
  return 'aring Match 분석중';
}

function scoreRangeColor(top: number) {
  if (top >= 80) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (top >= 60) return 'bg-green-50 text-green-700 border-green-200';
  if (top >= 40) return 'bg-blue-50 text-blue-600 border-blue-200';
  return 'bg-gray-50 text-gray-400 border-gray-200';
}

function matchSummaryText(m: MatchSummary | null) {
  if (!m) return '아직 비슷한 후보를 찾지 못했어요';
  if (m.similar === 0 && m.reference === 0) return '아직 비슷한 후보를 찾지 못했어요';
  return '유사한 후보 ' + m.similar + '개 · 참고 후보 ' + m.reference + '개를 찾았어요';
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

  if (loading) return (
    <div className='min-h-screen bg-white flex items-center justify-center'>
      <div className='w-6 h-6 border-2 border-gray-300 border-t-aring-ink-900 rounded-full animate-spin' />
    </div>
  );

  if (listings.length === 0) return (
    <div className='min-h-screen bg-white'>
      <div className='px-5 lg:px-8 pt-5 lg:pt-8 pb-3'>
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
    </div>
  );

  return (
    <div className='min-h-screen bg-white'>
      {/* 타이틀 - comments 페이지와 동일한 구조 */}
      <div className='px-5 lg:px-8 pt-5 lg:pt-8 pb-3'>
        <h1 className='text-[22px] font-extrabold tracking-tight text-aring-ink-900'>내 귀걸이 매칭 현황</h1>
        <p className='text-sm text-aring-ink-400 mt-1'>귀걸이 매칭을 기다리는 나의 귀걸이 {listings.length}건</p>
      </div>

      {/* PC 테이블 - comments 페이지와 동일한 구조 */}
      <div className='hidden lg:block mt-2 mx-6 rounded-2xl bg-white shadow-card border border-aring-ink-100 overflow-hidden'>
        <div className='flex items-center gap-3 px-6 py-2.5 bg-aring-ink-50 border-b border-aring-ink-100 text-[11px] font-bold text-aring-ink-500 uppercase tracking-wide'>
          <div className='w-10 text-center flex-shrink-0'>No.</div>
          <div className='w-14 flex-shrink-0'>사진</div>
          <div className='w-28 flex-shrink-0'>브랜드명</div>
          <div className='w-16 flex-shrink-0'>상태</div>
          <div className='flex-1 min-w-0'>매칭 결과 요약</div>
          <div className='w-36 flex-shrink-0'>aring Match</div>
          <div className='w-10 flex-shrink-0 text-right'>조회</div>
        </div>
        {listings.map((item, idx) => {
          const m = matchMap[item.id] ?? null;
          return (
            <div key={item.id} onClick={() => router.push('/match/' + item.id)}
              className='flex items-center gap-3 px-6 py-3 hover:bg-aring-ink-50 transition-colors border-b border-aring-ink-100 last:border-b-0 cursor-pointer'>
              <div className='w-10 text-center flex-shrink-0 text-[11px] font-bold text-aring-ink-400'>{listings.length - idx}</div>
              <div className='w-14 flex-shrink-0'>
                <div className='relative w-12 h-12 rounded-xl overflow-hidden bg-aring-ink-100'>
                  {item.photo_url && <Image src={item.photo_url} alt={item.brand ?? ''} fill className='object-cover' />}
                </div>
              </div>
              <div className='w-28 flex-shrink-0 text-sm font-semibold text-aring-ink-900 truncate'>{item.brand ?? '브랜드 미상'}</div>
              <div className='w-16 flex-shrink-0'>
                <span className={'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ' + statusColor(item.status)}>
                  {statusLabel(item.status)}
                </span>
              </div>
              <div className='flex-1 min-w-0 text-sm text-aring-ink-600'>{matchSummaryText(m)}</div>
              <div className='w-36 flex-shrink-0'>
                {m && m.topScore > 0 ? (
                  <span className={'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ' + scoreRangeColor(m.topScore)}>
                    {scoreRange(m.topScore)}
                  </span>
                ) : (
                  <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-gray-50 text-gray-400 border-gray-200'>aring Match 분석중</span>
                )}
              </div>
              <div className='w-10 flex-shrink-0 text-right text-[11px] text-aring-ink-400'>{item.view_count ?? 0}</div>
            </div>
          );
        })}
      </div>

      {/* 모바일 카드 리스트 - comments 페이지와 동일한 구조 */}
      <div className='lg:hidden mt-2 mx-4 rounded-2xl bg-white shadow-card border border-aring-ink-100 overflow-hidden divide-y divide-aring-ink-100'>
        {listings.map((item, idx) => {
          const m = matchMap[item.id] ?? null;
          return (
            <div key={item.id} onClick={() => router.push('/match/' + item.id)}
              className='flex gap-3 px-4 py-3 hover:bg-aring-ink-50 transition-colors cursor-pointer active:bg-aring-ink-50'>
              <div className='relative w-16 h-16 rounded-xl overflow-hidden bg-aring-ink-100 flex-shrink-0'>
                {item.photo_url && <Image src={item.photo_url} alt={item.brand ?? ''} fill className='object-cover' />}
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-1.5 mb-0.5'>
                  <span className='text-[10px] font-bold text-aring-ink-400'>No.{listings.length - idx}</span>
                  <span className={'inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ' + statusColor(item.status)}>
                    {statusLabel(item.status)}
                  </span>
                </div>
                <p className='text-sm font-semibold text-aring-ink-900 truncate'>{item.brand ?? '브랜드 미상'}</p>
                <p className='text-xs text-aring-ink-500 mt-0.5 leading-snug'>{matchSummaryText(m)}</p>
                <div className='flex items-center gap-2 mt-1'>
                  {m && m.topScore > 0 ? (
                    <span className={'inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ' + scoreRangeColor(m.topScore)}>
                      {scoreRange(m.topScore)}
                    </span>
                  ) : (
                    <span className='inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold border bg-gray-50 text-gray-400 border-gray-200'>aring Match 분석중</span>
                  )}
                  <span className='text-[10px] text-aring-ink-400'>조회 {item.view_count ?? 0}</span>
                </div>
              </div>
              <div className='flex-shrink-0 self-center text-aring-ink-300'>
                <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><polyline points='9 18 15 12 9 6'/></svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}