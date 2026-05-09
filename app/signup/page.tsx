'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { TopNav } from '@/components/Nav'

function SignupLeftPanel() {
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
          버리기엔, 포기하기엔 너무 예쁜 귀걸이
        </p>
        <p className="text-[13px] leading-relaxed text-white/80 mb-4 break-keep">
          서랍 속에 한 짝만 남겨둔 경험이 있다면{' '}
          <span className="text-purple-300 font-semibold">aring에서 다시 찾아보세요</span>
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
        <p className="text-[12px] text-purple-300 font-semibold break-keep">
          한 짝만 남은 귀걸이가 있다면{' '}
          <span className="text-white font-bold">버리지 말고 aring에 등록해보세요</span>
        </p>
      </div>
    </div>
  )
}

function SignupMobileBanner() {
  return (
    <div className="lg:hidden relative mx-5 mt-4 mb-2 rounded-2xl overflow-hidden h-[200px]">
      <Image
        src="/images/login_table1.jpg"
        alt="aring 글이 모델"
        fill
        className="object-cover object-[center_65%]"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 px-5 pb-5">
        <p className="text-[15px] font-bold text-white leading-snug mb-1 break-keep">
          버리기엔, 포기하기엔 너무 예쁜 귀걸이
        </p>
        <p className="text-[12px] text-white/70 leading-relaxed break-keep">
          한 짝만 남은 귀걸이를 등록하면 같거나 비슷한 짝을 찾아드립니다
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  const router = useRouter()

  const handleGoogleSignup = async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) console.error(error)
  }

  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
        <TopNav />
        <div className="lg:flex lg:min-h-[calc(100vh-72px)]">
          <SignupLeftPanel />
          <div className="flex-1 flex flex-col lg:overflow-y-auto">
            <SignupMobileBanner />
            <div className="px-5 pt-4 pb-28 lg:pt-12 lg:pb-10 lg:px-14 xl:px-20 lg:max-w-[560px] lg:w-full lg:mx-auto">

              <div className="text-center mb-2 lg:text-left lg:mb-7">
                <h1 className="text-[22px] font-bold text-aring-ink-900">에이링 시작하기</h1>
                <p className="text-[13px] lg:text-[14px] text-aring-ink-400 mt-1">귀걸이 정보를 공유하고 발견해보세요</p>
              </div>

              <div className="w-full flex flex-col gap-6">

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
                  <span className="text-[12px] lg:text-[13px] text-aring-ink-400">또는</span>
                  <div className="flex-1 h-px bg-aring-ink-100" />
                </div>

                <button
                  onClick={() => router.push('/signup/email')}
                  className="w-full py-3.5 rounded-2xl bg-aring-ink-900 text-white font-bold text-[14px] active:scale-95 transition"
                >
                  이메일로 가입하기
                </button>

                <p className="text-center text-[13px] lg:text-[14px] text-aring-ink-400">
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
          </div>
        </div>
      </div>
    </main>
  )
}