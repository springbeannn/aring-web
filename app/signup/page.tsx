'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) console.error(error)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-5">
      <div className="w-full max-w-[400px] flex flex-col gap-6">

        <div className="text-center mb-2">
          <h1 className="text-[22px] font-extrabold text-aring-ink-900">아링 시작하기</h1>
          <p className="text-[13px] text-aring-ink-400 mt-1">귀걸이 정보를 공유하고 발견해보세요</p>
        </div>

        <button
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border border-aring-ink-200 bg-white text-aring-ink-900 font-semibold text-[14px] active:scale-95 transition"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
            <path d="M6.3 14.7l7 5.1C15.2 17 19.3 14 24 14c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.6 0-14.2 4.1-17.7 10.2z" fill="#FF3D00"/>
            <path d="M24 45c5.5 0 10.5-1.9 14.4-5l-6.7-5.5C29.5 36.2 26.9 37 24 37c-6.1 0-10.7-3.1-11.8-7.5l-7 5.4C8.3 41.3 15.6 45 24 45z" fill="#4CAF50"/>
            <path d="M44.5 20H24v8.5h11.8c-.6 2.9-2.5 5.4-5.1 7l6.7 5.5C41.5 37.4 44.5 31.2 44.5 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
          </svg>
          Google 계정으로 계속하기
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-aring-ink-100" />
          <span className="text-[12px] text-aring-ink-400">또는</span>
          <div className="flex-1 h-px bg-aring-ink-100" />
        </div>

        <button
          onClick={() => router.push('/signup/email')}
          className="w-full py-3.5 rounded-2xl bg-aring-ink-900 text-white font-extrabold text-[14px] active:scale-95 transition"
        >
          이메일로 가입하기
        </button>

        <p className="text-center text-[13px] text-aring-ink-400">
          이미 계정이 있으신가요?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-aring-ink-900 font-bold underline"
          >
            로그인
          </button>
        </p>

      </div>
    </div>
  )
}
