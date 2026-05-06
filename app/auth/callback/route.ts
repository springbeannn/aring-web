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
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
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
    return NextResponse.redirect(`${origin}/signup?error=auth_failed`);
  }

  const user = data.user;
  const email = user.email;

  if (!email) {
    return NextResponse.redirect(`${origin}/signup?error=no_email`);
  }

  // 기존 프로필 확인
  const { data: existing } = await supabase
    .from('profiles')
    .select('id, nickname')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    if (!existing.nickname) {
      return NextResponse.redirect(`${origin}/signup/nickname`);
    }
    return NextResponse.redirect(`${origin}/`);
  }

  // 동일 이메일 다른 계정 확인
  const { data: emailExisting } = await supabase
    .from('profiles')
    .select('id, provider')
    .eq('email', email)
    .maybeSingle();

  if (emailExisting) {
    return NextResponse.redirect(`${origin}/`);
  }

  // 신규 사용자 프로필 생성
  const provider = user.app_metadata?.provider ?? 'unknown';
  await supabase.from('profiles').insert({
    user_id: user.id,
    email,
    nickname: '',
    provider,
  });

  return NextResponse.redirect(`${origin}/signup/nickname`);
}
