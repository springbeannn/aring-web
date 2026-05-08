import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// ────────────────────────────────────────────────────────────
// /admin/* 접근 제어
// - 미인증 또는 role !== 'admin' 이면 /admin/login 으로 redirect
// - /admin/login 자체는 통과
// - 그 외 일반 사용자 라우팅에는 영향 없음 (matcher로 한정)
// ────────────────────────────────────────────────────────────
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /admin/login 은 그대로 통과
  if (pathname === '/admin/login') return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return NextResponse.next();

  let response = NextResponse.next({ request: req });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
        response = NextResponse.next({ request: req });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_banned')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!profile || profile.role !== 'admin' || profile.is_banned) {
    return NextResponse.redirect(new URL('/admin/login?error=unauthorized', req.url));
  }

  return response;
}

export const config = {
  matcher: '/admin/:path*',
};
