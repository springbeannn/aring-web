import { supabase } from './supabase';

// ────────────────────────────────────────────────
// 에러 메시지 한국어 변환
// ────────────────────────────────────────────────
export function parseAuthError(message: string): string {
  if (message.includes('User already registered') || message.includes('already been registered'))
    return '이미 가입된 이메일입니다. 로그인해주세요.';
  if (message.includes('Invalid login credentials'))
    return '이메일 또는 비밀번호가 올바르지 않습니다.';
  if (message.includes('Email not confirmed'))
    return '이메일 인증이 필요합니다. 메일함을 확인해주세요.';
  if (message.includes('Password should be at least'))
    return '비밀번호는 6자 이상이어야 합니다.';
  if (message.includes('Unable to validate email address'))
    return '올바른 이메일 주소를 입력해주세요.';
  if (message.includes('Email rate limit exceeded'))
    return '잠시 후 다시 시도해주세요.';
  return '오류가 발생했습니다. 다시 시도해주세요.';
}

// ────────────────────────────────────────────────
// 이메일 가입
// ────────────────────────────────────────────────
export async function signUpWithEmail(
  email: string,
  password: string,
  nickname: string
): Promise<{ error: string | null }> {
  if (!supabase) return { error: '서비스 연결에 실패했습니다.' };

  // 이메일 중복 체크 (profiles 테이블)
  const { data: existing } = await supabase
    .from('profiles')
    .select('id, provider')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    if (existing.provider !== 'email') {
      return { error: `이미 해당 이메일로 가입된 계정이 있습니다. 기존 SNS 계정으로 로그인해주세요.` };
    }
    return { error: '이미 가입된 이메일입니다. 로그인해주세요.' };
  }

  // Supabase Auth 가입
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: parseAuthError(error.message) };
  if (!data.user) return { error: '가입 처리 중 오류가 발생했습니다.' };

  // profiles 저장
  const { error: profileError } = await supabase.from('profiles').insert({
    user_id: data.user.id,
    email,
    nickname,
    provider: 'email',
  });
  if (profileError) return { error: '프로필 저장에 실패했습니다.' };

  return { error: null };
}

// ────────────────────────────────────────────────
// 이메일 로그인
// ────────────────────────────────────────────────
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ error: string | null }> {
  if (!supabase) return { error: '서비스 연결에 실패했습니다.' };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: parseAuthError(error.message) };

  return { error: null };
}

// ────────────────────────────────────────────────
// SNS 로그인 (카카오 / 구글)
// 가입과 로그인을 하나의 흐름으로 처리
// ────────────────────────────────────────────────
export async function signInWithOAuth(
  provider: 'kakao' | 'google'
): Promise<{ error: string | null }> {
  if (!supabase) return { error: '서비스 연결에 실패했습니다.' };

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) return { error: parseAuthError(error.message) };

  return { error: null };
}

// ────────────────────────────────────────────────
// 로그아웃
// ────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

// ────────────────────────────────────────────────
// 현재 로그인 사용자 프로필 조회
// ────────────────────────────────────────────────
export async function getCurrentProfile() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  return data;
}
