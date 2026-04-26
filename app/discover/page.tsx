'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { TopNav, BottomNav } from '@/components/Nav';
import { RecentItemCard } from '@/components/RecentItemCard';
import {
  recentItems as mockRecentItems,
  type RecentItem,
  type ThumbTone,
} from '@/lib/mock';
import { supabase, type Listing } from '@/lib/supabase';

// ─────────────────────────────────────────────────────────────
// /discover — 알약식 다중 속성 필터 페이지 (스와로브스키 카테고리 차용)
//
// 동작 카테고리 (Phase 1, 5종): shape · material · side · price · brand
// 노출만 (Phase 2 예정, 4종, disabled): color · theme · size · condition
//
// 결과: 같은 페이지 하단 그리드, 즉시 갱신 (chip 클릭 즉시 리렌더)
// ─────────────────────────────────────────────────────────────

const TONE_ROTATION: ThumbTone[] = [
  'pink',
  'peach',
  'butter',
  'mint',
  'sky',
  'sage',
];

function pickTone(seed: string): ThumbTone {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return TONE_ROTATION[Math.abs(h) % TONE_ROTATION.length];
}

function listingToRecent(row: Listing): RecentItem {
  return {
    id: row.id,
    brand: row.brand ?? '브랜드 미상',
    name: row.detail ?? row.shape ?? '한 짝',
    price: row.price ?? 0,
    likes: 0,
    side: row.side,
    emoji: '◇',
    tone: pickTone(row.id),
    story: row.story ?? undefined,
    image: row.photo_url,
  };
}

// ─────────────────────────────────────────────────────────────
// 카테고리 옵션 정의
// ─────────────────────────────────────────────────────────────
type ShapeKey = 'all' | 'stud' | 'drop' | 'hoop' | 'chandelier' | 'cuff' | 'climber';
type MaterialKey =
  | 'all'
  | 'crystal'
  | 'pearl'
  | 'silver'
  | 'gold'
  | 'rose_gold'
  | 'plated';
type SideKey = 'all' | 'L' | 'R';
type PriceKey = 'all' | 'under_30' | 'mid_30_50' | 'mid_50_100' | 'over_100';

const SHAPE_OPTIONS: { value: ShapeKey; label: string; icon: string }[] = [
  { value: 'all', label: '전체', icon: '◇' },
  { value: 'stud', label: '스터드', icon: '●' },
  { value: 'drop', label: '드롭', icon: '◆' },
  { value: 'hoop', label: '후프', icon: '◯' },
  { value: 'chandelier', label: '샹들리에', icon: '✧' },
  { value: 'cuff', label: '이어커프', icon: '∽' },
  { value: 'climber', label: '클라이머', icon: '⤴' },
];

const MATERIAL_OPTIONS: {
  value: MaterialKey;
  label: string;
  swatch: string;
  border?: string;
}[] = [
  { value: 'all', label: '전체', swatch: '#FFFFFF', border: '#E5E5E5' },
  { value: 'crystal', label: '크리스탈', swatch: '#E5F0FF' },
  { value: 'pearl', label: '펄', swatch: '#FFF8E5' },
  { value: 'silver', label: '실버', swatch: '#D6D6D6' },
  { value: 'gold', label: '골드', swatch: '#F5C26B' },
  { value: 'rose_gold', label: '로즈골드', swatch: '#F4C2B7' },
  { value: 'plated', label: '도금', swatch: '#E8DFD0' },
];

const COLOR_OPTIONS: { label: string; swatch?: string; gradient?: string; border?: string }[] = [
  { label: '화이트', swatch: '#FFFFFF', border: '#D5D5D5' },
  { label: '핑크', swatch: '#F8BBD0' },
  { label: '옐로', swatch: '#FFE082' },
  { label: '오렌지', swatch: '#FFB088' },
  { label: '레드', swatch: '#EF5350' },
  { label: '그린', swatch: '#A5D6A7' },
  { label: '블루', swatch: '#90CAF9' },
  { label: '퍼플', swatch: '#CE93D8' },
  { label: '골드', swatch: '#F5C26B' },
  { label: '실버', swatch: '#D6D6D6' },
  { label: '블랙', swatch: '#1E1B2E' },
  {
    label: '멀티',
    gradient: 'linear-gradient(135deg, #FBC8DC, #FFD9B8, #C8E6C9)',
  },
];

const THEME_OPTIONS = [
  { label: '하트', icon: '♡' },
  { label: '별', icon: '★' },
  { label: '꽃', icon: '✿' },
  { label: '동물', icon: '◐' },
  { label: '나비', icon: '✦' },
  { label: '미니멀', icon: '·' },
];

const SIZE_OPTIONS = ['S', 'M', 'L'];

const CONDITION_OPTIONS = ['미사용', 'S급', 'A급', 'B급'];

const SIDE_OPTIONS: { value: SideKey; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'L', label: 'L · 왼쪽' },
  { value: 'R', label: 'R · 오른쪽' },
];

const PRICE_OPTIONS: { value: PriceKey; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'under_30', label: '3만 ↓' },
  { value: 'mid_30_50', label: '3~5만' },
  { value: 'mid_50_100', label: '5~10만' },
  { value: 'over_100', label: '10만 ↑' },
];

// ─────────────────────────────────────────────────────────────
// 매칭 로직 (한·영 키워드 contains)
// ─────────────────────────────────────────────────────────────
const SHAPE_KEYWORDS: Record<Exclude<ShapeKey, 'all'>, string[]> = {
  stud: ['스터드', 'stud'],
  drop: ['드롭', 'drop'],
  hoop: ['후프', 'hoop'],
  chandelier: ['샹들리에', 'chandelier'],
  cuff: ['커프', 'cuff'],
  climber: ['클라이머', 'climber'],
};

const MATERIAL_KEYWORDS: Record<Exclude<MaterialKey, 'all'>, string[]> = {
  crystal: ['크리스탈', '크리스털', 'crystal'],
  pearl: ['펄', '진주', 'pearl'],
  silver: ['실버', '은', 'silver', '925'],
  gold: ['골드', '금', 'gold', '14k', '18k'],
  rose_gold: ['로즈골드', 'rose'],
  plated: ['도금', 'plat'],
};

function containsAny(haystack: string | null | undefined, needles: string[]): boolean {
  if (!haystack) return false;
  const lc = haystack.toLowerCase();
  return needles.some((n) => lc.includes(n.toLowerCase()));
}

function priceMatches(price: number, range: PriceKey): boolean {
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

// ─────────────────────────────────────────────────────────────
// 카테고리 컴포넌트
// ─────────────────────────────────────────────────────────────
function CategoryRow({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-5 lg:px-8 py-4 border-b border-aring-ink-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11.5px] font-extrabold tracking-wider text-aring-ink-700 uppercase">
          {title}
        </h3>
        {hint && (
          <span className="text-[10px] font-semibold text-aring-ink-500">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// 아이콘 + 라벨 chip (모양/테마용)
function IconChip({
  icon,
  label,
  isActive,
  isDisabled,
  onClick,
}: {
  icon: string;
  label: string;
  isActive?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={[
        'flex flex-col items-center justify-center gap-1 w-[68px] py-2.5 rounded-tile border transition shrink-0',
        isActive
          ? 'bg-aring-ink-900 text-white border-aring-ink-900'
          : isDisabled
          ? 'bg-aring-ink-100/60 text-aring-ink-300 border-transparent cursor-not-allowed'
          : 'bg-white text-aring-ink-900 border-aring-green-line active:scale-95',
      ].join(' ')}
    >
      <span className="text-[18px] leading-none">{icon}</span>
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

// 컬러칩 (소재/컬러용)
function SwatchChip({
  swatch,
  gradient,
  border,
  label,
  isActive,
  isDisabled,
  onClick,
}: {
  swatch?: string;
  gradient?: string;
  border?: string;
  label: string;
  isActive?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={[
        'flex flex-col items-center gap-1 w-[58px] shrink-0',
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 transition',
      ].join(' ')}
    >
      <span
        className={[
          'w-9 h-9 rounded-full',
          isActive ? 'ring-2 ring-aring-ink-900 ring-offset-2' : '',
        ].join(' ')}
        style={{
          background: gradient ?? swatch,
          border: border ? `1px solid ${border}` : undefined,
        }}
      />
      <span
        className={[
          'text-[10px] font-bold',
          isActive ? 'text-aring-ink-900' : 'text-aring-ink-700',
          isDisabled ? 'text-aring-ink-500' : '',
        ].join(' ')}
      >
        {label}
      </span>
    </button>
  );
}

// 텍스트 토글 chip (사이드/가격/사이즈/상태/브랜드용)
function TextChip({
  label,
  isActive,
  isDisabled,
  onClick,
}: {
  label: string;
  isActive?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={[
        'shrink-0 inline-flex items-center px-3.5 py-1.5 rounded-pill text-[12px] font-bold transition',
        isActive
          ? 'bg-aring-ink-900 text-white'
          : isDisabled
          ? 'bg-aring-ink-100/60 text-aring-ink-300 cursor-not-allowed'
          : 'bg-white text-aring-ink-700 border border-aring-green-line active:scale-95',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
export default function DiscoverPage() {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 활성 필터
  const [shape, setShape] = useState<ShapeKey>('all');
  const [material, setMaterial] = useState<MaterialKey>('all');
  const [side, setSide] = useState<SideKey>('all');
  const [price, setPrice] = useState<PriceKey>('all');
  const [brand, setBrand] = useState<string>('all');

  // 첫 진입 시 listings 전체 fetch (status=open)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      if (!supabase) {
        if (!cancelled) {
          setItems(mockRecentItems);
          setLoading(false);
        }
        return;
      }
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(60);
      if (cancelled) return;
      if (error || !data || data.length === 0) {
        setItems(mockRecentItems);
      } else {
        setItems((data as Listing[]).map(listingToRecent));
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // 등록된 브랜드 목록 — items에서 동적 추출 (top 10)
  const brandOptions = useMemo(() => {
    const map = new Map<string, number>();
    for (const it of items) {
      map.set(it.brand, (map.get(it.brand) ?? 0) + 1);
    }
    const sorted = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([b]) => b);
    return ['all', ...sorted];
  }, [items]);

  // 필터링된 결과
  const filtered = useMemo(() => {
    return items.filter((it) => {
      // shape — 한·영 키워드 매칭
      if (shape !== 'all') {
        if (!containsAny(it.name, SHAPE_KEYWORDS[shape])) return false;
      }
      // material — name + story 모두 검사
      if (material !== 'all') {
        const corpus = `${it.name} ${it.story ?? ''}`;
        if (!containsAny(corpus, MATERIAL_KEYWORDS[material])) return false;
      }
      // side
      if (side !== 'all' && it.side !== side) return false;
      // price
      if (price !== 'all' && !priceMatches(it.price ?? 0, price)) return false;
      // brand
      if (brand !== 'all' && it.brand !== brand) return false;
      return true;
    });
  }, [items, shape, material, side, price, brand]);

  // 활성 필터 개수 (초기화 버튼용)
  const activeCount =
    (shape !== 'all' ? 1 : 0) +
    (material !== 'all' ? 1 : 0) +
    (side !== 'all' ? 1 : 0) +
    (price !== 'all' ? 1 : 0) +
    (brand !== 'all' ? 1 : 0);

  function resetAll() {
    setShape('all');
    setMaterial('all');
    setSide('all');
    setPrice('all');
    setBrand('all');
  }

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
          <TopNav />

          {/* 페이지 헤더 */}
          <div className="px-5 lg:px-8 pt-3 lg:pt-7 pb-3">
            <h1 className="text-[20px] lg:text-[26px] font-extrabold tracking-tight text-aring-ink-900">
              탐색
            </h1>
            <p className="mt-0.5 text-[12px] text-aring-ink-500">
              속성으로 한 짝을 좁혀보세요
            </p>
          </div>

          {/* 필터 영역 */}
          <div className="border-t border-aring-ink-100">
            {/* 모양 */}
            <CategoryRow title="모양">
              <div className="no-scrollbar flex gap-2 overflow-x-auto -mx-1 px-1">
                {SHAPE_OPTIONS.map((opt) => (
                  <IconChip
                    key={opt.value}
                    icon={opt.icon}
                    label={opt.label}
                    isActive={shape === opt.value}
                    onClick={() => setShape(opt.value)}
                  />
                ))}
              </div>
            </CategoryRow>

            {/* 소재 */}
            <CategoryRow title="소재">
              <div className="no-scrollbar flex gap-3 overflow-x-auto -mx-1 px-1">
                {MATERIAL_OPTIONS.map((opt) => (
                  <SwatchChip
                    key={opt.value}
                    swatch={opt.swatch}
                    border={opt.border}
                    label={opt.label}
                    isActive={material === opt.value}
                    onClick={() => setMaterial(opt.value)}
                  />
                ))}
              </div>
            </CategoryRow>

            {/* 컬러 — Phase 2 (disabled) */}
            <CategoryRow title="컬러" hint="곧 만나요">
              <div className="no-scrollbar flex gap-3 overflow-x-auto -mx-1 px-1">
                {COLOR_OPTIONS.map((opt) => (
                  <SwatchChip
                    key={opt.label}
                    swatch={opt.swatch}
                    gradient={opt.gradient}
                    border={opt.border}
                    label={opt.label}
                    isDisabled
                  />
                ))}
              </div>
            </CategoryRow>

            {/* 테마 — Phase 2 (disabled) */}
            <CategoryRow title="테마" hint="곧 만나요">
              <div className="no-scrollbar flex gap-2 overflow-x-auto -mx-1 px-1">
                {THEME_OPTIONS.map((opt) => (
                  <IconChip
                    key={opt.label}
                    icon={opt.icon}
                    label={opt.label}
                    isDisabled
                  />
                ))}
              </div>
            </CategoryRow>

            {/* 사이즈 — Phase 2 */}
            <CategoryRow title="사이즈" hint="곧 만나요">
              <div className="flex gap-2 flex-wrap">
                {SIZE_OPTIONS.map((s) => (
                  <TextChip key={s} label={s} isDisabled />
                ))}
              </div>
            </CategoryRow>

            {/* 상태 — Phase 2 */}
            <CategoryRow title="상태" hint="곧 만나요">
              <div className="flex gap-2 flex-wrap">
                {CONDITION_OPTIONS.map((c) => (
                  <TextChip key={c} label={c} isDisabled />
                ))}
              </div>
            </CategoryRow>

            {/* L · R */}
            <CategoryRow title="L · R">
              <div className="flex gap-2 flex-wrap">
                {SIDE_OPTIONS.map((opt) => (
                  <TextChip
                    key={opt.value}
                    label={opt.label}
                    isActive={side === opt.value}
                    onClick={() => setSide(opt.value)}
                  />
                ))}
              </div>
            </CategoryRow>

            {/* 가격대 */}
            <CategoryRow title="가격대">
              <div className="flex gap-2 flex-wrap">
                {PRICE_OPTIONS.map((opt) => (
                  <TextChip
                    key={opt.value}
                    label={opt.label}
                    isActive={price === opt.value}
                    onClick={() => setPrice(opt.value)}
                  />
                ))}
              </div>
            </CategoryRow>

            {/* 브랜드 */}
            <CategoryRow title="브랜드">
              <div className="flex gap-2 flex-wrap">
                {brandOptions.map((b) => (
                  <TextChip
                    key={b}
                    label={b === 'all' ? '전체' : b}
                    isActive={brand === b}
                    onClick={() => setBrand(b)}
                  />
                ))}
              </div>
            </CategoryRow>
          </div>

          {/* sticky summary bar */}
          <div className="sticky top-0 z-20 glass-strong border-y border-aring-green-line">
            <div className="flex items-center justify-between px-5 lg:px-8 py-3">
              <p className="text-[13px] font-extrabold text-aring-ink-900">
                {loading ? '불러오는 중…' : `${filtered.length}개 결과`}
                {activeCount > 0 && (
                  <span className="ml-2 text-[11px] font-semibold text-aring-ink-500">
                    · 필터 {activeCount}개 적용
                  </span>
                )}
              </p>
              {activeCount > 0 && (
                <button
                  onClick={resetAll}
                  className="text-[12px] font-bold text-aring-ink-500 hover:text-aring-ink-900 transition"
                >
                  초기화
                </button>
              )}
            </div>
          </div>

          {/* 결과 그리드 */}
          <div className="px-5 lg:px-8 pt-4">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-tile bg-aring-ink-100 animate-pulse"
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-[13px] font-bold text-aring-ink-900">
                  조건에 맞는 한 짝이 없어요
                </p>
                <p className="mt-1 text-[11.5px] text-aring-ink-500">
                  필터를 줄이거나 초기화해 주세요
                </p>
                {activeCount > 0 && (
                  <button
                    onClick={resetAll}
                    className="mt-4 inline-flex items-center justify-center px-5 py-2.5 rounded-pill bg-aring-ink-900 text-white text-[13px] font-extrabold"
                  >
                    필터 초기화
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {filtered.map((it) => (
                  <RecentItemCard key={it.id} it={it} />
                ))}
              </div>
            )}
          </div>
        </div>
        <BottomNav active="discover" />
      </div>
    </main>
  );
}
