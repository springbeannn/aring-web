'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import {
  todayMatches,
  recentItems as mockRecentItems,
  successStory,
  formatKRW,
  readLikedIds,
  writeLikedIds,
  pickTone,
  type MatchCard,
  type RecentItem,
} from '@/lib/mock';
import { supabase, type Listing } from '@/lib/supabase';
import { TopNav, BottomNav } from '@/components/Nav';
import { RecentItemCard } from '@/components/RecentItemCard';
import { FilterBar, useFilterBar } from '@/components/FilterBar';
import { getPastelClass } from '@/lib/pastel';

// ─────────────────────────────────────────────────────────────
// 아이콘
// ─────────────────────────────────────────────────────────────
type IconProps = { className?: string; strokeWidth?: number };

const IconSearch = ({ className = 'w-5 h-5', strokeWidth = 2 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
  </svg>
);
const IconCamera = ({ className = 'w-4 h-4', strokeWidth = 2 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);
const IconArrow = ({ className = 'w-3.5 h-3.5' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m13 5 7 7-7 7" />
  </svg>
);
const IconSparkle = ({ className = 'w-3 h-3' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M5.5 18.5l2.8-2.8M15.7 8.3l2.8-2.8" />
  </svg>
);
const IconEye = ({ className = 'w-3.5 h-3.5' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconHeart = ({ className = 'w-3.5 h-3.5', filled = false }: IconProps & { filled?: boolean }) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// 유명 브랜드 고정 10개
// ─────────────────────────────────────────────────────────────
const FAMOUS_BRANDS: string[] = [
  
  
  
];

// ─────────────────────────────────────────────────────────────
// 헬퍼
// ─────────────────────────────────────────────────────────────
const log = (e: string, d?: unknown) => () => console.log('[aring]', e, d ?? '');

// 톤 결정은 lib/mock의 pickTone 사용 (전 페이지 통일)
const toneFromId = pickTone;

function listingToRecentItem(row: Listing): RecentItem {
  return {
    id: row.id,
    brand: row.brand ?? '브랜드 미상',
    name: (row.detail ?? row.shape ?? '한 짝'),
    price: row.price ?? 0,
    likes: (row as any).likes_count ?? 0,
    side: (row.side ?? 'L') as 'L' | 'R',
    emoji: '◇',
    tone: pickTone(row.id),
    story: row.story ?? undefined,
    image: row.photo_url,
  };
}

function listingToMatchCard(row: Listing): MatchCard {
  const tone = toneFromId(row.id);
  return {
    id: row.id,
    brand: row.brand ?? '브랜드 미상',
    name: (row.detail ?? row.shape ?? '한 짝'),
    similarity: 0,
    region: row.region ?? '',
    leftEmoji: '◇', rightEmoji: '◇',
    leftTone: tone, rightTone: tone,
    leftImage: row.photo_url,
    rightImage: row.photo_url,
    price: row.price ?? undefined,
    shape: row.shape ?? undefined,
    viewCount: (row as any).view_count ?? 0,
  };
}

// ─────────────────────────────────────────────────────────────
// SearchBar
// ─────────────────────────────────────────────────────────────
function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        const q = query.trim();
        router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
      }}
      className="mx-5 lg:mx-8 mb-5 lg:mb-7 lg:mt-5 flex items-center gap-2.5 rounded-pill bg-aring-ink-100 px-4 lg:px-5 py-3 lg:py-3.5 lg:max-w-[640px]"
    >
      <IconSearch className="w-4 h-4 lg:w-5 lg:h-5 text-aring-ink-400 shrink-0" />
      <input
        type="search" value={query} onChange={e => setQuery(e.target.value)}
        className="flex-1 bg-transparent border-0 outline-none text-[16px] lg:text-[16px] text-aring-ink-700 placeholder:text-aring-ink-500"
        placeholder="브랜드, 모양, 컬러로 검색"
      />
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// HeroBanner
// ─────────────────────────────────────────────────────────────
function HeroBanner() {   // async 제거된 상태
  // ↓ 여기에 넣기 (함수 열리고 바로 첫 줄)
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/open-count')
      .then(res => res.json())
      .then(data => setCount(data.count))
  }, [])
return (
  <div className="mx-5 lg:mx-8 mb-6 lg:mb-10 relative overflow-hidden rounded-card bg-aring-grad-pastel px-5 lg:px-10 pt-2.5 lg:pt-6 pb-2.5 lg:pb-6 min-h-[220px] lg:min-h-[280px]">

    {/* 블러 배경 */}
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="aring-blob-a absolute -top-12 -left-10 w-[200px] h-[200px] rounded-full opacity-70" style={{ background: 'radial-gradient(circle, #FBC8DC 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="aring-blob-b absolute top-1/3 -right-14 w-[220px] h-[220px] rounded-full opacity-60" style={{ background: 'radial-gradient(circle, #C5DDF0 0%, transparent 70%)', filter: 'blur(48px)' }} />
      <div className="aring-blob-c absolute -bottom-14 left-1/4 w-[180px] h-[180px] rounded-full opacity-55" style={{ background: 'radial-gradient(circle, #FFEFB5 0%, transparent 70%)', filter: 'blur(44px)' }} />
    </div>

    {/* 합쳐진 배지 — count 로딩 중에는 skeleton 처리 */}
    <span className="relative inline-flex items-center gap-1 rounded-pill glass px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-aring-green shadow-card">
      <span className="relative w-2 h-2 rounded-full bg-aring-accent" />
      {count === null ? (
        <>AI MATCH · NEW : <span className="inline-block h-2.5 w-12 align-middle rounded bg-aring-ink-100 animate-pulse" /></>
      ) : (
        <>AI MATCH · NEW : {count} 매칭 중</>
      )}
    </span>

    <h1 className="relative z-10 mt-3.5 lg:mt-5 text-[24px] lg:text-[48px] lg:leading-[1.2] leading-[1.3] lg:leading-[1.2] font-bold tracking-tight text-aring-ink-900 max-w-[78%] lg:max-w-[55%]">
      하나만 남은 귀걸이,<br />
      <span className="grad-text-green">AI가 짝을 찾아드려요</span>
    </h1>

    <p className="relative z-10 mt-2 lg:mt-4 text-[15px] lg:text-[15px] leading-[1.5] leading-[1.6] text-aring-ink-700 max-w-[80%] lg:max-w-[55%]">
      사진 한 장이면 충분합니다. 브랜드·형태·소재·디테일까지 분석해 비슷하거나 정확히 맞는 짝을 연결합니다.
    </p>

    <Link href="/register" className="relative z-10 mt-4 lg:mt-7 inline-flex items-center gap-2 rounded-pill bg-aring-ink-900 px-5 lg:px-7 py-3 lg:py-3.5 text-[15px] lg:text-[15px] leading-[1.5] font-bold text-white shadow-cta active:scale-[0.98] transition">
      등록하기<IconArrow className="w-3.5 h-3.5" />
    </Link>

    <div className="pointer-events-none absolute -right-4 -bottom-6 lg:right-10 lg:bottom-1/2 lg:translate-y-1/2 w-[170px] h-[170px] lg:w-[260px] lg:h-[260px] flex items-center justify-center">
      <div className="absolute inset-0 radial-halo rounded-full" />
      <div className="relative grad-ring w-[110px] h-[110px] lg:w-[180px] lg:h-[180px] rounded-full shadow-[0_12px_30px_rgba(107,127,232,.25)]">
        <div className="absolute -top-3 lg:-top-5 left-1/2 -translate-x-1/2 w-5 h-5 lg:w-8 lg:h-8 rounded-full" style={{ background: 'linear-gradient(135deg,#FBC8DC,#FFD9B8,#C8E6C9)', boxShadow: '0 6px 14px rgba(245,168,199,.35)' }} />
      </div>
    </div>

  </div>
);

}

// ─────────────────────────────────────────────────────────────
// ThumbImage
// ─────────────────────────────────────────────────────────────
function ThumbImage({ src, fallback, bgClass, alt, className = '' }: {
  src?: string; fallback: string; bgClass: string; alt: string; className?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-tile border-2 border-white ${bgClass} ${className}`}>
      <img src={src} alt={alt} loading="lazy" className="absolute inset-0 w-full h-full object-cover"
        onError={e => {
          e.currentTarget.style.display = 'none';
          const n = e.currentTarget.nextElementSibling as HTMLElement;
          if (n) n.style.display = 'flex';
        }} />
      <span aria-hidden className="absolute inset-0 hidden items-center justify-center text-[26px]">{fallback}</span>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// SectionHeader
// ─────────────────────────────────────────────────────────────
function SectionHeader({ title, sub, more, onMore }: {
  title: string; sub?: string; more?: string; onMore?: () => void;
}) {
  return (
    <div className="flex items-end justify-between px-5 lg:px-8 mb-3">
      <div>
        <h2 className="text-[17px] lg:text-[18px] font-bold text-aring-ink-900 tracking-tight">{title}</h2>
        {sub && <p className="mt-0.5 text-[13px] lg:text-[14px] font-normal text-aring-ink-500">{sub}</p>}
      </div>
      {more && onMore && (
        <button onClick={onMore} className="text-[13px] lg:text-[14px] font-bold text-aring-ink-500 hover:text-aring-ink-900 transition">
          {more}
        </button>
      )}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────
// TodayMatchSection
// ─────────────────────────────────────────────────────────────
function TodayMatchSection() {
  const router = useRouter();
  // const [matches, setMatches] = useState<MatchCard[]>(todayMatches); // 롤백용 mock 초기값 — 주석
  const [matches, setMatches] = useState<MatchCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    const since = new Date(Date.now() - 604800000).toISOString();
    supabase.from('listings').select('*').eq('status', 'open')
      .gte('created_at', since).order('view_count', { ascending: false }).limit(5)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setIsError(true);
          setIsLoading(false);
          return;
        }
        if (data?.length) {
          setMatches(data.map(r => listingToMatchCard(r as Listing)));
        }
        setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="pt-2 pb-5">
      <SectionHeader title="오늘의 매칭 후보" sub="최근 일주일, 가장 많이 조회된 한 짝" more="더보기" onMore={() => router.push('/popular')} />
      {isLoading ? (
        <TodayMatchSkeleton />
      ) : isError ? (
        <SectionErrorBox label="매칭 후보" />
      ) : (
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 lg:px-8 pb-1">
          {matches.map((m, i) => <TodayMatchCard key={m.id} m={m} index={i} />)}
        </div>
      )}
    </section>
  );
}

function TodayMatchCard({ m, index }: { m: MatchCard; index: number }) {
  const priceLabel = typeof m.price === 'number' && m.price > 0 ? formatKRW(m.price) : '가격 협의';
  const viewCount = typeof m.viewCount === 'number' ? m.viewCount : 0;
  const baseLikes = typeof (m as MatchCard & { likes?: number }).likes === 'number'
    ? (m as MatchCard & { likes?: number }).likes!
    : 0;

  // 상세 페이지(items/[id])와 동일한 패턴: localStorage liked ids
  const [liked, setLiked] = useState(false);
  useEffect(() => {
    setLiked(readLikedIds().includes(m.id));
  }, [m.id]);

  function handleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const ids = readLikedIds();
    const next = ids.includes(m.id) ? ids.filter(i => i !== m.id) : [...ids, m.id];
    writeLikedIds(next);
    setLiked(next.includes(m.id));
  }

  return (
    <Link href={`/items/${m.id}`} onClick={log('today:tap', m.id)}
      className="shrink-0 w-[78%] lg:w-[300px] flex items-center gap-3 rounded-tile border border-aring-green-line bg-white p-3 lg:p-4 shadow-card text-left active:scale-[0.99] transition">
      <div className="relative w-[80px] h-[80px] shrink-0">
        <ThumbImage src={m.leftImage} fallback={m.leftEmoji} bgClass={getPastelClass(index)} alt={`${m.brand} ${m.name}`} className="w-full h-full" />
      </div>
      <div className="flex-1 min-w-0">
        {/* 가격 */}
        <p className="text-[15px] lg:text-[15px] font-bold text-aring-ink-900 truncate">{priceLabel}</p>
        {/* 위치 */}
        {m.region && (
          <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] lg:text-[12px] font-normal text-aring-ink-500 truncate max-w-full">
            <span aria-hidden>📍</span>
            <span className="truncate">{m.region}</span>
          </p>
        )}
        {/* 조회수 · 좋아요 — 가로 배치 */}
        <div className="mt-1 flex flex-row gap-2 items-center text-[11px] lg:text-[12px] font-normal text-aring-ink-400">
          <span className="inline-flex items-center gap-1">
            <IconEye className="w-3.5 h-3.5" />
            <span>조회수 {viewCount}</span>
          </span>
          <button
            type="button"
            onClick={handleLike}
            aria-label="찜하기"
            className={['inline-flex items-center gap-1 transition', liked ? 'text-aring-accent' : 'text-aring-ink-400'].join(' ')}
          >
            <IconHeart className="w-3.5 h-3.5" filled={liked} />
            <span>{baseLikes + (liked ? 1 : 0)}</span>
          </button>
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// RecentSection
// ─────────────────────────────────────────────────────────────
function RecentSection({ items, isLoading, isError }: { items: RecentItem[]; isLoading?: boolean; isError?: boolean }) {
  const router = useRouter();
    const { sort, setSort, price, setPrice } = useFilterBar();
    const filtered = items
        .filter(it => {
          if (price === 'all') return true;
          const p = it.price ?? null;
          if (price === '0-10000') return p !== null && p <= 10000;
          if (price === '10000-30000') return p !== null && p > 10000 && p <= 30000;
          if (price === '30000-70000') return p !== null && p > 30000 && p <= 70000;
          if (price === '70000-150000') return p !== null && p > 70000 && p <= 150000;
          if (price === '150000-plus') return p !== null && p > 150000;
          return true;
        });
    const sortedFiltered = sort === 'latest' ? filtered : [...filtered].reverse();
  return (
    <section className="pt-2 pb-5">
      <SectionHeader title="최근 등록된 한 짝" sub="짝을 찾아 완성하거나, 판매하세요" more="더보기" onMore={() => router.push('/products')} />
            <FilterBar sort={sort} onSort={setSort} price={price} onPrice={setPrice} />
            {isLoading ? (
        <RecentGridSkeleton />
      ) : isError ? (
        <SectionErrorBox label="최근 등록 한 짝" />
      ) : sortedFiltered.length === 0 ? (
        <div className="px-5 lg:px-8 py-10 text-center">
          <p className="text-[15px] lg:text-[15px] font-bold text-aring-ink-900">조건에 맞는 한 짝이 없어요</p>
          <p className="mt-1 text-[15px] lg:text-[15px] leading-[1.5] text-aring-ink-500">다른 가격대로 찾아보거나 직접 등록해보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 px-5 lg:px-8">
                    {sortedFiltered.map((it, i) => <RecentItemCard key={it.id} it={it} index={i} />)}
        </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// BrandSection — 칩 클릭 시 /brands/[브랜드명] 으로 이동
// ─────────────────────────────────────────────────────────────
function BrandSection({ brandCounts, isLoading }: {
  brandCounts: Record<string, number>;
  isLoading?: boolean;
}) {
  const router = useRouter();
  const famousSet = new Set(FAMOUS_BRANDS.map(b => b.toLowerCase()));

  const userBrands = useMemo(() =>
    Object.entries(brandCounts)
      .filter(([brand]) => brand && brand !== '브랜드 미상' && brand !== '기타' && !famousSet.has(brand.toLowerCase()))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([brand]) => brand),
  [brandCounts]);

  const hasEtc = (brandCounts['기타'] ?? 0) > 0;
  const allBrands = ['전체', ...FAMOUS_BRANDS, ...userBrands, ...(hasEtc ? ['기타'] : [])];
  const totalCount = Object.values(brandCounts).reduce((a, b) => a + b, 0);

  function handleClick(brand: string) {
    if (brand === '전체') {
      router.push('/products');
    } else {
      router.push(`/brands/${encodeURIComponent(brand)}`);
    }
  }

  return (
    <section id="brands" className="pt-2 pb-5 scroll-mt-20">
      <SectionHeader title="브랜드별 탐색" sub="가장 많이 등록된 브랜드" more="더보기" onMore={() => router.push('/brands')} />
      {isLoading ? (
        <BrandSectionSkeleton />
      ) : (
      <div className="flex flex-wrap gap-2 px-5 lg:px-8 pb-1">
        {allBrands.map(brand => {
          const count = brand === '전체'
            ? totalCount
            : Object.entries(brandCounts).find(
                ([key]) => key.toLowerCase() === brand.toLowerCase()
              )?.[1] ?? 0;

          return (
            <button
              key={brand}
              onClick={() => handleClick(brand)}
              className="rounded-pill px-2 py-1 text-[11px] lg:text-[13px] font-bold transition active:scale-95 bg-white text-aring-ink-700 border border-aring-green-line hover:border-aring-ink-300"
            >
              {brand}
              {count > 0 && (
                <span className="ml-1.5 text-[15px] lg:text-[15px] font-bold text-aring-ink-400">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// SuccessSection
// ─────────────────────────────────────────────────────────────
function SuccessSection() {
  return (
    <section className="pt-2 pb-4">
      <SectionHeader
        title="매칭 성공 사례"
        sub="실제 짝을 찾은 이야기"
        more="더보기"
        onMore={() => { window.location.href = '/cases'; }}
      />
      <Link
        href="/cases"
        aria-label="매칭 성공 사례 전체 보기"
        onClick={log('success:tap')}
        className="mx-5 lg:mx-8 relative overflow-hidden rounded-card bg-aring-grad-green px-5 py-4 lg:px-7 lg:py-[22px] block hover:opacity-95 active:scale-[0.99] transition"
      >
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 w-[180px] h-[180px] rounded-full opacity-30" style={{ background: 'radial-gradient(circle at center, #FBC8DC 0%, transparent 70%)' }} />
        <div aria-hidden className="pointer-events-none absolute -left-10 -bottom-12 w-[160px] h-[160px] rounded-full opacity-25" style={{ background: 'radial-gradient(circle at center, #C5DDF0 0%, transparent 70%)' }} />
        <span className="relative inline-flex items-center gap-1.5 rounded-pill border border-white/30 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white">
          <span className="w-1.5 h-1.5 rounded-full bg-aring-accent" />{successStory.badge}
        </span>
        <p className="relative mt-3 text-[16px] leading-[1.55] font-semibold text-white">&ldquo;{successStory.text}&rdquo;</p>
        <p className="relative mt-2 text-[15px] lg:text-[15px] text-white/70">{successStory.user}</p>
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {successStory.metrics.map(m => (
            <div key={m.label} className="rounded-tile border border-white/15 px-3 py-2.5 text-center backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <p className="text-[20px] font-bold text-white tracking-tight">{m.value}</p>
              <p className="mt-0.5 text-[12px] lg:text-[13px] font-semibold text-white/65 tracking-wide">{m.label}</p>
            </div>
          ))}
        </div>
        <div className="relative mt-4 flex items-center justify-end gap-1 text-[12px] lg:text-[13px] font-bold text-white/90">
          전체 사례 보기
          <IconArrow className="w-3 h-3" />
        </div>
      </Link>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// FindByPhotoCTA
// ─────────────────────────────────────────────────────────────
function FindByPhotoCTA() {
  const router = useRouter();
  return (
    <section className="px-5 lg:px-8 pt-1.5 pb-4 lg:pb-8">
      <button onClick={() => { log('cta:find-by-photo'); router.push('/my/match'); }} className="w-full flex items-center gap-3 rounded-card bg-white border border-aring-green-line px-4 py-4 shadow-card active:scale-[0.99] transition text-left">
        <div className="relative w-12 h-12 shrink-0 rounded-tile bg-aring-grad-pastel flex items-center justify-center">
          <IconCamera className="w-5 h-5 text-aring-ink-900" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] lg:text-[13px] font-bold tracking-wider text-aring-green">FIND BY PHOTO</p>
          <p className="mt-0.5 text-[16px] font-bold text-aring-ink-900">이 귀걸이와 비슷한 한 짝 찾기</p>
          <p className="mt-0.5 text-[15px] lg:text-[15px] leading-[1.5] text-aring-ink-500">사진을 올리면 AI가 5초 안에 후보를 보여드려요</p>
        </div>
        <span className="w-9 h-9 shrink-0 rounded-full bg-aring-ink-900 flex items-center justify-center text-white">
          <IconArrow />
        </span>
      </button>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Skeleton 컴포넌트
// ─────────────────────────────────────────────────────────────
function TodayMatchSkeleton() {
  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 lg:px-8 pb-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="shrink-0 w-[78%] lg:w-[300px] flex items-center gap-3 rounded-tile border border-aring-green-line bg-white p-3 lg:p-4 shadow-card">
          <div className="w-[80px] h-[80px] shrink-0 rounded-tile bg-aring-ink-100 animate-pulse" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 w-2/3 rounded bg-aring-ink-100 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-aring-ink-100 animate-pulse" />
            <div className="h-3 w-1/3 rounded bg-aring-ink-100 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentItemSkeleton() {
  return (
    <div className="rounded-tile bg-white border border-aring-green-line overflow-hidden">
      <div className="aspect-square bg-aring-ink-100 animate-pulse" />
      <div className="p-3 space-y-1.5">
        <div className="h-3 w-1/2 rounded bg-aring-ink-100 animate-pulse" />
        <div className="h-4 w-3/4 rounded bg-aring-ink-100 animate-pulse" />
        <div className="h-3 w-2/3 rounded bg-aring-ink-100 animate-pulse" />
      </div>
    </div>
  );
}

function RecentGridSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 px-5 lg:px-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <RecentItemSkeleton key={i} />
      ))}
    </div>
  );
}

function BrandSectionSkeleton() {
  const widths = ['w-12', 'w-16', 'w-20', 'w-14', 'w-20', 'w-16', 'w-12', 'w-20', 'w-14', 'w-16'];
  return (
    <div className="flex flex-wrap gap-2 px-5 lg:px-8 pb-1">
      {widths.map((w, i) => (
        <div key={i} className={`h-7 ${w} rounded-pill bg-aring-ink-100 animate-pulse`} />
      ))}
    </div>
  );
}

function SectionErrorBox({ label }: { label: string }) {
  return (
    <div className="px-5 lg:px-8 py-8 text-center">
      <p className="text-[15px] lg:text-[15px] leading-[1.5] text-aring-ink-500">{label}을 불러오지 못했어요</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────────────────────────
export default function HomePage() {
  // const [allItems, setAllItems] = useState<RecentItem[]>(mockRecentItems); // 롤백용 mock 초기값 — 주석
  const [allItems, setAllItems] = useState<RecentItem[]>([]);
  const [brandCounts, setBrandCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    supabase
      .from('listings')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('[aring] fetch listings error', error);
          setIsError(true);
          setIsLoading(false);
          return;
        }
        if (!data?.length) {
          setIsLoading(false);
          return;
        }

        setAllItems(data.map((row) => listingToRecentItem(row as Listing)));

        // brand_key 또는 aliases 기준으로 집계, display_name으로 표시
        import('@/lib/brandNormalizer').then(({ getBrands }) => {
          getBrands().then(brandDict => {
            const counts: Record<string, number> = {};
            data.forEach(row => {
              const brandInput = (row.brand as string)?.trim();
              if (!brandInput || brandInput === '브랜드 미상') return;
              const bkey = (row as any).brand_key as string | undefined;
              // 1) brand_key로 직접 매칭
              let dictEntry = bkey ? brandDict.find(b => b.brand_key === bkey) : null;
              // 2) brand_key 없으면 aliases/name_ko/name_en으로 매칭
              if (!dictEntry) {
                const q = brandInput.toLowerCase().replace(/\s+/g, '');
                dictEntry = brandDict.find(b => {
                  const targets = [
                    b.brand_key,
                    b.display_name.toLowerCase(),
                    (b.name_ko ?? '').toLowerCase(),
                    (b.name_en ?? '').toLowerCase(),
                    ...b.aliases.map((a: string) => a.toLowerCase()),
                  ].map(t => t.replace(/\s+/g, ''));
                  return targets.includes(q);
                }) ?? null;
              }
              // 3) 딕셔너리에 없으면 '기타'
              const displayName = dictEntry?.display_name ?? '기타';
              counts[displayName] = (counts[displayName] ?? 0) + 1;
            });
            if (cancelled) return;
            setBrandCounts(counts);
            setIsLoading(false);
          }).catch(() => {
            if (!cancelled) setIsLoading(false);
          });
        }).catch(() => {
          if (!cancelled) setIsLoading(false);
        });
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
        <div className="pb-28 lg:pb-10">
          <TopNav />
          <SearchBar />
          <HeroBanner />
          <TodayMatchSection />
          <RecentSection items={allItems.slice(0, 12)} isLoading={isLoading} isError={isError} />
          <BrandSection brandCounts={brandCounts} isLoading={isLoading} />
          <SuccessSection />
          <FindByPhotoCTA />
        </div>
        <BottomNav active="home" />
      </div>
    </main>
  );
}
