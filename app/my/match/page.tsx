'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { calculateAringMatch } from '@/lib/aringMatch';
import { readLikedIds, writeLikedIds } from '@/lib/mock';
import Image from 'next/image';
import { TopNav, BottomNav } from '@/components/Nav';

const ANON_ID_KEY = 'aring_anon_user_id';
const PAGE_SIZE = 9;
const PAGE_STEP = 3;

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

interface CandidateItem {
  id: string;
  brand: string | null;
  photo_url: string;
  score: number;
  type: 'similar' | 'reference';
}

interface MatchData {
  similar: CandidateItem[];
  reference: CandidateItem[];
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

function refRangeText(refs: CandidateItem[]): string {
  if (refs.length === 0) return '';
  const min = Math.min(...refs.map((r) => r.score));
  const max = Math.max(...refs.map((r) => r.score));
  if (min === max) return `aring Match ${min}%`;
  return `aring Match ${min}~${max}%`;
}

function HeartButton({ itemId }: { itemId: string }) {
  const [liked, setLiked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLiked(readLikedIds().includes(itemId));
    setMounted(true);
  }, [itemId]);

  function toggle(e: React.MouseEvent) {
    e.stopPropagation();
    const ids = readLikedIds();
    const next = ids.includes(itemId) ? ids.filter((id) => id !== itemId) : [...ids, itemId];
    writeLikedIds(next);
    setLiked(next.includes(itemId));
  }

  const count = mounted && liked ? 1 : 0;

  return (
    <button
      onClick={toggle}
      aria-label='찜하기'
      className={[
        'inline-flex items-center gap-1 text-[12px] lg:text-[13px] font-semibold transition active:scale-95',
        liked ? 'text-aring-accent' : 'text-aring-ink-400 hover:text-aring-ink-600',
      ].join(' ')}
    >
      <svg className='w-3.5 h-3.5' viewBox='0 0 24 24' fill={liked ? 'currentColor' : 'none'} stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round'>
        <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' />
      </svg>
      <span suppressHydrationWarning>{count}</span>
    </button>
  );
}

function ViewCount({ value }: { value: number }) {
  return (
    <span className='inline-flex items-center gap-1 text-[12px] lg:text-[13px] font-semibold text-aring-ink-400'>
      <svg className='w-3.5 h-3.5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round'>
        <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
        <circle cx='12' cy='12' r='3' />
      </svg>
      {value}
    </span>
  );
}

export default function MyMatchPage() {
  const router = useRouter();
  const [listings, setListings] = useState<MyListing[]>([]);
  const [matchMap, setMatchMap] = useState<Record<string, MatchData>>({});
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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
          .select('id, brand, shape, detail, color, material, photo_url')
          .eq('status', 'open')
          .neq('user_id', userId)
          .limit(200);
        const candidates = allOpen ?? [];
        const map: Record<string, MatchData> = {};
        for (const item of items) {
          const src = { shape: item.shape ?? '', color: item.color ?? '', material: item.material ?? '', detail: item.detail ?? '', brand: item.brand };
          const scored: CandidateItem[] = [];
          for (const c of candidates) {
            const tgt = { shape: c.shape ?? '', color: c.color ?? '', material: c.material ?? '', detail: c.detail ?? '', brand: c.brand };
            const r = calculateAringMatch(src, tgt);
            scored.push({
              id: c.id,
              brand: c.brand,
              photo_url: c.photo_url,
              score: r.totalScore,
              type: r.totalScore >= 60 ? 'similar' : 'reference',
            });
          }
          scored.sort((a, b) => b.score - a.score);
          const similar = scored.filter((s) => s.type === 'similar');
          const reference = scored.filter((s) => s.type === 'reference');
          map[item.id] = { similar, reference };
          if (typeof window !== 'undefined') {
            // eslint-disable-next-line no-console
            console.log('[my/match] match computed', {
              itemId: item.id,
              brand: item.brand,
              candidates: candidates.length,
              scored: scored.length,
              similar: similar.length,
              reference: reference.length,
              topScores: scored.slice(0, 5).map((s) => s.score),
            });
          }
        }
        setMatchMap(map);
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <main className='min-h-screen flex justify-center bg-white'>
        <div className='relative w-full max-w-[440px] min-h-screen overflow-hidden sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible bg-white'>
          <div className='pb-28 lg:pb-10'>
            <TopNav />
            <div className='flex items-center justify-center py-32'>
              <div className='w-6 h-6 border-2 border-gray-300 border-t-aring-ink-900 rounded-full animate-spin' />
            </div>
          </div>
          <BottomNav active='my' />
        </div>
      </main>
    );
  }

  if (listings.length === 0) {
    return (
      <main className='min-h-screen flex justify-center bg-white'>
        <div className='relative w-full max-w-[440px] min-h-screen overflow-hidden sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible bg-white'>
          <div className='pb-28 lg:pb-10'>
            <TopNav />
            <div className='px-5 lg:px-8 pt-3 lg:pt-7 pb-3'>
              <h1 className='text-[24px] lg:text-[26px] font-bold tracking-tight text-aring-ink-900'>내 귀걸이 매칭 현황</h1>
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
          <BottomNav active='my' />
        </div>
      </main>
    );
  }

  const visibleListings = listings.slice(0, visibleCount);
  const hasMore = visibleCount < listings.length;

  return (
    <main className='min-h-screen flex justify-center bg-white'>
      <div className='relative w-full max-w-[440px] min-h-screen overflow-hidden sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible bg-white'>
        <div className='pb-28 lg:pb-10'>
          <TopNav />
          <div className='px-5 lg:px-8 pt-3 lg:pt-7 pb-3'>
            <h1 className='text-[24px] lg:text-[26px] font-bold tracking-tight text-aring-ink-900'>내 귀걸이 매칭 현황</h1>
            <p className='text-sm text-aring-ink-400 mt-1'>귀걸이 매칭을 기다리는 나의 귀걸이 {listings.length}건</p>
          </div>

          <div className='mt-4 px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-4'>
            {visibleListings.map((item, idx) => {
              const data = matchMap[item.id];
              const hasSimilar = !!data && data.similar.length > 0;

              return (
                <div
                  key={item.id}
                  onClick={() => router.push('/match/' + item.id)}
                  className='group rounded-2xl bg-white shadow-card border border-aring-ink-100 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col'
                >
                  <div className='relative aspect-square bg-aring-ink-100'>
                    {item.photo_url && (
                      <Image
                        src={item.photo_url}
                        alt={item.brand ?? ''}
                        fill
                        sizes='(min-width: 1024px) 33vw, 100vw'
                        className='object-cover'
                      />
                    )}
                    <div className='absolute top-3 left-3 flex items-center gap-1.5'>
                      <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[12px] lg:text-[13px] font-bold bg-white/90 backdrop-blur text-aring-ink-700 shadow-sm'>
                        No.{listings.length - idx}
                      </span>
                      <span className={'inline-flex items-center px-2 py-0.5 rounded-full text-[12px] lg:text-[13px] font-semibold border backdrop-blur ' + statusColor(item.status)}>
                        {statusLabel(item.status)}
                      </span>
                    </div>
                  </div>

                  <div className='p-4 flex-1 flex flex-col'>
                    <p className='text-[16px] font-bold text-aring-ink-900 truncate'>
                      {item.brand ?? '브랜드 미상'}
                    </p>

                    <p className={[
                      'mt-2 mb-3 text-[15px] lg:text-[15px] font-bold leading-relaxed',
                      hasSimilar ? 'text-aring-green' : 'text-aring-ink-700',
                    ].join(' ')}>
                      {hasSimilar
                        ? '딱 맞는 짝을 찾을 때까지 조금 더 기다려 볼까요?'
                        : '아직 딱 맞는 짝을 찾지 못했어요. 함께 기다려 볼까요?'}
                    </p>

                    <div className='mt-auto pt-3 border-t border-aring-ink-100'>
                      {data && data.reference.length > 0 && (
                        <div className='mb-3'>
                          <p className='text-[12px] lg:text-[13px] font-bold text-aring-ink-700'>
                            완전히 같진 않지만, 이런 후보도 있어요
                          </p>
                          <p className='mt-0.5 text-[15px] lg:text-[15px] leading-[1.5] text-aring-ink-400'>
                            참고 후보 {data.reference.length}개 · {refRangeText(data.reference)}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push('/match/' + item.id);
                            }}
                            className='mt-1 text-[15px] lg:text-[15px] font-semibold text-aring-green hover:underline'
                          >
                            자세히 보기 →
                          </button>
                        </div>
                      )}
                      {data && data.reference.length === 0 && data.similar.length === 0 && (
                        <p className='mb-3 text-[15px] lg:text-[15px] text-aring-ink-500 leading-relaxed'>
                          아직 등록된 다른 한 짝이 없어요.<br/>
                          새 귀걸이가 올라오는 대로 다시 분석해드릴게요.
                        </p>
                      )}
                      <div className='flex items-center gap-3'>
                        <HeartButton itemId={item.id} />
                        <ViewCount value={item.view_count ?? 0} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <div className='mt-6 px-4 lg:px-8 flex justify-center'>
              <button
                onClick={() => setVisibleCount((c) => Math.min(c + PAGE_STEP, listings.length))}
                className='inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-white border border-aring-ink-200 text-sm font-bold text-aring-ink-900 shadow-sm hover:bg-aring-ink-100 hover:shadow active:scale-95 transition-all'
              >
                더보기
                <span className='text-[15px] lg:text-[15px] font-semibold text-aring-ink-400'>
                  ({Math.min(PAGE_STEP, listings.length - visibleCount)}개 더)
                </span>
                <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                  <polyline points='6 9 12 15 18 9'/>
                </svg>
              </button>
            </div>
          )}
        </div>
        <BottomNav active='my' />
      </div>
    </main>
  );
}
