'use client';

import { useEffect, useMemo, useState } from 'react';
import type { RecentItem } from '@/lib/mock';

// ─────────────────────────────────────────────────────────────
// 필터 타입 — 사용자 명세 (2026-04-26)
// 최신순 (default) / 가격대 (낮은순·높은순) / L·R
// 정렬: created_at DESC | price ASC | price DESC, side 필터링
// ─────────────────────────────────────────────────────────────
export type SortKey = 'recent' | 'price_asc' | 'price_desc';
export type SideFilter = 'all' | 'L' | 'R';

const IconChevronDown = ({
  className = 'w-3 h-3',
  strokeWidth = 2.4,
}: {
  className?: string;
  strokeWidth?: number;
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

/** items에 sort/side 필터를 적용한 결과를 반환하는 훅. */
export function useItemFilters(items: RecentItem[]) {
  const [sort, setSort] = useState<SortKey>('recent');
  const [side, setSide] = useState<SideFilter>('all');

  const filtered = useMemo(() => {
    let arr = items.slice();
    if (side !== 'all') arr = arr.filter((it) => it.side === side);
    if (sort === 'price_asc') {
      arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sort === 'price_desc') {
      arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    }
    // 'recent'는 fetch 정렬 그대로 유지 (created_at DESC)
    return arr;
  }, [items, sort, side]);

  return { sort, setSort, side, setSide, filtered };
}

/** 3-chip 드롭다운 필터 UI. 외부 클릭/ESC 시 자동 닫힘. */
export function ItemFilterChips({
  sort,
  setSort,
  side,
  setSide,
  className = '',
}: {
  sort: SortKey;
  setSort: (s: SortKey) => void;
  side: SideFilter;
  setSide: (s: SideFilter) => void;
  className?: string;
}) {
  const [open, setOpen] = useState<null | 'price' | 'side'>(null);

  useEffect(() => {
    if (!open) return;
    const onMouse = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-filter-chip]')) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    };
    document.addEventListener('mousedown', onMouse);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouse);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const priceLabel =
    sort === 'price_asc'
      ? '낮은순'
      : sort === 'price_desc'
      ? '높은순'
      : '가격대';
  const sideLabel =
    side === 'L' ? '왼쪽 (L)' : side === 'R' ? '오른쪽 (R)' : 'L · R';

  return (
    <div
      className={[
        'no-scrollbar flex gap-2 overflow-x-auto overflow-y-visible px-5 lg:px-8 mb-3',
        className,
      ].join(' ')}
    >
      {/* chip 1: 최신순 (단일 토글) */}
      <button
        onClick={() => {
          setSort('recent');
          setOpen(null);
          console.log('[aring]', 'filter:sort', 'recent');
        }}
        className={[
          'shrink-0 inline-flex items-center rounded-pill px-3 py-1.5 text-[11.5px] font-bold shadow-card transition active:scale-[0.98]',
          sort === 'recent'
            ? 'bg-aring-ink-900 text-white'
            : 'glass text-aring-ink-900',
        ].join(' ')}
      >
        최신순
      </button>

      {/* chip 2: 가격대 (드롭다운) */}
      <div className="relative" data-filter-chip>
        <button
          onClick={() => setOpen(open === 'price' ? null : 'price')}
          className={[
            'shrink-0 inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[11.5px] font-bold shadow-card transition active:scale-[0.98]',
            sort.startsWith('price')
              ? 'bg-aring-ink-900 text-white'
              : 'glass text-aring-ink-900',
          ].join(' ')}
        >
          {priceLabel}
          <IconChevronDown
            className={[
              'w-3 h-3 transition-transform',
              sort.startsWith('price') ? 'text-white/80' : 'text-aring-ink-500',
              open === 'price' ? 'rotate-180' : '',
            ].join(' ')}
          />
        </button>
        {open === 'price' && (
          <div className="absolute top-full left-0 mt-1.5 z-30 min-w-[140px] rounded-tile bg-white border border-aring-green-line shadow-card overflow-hidden">
            {[
              { value: 'price_asc' as SortKey, label: '낮은순' },
              { value: 'price_desc' as SortKey, label: '높은순' },
            ].map((opt) => {
              const selected = sort === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSort(opt.value);
                    setOpen(null);
                    console.log('[aring]', 'filter:sort', opt.value);
                  }}
                  className={[
                    'w-full text-left px-3.5 py-2.5 text-[12.5px] font-semibold transition',
                    selected
                      ? 'bg-aring-ink-900 text-white'
                      : 'text-aring-ink-700 hover:bg-aring-ink-100',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* chip 3: L·R (드롭다운) */}
      <div className="relative" data-filter-chip>
        <button
          onClick={() => setOpen(open === 'side' ? null : 'side')}
          className={[
            'shrink-0 inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[11.5px] font-bold shadow-card transition active:scale-[0.98]',
            side !== 'all'
              ? 'bg-aring-ink-900 text-white'
              : 'glass text-aring-ink-900',
          ].join(' ')}
        >
          {sideLabel}
          <IconChevronDown
            className={[
              'w-3 h-3 transition-transform',
              side !== 'all' ? 'text-white/80' : 'text-aring-ink-500',
              open === 'side' ? 'rotate-180' : '',
            ].join(' ')}
          />
        </button>
        {open === 'side' && (
          <div className="absolute top-full left-0 mt-1.5 z-30 min-w-[140px] rounded-tile bg-white border border-aring-green-line shadow-card overflow-hidden">
            {[
              { value: 'all' as SideFilter, label: 'L · R 전체' },
              { value: 'L' as SideFilter, label: '왼쪽 (L)' },
              { value: 'R' as SideFilter, label: '오른쪽 (R)' },
            ].map((opt) => {
              const selected = side === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSide(opt.value);
                    setOpen(null);
                    console.log('[aring]', 'filter:side', opt.value);
                  }}
                  className={[
                    'w-full text-left px-3.5 py-2.5 text-[12.5px] font-semibold transition',
                    selected
                      ? 'bg-aring-ink-900 text-white'
                      : 'text-aring-ink-700 hover:bg-aring-ink-100',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 초기화 — 활성 필터 있을 때만 노출 */}
      {(sort !== 'recent' || side !== 'all') && (
        <button
          onClick={() => {
            setSort('recent');
            setSide('all');
            setOpen(null);
          }}
          className="shrink-0 inline-flex items-center rounded-pill px-3 py-1.5 text-[11.5px] font-bold text-aring-ink-500 hover:text-aring-ink-900 transition"
        >
          초기화
        </button>
      )}
    </div>
  );
}
