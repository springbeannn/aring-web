'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { TopNav, BottomNav } from '@/components/Nav';
import { supabase, type Listing } from '@/lib/supabase';
import { getPastelClass } from '@/lib/pastel';

// ─────────────────────────────────────────────────────────────
// /brands — 브랜드별 탐색 (홈 "브랜드별 탐색 > 더보기" 진입점)
// 오늘의 매칭 후보(/popular)와 동일한 카드/그리드 UI
// 타이틀 아래 브랜드 칩(메인 BrandSection과 동일)으로 필터링
// ─────────────────────────────────────────────────────────────

// 메인 페이지와 동일한 고정 인기 브랜드
const FAMOUS_BRANDS: string[] = [];

const IconArrowLeft = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

const IconEye = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// 카드 — /popular의 PopularCard와 동일 UI (rank 뱃지만 제거)
// ─────────────────────────────────────────────────────────────
function BrandProductCard({ row, index }: { row: Listing; index: number }) {
  return (
    <Link
      href={`/items/${row.id}`}
      className="flex flex-col rounded-tile border border-aring-green-line bg-white overflow-hidden text-left active:scale-[0.99] transition"
    >
      <div className={`relative aspect-square overflow-hidden ${getPastelClass(index)}`}>
        {row.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={row.photo_url}
            alt={row.brand ?? '한 짝'}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* 조회수 */}
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-pill glass-strong px-2 py-1 text-[10px] font-bold text-aring-ink-900">
          <IconEye className="w-3.5 h-3.5" />
          {row.view_count ?? 0}
        </span>
      </div>
      <div className="px-3 py-3">
        <p className="text-[12px] lg:text-[13px] font-bold tracking-wider text-aring-ink-500 truncate">
          {row.brand ?? '브랜드 미상'}
        </p>
        <p className="mt-px text-[15px] lg:text-[15px] leading-[1.5] font-bold text-aring-ink-900 truncate">
          {row.detail ?? row.shape ?? '한 짝'}
        </p>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[15px] lg:text-[15px] font-bold text-aring-ink-900">
            {row.price ? `₩${row.price.toLocaleString('ko-KR')}` : '가격 협의'}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────────────────────────
export default function BrandsPage() {
  const [rows, setRows] = useState<Listing[]>([]);
  const [brandCounts, setBrandCounts] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<string>('전체');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      if (!supabase) {
        if (!cancelled) {
          setRows([]);
          setLoading(false);
        }
        return;
      }
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'open')
        .order('view_count', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(100);
      if (cancelled) return;
      if (error) {
        console.error('[aring] /brands fetch error', error);
        setError('한 짝 목록을 불러오지 못했습니다');
        setLoading(false);
        return;
      }

      const listings = (data ?? []) as Listing[];
      setRows(listings);

      // 브랜드 집계 (홈 BrandSection과 동일 로직 — brandNormalizer 사용)
      try {
        const { getBrands } = await import('@/lib/brandNormalizer');
        const brandDict = await getBrands();
        const counts: Record<string, number> = {};
        listings.forEach((row) => {
          const brandInput = (row.brand as string)?.trim();
          if (!brandInput || brandInput === '브랜드 미상') return;
          const bkey = (row as Listing & { brand_key?: string }).brand_key;
          let dictEntry = bkey ? brandDict.find((b) => b.brand_key === bkey) : null;
          if (!dictEntry) {
            const q = brandInput.toLowerCase().replace(/\s+/g, '');
            dictEntry = brandDict.find((b) => {
              const targets = [
                b.brand_key,
                b.display_name.toLowerCase(),
                (b.name_ko ?? '').toLowerCase(),
                (b.name_en ?? '').toLowerCase(),
                ...b.aliases.map((a: string) => a.toLowerCase()),
              ].map((t) => t.replace(/\s+/g, ''));
              return targets.includes(q);
            }) ?? null;
          }
          const displayName = dictEntry?.display_name ?? '기타';
          counts[displayName] = (counts[displayName] ?? 0) + 1;
        });
        if (!cancelled) setBrandCounts(counts);
      } catch (e) {
        console.error('[aring] brand normalize error', e);
      }

      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // 브랜드 칩 목록 (홈 BrandSection과 동일)
  const famousSet = useMemo(() => new Set(FAMOUS_BRANDS.map((b) => b.toLowerCase())), []);
  const userBrands = useMemo(
    () =>
      Object.entries(brandCounts)
        .filter(([brand]) => brand && brand !== '브랜드 미상' && brand !== '기타' && !famousSet.has(brand.toLowerCase()))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([brand]) => brand),
    [brandCounts, famousSet],
  );
  const hasEtc = (brandCounts['기타'] ?? 0) > 0;
  const allBrands = ['전체', ...FAMOUS_BRANDS, ...userBrands, ...(hasEtc ? ['기타'] : [])];
  const totalCount = Object.values(brandCounts).reduce((a, b) => a + b, 0);

  // 선택된 브랜드로 필터링
  const filtered = useMemo(() => {
    if (selected === '전체') return rows;
    if (selected === '기타') {
      // '기타' = brandCounts 집계 결과 'displayName === 기타'인 항목 → row 단위 재판정 필요
      // 간단히: brand 값이 비어있거나 '브랜드 미상'/공백인 row
      return rows.filter((r) => !r.brand || r.brand.trim() === '' || r.brand === '브랜드 미상');
    }
    return rows.filter((r) => (r.brand ?? '').toLowerCase() === selected.toLowerCase());
  }, [rows, selected]);

  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
        <div className="pb-28 lg:pb-10">
          <TopNav />

          {/* 페이지 헤더 — /popular와 동일 구조 */}
          <div className="px-5 lg:px-8 pt-3 lg:pt-7 pb-4 flex items-center gap-3">
            <Link
              href="/"
              aria-label="홈으로"
              className="lg:hidden w-9 h-9 rounded-full bg-aring-ink-100 flex items-center justify-center text-aring-ink-900 active:scale-95 transition"
            >
              <IconArrowLeft />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-[24px] lg:text-[26px] font-bold tracking-tight text-aring-ink-900">
                브랜드별 탐색
              </h1>
              <p className="mt-0.5 text-[15px] lg:text-[15px] leading-[1.5] text-aring-ink-500">
                가장 많이 등록된 브랜드부터 모았어요
                {totalCount > 0 && (
                  <>
                    {' '}· 총 <span className="font-semibold">{totalCount}</span>개
                  </>
                )}
              </p>
            </div>
          </div>

          {/* 브랜드 칩 — 홈 BrandSection 동일 디자인 */}
          {!loading && (
            <div className="flex flex-wrap gap-2 px-5 lg:px-8 pb-4">
              {allBrands.map((brand) => {
                const count =
                  brand === '전체'
                    ? totalCount
                    : Object.entries(brandCounts).find(([k]) => k.toLowerCase() === brand.toLowerCase())?.[1] ?? 0;
                const isActive = selected === brand;
                return (
                  <button
                    key={brand}
                    onClick={() => setSelected(brand)}
                    className={[
                      'rounded-pill px-2 py-1 text-[11px] lg:text-[13px] font-bold transition active:scale-95',
                      isActive
                        ? 'bg-aring-ink-900 text-white border border-aring-ink-900'
                        : 'bg-white text-aring-ink-700 border border-aring-green-line hover:border-aring-ink-300',
                    ].join(' ')}
                  >
                    {brand}
                    {count > 0 && (
                      <span className={['ml-1.5 text-[15px] lg:text-[15px] font-bold', isActive ? 'text-white/70' : 'text-aring-ink-400'].join(' ')}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* 본문 */}
          {loading ? (
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
              <p className="text-[15px] lg:text-[15px] font-bold text-aring-ink-900">선택한 브랜드의 한 짝이 없어요</p>
              <p className="mt-1 text-[15px] lg:text-[15px] leading-[1.5] text-aring-ink-500">다른 브랜드를 선택하거나 직접 등록해 보세요</p>
              <Link
                href="/register"
                className="mt-4 inline-flex items-center justify-center px-5 py-2.5 rounded-pill bg-aring-ink-900 text-white text-[15px] lg:text-[15px] font-bold"
              >
                한 짝 등록하기
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 px-5 lg:px-8">
              {filtered.map((row, idx) => (
                <BrandProductCard key={row.id} row={row} index={idx} />
              ))}
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    </main>
  );
}
