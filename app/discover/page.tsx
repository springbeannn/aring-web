'use client';

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
// /discover — 다중 속성 필터 (단순화 v2 · 2026-04-26)
// 변경점:
//  - 모양: 아이콘 제거 → 텍스트 pill 다중 선택
//  - 소재: swatch → 실사 느낌 원형 썸네일 (그라데이션 + radial highlight)
//  - 컬러: 8개 파스텔 chip
//  - 사이즈 카테고리 삭제
//  - 선택 상태 컬러 통일 (#EAF7F5 / #8ED9CC / #222), 크기·border 두께 고정
//  - 상단에 선택된 필터 chip + 전체 해제
// 기존 파일 구조 유지, mock 폴백 동작 그대로
// ─────────────────────────────────────────────────────────────

// 활성 시 통일 디자인
const ACTIVE_BG = '#EAF7F5';
const ACTIVE_BORDER = '#8ED9CC';
const ACTIVE_TEXT = '#222222';
const INACTIVE_BORDER = '#E5E5E5';

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
    color: row.color,
    theme: row.theme,
    item_size: row.item_size,
    condition: row.condition,
  };
}

// ─────────────────────────────────────────────────────────────
// 카테고리 옵션
// ─────────────────────────────────────────────────────────────
type ShapeKey = 'stud' | 'drop' | 'hoop' | 'chandelier' | 'cuff' | 'etc';
type MaterialKey =
  | 'all'
  | 'gold'
  | 'silver'
  | 'rose_gold'
  | 'pearl'
  | 'crystal'
  | 'stone'
  | 'acrylic';
type ColorKey =
  | 'all'
  | 'gold'
  | 'silver'
  | 'rose_gold'
  | 'white'
  | 'black'
  | 'pink'
  | 'blue'
  | 'etc';
type PriceKey = 'all' | 'under_30' | 'mid_30_50' | 'mid_50_100' | 'over_100';

const SHAPE_LIST: { value: ShapeKey; label: string }[] = [
  { value: 'stud', label: '스터드' },
  { value: 'drop', label: '드롭' },
  { value: 'hoop', label: '후프' },
  { value: 'chandelier', label: '샹들리에' },
  { value: 'cuff', label: '이어커프' },
  { value: 'etc', label: '기타' },
];

// 실사 느낌 원형 썸네일 — 그라데이션 + 광택 highlight 조합
const MATERIAL_LIST: {
  value: MaterialKey;
  label: string;
  bg: string;
}[] = [
  { value: 'all', label: '전체', bg: 'linear-gradient(135deg,#F5F5F5,#E8E8E8)' },
  { value: 'gold', label: '골드', bg: 'linear-gradient(135deg,#F5D78A,#C9A055 70%,#9C7A38)' },
  { value: 'silver', label: '실버', bg: 'linear-gradient(135deg,#F0F0F0,#C0C0C0 60%,#9A9A9A)' },
  { value: 'rose_gold', label: '로즈골드', bg: 'linear-gradient(135deg,#F4D5C8,#D89F90 65%,#B47865)' },
  { value: 'pearl', label: '진주', bg: 'linear-gradient(135deg,#FFFFFF,#F5EBDA 60%,#E0CFB1)' },
  { value: 'crystal', label: '크리스탈', bg: 'linear-gradient(135deg,#F0F8FF,#CDE3F5 60%,#A4C8E5)' },
  { value: 'stone', label: '원석', bg: 'linear-gradient(135deg,#C5CEDB,#7B8B9F 60%,#4D5C6E)' },
  { value: 'acrylic', label: '아크릴', bg: 'linear-gradient(135deg,#FBC8DC,#FFD9B8,#C8E6C9)' },
];

// 컬러 chip — 파스텔톤 (단, 골드/실버/로즈골드는 메탈 톤 유지)
const COLOR_LIST: {
  value: ColorKey;
  label: string;
  swatch: string;
  border?: string;
}[] = [
  { value: 'all', label: '전체', swatch: '#FFFFFF', border: '#E5E5E5' },
  { value: 'gold', label: '골드', swatch: 'linear-gradient(135deg,#F5D78A,#D9B25C)' },
  { value: 'silver', label: '실버', swatch: 'linear-gradient(135deg,#EAEAEA,#C0C0C0)' },
  { value: 'rose_gold', label: '로즈골드', swatch: 'linear-gradient(135deg,#F4D5C8,#D89F90)' },
  { value: 'white', label: '화이트', swatch: '#FAFAFA', border: '#E5E5E5' },
  { value: 'black', label: '블랙', swatch: '#1E1B2E' },
  { value: 'pink', label: '핑크', swatch: '#FBC8DC' },
  { value: 'blue', label: '블루', swatch: '#C5DDF0' },
  { value: 'etc', label: '기타', swatch: 'linear-gradient(135deg,#FBC8DC,#FFEFB5,#C8E6C9)' },
];

const PRICE_LIST: { value: PriceKey; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'under_30', label: '3만 ↓' },
  { value: 'mid_30_50', label: '3~5만' },
  { value: 'mid_50_100', label: '5~10만' },
  { value: 'over_100', label: '10만 ↑' },
];

// 매칭 키워드 — DB의 shape/detail 텍스트에서 contains 매칭
const SHAPE_KEYWORDS: Record<ShapeKey, string[]> = {
  stud: ['스터드', 'stud'],
  drop: ['드롭', 'drop'],
  hoop: ['후프', 'hoop'],
  chandelier: ['샹들리에', 'chandelier'],
  cuff: ['커프', 'cuff'],
  etc: [], // '기타'는 위 카테고리에 안 들어가는 항목 (역매칭)
};

const MATERIAL_KEYWORDS: Record<Exclude<MaterialKey, 'all'>, string[]> = {
  gold: ['골드', '금', 'gold', '14k', '18k'],
  silver: ['실버', '은', 'silver', '925'],
  rose_gold: ['로즈골드', 'rose'],
  pearl: ['펄', '진주', 'pearl'],
  crystal: ['크리스탈', '크리스털', 'crystal'],
  stone: ['원석', '보석', 'stone'],
  acrylic: ['아크릴', 'acrylic', '플라스틱'],
};

const COLOR_KEYWORDS: Record<Exclude<ColorKey, 'all'>, string[]> = {
  gold: ['골드', 'gold'],
  silver: ['실버', 'silver'],
  rose_gold: ['로즈', 'rose'],
  white: ['화이트', '흰', 'white'],
  black: ['블랙', '검정', 'black'],
  pink: ['핑크', 'pink'],
  blue: ['블루', '파랑', 'blue'],
  etc: [],
};

function containsAny(haystack: string | null | undefined, needles: string[]): boolean {
  if (!haystack) return false;
  if (needles.length === 0) return false;
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
// UI atoms
// ─────────────────────────────────────────────────────────────
function CategoryRow({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-5 py-4 border-b border-aring-ink-100">
      <h3 className="text-[11.5px] font-extrabold tracking-wider text-aring-ink-700 uppercase mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

// 텍스트 pill — 모양·가격 등 (선택 시 통일 색상)
function PillChip({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 inline-flex items-center px-3.5 py-1.5 rounded-pill text-[12px] font-bold transition active:scale-95"
      style={{
        backgroundColor: isActive ? ACTIVE_BG : '#FFFFFF',
        border: `1px solid ${isActive ? ACTIVE_BORDER : INACTIVE_BORDER}`,
        color: isActive ? ACTIVE_TEXT : '#555555',
      }}
    >
      {label}
    </button>
  );
}

// 실사 느낌 원형 썸네일 — 소재용
function MaterialThumb({
  bg,
  label,
  isActive,
  onClick,
}: {
  bg: string;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 w-[64px] shrink-0 active:scale-95 transition"
    >
      <span
        className="relative w-12 h-12 rounded-full overflow-hidden"
        style={{
          background: bg,
          boxShadow: isActive
            ? `0 0 0 2px ${ACTIVE_BORDER}, 0 0 0 4px #FFFFFF`
            : `0 0 0 1px ${INACTIVE_BORDER}`,
        }}
      >
        {/* 광택 highlight — 실사 느낌 */}
        <span
          aria-hidden
          className="absolute top-1.5 left-2 w-3 h-3 rounded-full opacity-60"
          style={{
            background:
              'radial-gradient(circle at 30% 30%, rgba(255,255,255,.95) 0%, rgba(255,255,255,0) 70%)',
          }}
        />
      </span>
      <span
        className="text-[10.5px] font-bold"
        style={{ color: isActive ? ACTIVE_TEXT : '#555' }}
      >
        {label}
      </span>
    </button>
  );
}

// 컬러칩 (원형) — 컬러 필터 전용
function ColorSwatch({
  swatch,
  label,
  border,
  isActive,
  onClick,
}: {
  swatch: string;
  label: string;
  border?: string;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 w-[58px] shrink-0 active:scale-95 transition"
    >
      <span
        className="w-9 h-9 rounded-full"
        style={{
          background: swatch,
          border: border ? `1px solid ${border}` : undefined,
          boxShadow: isActive
            ? `0 0 0 2px ${ACTIVE_BORDER}, 0 0 0 4px #FFFFFF`
            : 'none',
        }}
      />
      <span
        className="text-[10.5px] font-bold"
        style={{ color: isActive ? ACTIVE_TEXT : '#555' }}
      >
        {label}
      </span>
    </button>
  );
}

// 선택된 필터 chip (X 버튼 포함)
function SelectedChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-[11.5px] font-bold"
      style={{
        backgroundColor: ACTIVE_BG,
        border: `1px solid ${ACTIVE_BORDER}`,
        color: ACTIVE_TEXT,
      }}
    >
      {label}
      <button
        onClick={onRemove}
        aria-label={`${label} 해제`}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-white/60 transition"
      >
        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
export default function DiscoverPage() {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 활성 필터 — 모양은 다중, 나머지는 단일
  const [shape, setShape] = useState<ShapeKey[]>([]);
  const [material, setMaterial] = useState<MaterialKey>('all');
  const [color, setColor] = useState<ColorKey>('all');
  const [price, setPrice] = useState<PriceKey>('all');
  const [brand, setBrand] = useState<string>('all');

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

  const filtered = useMemo(() => {
    return items.filter((it) => {
      // 모양 — 다중. 비어있으면 통과. 'etc'는 5개 카테고리 모두 hit 안 하는 경우.
      if (shape.length > 0) {
        const hitMain = shape.some((s) =>
          s !== 'etc' ? containsAny(it.name, SHAPE_KEYWORDS[s]) : false
        );
        const wantsEtc = shape.includes('etc');
        const isEtc = !SHAPE_LIST.slice(0, 5).some((s) =>
          containsAny(it.name, SHAPE_KEYWORDS[s.value])
        );
        if (!(hitMain || (wantsEtc && isEtc))) return false;
      }
      // 소재
      if (material !== 'all') {
        const corpus = `${it.name} ${it.story ?? ''}`;
        if (!containsAny(corpus, MATERIAL_KEYWORDS[material])) return false;
      }
      // 컬러 — DB color 컬럼 우선, 없으면 텍스트 contains 폴백
      if (color !== 'all' && color !== 'etc') {
        const hasDbColor = (it.color ?? null) !== null;
        if (hasDbColor) {
          if (it.color !== color) return false;
        } else {
          // DB 미지정 → keyword 매칭 폴백 (mock 호환)
          const corpus = `${it.brand} ${it.name} ${it.story ?? ''}`;
          if (!containsAny(corpus, COLOR_KEYWORDS[color])) return false;
        }
      } else if (color === 'etc') {
        // '기타' = 어떤 색에도 정확 매칭 안 되는 항목
        if (it.color !== null && it.color !== undefined) {
          const known = ['gold', 'silver', 'rose_gold', 'white', 'black', 'pink', 'blue'];
          if (known.includes(it.color)) return false;
        }
      }
      // 가격
      if (price !== 'all' && !priceMatches(it.price ?? 0, price)) return false;
      // 브랜드
      if (brand !== 'all' && it.brand !== brand) return false;
      return true;
    });
  }, [items, shape, material, color, price, brand]);

  function toggleShape(v: ShapeKey) {
    setShape((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  }

  function resetAll() {
    setShape([]);
    setMaterial('all');
    setColor('all');
    setPrice('all');
    setBrand('all');
  }

  // 선택된 필터 라벨 산출
  const selectedChips: { id: string; label: string; onRemove: () => void }[] = [];
  shape.forEach((s) => {
    const opt = SHAPE_LIST.find((o) => o.value === s);
    if (opt) {
      selectedChips.push({
        id: `shape:${s}`,
        label: opt.label,
        onRemove: () => toggleShape(s),
      });
    }
  });
  if (material !== 'all') {
    const opt = MATERIAL_LIST.find((o) => o.value === material);
    if (opt) selectedChips.push({
      id: `material:${material}`,
      label: opt.label,
      onRemove: () => setMaterial('all'),
    });
  }
  if (color !== 'all') {
    const opt = COLOR_LIST.find((o) => o.value === color);
    if (opt) selectedChips.push({
      id: `color:${color}`,
      label: opt.label,
      onRemove: () => setColor('all'),
    });
  }
  if (price !== 'all') {
    const opt = PRICE_LIST.find((o) => o.value === price);
    if (opt) selectedChips.push({
      id: `price:${price}`,
      label: opt.label,
      onRemove: () => setPrice('all'),
    });
  }
  if (brand !== 'all') {
    selectedChips.push({
      id: `brand:${brand}`,
      label: brand,
      onRemove: () => setBrand('all'),
    });
  }
  const activeCount = selectedChips.length;

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
          <div className="px-5 pt-3 pb-3">
            <h1 className="text-[20px] font-extrabold tracking-tight text-aring-ink-900">
              탐색
            </h1>
            <p className="mt-0.5 text-[12px] text-aring-ink-500">
              속성으로 한 짝을 좁혀보세요
            </p>
          </div>

          {/* 선택된 필터 — 활성일 때만 노출 */}
          {activeCount > 0 && (
            <div className="px-5 pb-3 flex items-center gap-2 flex-wrap">
              {selectedChips.map((c) => (
                <SelectedChip key={c.id} label={c.label} onRemove={c.onRemove} />
              ))}
              <button
                onClick={resetAll}
                className="ml-auto text-[12px] font-bold text-aring-ink-500 hover:text-aring-ink-900 transition"
              >
                전체 해제
              </button>
            </div>
          )}

          {/* 필터 영역 */}
          <div className="border-t border-aring-ink-100">
            {/* 모양 — 다중 선택 텍스트 pill */}
            <CategoryRow title="모양">
              <div className="flex gap-2 flex-wrap">
                {SHAPE_LIST.map((opt) => (
                  <PillChip
                    key={opt.value}
                    label={opt.label}
                    isActive={shape.includes(opt.value)}
                    onClick={() => toggleShape(opt.value)}
                  />
                ))}
              </div>
            </CategoryRow>

            {/* 소재 — 실사 느낌 원형 썸네일 */}
            <CategoryRow title="소재">
              <div className="no-scrollbar flex gap-3 overflow-x-auto -mx-1 px-1">
                {MATERIAL_LIST.map((opt) => (
                  <MaterialThumb
                    key={opt.value}
                    bg={opt.bg}
                    label={opt.label}
                    isActive={material === opt.value}
                    onClick={() => setMaterial(opt.value)}
                  />
                ))}
              </div>
            </CategoryRow>

            {/* 컬러 — 8개 파스텔 swatch */}
            <CategoryRow title="컬러">
              <div className="no-scrollbar flex gap-3 overflow-x-auto -mx-1 px-1">
                {COLOR_LIST.map((opt) => (
                  <ColorSwatch
                    key={opt.value}
                    swatch={opt.swatch}
                    label={opt.label}
                    border={opt.border}
                    isActive={color === opt.value}
                    onClick={() => setColor(opt.value)}
                  />
                ))}
              </div>
            </CategoryRow>

            {/* 가격대 */}
            <CategoryRow title="가격대">
              <div className="flex gap-2 flex-wrap">
                {PRICE_LIST.map((opt) => (
                  <PillChip
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
                  <PillChip
                    key={b}
                    label={b === 'all' ? '전체' : b}
                    isActive={brand === b}
                    onClick={() => setBrand(b)}
                  />
                ))}
              </div>
            </CategoryRow>
          </div>

          {/* sticky summary */}
          <div className="sticky top-0 z-20 glass-strong border-y border-aring-green-line">
            <div className="flex items-center justify-between px-5 py-3">
              <p className="text-[13px] font-extrabold text-aring-ink-900">
                {loading ? '불러오는 중…' : `${filtered.length}개 결과`}
                {activeCount > 0 && (
                  <span className="ml-2 text-[11px] font-semibold text-aring-ink-500">
                    · 필터 {activeCount}개
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
          <div className="px-5 pt-4">
            {loading ? (
              <div className="grid grid-cols-2 gap-3">
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
                    className="mt-4 inline-flex items-center justify-center px-5 py-2.5 rounded-pill text-[13px] font-extrabold"
                    style={{
                      backgroundColor: ACTIVE_BG,
                      border: `1px solid ${ACTIVE_BORDER}`,
                      color: ACTIVE_TEXT,
                    }}
                  >
                    필터 초기화
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
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
