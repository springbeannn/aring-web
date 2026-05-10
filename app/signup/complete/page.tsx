'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const REDIRECT_DELAY_SEC = 3;

export default function SignupCompletePage() {
  const router = useRouter();
  const [secs, setSecs] = useState(REDIRECT_DELAY_SEC);

  // 인증 완료 후 세션은 살아있을 수 있으므로 명시적 로그아웃 (사용자가 로그인 페이지에서 직접 로그인하도록)
  useEffect(() => {
    if (supabase) supabase.auth.signOut().catch(() => {});
  }, []);

  useEffect(() => {
    const tick = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    const redirect = setTimeout(() => router.push('/login'), REDIRECT_DELAY_SEC * 1000);
    return () => {
      clearInterval(tick);
      clearTimeout(redirect);
    };
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-5">
      <div className="w-full max-w-[420px] text-center">
        {/* 로고 */}
        <div className="mb-8">
          <div className="inline-flex items-baseline gap-1">
            <span className="text-[28px] font-black tracking-tight text-aring-green leading-none">aring</span>
            <sup className="text-[12px] lg:text-[13px] font-semibold text-aring-ink-500">한 짝의 짝</sup>
          </div>
        </div>

        {/* 체크 아이콘 */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center">
          <svg className="w-10 h-10 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-[24px] font-bold text-aring-ink-900 mb-2">
          인증이 완료되었습니다!
        </h1>
        <p className="text-[16px] text-aring-ink-500 mb-8 leading-relaxed">
          aring에 오신 걸 환영해요.<br />
          {secs > 0
            ? `${secs}초 후 자동으로 로그인 페이지로 이동합니다.`
            : '로그인 페이지로 이동 중...'}
        </p>

        <Link
          href="/login"
          className="inline-flex items-center justify-center w-full bg-aring-ink-900 text-white py-4 rounded-2xl font-bold text-[16px] hover:opacity-90 transition active:scale-95"
        >
          지금 로그인하기
        </Link>
      </div>
    </main>
  );
}
