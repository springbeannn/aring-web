'use client';

import { useState, useEffect, useRef } from 'react';

// ──────────────────────────────────────────────────────────────
// 타입 정의
// ──────────────────────────────────────────────────────────────
export type SortOption = 'latest' | 'oldest';

export type PriceRange =
    | 'all'
  | 'unknown'
  | '0-10000'
  | '10000-30000'
  | '30000-70000'
  | '70000-150000'
  | '150000-plus';

// ──────────────────────────────────────────────────────────────
// 상수
// ──────────────────────────────────────────────────────────────
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
  ];

const PRICE_OPTIONS: { value: PriceRange; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'unknown', label: '가격 미정' },
  { value: '0-10000', label: '0 ~ 10,000원' },
  { value: '10000-30000', label: '10,000 ~ 30,000원' },
  { value: '30000-70000', label: '30,000 ~ 70,000원' },
  { value: '70000-150000', label: '70,000 ~ 150,000원' },
  { value: '150000-plus', label: '150,000원 이상' },
  ];

// ──────────────────────────────────────────────────────────────
// 아이콘
// ──────────────────────────────────────────────────────────────
const IconChevronDown = ({ className = 'w-3 h-3' }: { className?: string }) => (
    <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
        <polyline points="6 9 12 15 18 9" />
    </svg>svg>
  );

// ──────────────────────────────────────────────────────────────
// SortDropdown
// ──────────────────────────────────────────────────────────────
interface SortDropdownProps {
    sortOption: SortOption;
    onSortChange: (v: SortOption) => void;
}

export function SortDropdown({ sortOption, onSortChange }: SortDropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
          const handler = (e: MouseEvent) => {
                  if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
          };
          if (open) document.addEventListener('mousedown', handler);
          return () => document.removeEventListener('mousedown', handler);
    }, [open]);
  
    useEffect(() => {
          const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
          document.addEventListener('keydown', handler);
          return () => document.removeEventListener('keydown', handler);
    }, []);
  
    const currentLabel = SORT_OPTIONS.find((o) => o.value === sortOption)?.label ?? '최신순';
  
    return (
          <div ref={ref} className="relative shrink-0">
                <button
                          onClick={() => setOpen((p) => !p)}
                          className="shrink-0 inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[11.5px] font-bold shadow-card transition active:scale-[0.98] bg-aring-ink-900 text-white"
                        >
                  {currentLabel}
                        <IconChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>button>
          
            {open && (
                    <div className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-[120px] rounded-2xl bg-white shadow-lg border border-aring-ink-100 overflow-hidden">
                      {SORT_OPTIONS.map((opt) => (
                                  <button
                                                  key={opt.value}
                                                  onClick={() => {
                                                                    onSortChange(opt.value);
                                                                    setOpen(false);
                                                  }}
                                                  className={[
                                                                    'w-full text-left px-3.5 py-2.5 text-[12.5px] font-semibold transition',
                                                                    sortOption === opt.value
                                                                      ? 'bg-aring-ink-900 text-white'
                                                                      : 'text-aring-ink-700 hover:bg-aring-ink-100',
                                                                  ].join(' ')}
                                                >
                                    {opt.label}
                                  </button>button>
                                ))}
                    </div>div>
                )}
          </div>div>
        );
}

// ──────────────────────────────────────────────────────────────
// PriceDropdown
// ──────────────────────────────────────────────────────────────
interface PriceDropdownProps {
    priceRange: PriceRange;
    onPriceChange: (v: PriceRange) => void;
}

export function PriceDropdown({ priceRange, onPriceChange }: PriceDropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
          const handler = (e: MouseEvent) => {
                  if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
          };
          if (open) document.addEventListener('mousedown', handler);
          return () => document.removeEventListener('mousedown', handler);
    }, [open]);
  
    useEffect(() => {
          const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
          document.addEventListener('keydown', handler);
          return () => document.removeEventListener('keydown', handler);
    }, []);
  
    const currentLabel = PRICE_OPTIONS.find((o) => o.value === priceRange)?.label ?? '가격대';
    const isActive = priceRange !== 'all';
  
    return (
          <div ref={ref} className="relative shrink-0">
                <button
                          onClick={() => setOpen((p) => !p)}
                          className={[
                                      'shrink-0 inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[11.5px] font-bold shadow-card transition active:scale-[0.98]',
                                      isActive
                                        ? 'bg-aring-ink-900 text-white'
                                        : 'glass text-aring-ink-900',
                                    ].join(' ')}
                        >
                  {currentLabel}
                        <IconChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>button>
          
            {open && (
                    <div className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-[160px] rounded-2xl bg-white shadow-lg border border-aring-ink-100 overflow-hidden">
                      {PRICE_OPTIONS.map((opt) => (
                                  <button
                                                  key={opt.value}
                                                  onClick={() => {
                                                                    onPriceChange(opt.value);
                                                                    setOpen(false);
                                                  }}
                                                  className={[
                                                                    'w-full text-left px-3.5 py-2.5 text-[12.5px] font-semibold transition',
                                                                    priceRange === opt.value
                                                                      ? 'bg-aring-ink-900 text-white'
                                                                      : 'text-aring-ink-700 hover:bg-aring-ink-100',
                                                                  ].join(' ')}
                                                >
                                    {opt.label}
                                  </button>button>
                                ))}
                    </div>div>
                )}
          </div>div>
        );
}

// ──────────────────────────────────────────────────────────────
// FilterBar (조합 컴포넌트)
// ──────────────────────────────────────────────────────────────
interface FilterBarProps {
    sortOption: SortOption;
    onSortChange: (v: SortOption) => void;
    priceRange: PriceRange;
    onPriceChange: (v: PriceRange) => void;
    className?: string;
}

export function FilterBar({
    sortOption,
    onSortChange,
    priceRange,
    onPriceChange,
    className = '',
}: FilterBarProps) {
    return (
          <div className={`flex items-center gap-2 px-5 lg:px-8 pb-1 ${className}`}>
                <SortDropdown sortOption={sortOption} onSortChange={onSortChange} />
                <PriceDropdown priceRange={priceRange} onPriceChange={onPriceChange} />
          </div>div>
        );
}

// ──────────────────────────────────────────────────────────────
// 필터/정렬 훅
// ──────────────────────────────────────────────────────────────
interface FilterableItem {
    price?: number | null;
    created_at?: string | null;
    [key: string]: unknown;
}

export function useFilterBar<T extends FilterableItem>(items: T[]) {
    const [sortOption, setSortOption] = useState<SortOption>('latest');
    const [priceRange, setPriceRange] = useState<PriceRange>('all');
  
    const filtered = items
          .filter((item) => {
                  if (priceRange === 'all') return true;
                  const price = item.price ?? null;
                  if (priceRange === 'unknown') return price === null || price === 0;
                  if (priceRange === '0-10000') return price !== null && price > 0 && price <= 10000;
                  if (priceRange === '10000-30000') return price !== null && price > 10000 && price <= 30000;
                  if (priceRange === '30000-70000') return price !== null && price > 30000 && price <= 70000;
                  if (priceRange === '70000-150000') return price !== null && price > 70000 && price <= 150000;
                  if (priceRange === '150000-plus') return price !== null && price > 150000;
                  return true;
          })
          .sort((a, b) => {
                  const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                  const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                  return sortOption === 'latest' ? dateB - dateA : dateA - dateB;
          });
  
    return { sortOption, setSortOption, priceRange, setPriceRange, filtered };
}
