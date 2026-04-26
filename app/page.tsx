'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  todayMatches,
  recentItems as mockRecentItems,
  brands,
  successStory,
  formatKRW,
  thumbBg,
  type MatchCard,
  type RecentItem,
  type ThumbTone,
} from '@/lib/mock';
import { supabase, type Listing } from '@/lib/supabase';

// ─────────────────────────────────────────────────────────────
// 아이콘 (inline SVG · stroke 기반)
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// 헬퍼
// ─────────────────────────────────────────────────────────────
const log =
  (label: string, payload?: unknown) =>
  () =>
    console.log('[aring]', label, payload ?? '');

// 실사 이미지 + emoji 폴백 + tone 배경 (border-2 white frame)
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

// ─────────────────────────────────────────────────────────────
// 1) 상태바 (mock) — 모바일 폰 프레임에서만 노출
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// 2) 상단 네비 — 로고 / 알림 / 채팅
// ─────────────────────────────────────────────────────────────
function TopNav() {
  const desktopMenu: { key: Tab; label: string }[] = [
    { key: 'home', label: '홈' },
    { key: 'discover', label: '탐색' },
    { key: 'register', label: '등록' },
    { key: 'chat', label: '채팅' },
    { key: 'my', label: 'MY' },
  ];

  return (
    <div className="flex items-center justify-between px-5 lg:px-8 pt-2 lg:pt-5 pb-3.5 lg:pb-5 lg:border-b lg:border-aring-green-line">
      <div className="flex items-center gap-8">
        <div className="flex items-baseline gap-1">
          <span className="text-[26px] lg:text-[28px] font-black tracking-tight text-aring-green leading-none">
            aring
          </span>
          <sup className="text-[10px] font-medium text-aring-ink-500">
            한 짝의 짝
          </sup>
        </div>
        {/* 데스크탑 메뉴 */}
        <nav className="hidden lg:flex items-center gap-1">
          {desktopMenu.map((m) => (
            <button
              key={m.key}
              onClick={log(`nav:${m.key}`)}
              className="px-3.5 py-2 rounded-pill text-[13px] font-semibold text-aring-ink-700 hover:bg-aring-ink-100 transition"
            >
              {m.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2.5">
        <Link
          href="/register"
          aria-label="한 짝 등록"
          className="hidden lg:inline-flex items-center gap-1.5 rounded-pill bg-aring-ink-900 px-4 py-2.5 text-[13px] font-extrabold text-white shadow-cta active:scale-95 transition"
        >
          <IconPlus className="w-4 h-4" strokeWidth={2.4} />
          한 짝 등록
        </Link>
        <button
          onClick={log('topnav:bell')}
          aria-label="알림"
          className="relative w-10 h-10 rounded-full bg-aring-ink-100 flex items-center justify-center text-aring-ink-900 active:scale-95 transition"
        >
          <IconBell />
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-aring-accent ring-2 ring-white" />
        </button>
        <button
          onClick={log('topnav:chat')}
          aria-label="채팅"
          className="relative w-10 h-10 rounded-full bg-aring-ink-100 flex items-center justify-center text-aring-ink-900 active:scale-95 transition"
        >
          <IconChat />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3) 검색바
// ─────────────────────────────────────────────────────────────
function SearchBar() {
  return (
    <div className="mx-5 lg:mx-8 mb-5 lg:mb-7 lg:mt-5 flex items-center gap-2.5 rounded-pill bg-aring-ink-100 px-4 lg:px-5 py-3 lg:py-3.5 lg:max-w-[640px]">
      <IconSearch className="w-4 h-4 lg:w-5 lg:h-5 text-aring-ink-500" />
      <input
        className="flex-1 bg-transparent border-0 outline-none text-[14px] lg:text-[15px] text-aring-ink-700 placeholder:text-aring-ink-500"
        placeholder="브랜드, 모양, 컬러로 검색"
      />
      <button
        onClick={log('search:camera')}
        aria-label="사진으로 검색"
        className="w-7 h-7 rounded-full bg-aring-ink-900 flex items-center justify-center text-white active:scale-95 transition"
      >
        <IconCamera />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4) 히어로 카드
// ─────────────────────────────────────────────────────────────
function HeroCard() {
  return (
    <div className="mx-5 lg:mx-8 mb-6 lg:mb-10 relative overflow-hidden rounded-card bg-aring-grad-pastel px-5 lg:px-10 pt-5 lg:pt-12 pb-5 lg:pb-12 min-h-[260px] lg:min-h-[340px]">
      {/* ── Pastel glow blobs (배경 레이어, blur + soft float) ── */}
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

      {/* 배지 — frosted glass */}
      <span className="relative inline-flex items-center gap-1 rounded-pill glass px-2.5 py-1.5 text-[10px] font-extrabold tracking-wider text-aring-green shadow-card">
        <IconSparkle className="w-3 h-3" />
        AI MATCH · NEW
      </span>

      {/* Frosted Live Pill — 우상단 / "지금 매칭 중" 라이브 사인 */}
      <div className="absolute top-5 right-5 lg:top-8 lg:right-8 z-10 glass rounded-pill pl-2.5 pr-3 py-1.5 inline-flex items-center gap-2 shadow-card">
        <span className="relative flex w-2 h-2">
          <span className="aring-pulse absolute inset-0 rounded-full bg-aring-accent" />
          <span className="relative w-2 h-2 rounded-full bg-aring-accent" />
        </span>
        <span className="text-[10px] font-bold text-aring-ink-900 tracking-wide">
          지금 12명 매칭 중
        </span>
      </div>

      {/* 헤드라인 */}
      <h1 className="relative mt-3.5 lg:mt-5 text-[22px] lg:text-[40px] leading-[1.3] lg:leading-[1.2] font-extrabold tracking-tight text-aring-ink-900 max-w-[78%] lg:max-w-[55%]">
        하나만 남은 귀걸이,
        <br />
        <span className="grad-text-green">AI가 짝을 찾아드려요</span>
      </h1>

      {/* 설명 */}
      <p className="relative mt-2 lg:mt-4 text-[12.5px] lg:text-[15px] leading-[1.6] text-aring-ink-700 max-w-[80%] lg:max-w-[55%]">
        사진 한 장이면 충분합니다. 브랜드·형태·소재·디테일까지 분석해
        비슷하거나 정확히 맞는 짝을 연결합니다.
      </p>

      {/* CTA */}
      <Link
        href="/register"
        className="relative mt-4 lg:mt-7 inline-flex items-center gap-2 rounded-pill bg-aring-ink-900 px-5 lg:px-7 py-3 lg:py-3.5 text-[13px] lg:text-[14px] font-extrabold text-white shadow-cta active:scale-[0.98] transition"
      >
        등록하기
        <IconArrow className="w-3.5 h-3.5" />
      </Link>

      {/* 일러스트 (귀걸이 ring) */}
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

// ─────────────────────────────────────────────────────────────
// 섹션 헤더 공통
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// 5) 오늘의 매칭 후보
// ─────────────────────────────────────────────────────────────
function TodayMatchesSection() {
  return (
    <section className="pt-2 pb-5">
      <SectionHead
        title="오늘의 매칭 후보"
        sub="AI가 가장 가깝다고 판단한 짝"
        more="전체보기"
        onMore={log('today:more')}
      />
      <div className="no-scrollbar flex lg:grid lg:grid-cols-4 gap-3 lg:gap-4 overflow-x-auto lg:overflow-visible px-5 lg:px-8 pb-1">
        {todayMatches.map((m) => (
          <MatchCardItem key={m.id} m={m} />
        ))}
      </div>
    </section>
  );
}

function MatchCardItem({ m }: { m: MatchCard }) {
  return (
    <button
      onClick={log('today:tap', m.id)}
      className="shrink-0 w-[78%] lg:w-auto flex items-center gap-3 rounded-tile border border-aring-green-line bg-white p-3 lg:p-4 shadow-card text-left active:scale-[0.99] transition"
    >
      {/* 매칭 후보 — 실사 이미지 1개로 단순화 */}
      <div className="relative w-[80px] h-[80px] shrink-0">
        <span className="absolute -top-1.5 -left-1.5 z-10 rounded-pill glass-dark px-2 py-1 text-[10px] font-extrabold text-white shadow-chip">
          {m.similarity}%
        </span>
        <ThumbImage
          src={m.leftImage}
          fallback={m.leftEmoji}
          tone={m.leftTone}
          alt={`${m.brand} ${m.name}`}
          className="w-full h-full"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10.5px] font-bold tracking-wider text-aring-ink-500">
          {m.brand}
        </p>
        <p className="mt-0.5 text-[14px] font-bold text-aring-ink-900 truncate">
          {m.name}
        </p>
        <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-pill bg-aring-pastel-pink/40 px-2 py-1">
          <IconSparkle className="w-3 h-3 text-aring-accent" />
          <span className="text-[10.5px] font-bold text-aring-ink-900">
            매칭 {m.similarity}%
          </span>
        </div>
        <p className="mt-1.5 text-[10.5px] text-aring-ink-500">{m.region}</p>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// 6) 최근 등록된 한 짝 — 2열 그리드
// ─────────────────────────────────────────────────────────────
// ── 필터 옵션 정의 ────────────────────────────────────────────
type SortKey = 'recent' | 'price_low' | 'price_high' | 'popular';
type PriceRange = 'all' | 'under_30' | 'mid_30_50' | 'mid_50_100' | 'over_100';
type SideFilter = 'all' | 'L' | 'R';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'recent', label: '최신순' },
  { value: 'price_low', label: '낮은 가격순' },
  { value: 'price_high', label: '높은 가격순' },
  { value: 'popular', label: '인기순' },
];
const PRICE_OPTIONS: { value: PriceRange; label: string }[] = [
  { value: 'all', label: '전체 가격' },
  { value: 'under_30', label: '3만 원 이하' },
  { value: 'mid_30_50', label: '3~5만 원' },
  { value: 'mid_50_100', label: '5~10만 원' },
  { value: 'over_100', label: '10만 원 이상' },
];
const SIDE_OPTIONS: { value: SideFilter; label: string }[] = [
  { value: 'all', label: 'L · R 전체' },
  { value: 'L', label: '왼쪽 한 짝 (L)' },
  { value: 'R', label: '오른쪽 한 짝 (R)' },
];

function priceMatches(price: number, range: PriceRange): boolean {
  switch (range) {
    case 'under_30':
      return price > 0 && price < 30000;
    case 'mid_30_50':
      return price >= 30000 && price < 50000;
    case 'mid_50_100':
      return price >= 50000 && price < 100000;
    case 'over_100':
      return price >= 100000;
    case 'all':
    default:
      return true;
  }
}

function FilterChip({
  label,
  isActive,
  isOpen,
  onToggle,
  options,
  current,
  onSelect,
}: {
  label: string;
  isActive: boolean;
  isOpen: boolean;
  onToggle: () => void;
  options: { value: string; label: string }[];
  current: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="relative" data-filter-chip>
      <button
        onClick={onToggle}
        className={[
          'shrink-0 inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[11.5px] font-bold shadow-card active:scale-[0.98] transition',
          isActive
            ? 'bg-aring-ink-900 text-white'
            : 'glass text-aring-ink-900',
        ].join(' ')}
      >
        {label}
        <IconChevronDown
          className={[
            'w-3 h-3 transition-transform',
            isActive ? 'text-white/80' : 'text-aring-ink-500',
            isOpen ? 'rotate-180' : '',
          ].join(' ')}
        />
      </button>
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1.5 z-30 min-w-[160px] rounded-tile bg-white border border-aring-green-line shadow-card overflow-hidden"
        >
          {options.map((opt) => {
            const selected = opt.value === current;
            return (
              <button
                key={opt.value}
                onClick={() => onSelect(opt.value)}
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
  );
}

function RecentItemsSection({ items }: { items: RecentItem[] }) {
  const [sort, setSort] = useState<SortKey>('recent');
  const [price, setPrice] = useState<PriceRange>('all');
  const [side, setSide] = useState<SideFilter>('all');
  const [open, setOpen] = useState<null | 'sort' | 'price' | 'side'>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 / esc 시 dropdown 닫기
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

  const filtered = useMemo(() => {
    let arr = items.slice();
    if (side !== 'all') arr = arr.filter((it) => it.side === side);
    if (price !== 'all')
      arr = arr.filter((it) => priceMatches(it.price ?? 0, price));
    switch (sort) {
      case 'price_low':
        arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case 'price_high':
        arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case 'popular':
        arr.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
        break;
      // 'recent'는 fetch 시점 정렬 그대로 유지
    }
    return arr;
  }, [items, sort, price, side]);

  const sortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? '최신순';
  const priceLabel =
    price === 'all'
      ? '가격대'
      : PRICE_OPTIONS.find((o) => o.value === price)?.label ?? '가격대';
  const sideLabel = side === 'all' ? 'L · R' : `한 짝: ${side}`;

  return (
    <section className="pt-2 pb-5">
      <SectionHead
        title="최근 등록된 한 짝"
        sub="누군가의 잃어버린 반쪽이 될 수 있어요"
        more="더보기"
        onMore={log('recent:more')}
      />

      {/* 필터 chips — 동작 가능 */}
      <div
        ref={containerRef}
        className="no-scrollbar flex gap-2 overflow-x-auto overflow-y-visible px-5 lg:px-8 mb-3"
      >
        <FilterChip
          label={sortLabel}
          isActive={sort !== 'recent'}
          isOpen={open === 'sort'}
          onToggle={() => setOpen(open === 'sort' ? null : 'sort')}
          options={SORT_OPTIONS}
          current={sort}
          onSelect={(v) => {
            setSort(v as SortKey);
            setOpen(null);
            console.log('[aring]', 'filter:sort', v);
          }}
        />
        <FilterChip
          label={priceLabel}
          isActive={price !== 'all'}
          isOpen={open === 'price'}
          onToggle={() => setOpen(open === 'price' ? null : 'price')}
          options={PRICE_OPTIONS}
          current={price}
          onSelect={(v) => {
            setPrice(v as PriceRange);
            setOpen(null);
            console.log('[aring]', 'filter:price', v);
          }}
        />
        <FilterChip
          label={sideLabel}
          isActive={side !== 'all'}
          isOpen={open === 'side'}
          onToggle={() => setOpen(open === 'side' ? null : 'side')}
          options={SIDE_OPTIONS}
          current={side}
          onSelect={(v) => {
            setSide(v as SideFilter);
            setOpen(null);
            console.log('[aring]', 'filter:side', v);
          }}
        />
        {(sort !== 'recent' || price !== 'all' || side !== 'all') && (
          <button
            onClick={() => {
              setSort('recent');
              setPrice('all');
              setSide('all');
              setOpen(null);
            }}
            className="shrink-0 inline-flex items-center rounded-pill px-3 py-1.5 text-[11.5px] font-bold text-aring-ink-500 hover:text-aring-ink-900 transition"
          >
            초기화
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="px-5 lg:px-8 py-10 text-center">
          <p className="text-[13px] font-bold text-aring-ink-900">
            조건에 맞는 한 짝이 없어요
          </p>
          <p className="mt-1 text-[11.5px] text-aring-ink-500">
            필터를 초기화하거나 다른 조건을 선택해 주세요
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

function RecentItemCard({ it }: { it: RecentItem }) {
  return (
    <Link
      href={`/items/${it.id}`}
      onClick={log('recent:tap', it.id)}
      className="flex flex-col rounded-tile border border-aring-green-line bg-white overflow-hidden text-left active:scale-[0.99] transition"
    >
      {/* 썸네일 — 실사 이미지, 실패 시 emoji 폴백 */}
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

// ─────────────────────────────────────────────────────────────
// 7) 브랜드별 탐색 — 칩
// ─────────────────────────────────────────────────────────────
function BrandChips({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (b: string) => void;
}) {
  return (
    <section className="pt-2 pb-5">
      <SectionHead
        title="브랜드별 탐색"
        sub="가장 많이 등록된 브랜드"
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
            + 더보기
          </button>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 8) 인기 매칭 성공 사례
// ─────────────────────────────────────────────────────────────
function SuccessStoryCard() {
  return (
    <section className="pt-2 pb-5">
      <SectionHead title="매칭 성공 사례" sub="실제 짝을 찾은 이야기" />
      <div className="mx-5 lg:mx-8 relative overflow-hidden rounded-card bg-aring-grad-green p-5 lg:p-8">
        {/* 장식 소프트 글로우 */}
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
          “{successStory.text}”
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

// ─────────────────────────────────────────────────────────────
// 9) 하단 CTA — 사진으로 한 짝 찾기
// ─────────────────────────────────────────────────────────────
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
            이 귀걸이와 비슷한 한 짝 찾기
          </p>
          <p className="mt-0.5 text-[11px] text-aring-ink-500">
            사진을 올리면 AI가 5초 안에 후보를 보여드려요
          </p>
        </div>
        <span className="w-9 h-9 shrink-0 rounded-full bg-aring-ink-900 flex items-center justify-center text-white">
          <IconArrow />
        </span>
      </button>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 10) 하단 네비게이션 — 5탭 + 중앙 FAB(등록)
// ─────────────────────────────────────────────────────────────
type Tab = 'home' | 'discover' | 'register' | 'chat' | 'my';

function BottomNav({ active = 'home' as Tab }: { active?: Tab }) {
  const item = (key: Tab, label: string, icon: React.ReactNode, dot?: 'unread' | 'new') => {
    const isActive = active === key;
    return (
      <button
        key={key}
        onClick={log(`nav:${key}`)}
        className={[
          'relative flex flex-col items-center gap-1 flex-1 py-2',
          isActive ? 'text-aring-green' : 'text-aring-ink-500',
        ].join(' ')}
      >
        <span className="relative">
          {icon}
          {dot === 'unread' && (
            <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] px-1 rounded-full bg-aring-accent text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white">
              2
            </span>
          )}
          {dot === 'new' && (
            <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-aring-accent ring-2 ring-white" />
          )}
        </span>
        <span className={[
          'text-[10.5px]',
          isActive ? 'font-extrabold' : 'font-semibold',
        ].join(' ')}>{label}</span>
        {isActive && (
          <span className="absolute -bottom-0.5 w-5 h-0.5 rounded-full bg-aring-green" />
        )}
      </button>
    );
  };

  return (
    <nav className="absolute left-0 right-0 bottom-0 z-30 lg:hidden">
      <div className="relative mx-auto max-w-[440px] glass-strong border-t border-white/60 pb-[env(safe-area-inset-bottom,0px)]">
        {/* 중앙 FAB — 등록 */}
        <Link
          href="/register"
          aria-label="한 짝 등록하기"
          className="absolute left-1/2 -translate-x-1/2 -top-6 w-[60px] h-[60px] rounded-full bg-aring-green text-white flex items-center justify-center shadow-cta active:scale-95 transition"
          style={{
            boxShadow:
              '0 14px 28px rgba(28,51,40,0.35), 0 4px 10px rgba(28,51,40,0.18)',
          }}
        >
          <IconPlus />
          <span
            aria-hidden
            className="absolute inset-[-3px] rounded-full pointer-events-none"
            style={{
              background:
                'linear-gradient(135deg, rgba(251,200,220,.55), rgba(197,221,240,.55))',
              filter: 'blur(8px)',
              zIndex: -1,
            }}
          />
        </Link>

        <div className="flex items-stretch px-2 pt-2 pb-2">
          {item('home', '홈', <IconHome />)}
          {item('discover', '탐색', <IconCompass />)}
          {/* 가운데 자리 비워둠 (FAB가 차지) */}
          <div className="flex-1 flex flex-col items-center gap-1 py-2 select-none pointer-events-none opacity-0">
            <IconPlus />
            <span className="text-[10.5px]">등록</span>
          </div>
          {item('chat', '채팅', <IconChat />, 'unread')}
          {item('my', 'MY', <IconUser />, 'new')}
        </div>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
// Listing(DB row) → RecentItem(UI shape) 매핑
const TONE_ROTATION: ThumbTone[] = ['pink', 'peach', 'butter', 'mint', 'sky', 'sage'];

function listingToRecent(row: Listing, idx: number): RecentItem {
  return {
    id: row.id,
    brand: row.brand ?? '브랜드 미상',
    name: row.detail ?? row.shape ?? '한 짝',
    price: row.price ?? 0,
    likes: 0,
    side: row.side,
    emoji: '◇',
    tone: TONE_ROTATION[idx % TONE_ROTATION.length],
    story: row.story ?? undefined,
    image: row.photo_url,
  };
}

export default function HomePage() {
  const [activeBrand, setActiveBrand] = useState('전체');
  const [items, setItems] = useState<RecentItem[]>(mockRecentItems);

  // Supabase가 설정되어 있으면 실데이터 fetch — 아니면 mock 유지
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
        // data가 비어있으면 mock 그대로 유지 — 첫 등록 전까지의 데모 데이터
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
          <BrandChips active={activeBrand} onSelect={setActiveBrand} />
          <SuccessStoryCard />
          <FindByPhotoCTA />
        </div>
        <BottomNav active="home" />
      </div>
    </main>
  );
}
