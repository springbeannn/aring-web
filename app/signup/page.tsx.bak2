'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/Nav';
import { signInWithOAuth } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();

  const handleKakao = () => {
    alert('서비스 준비 중입니다.');

  };

  const handleGoogle = async () => {
    const { error } = await signInWithOAuth('google');

  };

  const handleNaver = () => {
    alert('서비스 준비 중입니다.');
  };

  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
        <TopNav />

        <div className="px-5 pt-4 pb-24 lg:max-w-[480px] lg:mx-auto">

          <div className="mb-7 text-center">
            <h1 className="text-[22px] font-extrabold tracking-tight text-aring-ink-900">aring 시작하기</h1>
            <p className="mt-1.5 text-[13px] text-aring-ink-500 leading-snug">잃어버린 한 짝을 찾거나,<br />누군가의 반쪽이 되어보세요</p>
          </div>

          <div className="flex flex-col gap-3 mb-4 items-center sm:items-stretch">
            <button
              onClick={handleKakao}
              className="w-[69%] sm:w-full flex items-center justify-center gap-2.5 py-2.5 rounded-2xl font-bold text-[14px] text-[#3C1E1E] transition active:scale-95 whitespace-nowrap"
              style={{ background: '#FEE500' }}
            >
              <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                <ellipse cx="20" cy="19" rx="18" ry="17" fill="#3C1E1E"/>
                <ellipse cx="13" cy="19" rx="3" ry="4" fill="#FEE500"/>
                <ellipse cx="27" cy="19" rx="3" ry="4" fill="#FEE500"/>
                <path d="M13 26c2 2 12 2 14 0" stroke="#FEE500" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              카카오톡으로 계속하기
            </button>

            <button
              onClick={handleNaver}
              className="w-[69%] sm:w-full flex items-center justify-center gap-2.5 py-2.5 rounded-2xl font-bold text-[14px] text-white transition active:scale-95 whitespace-nowrap"
              style={{ background: '#03C75A' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
              </svg>
              네이버로 계속하기
            </button>

            <button
              onClick={handleGoogle}
              className="w-[69%] sm:w-full flex items-center justify-center gap-2.5 py-2.5 rounded-2xl font-bold text-[14px] text-aring-ink-900 border border-aring-ink-200 bg-white transition active:scale-95 whitespace-nowrap"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google로 계속하기
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-aring-ink-100" />
            <span className="text-[11px] text-aring-ink-400 font-medium">또는</span>
            <div className="flex-1 h-px bg-aring-ink-100" />
          </div>

          <button
            onClick={() => router.push('/signup/email')}
            className="w-[69%] sm:w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl font-bold text-[14px] text-aring-ink-700 border border-aring-ink-200 bg-white transition active:scale-95 mb-5 whitespace-nowrap mx-auto"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            이메일로 가입하기
          </button>

          <p className="mt-4 text-center text-[13px] text-aring-ink-500">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="font-bold text-aring-ink-900 underline">로그인</Link>
          </p>

        </div>
      </div>
    </main>
  );
}
