'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav, BottomNav } from '@/components/Nav';
import { RecentItemCard } from '@/components/RecentItemCard';
import {
  recentItems as mockRecentItems,
  type RecentItem,
  type ThumbTone,
} from '@/lib/mock';
import { supabase, type Listing } from '@/lib/supabase';
import {
  SHAPE_OPTIONS,
  MATERIAL_OPTIONS,
  inferShapeKey,
  inferMaterialKey,
  type ShapeKey,
  type MaterialKey,
} from '@/lib/categories';

// ─────────────────────────────────────────────────────────────
// /discover — 단순화 v3 (2026-04-26)
// 변경: 컬러 카테고리 완전 삭제. 모양·소재는 lib/categories의 enum 기반 정확 매칭
// 등록 시 사용자가 chip으로 선택한 한국어 라벨이 listings.shape/material에 그대로 들어가므로
// inferShapeKey / inferMaterialKey 로 정확 매칭 (legacy freetext도 keyword contains 폴백)
// ─────────────────────────────────────────────────────────────

const ACTIVE_BG = '#EAF7F5';
const ACTIVE_BORDER = '#8ED9CC';
const ACTIVE_TEXT = '#222222';
const INACTIVE_BORDER = '#E5E5E5';

const TONE_ROTATION: ThumbTone[] = [
  'pink', 'peach', 'butter', 'mint', 'sky', 'sage',
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
// 가격 / 브랜드 옵션
// ─────────────────────────────────────────────────────────────
type PriceKey = 'all' | 'under_10' | 'mid_10_30' | 'mid_30_70' | 'mid_70_150' | 'over_150' | 'negotiable';

const PRICE_LIST: { value: PriceKey; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'under_10', label: '~1만원' },
  { value: 'mid_10_30', label: '1~3만원' },
  { value: 'mid_30_70', label: '3~7만원' },
  { value: 'mid_70_150', label: '7~15만원' },
  { value: 'over_150', label: '15만원~' },
  { value: 'negotiable', label: '가격미정/협의필요' },
];

function priceMatches(price: number, range: PriceKey): boolean {
  switch (range) {
    case 'under_10':   return price > 0 && price < 10000;
    case 'mid_10_30':  return price >= 10000 && price < 30000;
    case 'mid_30_70':  return price >= 30000 && price < 70000;
    case 'mid_70_150': return price >= 70000 && price < 150000;
case 'over_150':   return price >= 150000;
case 'negotiable': return price === 0 || price == null;
    default: return true;
  }
}

// ─────────────────────────────────────────────────────────────
// UI atoms
// ─────────────────────────────────────────────────────────────
function CategoryRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-4 border-b border-aring-ink-100">
      <h3 className="text-[11.5px] font-extrabold tracking-wider text-aring-ink-700 uppercase mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function PillChip({ label, isActive, onClick }: { label: string; isActive?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-pill px-3.5 py-2 text-[12.5px] font-bold transition active:scale-95 ${
        isActive
          ? 'bg-aring-ink-900 text-white border border-transparent'
          : 'bg-white text-aring-ink-700 border border-aring-green-line hover:border-aring-ink-300'
      }`}
    >
      {label}
    </button>
  );
}

function MaterialThumb({ bg, label, isActive, onClick }: { bg: string; label: string; isActive?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 w-[64px] shrink-0 active:scale-95 transition"
    >
      <span
        className="relative w-12 h-12 rounded-full"
        style={isActive ? {
          padding: '2px',
          background: 'linear-gradient(135deg, rgba(251,200,220,0.9) 0%, rgba(197,221,240,0.9) 50%, rgba(200,230,201,0.9) 100%)',
          boxShadow: 'none',
        } : {
          padding: '1px',
          background: '#E5E5E5',
          boxShadow: 'none',
        }}
      >
        <span
          className="block w-full h-full rounded-full overflow-hidden"
          style={{ background: bg }}
        >
          <span
            aria-hidden
            className="absolute top-1.5 left-2 w-3 h-3 rounded-full opacity-60"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,.95) 0%, rgba(255,255,255,0) 70%)',
            }}
          />
        </span>
      </span>
      <span className="text-[10.5px] font-bold" style={{ color: isActive ? ACTIVE_TEXT : '#555' }}>
        {label}
      </span>
    </button>
  );
}

function SelectedChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-[11.5px] font-bold"
      style={{
        background: 'linear-gradient(135deg, rgba(251,200,220,0.2) 0%, rgba(197,221,240,0.2) 50%, rgba(200,230,201,0.2) 100%)',
        outline: '1.5px solid rgba(197,221,240,0.85)',
        color: '#1e1b2e',
      }}
    >
      {label}
      <button onClick={onRemove} aria-label={`${label} 해제`} className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-white/60 transition">
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
  const router = useRouter();
  const [items, setItems] = useState<RecentItem[]>([]);
  const [rawListings, setRawListings] = useState<Map<string, Listing>>(new Map());
  const [loading, setLoading] = useState(true);

  const [shape, setShape] = useState<ShapeKey[]>([]);
  const [material, setMaterial] = useState<MaterialKey | 'all'>('all');
  const [price, setPrice] = useState<PriceKey>('all');
  const [brand, setBrand] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      if (!supabase) {
        if (!cancelled) {
          setItems(mockRecentItems);
          setRawListings(new Map());
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
        setRawListings(new Map());
      } else {
        const rows = data as Listing[];
        setItems(rows.map(listingToRecent));
        setRawListings(new Map(rows.map((r) => [r.id, r])));
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const brandOptions = useMemo(() => {
    const map = new Map<string, number>();
    for (const it of items) map.set(it.brand, (map.get(it.brand) ?? 0) + 1);
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([b]) => b);
    return ['all', ...sorted];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const row = rawListings.get(it.id);
      if (shape.length > 0) {
        const inferred = inferShapeKey(row?.shape ?? it.name);
        const wantsEtc = shape.includes('etc');
        const hitSpecific = inferred !== null && shape.includes(inferred);
        const isEtc = inferred === null;
        if (!(hitSpecific || (wantsEtc && isEtc))) return false;
      }
      if (material !== 'all') {
        const inferred = inferMaterialKey(row?.material ?? `${it.name} ${it.story ?? ''}`);
        if (inferred !== material) return false;
      }
      if (price !== 'all' && !priceMatches(it.price ?? 0, price)) return false;
      if (brand !== 'all' && it.brand !== brand) return false;
      return true;
    });
  }, [items, rawListings, shape, material, price, brand]);

  function toggleShape(v: ShapeKey) {
    setShape((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]);
  }

  function resetAll() {
    setShape([]);
    setMaterial('all');
    setPrice('all');
    setBrand('all');
  }

  function handleBrandChipClick(b: string) {
    setBrand(b);
  }

  const selectedChips: { id: string; label: string; onRemove: () => void }[] = [];
  shape.forEach((s) => {
    const opt = SHAPE_OPTIONS.find((o) => o.value === s);
    if (opt) selectedChips.push({ id: `shape:${s}`, label: opt.label, onRemove: () => toggleShape(s) });
  });
  if (material !== 'all') {
    const opt = MATERIAL_OPTIONS.find((o) => o.value === material);
    if (opt) selectedChips.push({ id: `material:${material}`, label: opt.label, onRemove: () => setMaterial('all') });
  }
  if (price !== 'all') {
    const opt = PRICE_LIST.find((o) => o.value === price);
    if (opt) selectedChips.push({ id: `price:${price}`, label: opt.label, onRemove: () => setPrice('all') });
  }
  if (brand !== 'all') {
    selectedChips.push({ id: `brand:${brand}`, label: brand, onRemove: () => setBrand('all') });
  }
  const activeCount = selectedChips.length;

  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
        <div className="pb-28 lg:pb-12">
          <TopNav />

          <div className="px-5 pt-3 pb-3">
            <h1 className="text-[20px] font-extrabold tracking-tight text-aring-ink-900">탐색</h1>
            <p className="mt-0.5 text-[12px] text-aring-ink-500">속성으로 한 짝을 좁혀보세요</p>
          </div>

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

          <div className="border-t border-aring-ink-100">
            <CategoryRow title="모양">
              <div className="flex gap-2 flex-wrap">
                {SHAPE_OPTIONS.map((opt) => (
                  <PillChip
                    key={opt.value}
                    label={opt.label}
                    isActive={shape.includes(opt.value)}
                    onClick={() => toggleShape(opt.value)}
                  />
                ))}
              </div>
            </CategoryRow>

            <CategoryRow title="소재">
              <div className="no-scrollbar flex gap-3 overflow-x-auto -mx-1 px-1">
                <MaterialThumb
                  bg="linear-gradient(135deg,#F5F5F5,#E8E8E8)"
                  label="전체"
                  isActive={material === 'all'}
                  onClick={() => setMaterial('all')}
                />
                {MATERIAL_OPTIONS.map((opt) => (
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

            {/* 브랜드 — 칩 클릭 시 /brands/[브랜드명] 으로 이동 */}
            <CategoryRow title="브랜드">
              <div className="flex gap-2 flex-wrap">
                {brandOptions.map((b) => (
                  <PillChip
                    key={b}
                    label={b === 'all' ? '전체' : b}
                    isActive={brand === b}
                    onClick={() => handleBrandChipClick(b)}
                  />
                ))}
              </div>
            </CategoryRow>
          </div>

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
                <button onClick={resetAll} className="text-[12px] font-bold text-aring-ink-500 hover:text-aring-ink-900 transition">
                  초기화
                </button>
              )}
            </div>
          </div>

          <div className="px-5 pt-4">
            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square rounded-tile bg-aring-ink-100 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-[13px] font-bold text-aring-ink-900">조건에 맞는 한 짝이 없어요</p>
                <p className="mt-1 text-[11.5px] text-aring-ink-500">필터를 줄이거나 초기화해 주세요</p>
                {activeCount > 0 && (
                  <button
                    onClick={resetAll}
                    className="mt-4 inline-flex items-center justify-center px-5 py-2.5 rounded-pill text-[13px] font-extrabold"
                    style={{ backgroundColor: ACTIVE_BG, border: `1px solid ${ACTIVE_BORDER}`, color: ACTIVE_TEXT }}
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
