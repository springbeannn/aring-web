import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/signup?error=no_code`);
  }

  const cookieStore = cookies();

  // 디버그: 쿠키 목록 확인
  const allCookies = cookieStore.getAll();
  console.log('[auth/callback] cookies:', allCookies.map(c => c.name));

  const response = NextResponse.redirect(`${origin}/`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error('[auth/callback] exchangeCodeForSession error:', error?.message);
    return NextResponse.redirect(`${origin}/signup?error=auth_failed&msg=${encodeURIComponent(error?.message ?? 'unknown')}`);
  }

  const user = data.user;
  const email = user.email;

  if (!email) {
    return NextResponse.redirect(`${origin}/signup?error=no_email`);
  }

  // 이메일 가입 인증 콜백 → /signup/complete (OAuth 흐름과 분리)
  const provider = user.app_metadata?.provider ?? 'unknown';
  if (provider === 'email') {
    return NextResponse.redirect(`${origin}/signup/complete`);
  }

  // 기존 프로필 확인
  const { data: existing } = await supabase
    .from('profiles')
    .select('id, nickname')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    if (!existing.nickname) {
      response.headers.set('Location', `${origin}/signup/nickname`);
      return NextResponse.redirect(`${origin}/signup/nickname`);
    }
    return response;
  }

  // 동일 이메일 다른 계정 확인 (nickname 체크 포함)
  const { data: emailExisting } = await supabase
    .from('profiles')
    .select('id, provider, nickname')
    .eq('email', email)
    .maybeSingle();

  if (emailExisting) {
    if (!emailExisting.nickname) {
      return NextResponse.redirect(`${origin}/signup/nickname`);
    }
    return response;
  }

  // 신규 사용자 프로필 생성 (provider는 위에서 이미 선언됨)
  await supabase.from('profiles').insert({
    user_id: user.id,
    email,
    nickname: '',
    provider,
  });

  return NextResponse.redirect(`${origin}/signup/nickname`);
}
