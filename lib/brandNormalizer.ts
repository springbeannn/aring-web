import { supabase } from '@/lib/supabase';

export type BrandRow = {
  id: string;
  brand_key: string;
  display_name: string;
  name_ko: string | null;
  name_en: string | null;
  aliases: string[];
  origin: 'domestic' | 'international' | null;
  category: 'luxury' | 'fashion' | 'contemporary' | 'mass' | 'designer' | null;
};

// ─── 메모리 캐시 ───────────────────────────────────────────
let _cache: BrandRow[] | null = null;
let _cacheAt = 0;
const CACHE_TTL = 1000 * 60 * 10; // 10분

export async function getBrands(): Promise<BrandRow[]> {
  if (_cache && Date.now() - _cacheAt < CACHE_TTL) return _cache;
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('display_name');
  if (error || !data) return _cache ?? [];
  _cache = data as BrandRow[];
  _cacheAt = Date.now();
  return _cache;
}

// ─── 브랜드 매칭 ───────────────────────────────────────────
export async function resolveBrand(input: string): Promise<{
  brand_key: string;
  display_name: string;
} | null> {
  if (!input.trim()) return null;
  const brands = await getBrands();
  const q = input.toLowerCase().trim().replace(/\s+/g, '');

  for (const b of brands) {
    const targets = [
      b.brand_key,
      b.display_name.toLowerCase(),
      b.name_ko?.toLowerCase() ?? '',
      b.name_en?.toLowerCase() ?? '',
      ...b.aliases.map(a => a.toLowerCase()),
    ];
    const targetsNoSpace = targets.map(t => t.replace(/\s+/g, ''));
    if (targets.includes(input.toLowerCase().trim()) || targetsNoSpace.includes(q)) {
      return { brand_key: b.brand_key, display_name: b.display_name };
    }
  }
  return null;
}

// ─── 하위호환 동기 함수 (register에서 쓰던 것) ─────────────
export function normalizeBrand(input: string): string {
  if (!input.trim()) return '';
  return input.toLowerCase().trim().replace(/\s+/g, '');
}
