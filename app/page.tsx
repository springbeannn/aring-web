'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  todayMatches,
  recentItems as mockRecentItems,
  successStory,
  formatKRW,
  thumbBg,
  type MatchCard,
  type RecentItem,
  type ThumbTone,
} from '@/lib/mock';
import { supabase, type Listing } from '@/lib/supabase';
import { TopNav, BottomNav } from '@/components/Nav';
import { RecentItemCard } from '@/components/RecentItemCard';
import { useItemFilters, ItemFilterChips } from '@/components/ItemFilters';

// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
// Ã¬ÂÂÃ¬ÂÂ´Ã¬Â½Â (inline SVG ÃÂ· stroke ÃªÂ¸Â°Ã«Â°Â)
// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
type IconProps = { className?: string; strokeWidth?: number };

const IconBell = ({ className = 'w-5 h-5', strokeWidth = 1.8 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const IconChat = ({ className = 'w-5 h-5', strokeWidth = 1.8 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const IconSearch = ({ className = 'w-5 h-5', strokeWidth = 2 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const IconCamera = ({ className = 'w-4 h-4', strokeWidth = 2 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const IconArrow = ({ className = 'w-4 h-4', strokeWidth = 2.4 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m13 5 7 7-7 7" />
  </svg>
);

const IconHeart = ({ className = 'w-3.5 h-3.5', strokeWidth = 2 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const IconHome = ({ className = 'w-5 h-5', strokeWidth = 2 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5 12 3l9 6.5V20a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2V9.5z" />
  </svg>
);

const IconCompass = ({ className = 'w-5 h-5', strokeWidth = 2 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m16 8-2 6-6 2 2-6 6-2z" />
  </svg>
);

const IconUser = ({ className = 'w-5 h-5', strokeWidth = 2 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconPlus = ({ className = 'w-6 h-6', strokeWidth = 2.6 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const IconSparkle = ({ className = 'w-3.5 h-3.5', strokeWidth = 2 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M5.5 18.5l2.8-2.8M15.7 8.3l2.8-2.8" />
  </svg>
);

const IconChevronDown = ({ className = 'w-3 h-3', strokeWidth = 2.4 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
// Ã­ÂÂ¬Ã­ÂÂ¼
// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
const log =
  (label: string, payload?: unknown) =>
  () =>
    console.log('[aring]', label, payload ?? '');

// Ã¬ÂÂ¤Ã¬ÂÂ¬ Ã¬ÂÂ´Ã«Â¯Â¸Ã¬Â§Â + emoji Ã­ÂÂ´Ã«Â°Â± + tone Ã«Â°Â°ÃªÂ²Â½ (border-2 white frame)
function ThumbImage({
  src,
  fallback,
  tone,
  alt,
  className = '',
}: {
  src: string;
  fallback: string;
  tone: import('@/lib/mock').ThumbTone;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-tile border-2 border-white ${className}`}
      style={{ background: thumbBg(tone) }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = 'none';
          const fb = target.nextElementSibling as HTMLElement | null;
          if (fb) fb.style.display = 'flex';
        }}
      />
      <span
        aria-hidden
        className="absolute inset-0 hidden items-center justify-center text-[26px]"
      >
        {fallback}
      </span>
    </div>
  );
}

// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
// 1) Ã¬ÂÂÃ­ÂÂÃ«Â°Â (mock) Ã¢ÂÂ Ã«ÂªÂ¨Ã«Â°ÂÃ¬ÂÂ¼ Ã­ÂÂ° Ã­ÂÂÃ«Â ÂÃ¬ÂÂÃ¬ÂÂÃ¬ÂÂÃ«Â§Â Ã«ÂÂ¸Ã¬Â¶Â
// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function StatusBar() {
  return (
    <div className="lg:hidden flex items-center justify-between px-5 pt-3 pb-1 text-[13px] font-semibold text-aring-ink-900">
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        <span className="w-4 h-2.5 rounded-[2px] border border-aring-ink-900/70 relative">
          <span className="absolute inset-[2px] right-[3px] bg-aring-ink-900 rounded-[1px]" />
        </span>
      </div>
    </div>
  );
}

// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
// 2) Ã¬ÂÂÃ«ÂÂ¨ Ã«ÂÂ¤Ã«Â¹Â Ã¢ÂÂ components/Nav.tsx Ã¬ÂÂ TopNav Ã¬ÂÂ¬Ã¬ÂÂ© (ÃªÂ³ÂµÃ­ÂÂµ)
// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ

// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
// 3) ÃªÂ²ÂÃ¬ÂÂÃ«Â°Â
// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="mx-5 lg:mx-8 mb-5 lg:mb-7 lg:mt-5 flex items-center gap-2.5 rounded-pill bg-aring-ink-100 px-4 lg:px-5 py-3 lg:py-3.5 lg:max-w-[640px]"
    >
      <IconSearch className="w-4 h-4 lg:w-5 lg:h-5 text-aring-ink-500" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 bg-transparent border-0 outline-none text-[14px] lg:text-[15px] text-aring-ink-700 placeholder:text-aring-ink-500"
        placeholder="브랜드, 모양, 컴러로 검색"
      />
    </form>
  );
}

function HeroCard() {
  return (
    <div className="mx-5 lg:mx-8 mb-6 lg:mb-10 relative overflow-hidden rounded-card bg-aring-grad-pastel px-5 lg:px-10 pt-5 lg:pt-12 pb-5 lg:pb-12 min-h-[260px] lg:min-h-[340px]">
      {/* Ã¢ÂÂÃ¢ÂÂ Pastel glow blobs (Ã«Â°Â°ÃªÂ²Â½ Ã«Â ÂÃ¬ÂÂ´Ã¬ÂÂ´, blur + soft float) Ã¢ÂÂÃ¢ÂÂ */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="aring-blob-a absolute -top-12 -left-10 w-[200px] h-[200px] rounded-full opacity-70"
          style={{
            background: 'radial-gradient(circle, #FBC8DC 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="aring-blob-b absolute top-1/3 -right-14 w-[220px] h-[220px] rounded-full opacity-60"
          style={{
            background: 'radial-gradient(circle, #C5DDF0 0%, transparent 70%)',
            filter: 'blur(48px)',
          }}
        />
        <div
          className="aring-blob-c absolute -bottom-14 left-1/4 w-[180px] h-[180px] rounded-full opacity-55"
          style={{
            background: 'radial-gradient(circle, #FFEFB5 0%, transparent 70%)',
            filter: 'blur(44px)',
          }}
        />
      </div>

      {/* Ã«Â°Â°Ã¬Â§Â Ã¢ÂÂ frosted glass */}
      <span className="relative inline-flex items-center gap-1 rounded-pill glass px-2.5 py-1.5 text-[10px] font-extrabold tracking-wider text-aring-green shadow-card">
        <IconSparkle className="w-3 h-3" />
        AI MATCH ÃÂ· NEW
      </span>

      {/* Frosted Live Pill Ã¢ÂÂ Ã¬ÂÂ°Ã¬ÂÂÃ«ÂÂ¨ / "Ã¬Â§ÂÃªÂ¸Â Ã«Â§Â¤Ã¬Â¹Â­ Ã¬Â¤Â" Ã«ÂÂ¼Ã¬ÂÂ´Ã«Â¸Â Ã¬ÂÂ¬Ã¬ÂÂ¸ */}
      <div className="absolute top-5 right-5 lg:top-8 lg:right-8 z-10 glass rounded-pill pl-2.5 pr-3 py-1.5 inline-flex items-center gap-2 shadow-card">
        <span className="relative flex w-2 h-2">
          <span className="aring-pulse absolute inset-0 rounded-full bg-aring-accent" />
          <span className="relative w-2 h-2 rounded-full bg-aring-accent" />
        </span>
        <span className="text-[10px] font-bold text-aring-ink-900 tracking-wide">
          Ã¬Â§ÂÃªÂ¸Â 12Ã«ÂªÂ Ã«Â§Â¤Ã¬Â¹Â­ Ã¬Â¤Â
        </span>
      </div>

      {/* Ã­ÂÂ¤Ã«ÂÂÃ«ÂÂ¼Ã¬ÂÂ¸ */}
      <h1 className="relative mt-3.5 lg:mt-5 text-[22px] lg:text-[40px] leading-[1.3] lg:leading-[1.2] font-extrabold tracking-tight text-aring-ink-900 max-w-[78%] lg:max-w-[55%]">
        Ã­ÂÂÃ«ÂÂÃ«Â§Â Ã«ÂÂ¨Ã¬ÂÂ ÃªÂ·ÂÃªÂ±Â¸Ã¬ÂÂ´,
        <br />
        <span className="grad-text-green">AIÃªÂ°Â Ã¬Â§ÂÃ¬ÂÂ Ã¬Â°Â¾Ã¬ÂÂÃ«ÂÂÃ«Â Â¤Ã¬ÂÂ</span>
      </h1>

      {/* Ã¬ÂÂ¤Ã«ÂªÂ */}
      <p className="relative mt-2 lg:mt-4 text-[12.5px] lg:text-[15px] leading-[1.6] text-aring-ink-700 max-w-[80%] lg:max-w-[55%]">
        Ã¬ÂÂ¬Ã¬Â§Â Ã­ÂÂ Ã¬ÂÂ¥Ã¬ÂÂ´Ã«Â©Â´ Ã¬Â¶Â©Ã«Â¶ÂÃ­ÂÂ©Ã«ÂÂÃ«ÂÂ¤. Ã«Â¸ÂÃ«ÂÂÃ«ÂÂÃÂ·Ã­ÂÂÃ­ÂÂÃÂ·Ã¬ÂÂÃ¬ÂÂ¬ÃÂ·Ã«ÂÂÃ­ÂÂÃ¬ÂÂ¼ÃªÂ¹ÂÃ¬Â§Â Ã«Â¶ÂÃ¬ÂÂÃ­ÂÂ´
        Ã«Â¹ÂÃ¬ÂÂ·Ã­ÂÂÃªÂ±Â°Ã«ÂÂ Ã¬Â ÂÃ­ÂÂÃ­ÂÂ Ã«Â§ÂÃ«ÂÂ Ã¬Â§ÂÃ¬ÂÂ Ã¬ÂÂ°ÃªÂ²Â°Ã­ÂÂ©Ã«ÂÂÃ«ÂÂ¤.
      </p>

      {/* CTA */}
      <Link
        href="/register"
        className="relative mt-4 lg:mt-7 inline-flex items-center gap-2 rounded-pill bg-aring-ink-900 px-5 lg:px-7 py-3 lg:py-3.5 text-[13px] lg:text-[14px] font-extrabold text-white shadow-cta active:scale-[0.98] transition"
      >
        Ã«ÂÂ±Ã«Â¡ÂÃ­ÂÂÃªÂ¸Â°
        <IconArrow className="w-3.5 h-3.5" />
      </Link>

      {/* Ã¬ÂÂ¼Ã«ÂÂ¬Ã¬ÂÂ¤Ã­ÂÂ¸ (ÃªÂ·ÂÃªÂ±Â¸Ã¬ÂÂ´ ring) */}
      <div className="pointer-events-none absolute -right-4 -bottom-6 lg:right-10 lg:bottom-1/2 lg:translate-y-1/2 w-[170px] h-[170px] lg:w-[260px] lg:h-[260px] flex items-center justify-center">
        <div className="absolute inset-0 radial-halo rounded-full" />
        <div className="relative grad-ring w-[110px] h-[110px] lg:w-[180px] lg:h-[180px] rounded-full shadow-[0_12px_30px_rgba(107,127,232,.25)]">
          <div
            className="absolute -top-3 lg:-top-5 left-1/2 -translate-x-1/2 w-5 h-5 lg:w-8 lg:h-8 rounded-full"
            style={{
              background: 'linear-gradient(135deg,#FBC8DC,#FFD9B8,#C8E6C9)',
              boxShadow: '0 6px 14px rgba(245,168,199,.35)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
// Ã¬ÂÂ¹Ã¬ÂÂ Ã­ÂÂ¤Ã«ÂÂ ÃªÂ³ÂµÃ­ÂÂµ
// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function SectionHead({
  title,
  sub,
  more,
  onMore,
}: {
  title: string;
  sub?: string;
  more?: string;
  onMore?: () => void;
}) {
  return (
    <div className="px-5 lg:px-8 mb-3 lg:mb-5 flex items-end justify-between">
      <div>
        <h2 className="text-[17px] lg:text-[22px] font-extrabold tracking-tight text-aring-ink-900">
          {title}
        </h2>
        {sub && <p className="mt-1 text-[11.5px] lg:text-[13px] text-aring-ink-500">{sub}</p>}
      </div>
      {more && (
        <button
          onClick={onMore}
          className="text-[12px] lg:text-[13px] font-semibold text-aring-ink-500 active:opacity-70"
        >
          {more}
        </button>
      )}
    </div>
  );
}

// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
// 5) Ã¬ÂÂ¤Ã«ÂÂÃ¬ÂÂ Ã«Â§Â¤Ã¬Â¹Â­ Ã­ÂÂÃ«Â³Â´ Ã¢ÂÂ Ã¬ÂµÂÃªÂ·Â¼ 7Ã¬ÂÂ¼ Ã«ÂÂ´ Ã¬Â¡Â°Ã­ÂÂÃ¬ÂÂ top 5
//   Supabase fetch (Ã¬ÂÂ¤Ã­ÂÂ¨ Ã¬ÂÂ mock fallback)
//   "Ã¬Â ÂÃ¬Â²Â´Ã«Â³Â´ÃªÂ¸Â°" Ã¢ÂÂ /popular Ã«ÂÂ¼Ã¬ÂÂ°Ã­ÂÂ
// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function listingToMatchCard(row: Listing): MatchCard {
  const tones: ThumbTone[] = ['pink', 'peach', 'butter', 'mint', 'sky', 'sage'];
  let h = 0;
  for (let i = 0; i < row.id.length; i++) h = (h * 31 + row.id.charCodeAt(i)) | 0;
  const tone = tones[Math.abs(h) % tones.length];
  return {
    id: row.id,
    brand: row.brand ?? 'Ã«Â¸ÂÃ«ÂÂÃ«ÂÂ Ã«Â¯Â¸Ã¬ÂÂ',
    name: row.detail ?? row.shape ?? 'Ã­ÂÂ Ã¬Â§Â',
    similarity: 0,
    region: row.region ?? '',
    leftEmoji: 'Ã¢ÂÂ',
    rightEmoji: 'Ã¢ÂÂ',
    leftTone: tone,
    rightTone: tone,
    leftImage: row.photo_url,
    rightImage: row.photo_url,
    price: row.price ?? undefined,
    shape: row.shape ?? undefined,
    viewCount: row.view_count ?? 0,
  };
}

function TodayMatchesSection() {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchCard[]>(todayMatches);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    supabase
      .from('listings')
      .select('*')
      .eq('status', 'open')
      .gte('created_at', since)
      .order('view_count', { ascending: false })
      .limit(5)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('[aring] today matches fetch error', error);
          return;
        }
        if (data && data.length > 0) {
          setMatches((data as Listing[]).map(listingToMatchCard));
        }
        // data Ã«Â¹ÂÃ¬ÂÂ´Ã¬ÂÂÃ¬ÂÂ¼Ã«Â©Â´ mock ÃªÂ·Â¸Ã«ÂÂÃ«Â¡Â Ã¬ÂÂ Ã¬Â§Â (Ã«ÂÂ°Ã«ÂªÂ¨)
      });

    // ë¸ëë top ëª©ë¡ fetch (top_brands ë·°)
    supabase
      .from('top_brands')
      .select('brand_key, display_name, count')
      .then(({ data }) => {
        if (cancelled || !data) return;
        setDbBrands(data.map((b: { brand_key: string; display_name: string; count: number }) => ({
          key: b.brand_key,
          label: b.display_name || b.brand_key,
        })));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="pt-2 pb-5">
      <SectionHead
        title="Ã¬ÂÂ¤Ã«ÂÂÃ¬ÂÂ Ã«Â§Â¤Ã¬Â¹Â­ Ã­ÂÂÃ«Â³Â´"
        sub="Ã¬ÂµÂÃªÂ·Â¼ Ã¬ÂÂ¼Ã¬Â£Â¼Ã¬ÂÂ¼, ÃªÂ°ÂÃ¬ÂÂ¥ Ã«Â§ÂÃ¬ÂÂ´ Ã¬Â¡Â°Ã­ÂÂÃ«ÂÂ Ã­ÂÂ Ã¬Â§Â"
        more="Ã¬Â ÂÃ¬Â²Â´Ã«Â³Â´ÃªÂ¸Â°"
        onMore={() => router.push('/popular')}
      />
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 lg:px-8 pb-1">
        {matches.map((m) => (
          <MatchCardItem key={m.id} m={m} />
        ))}
      </div>
    </section>
  );
}

function MatchCardItem({ m }: { m: MatchCard }) {
  const priceText =
    typeof m.price === 'number' && m.price > 0
      ? formatKRW(m.price)
      : 'ÃªÂ°ÂÃªÂ²Â© Ã­ÂÂÃ¬ÂÂ';
  const viewCountText =
    typeof m.viewCount === 'number' ? `${m.viewCount}Ã­ÂÂ` : '0Ã­ÂÂ';

  return (
    <Link
      href={`/items/${m.id}`}
      onClick={log('today:tap', m.id)}
      className="shrink-0 w-[78%] lg:w-[300px] flex items-center gap-3 rounded-tile border border-aring-green-line bg-white p-3 lg:p-4 shadow-card text-left active:scale-[0.99] transition"
    >
      {/* Ã¬ÂÂ¸Ã«ÂÂ¤Ã¬ÂÂ¼ Ã¢ÂÂ Ã¬Â½ÂÃ«ÂÂ Ã«ÂÂ¼Ã«Â²Â¨ Ã¬Â ÂÃªÂ±Â° */}
      <div className="relative w-[80px] h-[80px] shrink-0">
        <ThumbImage
          src={m.leftImage}
          fallback={m.leftEmoji}
          tone={m.leftTone}
          alt={`${m.brand} ${m.name}`}
          className="w-full h-full"
        />
      </div>

      {/* Ã«Â³Â¸Ã«Â¬Â¸ Ã¢ÂÂ 4ÃªÂ°ÂÃ¬Â§Â Ã¬Â ÂÃ«Â³Â´Ã«Â§Â */}
      <div className="flex-1 min-w-0">
        {/* 1. ÃªÂ°ÂÃªÂ²Â© (Ã«Â©ÂÃ¬ÂÂ¸ ÃªÂ°ÂÃ¬Â¡Â°) */}
        <p className="text-[15px] font-extrabold text-aring-ink-900 truncate">
          {priceText}
        </p>
        {/* 2~4. ÃªÂ±Â°Ã«ÂÂÃ¬ÂÂ¥Ã¬ÂÂ / Ã¬Â¡Â°Ã­ÂÂÃ¬ÂÂ / Ã­ÂÂÃ­ÂÂ */}
        <div className="mt-1.5 flex flex-col gap-1 text-[10.5px] text-aring-ink-500">
          {m.region && (
            <span className="inline-flex items-center gap-1 truncate">
              <span aria-hidden>Ã°ÂÂÂ</span>
              <span className="truncate">{m.region}</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <span aria-hidden>Ã°ÂÂÂ</span>
            <span>Ã¬Â¡Â°Ã­ÂÂ {viewCountText}</span>
          </span>
          {m.shape && (
            <span className="inline-flex items-center gap-1 truncate">
              <span aria-hidden>Ã¢ÂÂ</span>
              <span className="truncate">{m.shape}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
// 6) Ã¬ÂµÂÃªÂ·Â¼ Ã«ÂÂ±Ã«Â¡ÂÃ«ÂÂ Ã­ÂÂ Ã¬Â§Â Ã¢ÂÂ ÃªÂ³ÂµÃ­ÂÂµ Ã¬Â»Â´Ã­ÂÂ¬Ã«ÂÂÃ­ÂÂ¸(useItemFilters + RecentItemCard)
//    "Ã«ÂÂÃ«Â³Â´ÃªÂ¸Â°"Ã«ÂÂ /products Ã«ÂÂ¼Ã¬ÂÂ°Ã­ÂÂ
// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function RecentItemsSection({ items }: { items: RecentItem[] }) {
  const router = useRouter();
  const { sort, setSort, side, setSide, filtered } = useItemFilters(items);

  return (
    <section className="pt-2 pb-5">
      <SectionHead
        title="Ã¬ÂµÂÃªÂ·Â¼ Ã«ÂÂ±Ã«Â¡ÂÃ«ÂÂ Ã­ÂÂ Ã¬Â§Â"
        sub="Ã«ÂÂÃªÂµÂ°ÃªÂ°ÂÃ¬ÂÂ Ã¬ÂÂÃ¬ÂÂ´Ã«Â²ÂÃ«Â¦Â° Ã«Â°ÂÃ¬ÂªÂ½Ã¬ÂÂ´ Ã«ÂÂ  Ã¬ÂÂ Ã¬ÂÂÃ¬ÂÂ´Ã¬ÂÂ"
        more="Ã«ÂÂÃ«Â³Â´ÃªÂ¸Â°"
        onMore={() => router.push('/products')}
      />

      <ItemFilterChips
        sort={sort}
        setSort={setSort}
        side={side}
        setSide={setSide}
      />

      {filtered.length === 0 ? (
        <div className="px-5 lg:px-8 py-10 text-center">
          <p className="text-[13px] font-bold text-aring-ink-900">
            Ã¬Â¡Â°ÃªÂ±Â´Ã¬ÂÂ Ã«Â§ÂÃ«ÂÂ Ã­ÂÂ Ã¬Â§ÂÃ¬ÂÂ´ Ã¬ÂÂÃ¬ÂÂ´Ã¬ÂÂ
          </p>
          <p className="mt-1 text-[11.5px] text-aring-ink-500">
            Ã­ÂÂÃ­ÂÂ°Ã«Â¥Â¼ Ã¬Â´ÂÃªÂ¸Â°Ã­ÂÂÃ­ÂÂÃªÂ±Â°Ã«ÂÂ Ã«ÂÂ¤Ã«Â¥Â¸ Ã¬Â¡Â°ÃªÂ±Â´Ã¬ÂÂ Ã¬ÂÂ Ã­ÂÂÃ­ÂÂ´ Ã¬Â£Â¼Ã¬ÂÂ¸Ã¬ÂÂ
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 px-5 lg:px-8">
          {filtered.map((it) => (
            <RecentItemCard key={it.id} it={it} />
          ))}
        </div>
      )}
    </section>
  );
}

// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
// 7) Ã«Â¸ÂÃ«ÂÂÃ«ÂÂÃ«Â³Â Ã­ÂÂÃ¬ÂÂ Ã¢ÂÂ Ã¬Â¹Â©
// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function BrandChips({
  active,
  onSelect,
  dbBrands,
}: {
  active: string;
  onSelect: (b: string) => void;
  dbBrands: { key: string; label: string }[];
}) {
  return (
    <section className="pt-2 pb-5">
      <SectionHead
        title="Ã«Â¸ÂÃ«ÂÂÃ«ÂÂÃ«Â³Â Ã­ÂÂÃ¬ÂÂ"
        sub="ÃªÂ°ÂÃ¬ÂÂ¥ Ã«Â§ÂÃ¬ÂÂ´ Ã«ÂÂ±Ã«Â¡ÂÃ«ÂÂ Ã«Â¸ÂÃ«ÂÂÃ«ÂÂ"
      />
      <div className="flex flex-wrap gap-2 px-5 lg:px-8 pb-1">
        {brands.slice(0, 10).map((b) => {
          const isActive = active === b;
          return (
            <button
              key={b}
              onClick={() => {
                onSelect(b);
                console.log('[aring]', 'brand:select', b);
              }}
              className={[
                'rounded-pill px-3.5 py-2 text-[12.5px] font-bold transition',
                isActive
                  ? 'bg-aring-ink-900 text-white shadow-chip'
                  : 'bg-white text-aring-ink-700 border border-aring-green-line hover:border-aring-ink-300',
              ].join(' ')}
            >
              {b}
            </button>
          );
        })}
        {brands.length > 10 && (
          <button
            onClick={log('brand:more')}
            className="rounded-pill px-3.5 py-2 text-[12.5px] font-bold bg-aring-ink-100 text-aring-ink-500"
          >
            + Ã«ÂÂÃ«Â³Â´ÃªÂ¸Â°
          </button>
        )}
      </div>
    </section>
  );
}

// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
// 8) Ã¬ÂÂ¸ÃªÂ¸Â° Ã«Â§Â¤Ã¬Â¹Â­ Ã¬ÂÂ±ÃªÂ³Âµ Ã¬ÂÂ¬Ã«Â¡Â
// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function SuccessStoryCard() {
  return (
    <section className="pt-2 pb-5">
      <SectionHead title="Ã«Â§Â¤Ã¬Â¹Â­ Ã¬ÂÂ±ÃªÂ³Âµ Ã¬ÂÂ¬Ã«Â¡Â" sub="Ã¬ÂÂ¤Ã¬Â Â Ã¬Â§ÂÃ¬ÂÂ Ã¬Â°Â¾Ã¬ÂÂ Ã¬ÂÂ´Ã¬ÂÂ¼ÃªÂ¸Â°" />
      <div className="mx-5 lg:mx-8 relative overflow-hidden rounded-card bg-aring-grad-green p-5 lg:p-8">
        {/* Ã¬ÂÂ¥Ã¬ÂÂ Ã¬ÂÂÃ­ÂÂÃ­ÂÂ¸ ÃªÂ¸ÂÃ«Â¡ÂÃ¬ÂÂ° */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 w-[180px] h-[180px] rounded-full opacity-30"
          style={{
            background:
              'radial-gradient(circle at center, #FBC8DC 0%, transparent 70%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-10 -bottom-12 w-[160px] h-[160px] rounded-full opacity-25"
          style={{
            background:
              'radial-gradient(circle at center, #C5DDF0 0%, transparent 70%)',
          }}
        />

        <span className="relative inline-flex items-center gap-1.5 rounded-pill border border-white/30 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-white">
          <span className="w-1.5 h-1.5 rounded-full bg-aring-accent" />
          {successStory.badge}
        </span>

        <p className="relative mt-3 text-[14.5px] leading-[1.55] font-semibold text-white">
          Ã¢ÂÂ{successStory.text}Ã¢ÂÂ
        </p>
        <p className="relative mt-2 text-[11.5px] text-white/70">
          {successStory.user}
        </p>

        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {successStory.metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-tile bg-white/8 backdrop-blur-sm border border-white/15 px-3 py-2.5 text-center"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              <p className="text-[18px] font-extrabold text-white tracking-tight">
                {m.value}
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-white/65 tracking-wide">
                {m.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
// 9) Ã­ÂÂÃ«ÂÂ¨ CTA Ã¢ÂÂ Ã¬ÂÂ¬Ã¬Â§ÂÃ¬ÂÂ¼Ã«Â¡Â Ã­ÂÂ Ã¬Â§Â Ã¬Â°Â¾ÃªÂ¸Â°
// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function FindByPhotoCTA() {
  return (
    <section className="px-5 lg:px-8 pt-2 pb-7 lg:pb-12">
      <button
        onClick={log('cta:find-by-photo')}
        className="w-full flex items-center gap-3 rounded-card bg-white border border-aring-green-line px-4 py-4 shadow-card active:scale-[0.99] transition text-left"
      >
        <div className="relative w-12 h-12 shrink-0 rounded-tile bg-aring-grad-pastel flex items-center justify-center">
          <IconCamera className="w-5 h-5 text-aring-ink-900" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold tracking-wider text-aring-accent">
            FIND BY PHOTO
          </p>
          <p className="mt-0.5 text-[14px] font-bold text-aring-ink-900">
            Ã¬ÂÂ´ ÃªÂ·ÂÃªÂ±Â¸Ã¬ÂÂ´Ã¬ÂÂ Ã«Â¹ÂÃ¬ÂÂ·Ã­ÂÂ Ã­ÂÂ Ã¬Â§Â Ã¬Â°Â¾ÃªÂ¸Â°
          </p>
          <p className="mt-0.5 text-[11px] text-aring-ink-500">
            Ã¬ÂÂ¬Ã¬Â§ÂÃ¬ÂÂ Ã¬ÂÂ¬Ã«Â¦Â¬Ã«Â©Â´ AIÃªÂ°Â 5Ã¬Â´Â Ã¬ÂÂÃ¬ÂÂ Ã­ÂÂÃ«Â³Â´Ã«Â¥Â¼ Ã«Â³Â´Ã¬ÂÂ¬Ã«ÂÂÃ«Â Â¤Ã¬ÂÂ
          </p>
        </div>
        <span className="w-9 h-9 shrink-0 rounded-full bg-aring-ink-900 flex items-center justify-center text-white">
          <IconArrow />
        </span>
      </button>
    </section>
  );
}

// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
// 10) Ã­ÂÂÃ«ÂÂ¨ Ã«ÂÂ¤Ã«Â¹ÂÃªÂ²ÂÃ¬ÂÂ´Ã¬ÂÂ Ã¢ÂÂ components/Nav.tsx Ã¬ÂÂ BottomNav Ã¬ÂÂ¬Ã¬ÂÂ© (ÃªÂ³ÂµÃ­ÂÂµ)
// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ

// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
// MAIN
// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
// Listing(DB row) Ã¢ÂÂ RecentItem(UI shape) Ã«Â§Â¤Ã­ÂÂ
const TONE_ROTATION: ThumbTone[] = ['pink', 'peach', 'butter', 'mint', 'sky', 'sage'];

function listingToRecent(row: Listing, idx: number): RecentItem {
  return {
    id: row.id,
    brand: row.brand ?? 'Ã«Â¸ÂÃ«ÂÂÃ«ÂÂ Ã«Â¯Â¸Ã¬ÂÂ',
    name: row.detail ?? row.shape ?? 'Ã­ÂÂ Ã¬Â§Â',
    price: row.price ?? 0,
    likes: 0,
    side: row.side,
    emoji: 'Ã¢ÂÂ',
    tone: TONE_ROTATION[idx % TONE_ROTATION.length],
    story: row.story ?? undefined,
    image: row.photo_url,
  };
}

export default function HomePage() {
  const [activeBrand, setActiveBrand] = useState('Ã¬Â ÂÃ¬Â²Â´');
  const [items, setItems] = useState<RecentItem[]>(mockRecentItems);
  const [dbBrands, setDbBrands] = useState<{ key: string; label: string }[]>([]);

  // SupabaseÃªÂ°Â Ã¬ÂÂ¤Ã¬Â ÂÃ«ÂÂÃ¬ÂÂ´ Ã¬ÂÂÃ¬ÂÂ¼Ã«Â©Â´ Ã¬ÂÂ¤Ã«ÂÂ°Ã¬ÂÂ´Ã­ÂÂ° fetch Ã¢ÂÂ Ã¬ÂÂÃ«ÂÂÃ«Â©Â´ mock Ã¬ÂÂ Ã¬Â§Â
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from('listings')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(8)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('[aring] fetch listings error', error);
          return;
        }
        if (data && data.length > 0) {
          setItems((data as Listing[]).map(listingToRecent));
        }
        // dataÃªÂ°Â Ã«Â¹ÂÃ¬ÂÂ´Ã¬ÂÂÃ¬ÂÂ¼Ã«Â©Â´ mock ÃªÂ·Â¸Ã«ÂÂÃ«Â¡Â Ã¬ÂÂ Ã¬Â§Â Ã¢ÂÂ Ã¬Â²Â« Ã«ÂÂ±Ã«Â¡Â Ã¬Â ÂÃªÂ¹ÂÃ¬Â§ÂÃ¬ÂÂ Ã«ÂÂ°Ã«ÂªÂ¨ Ã«ÂÂ°Ã¬ÂÂ´Ã­ÂÂ°
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
          <StatusBar />
          <TopNav />
          <SearchBar />
          <HeroCard />
          <TodayMatchesSection />
          <RecentItemsSection items={items} />
          <BrandChips active={activeBrand} onSelect={setActiveBrand} dbBrands={dbBrands} />
          <SuccessStoryCard />
          <FindByPhotoCTA />
        </div>
        <BottomNav active="home" />
      </div>
    </main>
  );
}
