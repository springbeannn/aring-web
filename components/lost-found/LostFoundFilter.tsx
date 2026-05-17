'use client';

import { useState } from 'react';
import { CATEGORY_OPTIONS, PERIOD_OPTIONS, REGION_OPTIONS } from '@/lib/lost112/codes';

// Phase 1: UI placeholder.
// Phase 2에서 URL params 동기화 + 서버 fetch 연결.
export function LostFoundFilter() {
  const [region, setRegion] = useState('');
  const [periodDays, setPeriodDays] = useState(30);
  const [category, setCategory] = useState('');

  return (
    <div className="px-5 lg:px-8 pb-4">
      <div className="flex flex-wrap gap-2">
        <Pill
          label={REGION_OPTIONS.find((o) => o.code === region)?.label ?? '지역'}
          options={REGION_OPTIONS.map((o) => ({ value: o.code, label: o.label }))}
          value={region}
          onChange={setRegion}
        />
        <Pill
          label={PERIOD_OPTIONS.find((o) => o.days === periodDays)?.label ?? '기간'}
          options={PERIOD_OPTIONS.map((o) => ({ value: String(o.days), label: o.label }))}
          value={String(periodDays)}
          onChange={(v) => setPeriodDays(Number(v))}
        />
        <Pill
          label={CATEGORY_OPTIONS.find((o) => o.code === category)?.label ?? '분류'}
          options={CATEGORY_OPTIONS.map((o) => ({ value: o.code, label: o.label }))}
          value={category}
          onChange={setCategory}
        />
      </div>
    </div>
  );
}

// 가벼운 inline-select pill — 별도 드롭다운 UI 없이 native <select> overlay
function Pill({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="relative inline-flex items-center rounded-pill border border-aring-green-line bg-white px-3.5 py-2 text-[12px] lg:text-[13px] font-bold text-aring-ink-900 transition hover:border-aring-ink-300">
      <span className="truncate max-w-[120px]">{label}</span>
      <svg className="ml-1 w-3 h-3 text-aring-ink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer"
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
