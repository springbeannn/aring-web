'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TopNav, BottomNav } from '@/components/Nav';
import { supabase } from '@/lib/supabase';
import { signOut, getCurrentProfile } from '@/lib/auth';

function relativeDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

type Profile = {
  nickname: string;
  email: string;
  provider: string;
  created_at?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function load() {
      if (!supabase) { setLoading(false); return; }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }

      const data = await getCurrentProfile();
      if (data) {
        setProfile({
          nickname: data.nickname ?? 'aring 사용자',
          email: data.email ?? session.user.email ?? '',
          provider: data.provider ?? 'email',
          created_at: data.created_at ?? session.user.created_at,
        });
      } else {
        setProfile({
          nickname: 'aring 사용자',
          email: session.user.email ?? '',
          provider: 'email',
          created_at: session.user.created_at,
        });
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);
    await signOut();
    router.replace('/');
  }

  const providerLabel: Record<string, string> = {
    email: '이메일',
    kakao: '카카오',
    google: '구글',
  };

  if (loading) {
    return (
      <main className="min-h-screen flex justify-center bg-gradient-to-b from-green-50 via-yellow-50 to-pink-50">
        <div className="relative w-full max-w-[440px] min-h-screen">
          <TopNav />
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 rounded-full border-2 border-aring-ink-100 border-t-aring-ink-900 animate-spin" />
          </div>
        </div>
      </main>
    );
  }

  if (!profile) return null;

  const initial = (profile.nickname || '?').charAt(0).toUpperCase();

  return (
    <main className="min-h-screen flex justify-center bg-gradient-to-b from-green-50 via-yellow-50 to-pink-50">
      <div className="relative w-full max-w-[440px] bg-transparent overflow-hidden min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
        <div className="pb-28 lg:pb-12">
          <TopNav />

          {/* 헤더 */}
          <div className="px-5 lg:px-8 pt-3 pb-5">
            <div className="flex items-center gap-2 mb-1">
              <Link href="/my" className="text-[12px] text-aring-ink-400 hover:text-aring-ink-700 transition">MY</Link>
              <span className="text-aring-ink-300 text-[12px]">›</span>
              <span className="text-[12px] text-aring-ink-700 font-semibold">내 정보</span>
            </div>
            <h1 className="text-[22px] font-extrabold tracking-tight text-aring-ink-900">내 정보</h1>
          </div>

          {/* 프로필 카드 */}
          <div className="px-5 lg:px-8">

            {/* 아바타 + 닉네임 */}
            <div className="rounded-2xl border border-aring-green-line bg-white p-5 mb-3">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 shrink-0 rounded-full bg-aring-grad-pastel flex items-center justify-center text-[24px] font-extrabold text-aring-ink-900">
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[18px] font-extrabold text-aring-ink-900 truncate">{profile.nickname}</p>
                  <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full bg-aring-ink-100 text-[10.5px] font-bold text-aring-ink-500">
                    {providerLabel[profile.provider] ?? profile.provider} 계정
                  </span>
                </div>
              </div>
            </div>

            {/* 계정 정보 */}
            <div className="rounded-2xl border border-aring-green-line bg-white overflow-hidden mb-3">
              <div className="px-5 py-3.5 border-b border-aring-ink-100">
                <p className="text-[11px] font-bold text-aring-ink-400 tracking-wider uppercase mb-1">이메일</p>
                <p className="text-[14px] font-semibold text-aring-ink-900">{profile.email}</p>
              </div>
              {profile.created_at && (
                <div className="px-5 py-3.5">
                  <p className="text-[11px] font-bold text-aring-ink-400 tracking-wider uppercase mb-1">가입일</p>
                  <p className="text-[14px] font-semibold text-aring-ink-900">{relativeDate(profile.created_at)}</p>
                </div>
              )}
            </div>

            {/* MY 바로가기 */}
            <Link
              href="/my"
              className="flex items-center justify-between rounded-2xl border border-aring-green-line bg-white px-5 py-4 mb-3 active:scale-[0.99] transition"
            >
              <span className="text-[14px] font-bold text-aring-ink-900">내 활동 보기</span>
              <span className="text-aring-ink-400 text-[16px]">›</span>
            </Link>

            {/* 로그아웃 버튼 */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className={`w-full py-4 rounded-2xl font-extrabold text-[15px] transition active:scale-95 ${loggingOut ? 'bg-aring-ink-100 text-aring-ink-400 cursor-not-allowed' : 'bg-rose-50 text-rose-400 border border-rose-100 hover:bg-rose-100'}`}
            >
              {loggingOut ? '로그아웃 중...' : '로그아웃'}
            </button>

          </div>
        </div>
        <BottomNav active="my" />
      </div>
    </main>
  );
}
