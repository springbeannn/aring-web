'use client';

import Link from 'next/link';
import { formatKRW, thumbBg, type RecentItem } from '@/lib/mock';

const IconHeart = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

/** 홈/상품 리스트에서 공용으로 쓰는 카드. 클릭 시 상세 페이지로 라우팅. */
export function RecentItemCard({ it }: { it: RecentItem }) {
  return (
    <Link
      href={`/items/${it.id}`}
      onClick={() => console.log('[aring]', 'recent:tap', it.id)}
      className="flex flex-col rounded-tile border border-aring-green-line bg-white overflow-hidden text-left active:scale-[0.99] transition"
    >
      {/* 썸네일 */}
      <div
        className="relative aspect-square overflow-hidden"
        style={{ background: thumbBg(it.tone) }}
      >
        <img
          src={it.image}
          alt={`${it.brand} ${it.name}`}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement | null;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <span
          aria-hidden
          className="absolute inset-0 hidden items-center justify-center text-[42px] lg:text-[56px]"
        >
          {it.emoji}
        </span>
      </div>

      {/* 본문 */}
      <div className="px-3 py-3">
        <div className="flex items-center gap-1.5">
          <p className="text-[10.5px] font-bold tracking-wider text-aring-ink-500 truncate">
            {it.brand}
          </p>
          <span
            className="shrink-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-pill bg-aring-ink-900 text-white text-[9.5px] font-extrabold tracking-wider"
            aria-label={it.side === 'L' ? '왼쪽 한 짝' : '오른쪽 한 짝'}
          >
            {it.side}
          </span>
        </div>
        <p className="mt-0.5 text-[13px] font-bold text-aring-ink-900 truncate">
          {it.name}
        </p>
        {it.story && (
          <p className="mt-1 text-[10.5px] text-aring-ink-500 truncate">
            · {it.story}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[12px] font-bold text-aring-ink-900">
            {formatKRW(it.price)}
          </span>
          <span className="inline-flex items-center gap-1 text-[10.5px] text-aring-ink-500">
            <IconHeart className="w-3 h-3" />
            {it.likes}
          </span>
        </div>
      </div>
    </Link>
  );
}
