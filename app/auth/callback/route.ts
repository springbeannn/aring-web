import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// next 파라미터 — open redirect 방어: 내부 경로(/...)만 허용, // 프로토콜-상대 차단
function safeNext(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith('/')) return null;
  if (raw.startsWith('//')) return null;
  return raw;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const nextPath = safeNext(url.searchParams.get('next'));
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/signup?error=no_code`);
  }

  const cookieStore = cookies();

  // App Router cookies() API 직접 사용 → 자동으로 응답 쿠키에 반영
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
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error('[auth/callback] exchangeCodeForSession error:', error?.message);
    return NextResponse.redirect(
      `${origin}/signup?error=auth_failed&msg=${encodeURIComponent(error?.message ?? 'unknown')}`
    );
  }

  const user = data.user;
  const email = user.email;

  if (!email) {
    return NextResponse.redirect(`${origin}/signup?error=no_email`);
  }

  // 흐름 구분 — user.identities 우선(자동 링크 후에도 신뢰 가능), app_metadata는 fallback
  // 주의: app_metadata.provider만 보면 자동 링크된 사용자는 원래 가입 방법('email')으로
  //       남아 있어 Google 로그인을 인증완료 페이지로 잘못 보내게 됨.
  const allProviders = new Set<string>();
  (user.identities ?? []).forEach((i) => {
    if (i.provider) allProviders.add(i.provider);
  });
  const apmProvidersArr = user.app_metadata?.providers as string[] | undefined;
  apmProvidersArr?.forEach((p) => allProviders.add(p));
  const apmProvider = user.app_metadata?.provider as string | undefined;
  if (apmProvider) allProviders.add(apmProvider);

  const oauthProvider = [...allProviders].find((p) => p !== 'email');

  if (!oauthProvider) {
    // 순수 이메일 가입 인증 완료 흐름 — SNS identity가 전혀 연결 안 됨
    return NextResponse.redirect(`${origin}/signup/complete`);
  }

  // OAuth 흐름 — 자동 링크되었거나 신규/충돌 케이스
  const provider = oauthProvider;

  // 기존 프로필 확인
  const { data: existing } = await supabase
    .from('profiles')
    .select('id, nickname')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    // 이미 프로필 있음 — 닉네임 있고 next 파라미터 있으면 그쪽으로 복귀
    // (예: 마이프로필에서 Google 연결 후 /my/profile?linked=google로 돌아옴)
    const dest = existing.nickname ? (nextPath ?? '/') : '/signup/nickname';
    return NextResponse.redirect(`${origin}${dest}`);
  }

  // 동일 이메일 다른 계정 확인
  const { data: emailExisting } = await supabase
    .from('profiles')
    .select('id, provider, nickname')
    .eq('email', email)
    .maybeSingle();

  if (emailExisting) {
    // 같은 이메일이 이미 다른 가입 방법으로 존재 → 새 OAuth 세션 종료 후 안내
    // (예: 이메일/비번으로 가입한 사람이 같은 Gmail로 Google 로그인 시도)
    if (emailExisting.provider !== provider) {
      await supabase.auth.signOut();
      const params = new URLSearchParams({
        reason: 'different_provider',
        email,
        from: provider,
        existing: emailExisting.provider ?? 'email',
      });
      return NextResponse.redirect(`${origin}/login?${params.toString()}`);
    }

    // 동일 provider인데 user_id가 다른 경우(이론상 거의 없음) — nickname 흐름 유지
    return NextResponse.redirect(`${origin}${emailExisting.nickname ? '/' : '/signup/nickname'}`);
  }

  // 신규 사용자 프로필 생성
  await supabase.from('profiles').insert({
    user_id: user.id,
    email,
    nickname: '',
    provider,
  });

  return NextResponse.redirect(`${origin}/signup/nickname`);
}
