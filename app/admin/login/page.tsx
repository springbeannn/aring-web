'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { parseAuthError } from '@/lib/auth';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginInner />
    </Suspense>
  );
}

function AdminLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('error') === 'unauthorized') {
      setError('관리자 권한이 없습니다.');
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!supabase) {
      setError('서비스 연결에 실패했습니다.');
      return;
    }
    setLoading(true);
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInErr) {
      setLoading(false);
      setError(parseAuthError(signInErr.message));
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      setError('로그인 정보를 가져올 수 없습니다.');
      return;
    }
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('role, is_banned')
      .eq('user_id', user.id)
      .maybeSingle();
    if (profileErr || !profile) {
      await supabase.auth.signOut();
      setLoading(false);
      setError('프로필을 찾을 수 없습니다.');
      return;
    }
    if (profile.is_banned) {
      await supabase.auth.signOut();
      setLoading(false);
      setError('정지된 계정입니다.');
      return;
    }
    if (profile.role !== 'admin') {
      await supabase.auth.signOut();
      setLoading(false);
      setError('관리자 권한이 없습니다.');
      return;
    }
    router.push('/admin');
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-aring-ink-50 px-5 py-10">
      <div className="w-full max-w-[420px]">
        {/* 로고 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-baseline gap-1">
            <span className="text-[28px] font-black tracking-tight text-aring-green leading-none">aring</span>
            <sup className="text-[12px] font-medium text-aring-ink-500">관리자</sup>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-aring-ink-100 p-6">
          <h1 className="text-[18px] font-extrabold text-aring-ink-900 mb-1">관리자 로그인</h1>
          <p className="text-[13px] text-aring-ink-500 mb-5">관리자 권한이 있는 계정으로만 접속할 수 있어요</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="block">
              <span className="text-[13px] font-semibold text-aring-ink-700">이메일</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full border border-aring-ink-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-aring-green transition"
                placeholder="admin@example.com"
              />
            </label>

            <label className="block">
              <span className="text-[13px] font-semibold text-aring-ink-700">비밀번호</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full border border-aring-ink-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-aring-green transition"
                placeholder="••••••••"
              />
            </label>

            {error && (
              <p className="text-[13px] text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-aring-green text-white text-[14px] font-semibold rounded-lg py-3 hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? '확인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
