'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TopNav, BottomNav } from '@/components/Nav';
import { RecentItemCard } from '@/components/RecentItemCard';
import { useItemFilters, ItemFilterChips } from '@/components/ItemFilters';
import {
  recentItems as mockRecentItems,
  pickTone,
  type RecentItem,
} from '@/lib/mock';
import { supabase, type Listing } from '@/lib/supabase';

// ─────────────────────────────────────────────────────────────
// /products — 전체 한 짝 리스트 + 더보기 페이지네이션
// ─────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

function listingToRecent(row: Listing): RecentItem {
  return {
    id: row.id,
    brand: row.brand ?? '브랜드 미상',
    name: row.detail ?? row.shape ?? '한 짝',
    price: row.price ?? 0,
    likes: 0,
    side: row.side,
    emoji: '◇',
    tone: pickTone(row.id),
    story: row.story ?? undefined,
    image: row.photo_url,
  };
}

const IconArrowLeft = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// useSearchParams를 사용하는 내부 컴포넌트 (Suspense로 감싸기 위해 분리)
// ─────────────────────────────────────────────────────────────
function ProductsContent() {
  const searchParams = useSearchParams();
  const brandFilter = searchParams.get('brand') ?? '';

  const [items, setItems] = useState<RecentItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { sort, setSort, side, setSide, price, setPrice, filtered: sortFiltered } = useItemFilters(items);

  const filtered = useMemo(() => {
    if (!brandFilter) return sortFiltered;
    return sortFiltered.filter(item =>
      (item.brand ?? '').toLowerCase().includes(brandFilter.toLowerCase())
    );
  }, [sortFiltered, brandFilter]);

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

      const orderCol = sort === 'view_count' ? 'view_count' : 'created_at';
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'open')
        .order(orderCol, { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (cancelled) return;

      if (error) {
        console.error('[aring] products fetch error', error);
        setError('상품을 불러오지 못했습니다');
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as Listing[];
      const fresh = rows.map((r) => listingToRecent(r));

      if (fresh.length === 0) {
        setItems(mockRecentItems);
        setHasMore(false);
      } else {
        setItems(fresh);
        setHasMore(rows.length === PAGE_SIZE);
      }

      setLoading(false);
    }

    loadFirst();
    return () => { cancelled = true; };
  }, [sort]);

  async function loadMore() {
    if (!supabase || loading || !hasMore) return;
    setLoading(true);

    const nextPage = page + 1;
    const start = nextPage * PAGE_SIZE;

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .range(start, start + PAGE_SIZE - 1);

    if (error) {
      console.error('[aring] products loadMore error', error);
      setError('추가 데이터를 불러오지 못했습니다');
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as Listing[];
    const fresh = rows.map((r) => listingToRecent(r));

    setItems((prev) => [...prev, ...fresh]);
    setHasMore(rows.length === PAGE_SIZE);
    setPage(nextPage);
    setLoading(false);
  }

  const pageTitle = brandFilter || '전체 한 짝';
  const pageDesc = brandFilter
    ? `${brandFilter} 브랜드 한 짝`
    : '지금 매칭을 기다리는 모든 한 짝';

  return (
    <div className="pb-28 lg:pb-10">
      <TopNav />

      <div className="px-5 lg:px-8 pt-3 lg:pt-7 pb-4 lg:pb-6 flex items-center gap-3">
        <Link
          href="/"
          aria-label="홈으로"
          className="lg:hidden w-9 h-9 rounded-full bg-aring-ink-100 flex items-center justify-center text-aring-ink-900 active:scale-95 transition"
        >
          <IconArrowLeft />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-[24px] lg:text-[26px] font-bold tracking-tight text-aring-ink-900">
            {pageTitle}
          </h1>
          <p className="mt-0.5 text-[15px] lg:text-[15px] leading-[1.5] text-aring-ink-500">
            {pageDesc}
            {filtered.length > 0 && (
              <> · <span className="font-semibold">{filtered.length}</span>개 등록</>
            )}
          </p>
        </div>
      </div>

      <ItemFilterChips sort={sort} setSort={setSort} side={side} setSide={setSide} price={price} setPrice={setPrice} />

      {loading && items.length === 0 ? (
        <div className="px-5 lg:px-8 py-16 text-center">
          <div className="w-8 h-8 mx-auto rounded-full border-2 border-aring-ink-100 border-t-aring-ink-900 animate-spin" />
          <p className="mt-3 text-[15px] lg:text-[15px] text-aring-ink-500">불러오는 중…</p>
        </div>
      ) : error ? (
        <div className="px-5 lg:px-8 py-16 text-center">
          <p className="text-[15px] lg:text-[15px] font-bold text-aring-ink-900">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center justify-center px-5 py-2.5 rounded-pill bg-aring-ink-900 text-white text-[15px] lg:text-[15px] font-bold"
          >
            다시 시도
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-5 lg:px-8 py-16 text-center">
          <p className="text-[15px] lg:text-[15px] font-bold text-aring-ink-900">조건에 맞는 한 짝이 없어요</p>
          <p className="mt-1 text-[15px] lg:text-[15px] leading-[1.5] text-aring-ink-500">필터를 초기화하거나 다른 조건을 선택해 주세요</p>
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
                className="w-full inline-flex items-center justify-center h-12 rounded-pill bg-aring-ink-100 text-aring-ink-900 text-[15px] lg:text-[15px] font-bold active:scale-[0.99] transition disabled:opacity-60"
              >
                {loading ? '불러오는 중…' : '더보기'}
              </button>
            </div>
          )}

          {!hasMore && items.length > 0 && (
            <p className="mt-6 text-center text-[15px] lg:text-[15px] text-aring-ink-500">
              마지막 한 짝까지 모두 확인했어요
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 메인 export — Suspense로 감싸서 빌드 에러 해결
// ─────────────────────────────────────────────────────────────
export default function ProductsPage() {
  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
        <Suspense fallback={
          <div className="py-16 text-center">
            <div className="w-8 h-8 mx-auto rounded-full border-2 border-aring-ink-100 border-t-aring-ink-900 animate-spin" />
          </div>
        }>
          <ProductsContent />
        </Suspense>
        <BottomNav />
      </div>
    </main>
  );
}