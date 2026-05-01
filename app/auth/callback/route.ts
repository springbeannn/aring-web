import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/signup?error=no_code`);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/signup?error=auth_failed`);
  }

  const user = data.user;
  const email = user.email;

  if (!email) {
    return NextResponse.redirect(
      `${origin}/signup?error=no_email`
    );
  }

  // 기존 프로필 확인
  const { data: existing } = await supabase
    .from('profiles')
    .select('id, nickname')
    .eq('user_id', user.id)
    .maybeSingle();

  // 이미 프로필 있으면 → 로그인 처리 → 홈으로
  if (existing) {
    // 닉네임 없으면 → 닉네임 입력 페이지
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
    // 같은 이메일 다른 provider → 같은 회원으로 처리 (로그인)
    return NextResponse.redirect(`${origin}/`);
  }

  // 신규 사용자 → provider 파악
  const provider = user.app_metadata?.provider ?? 'unknown';

  // profiles 생성 (닉네임은 아직 없음)
  await supabase.from('profiles').insert({
    user_id: user.id,
    email,
    nickname: '',
    provider,
  });

  // 닉네임 입력 페이지로
  return NextResponse.redirect(`${origin}/signup/nickname`);
}
