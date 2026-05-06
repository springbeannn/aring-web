import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ────────────────────────────────────────────────────────────────
// Supabase client — env 자동 감지
// .env.local 미설정 시 null 반환 → 자동으로 mock 폴백 동작
// ────────────────────────────────────────────────────────────────
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, flowType: 'pkce' }, // MVP — auth 추가 시 true
    })
  : null;

// ────────────────────────────────────────────────────────────────
// DB row 타입 — supabase/migrations/001_listings.sql 와 1:1 매칭
// ────────────────────────────────────────────────────────────────
export type ColorKey =
  | 'white' | 'pink' | 'yellow' | 'orange' | 'red' | 'green'
  | 'blue' | 'purple' | 'gold' | 'silver' | 'black' | 'multi';

export type ThemeKey =
  | 'heart' | 'star' | 'flower' | 'animal' | 'butterfly' | 'minimal';

export type SizeKey = 'S' | 'M' | 'L';
export type ConditionKey = 'new' | 'S' | 'A' | 'B';

export type Listing = {
  id: string;
  created_at: string;
  user_id: string | null;

  photo_url: string;
  photo_path: string;

  brand: string | null;
  shape: string | null;
  material: string | null;
  detail: string | null;

  // L/R 컬럼은 DB에 유지 (legacy data 보호) — UI에선 더 이상 노출/입력 안 함, 등록 시 default 'L' 자동 insert
  side: 'L' | 'R';
  price: number | null;
  story: string | null;
  region: string | null;

  // 004_listings_attributes.sql — 탐색 필터용 4개 속성 (모두 nullable)
  color: ColorKey | null;
  theme: ThemeKey | null;
  item_size: SizeKey | null;
  condition: ConditionKey | null;

  // 005_listings_view_count.sql — 인기 정렬용
  view_count: number;

  status: 'open' | 'matched' | 'closed';
};

export type NewListing = Omit<Listing, 'id' | 'created_at' | 'user_id' | 'status'>;

// ────────────────────────────────────────────────────────────────
// Comments — 002_comments.sql
// ────────────────────────────────────────────────────────────────
export type CommentRole = 'seller' | 'buyer';

export type Comment = {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  role: CommentRole;
  message: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
};

export type NewComment = Omit<Comment, 'id' | 'created_at' | 'updated_at'>;

// Storage 경로 생성 — 충돌 방지용 timestamp + random suffix
export function buildPhotoPath(filename: string): string {
  const ext = (filename.split('.').pop() ?? 'jpg').toLowerCase();
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}-${rand}.${ext}`;
}

export const STORAGE_BUCKET = 'listing-photos';

// ────────────────────────────────────────────────────────────────
// Brand dictionary — brands 테이블 row 타입
// ────────────────────────────────────────────────────────────────
export type BrandRow = {
  id: string;
  brand_key: string;
  display_name: string;
  name_ko: string | null;
  name_en: string | null;
  aliases: string[];
  origin: 'domestic' | 'international' | null;
  category: 'luxury' | 'fashion' | 'contemporary' | 'mass' | 'designer' | null;
  created_at: string;
  updated_at: string;
};
