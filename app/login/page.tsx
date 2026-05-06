'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TopNav } from '@/components/Nav';
import { signInWithEmail, signInWithOAuth } from '@/lib/auth';

const IconEye = ({ open }: { open: boolean }) => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

function LoginLeftPanel() {
  return (
    <div className="hidden lg:flex flex-col relative overflow-hidden w-[420px] xl:w-[480px] flex-shrink-0 min-h-full">
      <Image
        src="/images/login_table1.jpg"
        alt="aring 귀걸이 모델"
        fill
        className="object-cover object-[center_65%]"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
      <div className="relative z-20 mt-auto px-9 pb-12">
        <p className="text-[22px] font-bold leading-snug text-white mb-3 break-keep">
          aring에 다시 오셨군요 :)
        </p>
        <p className="text-[13px] leading-relaxed text-white/80 mb-4 break-keep">
          서랍 속에 한 짝만 남겨둔 경험이 있다면{' '}
          <span className="text-purple-300 font-semibold">aring에서 다시 만나보세요</span>
        </p>
        <div className="pl-3 border-l-2 border-purple-400/50 mb-4">
          <p className="text-[12px] leading-relaxed text-white/60 break-keep">
            aring은 한 짝만 남은 귀걸이를 등록하면<br />
            귀걸이를 찾아볼 수 있도록<br />
            돕는 매칭 서비스입니다.<br />
            시간이 조금 걸리더라도<br />
            잃어버린 반쪽을 다시 만나는 경험을<br />
            만들어가고 있습니다.
          </p>
        </div>
        <p className="text-[12px] text-purple-300 font-medium break-keep">
          한 짝만 남은 귀걸이가 있다면{' '}
          <span className="text-white font-bold">버리지 말고 aring에 등록해보세요</span>
        </p>
      </div>
    </div>
  );
}

function LoginMobileBanner() {
  return (
    <div className="lg:hidden relative mx-5 mt-4 mb-2 rounded-2xl overflow-hidden h-[200px]">
      <Image
        src="/images/login_table1.jpg"
        alt="aring 귀걸이 모델"
        fill
        className="object-cover object-[center_65%]"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 px-5 pb-5">
        <p className="text-[15px] font-bold text-white leading-snug mb-1 break-keep">
          aring에 다시 오셨군요 :)
        </p>
        <p className="text-[12px] text-white/70 leading-relaxed break-keep">
          한 짝만 남은 귀걸이를 등록하면 같거나 비슷한 짝을 찾아드립니다
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await signInWithEmail(email, password);
    setLoading(false);
    if (error) { setError(error); return; }
    router.push('/');
  };

  const handleOAuth = async (provider: 'kakao' | 'google') => {
    const { error } = await signInWithOAuth(provider);
    if (error) alert(error);
  };

  const handleNaver = () => alert('서비스 준비 중입니다.');

  const isValid = email.trim() !== '' && password.trim() !== '';

  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
        <TopNav />

        <div className="lg:flex lg:min-h-[calc(100vh-72px)]">
          <LoginLeftPanel />

          <div className="flex-1 flex flex-col lg:overflow-y-auto">
            <LoginMobileBanner />

            <div className="px-5 pt-4 pb-24 lg:pt-12 lg:pb-16 lg:px-14 xl:px-20 lg:max-w-[560px] lg:w-full lg:mx-auto">
              <div className="mb-7 text-center lg:text-left">
                <h1 className="text-[22px] font-extrabold tracking-tight text-aring-ink-900">로그인</h1>
                <p className="mt-1.5 text-[13px] text-aring-ink-500 leading-snug">aring에 다시 오셨군요 :)</p>
              </div>

              <div className="flex flex-col gap-3 mb-4 items-center sm:items-stretch">
                <button onClick={() => handleOAuth('kakao')}
                  className="w-[69%] sm:w-full flex items-center justify-center gap-2.5 py-2.5 rounded-2xl font-bold text-[14px] text-[#3C1E1E] transition active:scale-95 whitespace-nowrap"
                  style={{ background: '#FEE500' }}>
                  <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                    <ellipse cx="20" cy="19" rx="18" ry="17" fill="#3C1E1E"/>
                    <ellipse cx="13" cy="19" rx="3" ry="4" fill="#FEE500"/>
                    <ellipse cx="27" cy="19" rx="3" ry="4" fill="#FEE500"/>
                    <path d="M13 26c2 2 12 2 14 0" stroke="#FEE500" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                  카카오톡으로 로그인
                </button>

                <button onClick={handleNaver}
                  className="w-[69%] sm:w-full flex items-center justify-center gap-2.5 py-2.5 rounded-2xl font-bold text-[14px] text-white transition active:scale-95 whitespace-nowrap"
                  style={{ background: '#03C75A' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
                  </svg>
                  네이버로 로그인
                </button>

                <button onClick={() => handleOAuth('google')}
                  className="w-[69%] sm:w-full flex items-center justify-center gap-2.5 py-2.5 rounded-2xl font-bold text-[14px] text-aring-ink-900 border border-aring-ink-200 bg-white transition active:scale-95 whitespace-nowrap">
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google로 로그인
                </button>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-aring-ink-100" />
                <span className="text-[11px] text-aring-ink-400 font-medium">또는</span>
                <div className="flex-1 h-px bg-aring-ink-100" />
              </div>

              <div className="flex flex-col gap-3 mb-4">
                <input
                  type="email"
                  placeholder="이메일"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-aring-ink-200 text-[14px] text-aring-ink-900 placeholder:text-aring-ink-400 outline-none focus:border-aring-ink-500 transition"
                  style={{ background: 'linear-gradient(to right, rgba(235,218,210,0.5), rgba(225,205,212,0.5))' }}
                />
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
                    className="w-full px-4 py-3 pr-11 rounded-2xl border border-aring-ink-200 text-[14px] text-aring-ink-900 placeholder:text-aring-ink-400 outline-none focus:border-aring-ink-500 transition"
                    style={{ background: 'linear-gradient(to right, rgba(200,220,213,0.5), rgba(210,205,225,0.5))' }}
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-aring-ink-400 hover:text-aring-ink-700 transition">
                    <IconEye open={showPw} />
                  </button>
                </div>
              </div>

              {error && <p className="mb-3 text-[11px] text-red-500 text-center">{error}</p>}

              <button
                onClick={handleEmailLogin}
                disabled={!isValid || loading}
                className={`w-full py-4 rounded-2xl font-extrabold text-[14px] transition active:scale-95 ${isValid && !loading ? 'bg-aring-ink-900 text-white shadow-cta' : 'bg-aring-ink-100 text-aring-ink-400 cursor-not-allowed'}`}
              >
                {loading ? '로그인 중...' : '로그인'}
              </button>

              <p className="mt-4 text-center text-[13px] text-aring-ink-500">
                아직 계정이 없으신가요?{' '}
                <Link href="/signup" className="font-bold text-aring-ink-900 underline">회원가입</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}