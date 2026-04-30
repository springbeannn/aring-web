'use client';
import { useState } from 'react';

export type SortOption = 'latest' | 'oldest';
export type PriceRange = 'all' | '0-10000' | '10000-30000' | '30000-70000' | '70000-150000' | '150000-plus';

interface Props {
  sort: SortOption;
  price: PriceRange;
  onSort: (v: SortOption) => void;
  onPrice: (v: PriceRange) => void;
}

export function FilterBar({ sort, price, onSort, onPrice }: Props) {
  const selectClass = "text-[12px] font-bold rounded-full px-3 py-1 border border-[rgb(243,243,245)] bg-white text-aring-ink-900 outline-none cursor-pointer";
  return (
    <div className="flex gap-2 px-5 pb-2">
      <select value={sort} onChange={e => onSort(e.target.value as SortOption)} className={selectClass}>
        <option value="latest">최신순</option>
        <option value="oldest">오래된순</option>
      </select>
      <select value={price} onChange={e => onPrice(e.target.value as PriceRange)} className={selectClass}>
        <option value="all">전체 가격</option>
        <option value="0-10000">~1만원</option>
        <option value="10000-30000">1~3만원</option>
        <option value="30000-70000">3~7만원</option>
        <option value="70000-150000">7~15만원</option>
        <option value="150000-plus">15만원~</option>
      </select>
    </div>
  );
}

export function useFilterBar() {
  const [sort, setSort] = useState<SortOption>('latest');
  const [price, setPrice] = useState<PriceRange>('all');
  return { sort, setSort, price, setPrice };
}
