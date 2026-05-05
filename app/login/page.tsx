'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TopNav } from '@/components/Nav';
import { signInWithEmail, signInWithOAuth } from '@/lib/auth';

const IconEye = ({ open }: { open: boolean }) => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {open ? (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>>) : (<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>>)}
    </svg>svg>
  );

function LoginLeftPanel() {
    return (
          <div className="hidden lg:flex flex-col relative overflow-hidden w-[420px] xl:w-[480px] flex-shrink-0 min-h-full">
                <Image
                          src="/images/signup-model.jpg"
                          alt="aring 귀걸이 모델"
                          fill
                          className="object-cover object-[center_30%]"
                          priority
                        />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
                <div className="relative z-20 mt-auto px-9 pb-12">
                        <p className="text-[22px] font-bold leading-snug text-white mb-3 break-keep">
                                  aring에 다시 오셨군요 :)
                        </p>p>
                        <p className="text-[13px] leading-relaxed text-white/80 mb-4 break-keep">
                                  귀걸이의 짝을 찾고 있다면{' '}
                                  <span className="text-purple-300 font-semibold">aring에서 다시 만나보세요</span>span>
                        </p>p>
                        <div className="pl-3 border-l-2 border-purple-400/50 mb-4">
                                  <p className="text-[12px] leading-relaxed text-white/60 break-keep">
                                              aring은 한 짝만 남은 귀걸이를 등록하면<br />
                                              귀걸이를 찾아볼 수 있도록<br />
                                              돕는 매칭 서비스입니다.<br />
                                              시간이 조금 걸리더라도<br />
                                              잃어버린 반쪽을 다시 만나는 경험을<br />
                                              만들어가고 있습니다.
                                  </p>p>
                        </div>div>
                        <p className="text-[12px] text-purple-300 font-medium break-keep">
                                  한 짝만 남은 귀걸이가 있다면{' '}
                                  <span className="text-white font-bold">버리지 말고 aring에 등록해보세요</span>span>
                        </p>p>
                </div>div>
          </div>div>
        )
}

function LoginMobileBanner() {
    return (
          <div className="lg:hidden relative mx-5 mt-4 mb-2 rounded-2xl overflow-hidden h-[200px]">
                <Image
                          src="/images/signup-model.jpg"
                          alt="aring 귀걸이 모델"
                          fill
                          className="object-cover object-[center_30%]"
                          priority
                        />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 px-5 pb-5">
                        <p className="text-[15px] font-bold text-white leading-snug mb-1 break-keep">
                                  aring에 다시 오셨군요 :)
                        </p>p>
                        <p className="text-[12px] text-white/70 leading-relaxed break-keep">
                                  귀걸이의 짝을 찾고 있다면 aring에서 다시 만나보세요
                        </p>p>
                </div>div>
          </div>div>
        )
}

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
                        <div className="lg:flex lg:min-h-[calc(100vh-72px)]">
                                  <LoginLeftPanel />
                                  <div className="flex-1 flex flex-col lg:overflow-y-auto">
                                              <LoginMobileBanner />
                                              <div className="px-5 pt-4 pb-32 lg:pt-12 lg:pb-16 lg:px-14 xl:px-20 lg:max-w-[560px] lg:w-full lg:mx-auto">
                                                            <div className="text-center mb-6 lg:text-left lg:mb-7">
                                                                            <h1 className="text-[22px] font-extrabold tracking-tight text-aring-ink-900">로그인</h1>h1>
                                                                            <p className="mt-1.5 text-[13px] text-aring-ink-500 leading-snug">aring에 다시 오셨군요 :)</p>p>
                                                            </div>div>
                                                            <div className="w-full flex flex-col gap-6">
                                                                            <button onClick={handleGoogle}
                                                                                                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-[14px] text-aring-ink-900 border border-aring-ink-200 bg-white transition active:scale-95 shadow-sm">
                                                                                              <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                                                  <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
                                                                                                                  <path d="M6.3 14.7l7 5.1C15.2 17 19.3 14 24 14c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.6 0-14.2 4.1-17.7 10.2z" fill="#FF3D00"/>
                                                                                                                  <path d="M24 45c5.5 0 10.5-1.9 14.4-5l-6.7-5.5C29.5 36.2 26.9 37 24 37c-6.1 0-10.7-3.1-11.8-7.5l-7 5.4C8.3 41.3 15.6 45 24 45z" fill="#4CAF50"/>
                                                                                                                  <path d="M44.5 20H24v8.5h11.8c-.6 2.9-2.5 5.4-5.1 7l6.7 5.5C41.5 37.4 44.5 31.2 44.5 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
                                                                                                </svg>svg>
                                                                                              Google로 로그인
                                                                            </button>button>
                                                                            <div className="flex items-center gap-3">
                                                                                              <div className="flex-1 h-px bg-aring-ink-100" />
                                                                                              <span className="text-[11px] text-aring-ink-400 font-medium">또는</span>span>
                                                                                              <div className="flex-1 h-px bg-aring-ink-100" />
                                                                            </div>div>
                                                                            <div className="flex flex-col gap-3">
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
                                                                                                                    </button>button>
                                                                                                </div>div>
                                                                            </div>div>
                                                              {error && <p className="text-[11px] text-rose-400 text-center">{error}</p>p>}
                                                                            <button onClick={handleEmailLogin} disabled={!isValid || loading}
                                                                                                className={`w-full py-4 rounded-2xl font-extrabold text-[14px] transition active:scale-95 ${isValid && !loading ? 'bg-aring-ink-900 text-white shadow-cta' : 'bg-aring-ink-100 text-aring-ink-400 cursor-not-allowed'}`}>
                                                                              {loading ? '로그인 중...' : '로그인'}
                                                                            </button>button>
                                                                            <p className="text-center text-[13px] text-aring-ink-500">
                                                                                              아직 계정이 없으신가요?{' '}
                                                                                              <Link href="/signup" className="font-bold text-aring-ink-900 underline">회원가입</Link>Link>
                                                                            </p>p>
                                                            </div>div>
                                              </div>div>
                                  </div>div>
                        </div>div>
                </div>div>
          </main>main>
        );
}</></></svg>
