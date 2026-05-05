'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/Nav';
import { signInWithEmail, signInWithOAuth } from '@/lib/auth';

const IconEye = ({ open }: { open: boolean }) => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {open ? (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>) : (<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>)}
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) { setError('이메일과 비밀번호를 입력해주세요.'); return; }
    setLoading(true); setError('');
    const { error } = await signInWithEmail(email, password);
    setLoading(false);
    if (error) { setError('이메일 또는 비밀번호를 확인해주세요.'); return; }
    router.push('/');
  };

  const handleGoogle = async () => {
    const { error } = await signInWithOAuth('google');
    if (error) setError('로그인에 실패했어요. 잠시 후 다시 시도해주세요.');
  };

  const isValid = email.trim() !== '' && password.trim() !== '';

  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
        <TopNav />
        <div className="px-5 pt-4 pb-24 lg:max-w-[480px] lg:mx-auto">
          <div className="mb-7 text-center">
            <h1 className="text-[22px] font-extrabold tracking-tight text-aring-ink-900">로그인</h1>
            <p className="mt-1.5 text-[13px] text-aring-ink-500 leading-snug">aring에 다시 오셨군요 :)</p>
          </div>
          <div className="mb-5">
            <button onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl font-bold text-[14px] text-aring-ink-900 border border-aring-ink-200 bg-white transition active:scale-95 shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google로 로그인
            </button>
          </div>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-aring-ink-100" />
            <span className="text-[11px] text-aring-ink-400 font-medium">또는</span>
            <div className="flex-1 h-px bg-aring-ink-100" />
          </div>
          <div className="flex flex-col gap-3 mb-4">
            <input type="email" placeholder="이메일" value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full px-4 py-3 rounded-2xl border border-aring-ink-200 text-[14px] text-aring-ink-900 placeholder:text-aring-ink-400 outline-none focus:border-aring-ink-500 transition input-aurora"
              style={{ background: 'linear-gradient(to right, rgba(235,218,210,0.5), rgba(225,205,212,0.5))' }} />
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} placeholder="비밀번호" value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
                className="w-full px-4 py-3 pr-11 rounded-2xl border border-aring-ink-200 text-[14px] text-aring-ink-900 placeholder:text-aring-ink-400 outline-none focus:border-aring-ink-500 transition input-aurora"
                style={{ background: 'linear-gradient(to right, rgba(200,220,213,0.5), rgba(210,205,225,0.5))' }} />
              <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-aring-ink-400 hover:text-aring-ink-700 transition">
                <IconEye open={showPw} />
              </button>
            </div>
          </div>
          {error && <p className="mb-3 text-[11px] text-rose-400 text-center">{error}</p>}
          <button onClick={handleEmailLogin} disabled={!isValid || loading}
            className={\`w-full py-4 rounded-2xl font-extrabold text-[14px] transition active:scale-95 \${isValid && !loading ? 'bg-aring-ink-900 text-white shadow-cta' : 'bg-aring-ink-100 text-aring-ink-400 cursor-not-allowed'}\`}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
          <p className="mt-4 text-center text-[13px] text-aring-ink-500">
            아직 계정이 없으신가요?{' '}
            <Link href="/signup" className="font-bold text-aring-ink-900 underline">회원가입</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
