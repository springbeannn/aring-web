'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { TopNav, BottomNav } from '@/components/Nav';
import { RecentItemCard } from '@/components/RecentItemCard';
import { useItemFilters, ItemFilterChips } from '@/components/ItemFilters';
import {
  recentItems as mockRecentItems,
  type RecentItem,
  type ThumbTone,
} from '@/lib/mock';
import { supabase, type Listing } from '@/lib/supabase';

// ─────────────────────────────────────────────────────────────
// /brands/[brand] — 브랜드별 한 짝 리스트
// /products와 동일한 구성, 상단 제목만 브랜드명으로 표시
// ─────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

const TONE_ROTATION: ThumbTone[] = [
  'pink', 'peach', 'butter', 'mint', 'sky', 'sage',
];

function listingToRecent(row: Listing, idx: number): RecentItem {
  return {
    id: row.id,
    brand: row.brand ?? '브랜드 미상',
    name: row.detail ?? row.shape ?? '한 짝',
    price: row.price ?? 0,
    likes: 0,
    side: row.side,
    emoji: '◇',
    tone: TONE_ROTATION[idx % TONE_ROTATION.length],
    story: row.story ?? undefined,
    image: row.photo_url,
  };
}

const IconArrowLeft = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

export default function BrandPage() {
  const params = useParams();
  const brandName = decodeURIComponent(params.brand as string);

  const [items, setItems] = useState<RecentItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { sort, setSort, side, setSide, price, setPrice, filtered: sortFiltered } = useItemFilters(items);

  // 브랜드 필터 적용
  const filtered = useMemo(() => {
    return sortFiltered.filter(item =>
      (item.brand ?? '').toLowerCase() === brandName.toLowerCase()
    );
  }, [sortFiltered, brandName]);

  // 첫 페이지 fetch — 브랜드로 직접 쿼리
  useEffect(() => {
    let cancelled = false;

    async function loadFirst() {
      setLoading(true);

      if (!supabase) {
        if (!cancelled) {
          setItems(mockRecentItems);
          setHasMore(false);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'open')
        .ilike('brand', brandName)
        .order('created_at', { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (cancelled) return;

      if (error) {
        console.error('[aring] brand fetch error', error);
        setError('상품을 불러오지 못했습니다');
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as Listing[];
      const fresh = rows.map((r, i) => listingToRecent(r, i));

      if (fresh.length === 0) {
        setItems([]);
        setHasMore(false);
      } else {
        setItems(fresh);
        setHasMore(rows.length === PAGE_SIZE);
      }

      setLoading(false);
    }

    loadFirst();
    return () => { cancelled = true; };
  }, [brandName]);

  async function loadMore() {
    if (!supabase || loading || !hasMore) return;
    setLoading(true);

    const nextPage = page + 1;
    const start = nextPage * PAGE_SIZE;

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'open')
      .ilike('brand', brandName)
      .order('created_at', { ascending: false })
      .range(start, start + PAGE_SIZE - 1);

    if (error) {
      console.error('[aring] brand loadMore error', error);
      setError('추가 데이터를 불러오지 못했습니다');
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as Listing[];
    const fresh = rows.map((r, i) => listingToRecent(r, start + i));

    setItems((prev) => [...prev, ...fresh]);
    setHasMore(rows.length === PAGE_SIZE);
    setPage(nextPage);
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div
        className="
          relative w-full max-w-[440px] bg-white overflow-hidden
          min-h-screen
          sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone
          lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible
        "
      >
        <div className="pb-28 lg:pb-12">
          <TopNav />

          {/* 페이지 헤더 — 제목만 브랜드명으로 */}
          <div className="px-5 lg:px-8 pt-3 lg:pt-7 pb-4 lg:pb-6 flex items-center gap-3">
            <Link
              href="/discover"
              aria-label="탐색으로"
              className="lg:hidden w-9 h-9 rounded-full bg-aring-ink-100 flex items-center justify-center text-aring-ink-900 active:scale-95 transition"
            >
              <IconArrowLeft />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-[22px] lg:text-[26px] font-extrabold tracking-tight text-aring-ink-900">
                {brandName}
              </h1>
              <p className="mt-0.5 text-[11px] text-aring-ink-500">
                {brandName} 브랜드 한 짝
                {filtered.length > 0 && (
                  <>
                    {' '}· <span className="font-semibold">{filtered.length}</span>개 등록
                  </>
                )}
              </p>
            </div>
          </div>

          {/* 필터 */}
          <ItemFilterChips
            sort={sort}
            setSort={setSort}
            side={side}
            setSide={setSide}
            price={price}
            setPrice={setPrice}
          />

          {/* 본문 */}
          {loading && items.length === 0 ? (
            <div className="px-5 lg:px-8 py-16 text-center">
              <div className="w-8 h-8 mx-auto rounded-full border-2 border-aring-ink-100 border-t-aring-ink-900 animate-spin" />
              <p className="mt-3 text-[11px] text-aring-ink-500">불러오는 중…</p>
            </div>
          ) : error ? (
            <div className="px-5 lg:px-8 py-16 text-center">
              <p className="text-[13px] font-bold text-aring-ink-900">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex items-center justify-center px-5 py-2.5 rounded-pill bg-aring-ink-900 text-white text-[13px] font-extrabold"
              >
                다시 시도
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-5 lg:px-8 py-16 text-center">
              <p className="text-[13px] font-bold text-aring-ink-900">
                {brandName} 브랜드의 한 짝이 아직 없어요
              </p>
              <p className="mt-1 text-[11px] text-aring-ink-500">
                첫 번째로 등록해 보세요
              </p>
              <Link
                href="/register"
                className="mt-4 inline-flex items-center justify-center px-5 py-2.5 rounded-pill bg-aring-ink-900 text-white text-[13px] font-extrabold"
              >
                한 짝 등록하기
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 px-5 lg:px-8">
                {filtered.map((it) => (
                  <RecentItemCard key={it.id} it={it} />
                ))}
              </div>

              {hasMore && (
                <div className="px-5 lg:px-8 mt-6">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center h-12 rounded-pill bg-aring-ink-100 text-aring-ink-900 text-[13px] font-extrabold active:scale-[0.99] transition disabled:opacity-60"
                  >
                    {loading ? '불러오는 중…' : '더보기'}
                  </button>
                </div>
              )}

              {!hasMore && items.length > 0 && (
                <p className="mt-6 text-center text-[11px] text-aring-ink-500">
                  마지막 한 짝까지 모두 확인했어요
                </p>
              )}
            </>
          )}
        </div>

        <BottomNav />
      </div>
    </main>
  );
}