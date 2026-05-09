import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

// ────────────────────────────────────────────────────────────────
// Server-side Supabase client
// Server Component / Route Handler에서 cookie 기반 세션을 다룰 때 사용.
// .env 미설정 시 null 반환 → 호출부에서 fallback 처리.
// ────────────────────────────────────────────────────────────────
export function createSupabaseServer(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component에서는 cookies set 호출이 무시됨 — 정상 동작
        }
      },
    },
  });
}
