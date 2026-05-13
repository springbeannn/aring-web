'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { RecentItem } from '@/lib/mock';
import { type PriceRange, PRICE_OPTIONS } from '@/components/FilterBar';

export type SortKey = 'recent' | 'view_count';
export type SideFilter = 'all' | 'L' | 'R';

const IconChevronDown = ({ className = 'w-3 h-3', open = false }: { className?: string; open?: boolean }) => (
  <svg className={`${className} transition-transform ${open ? 'rotate-180' : ''}`}
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export function useItemFilters(items: RecentItem[]) {
  const [sort, setSort] = useState<SortKey>('recent');
  const [side, setSide] = useState<SideFilter>('all');
  const [price, setPrice] = useState<PriceRange>('all');

  const filtered = useMemo(() => {
    let arr = items.slice();
    if (side !== 'all') arr = arr.filter((it) => it.side === side);
    arr = arr.filter((it) => {
      if (price === 'all') return true;
      const p = it.price ?? null;
      if (price === '0-10000') return p !== null && p <= 10000;
      if (price === '10000-30000') return p !== null && p > 10000 && p <= 30000;
      if (price === '30000-70000') return p !== null && p > 30000 && p <= 70000;
      if (price === '70000-150000') return p !== null && p > 70000 && p <= 150000;
      if (price === '150000-plus') return p !== null && p > 150000;
      return true;
    });
    // 정렬 — recent: 입력 순서 유지(fetch가 created_at desc), view_count: 조회수 내림차순
    if (sort === 'view_count') {
      arr.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
    }
    return arr;
  }, [items, sort, side, price]);

  return { sort, setSort, side, setSide, price, setPrice, filtered };
}

export function ItemFilterChips({
  sort, setSort, side, setSide, price, setPrice, className = '',
}: {
  sort: SortKey; setSort: (s: SortKey) => void;
  side: SideFilter; setSide: (s: SideFilter) => void;
  price: PriceRange; setPrice: (p: PriceRange) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onMouse);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouse);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const priceLabel = PRICE_OPTIONS.find(o => o.value === price)?.label ?? '전체 가격';
  const isPriceActive = price !== 'all';

  return (
    <div className={['flex gap-2 px-5 lg:px-8 mb-3 relative z-10', className].join(' ')}>

      {/* 최신순 */}
      <button
        onClick={() => { setSort('recent'); setOpen(false); }}
        className={['shrink-0 inline-flex items-center rounded-pill px-3 py-1.5 text-[11px] font-bold shadow-card transition active:scale-[0.98]',
          sort === 'recent' ? 'bg-aring-ink-900 text-white' : 'glass text-aring-ink-900'].join(' ')}
      >
        최신순
      </button>

      {/* 조회수순 */}
      <button
        onClick={() => { setSort('view_count'); setOpen(false); }}
        className={['shrink-0 inline-flex items-center rounded-pill px-3 py-1.5 text-[11px] font-bold shadow-card transition active:scale-[0.98]',
          sort === 'view_count' ? 'bg-aring-ink-900 text-white' : 'glass text-aring-ink-900'].join(' ')}
      >
        조회수순
      </button>

      {/* 가격 드롭다운 */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(o => !o)}
          className={['shrink-0 inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[11px] font-bold shadow-card transition active:scale-[0.98]',
            isPriceActive ? 'bg-aring-ink-900 text-white' : 'glass text-aring-ink-900'].join(' ')}
        >
          {priceLabel}
          <IconChevronDown className={`w-3 h-3 ${isPriceActive ? 'text-white/80' : 'text-aring-ink-500'}`} open={open} />
        </button>
        {open && (
          <div className="absolute top-full left-0 mt-1.5 z-50 min-w-[140px] rounded-tile bg-white border border-aring-green-line shadow-card overflow-hidden">
            {PRICE_OPTIONS.map(opt => {
              const selected = price === opt.value;
              return (
                <button key={opt.value} onClick={() => { setPrice(opt.value); setOpen(false); }}
                  className={['w-full text-left px-3.5 py-2.5 text-[15px] lg:text-[15px] font-semibold transition',
                    selected ? 'bg-aring-ink-900 text-white' : 'text-aring-ink-700 hover:bg-aring-ink-100'].join(' ')}>
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 초기화 */}
      {(isPriceActive || sort === 'view_count') && (
        <button onClick={() => { setPrice('all'); setSort('recent'); setOpen(false); }}
          className="shrink-0 inline-flex items-center rounded-pill px-3 py-1.5 text-[11px] font-bold text-aring-ink-500 hover:text-aring-ink-900 transition">
          초기화
        </button>
      )}
    </div>
  );
}
