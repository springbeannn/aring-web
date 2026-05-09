'use client';

import { useEffect, useRef, useState } from 'react';

export type SortOption = 'latest' | 'oldest';
export type PriceRange = 'all' | '0-10000' | '10000-30000' | '30000-70000' | '70000-150000' | '150000-plus';

const IconChevronDown = ({ className = 'w-3 h-3', open = false }: { className?: string; open?: boolean }) => (
  <svg
    className={`${className} transition-transform ${open ? 'rotate-180' : ''}`}
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const PRICE_OPTIONS: { value: PriceRange; label: string }[] = [
  { value: 'all',           label: '전체 가격' },
  { value: '0-10000',       label: '~1만원' },
  { value: '10000-30000',   label: '1~3만원' },
  { value: '30000-70000',   label: '3~7만원' },
  { value: '70000-150000',  label: '7~15만원' },
  { value: '150000-plus',   label: '15만원~' },
];

interface Props {
  sort: SortOption;
  price: PriceRange;
  onSort: (v: SortOption) => void;
  onPrice: (v: PriceRange) => void;
}

export function FilterBar({ sort, price, onSort, onPrice }: Props) {
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
    <div className="flex gap-2 px-5 lg:px-8 pb-3 relative z-10">
      {/* 최신순 chip */}
      <button
        onClick={() => { onSort('latest'); setOpen(false); }}
        className={[
          'shrink-0 inline-flex items-center rounded-pill px-3 py-1.5 text-[11px] font-bold shadow-card transition active:scale-[0.98]',
          sort === 'latest' ? 'bg-aring-ink-900 text-white' : 'glass text-aring-ink-900',
        ].join(' ')}
      >
        최신순
      </button>

      {/* 가격 드롭다운 */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(o => !o)}
          className={[
            'shrink-0 inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[11px] font-bold shadow-card transition active:scale-[0.98]',
            isPriceActive ? 'bg-aring-ink-900 text-white' : 'glass text-aring-ink-900',
          ].join(' ')}
        >
          {priceLabel}
          <IconChevronDown
            className={`w-3 h-3 ${isPriceActive ? 'text-white/80' : 'text-aring-ink-500'}`}
            open={open}
          />
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-1.5 z-50 min-w-[140px] rounded-tile bg-white border border-aring-green-line shadow-card overflow-hidden">
            {PRICE_OPTIONS.map(opt => {
              const selected = price === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => { onPrice(opt.value); setOpen(false); }}
                  className={[
                    'w-full text-left px-3.5 py-2.5 text-[13px] lg:text-[15px] font-semibold transition',
                    selected ? 'bg-aring-ink-900 text-white' : 'text-aring-ink-700 hover:bg-aring-ink-100',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 초기화 */}
      {isPriceActive && (
        <button
          onClick={() => { onPrice('all'); onSort('latest'); setOpen(false); }}
          className="shrink-0 inline-flex items-center rounded-pill px-3 py-1.5 text-[11px] font-bold text-aring-ink-500 hover:text-aring-ink-900 transition"
        >
          초기화
        </button>
      )}
    </div>
  );
}

export function useFilterBar() {
  const [sort, setSort] = useState<SortOption>('latest');
  const [price, setPrice] = useState<PriceRange>('all');
  return { sort, setSort, price, setPrice };
}
