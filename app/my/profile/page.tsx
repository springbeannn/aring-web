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

  const [editingNick, setEditingNick] = useState(false);
  const [newNick, setNewNick] = useState('');
  const [nickSaving, setNickSaving] = useState(false);
  const [nickMsg, setNickMsg] = useState('');

  useEffect(() => {
    async function load() {
      if (!supabase) { setLoading(false); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/login'); return; }
      const data = await getCurrentProfile();
      if (data) {
        setProfile({
          nickname: data.nickname ?? 'aring 사용자',
          email: data.email ?? session.user.email ?? '',
          provider: data.provider ?? 'email',
          created_at: data.created_at ?? session.user.created_at,
        });
        setNewNick(data.nickname ?? '');
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

  async function handleNickSave() {
    const trimmed = newNick.trim();
    if (!trimmed || trimmed.length < 2) { setNickMsg('닉네임은 2자 이상이어야 해요.'); return; }
    if (trimmed.length > 12) { setNickMsg('닉네임은 12자 이하여야 해요.'); return; }
    if (!/^[가-힣a-zA-Z0-9]+$/.test(trimmed)) { setNickMsg('한글, 영문, 숫자만 사용할 수 있어요.'); return; }
    if (!supabase) return;
    setNickSaving(true);
    setNickMsg('');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setNickSaving(false); return; }
    const { data: dup } = await supabase
      .from('profiles')
      .select('id')
      .ilike('nickname', trimmed)
      .neq('user_id', session.user.id)
      .maybeSingle();
    if (dup) { setNickMsg('이미 사용 중인 닉네임이에요.'); setNickSaving(false); return; }
    const { error } = await supabase
      .from('profiles')
      .update({ nickname: trimmed })
      .eq('user_id', session.user.id);
    setNickSaving(false);
    if (error) { setNickMsg('저장에 실패했어요. 다시 시도해 주세요.'); return; }
    setProfile(prev => prev ? { ...prev, nickname: trimmed } : prev);
    setEditingNick(false);
    setNickMsg('');
  }

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
      <main className="min-h-screen flex justify-center bg-gradient-to-b from-white to-blue-50">
        <div className="relative w-full max-w-[440px] bg-transparent overflow-hidden min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
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
    <main className="min-h-screen flex justify-center bg-gradient-to-b from-white to-blue-50">
      {/* 모바일: max-w-[440px] 고정 / PC(lg): 전체 폭 사용 */}
      <div className="relative w-full max-w-[440px] bg-transparent overflow-hidden min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
        <div className="pb-28 lg:pb-10">
          <TopNav />

          {/* 헤더 — 사이트 표준 (홈/탐색/댓글 등과 동일 폭·padding·타이포) */}
          <div className="px-5 lg:px-8 pt-3 lg:pt-7 pb-3 flex items-center gap-3">
            <Link
              href="/my"
              aria-label="MY로"
              className="lg:hidden w-9 h-9 rounded-full bg-aring-ink-100 flex items-center justify-center text-aring-ink-900 active:scale-95 transition shrink-0"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-[24px] lg:text-[26px] font-bold tracking-tight text-aring-ink-900">내 정보</h1>
              <p className="mt-0.5 text-[15px] lg:text-[15px] leading-[1.5] text-aring-ink-500">닉네임과 프로필을 관리해보세요</p>
            </div>
          </div>

          {/* 카드 영역 — 사이트 표준 1200px 폭 */}
          <div className="px-5 lg:px-8 space-y-3 lg:space-y-4">

              {/* 아바타 + 닉네임 */}
              <div className="rounded-2xl border border-aring-green-line bg-white p-5 lg:p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 shrink-0 rounded-full bg-aring-grad-pastel flex items-center justify-center text-[24px] lg:text-[30px] font-bold text-aring-ink-900">
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[20px] lg:text-[22px] font-bold text-aring-ink-900 truncate">{profile.nickname}</p>
                    <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full bg-aring-ink-100 text-[12px] lg:text-[13px] font-bold text-aring-ink-500">
                      {providerLabel[profile.provider] ?? profile.provider} 계정
                    </span>
                  </div>
                </div>
              </div>

              {/* 대화명 변경 */}
              <div className="rounded-2xl border border-aring-green-line bg-white overflow-hidden">
                <div className="px-5 py-4 lg:px-6 lg:py-5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[15px] lg:text-[15px] font-bold text-aring-ink-400 tracking-wider uppercase">대화명</p>
                    {!editingNick && (
                      <button
                        onClick={() => { setEditingNick(true); setNickMsg(''); setNewNick(profile.nickname); }}
                        className="text-[15px] lg:text-[15px] font-bold text-aring-ink-900 underline underline-offset-2"
                      >
                        변경
                      </button>
                    )}
                  </div>
                  {editingNick ? (
                    <div className="space-y-2 mt-2">
                      <input
                        type="text"
                        value={newNick}
                        onChange={(e) => { setNewNick(e.target.value); setNickMsg(''); }}
                        maxLength={12}
                        placeholder="새 대화명 입력 (2~12자)"
                        className="w-full px-4 py-2.5 rounded-xl border border-aring-ink-200 text-[16px] lg:text-[16px] lg:font-normal text-aring-ink-900 outline-none focus:border-aring-ink-500 transition"
                        autoFocus
                      />
                      {nickMsg && (
                        <p className={`text-[15px] lg:text-[15px] ${nickMsg.includes('사용 가능') ? 'text-emerald-500' : 'text-amber-500'}`}>{nickMsg}</p>
                      )}
                      <div className="flex gap-2 lg:max-w-[320px]">
                        <button
                          onClick={handleNickSave}
                          disabled={nickSaving}
                          className={`flex-1 py-2.5 rounded-xl font-bold text-[15px] lg:text-[15px] transition active:scale-95 ${nickSaving ? 'bg-aring-ink-100 text-aring-ink-400' : 'bg-aring-ink-900 text-white'}`}
                        >
                          {nickSaving ? '저장 중...' : '저장'}
                        </button>
                        <button
                          onClick={() => { setEditingNick(false); setNickMsg(''); }}
                          className="flex-1 py-2.5 rounded-xl font-bold text-[15px] lg:text-[15px] border border-aring-ink-200 text-aring-ink-700 transition active:scale-95"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[16px] font-semibold text-aring-ink-900">{profile.nickname}</p>
                  )}
                </div>
              </div>

              {/* 계정 정보 */}
              <div className="rounded-2xl border border-aring-green-line bg-white overflow-hidden">
                <div className="px-5 py-3.5 lg:px-6 lg:py-4 border-b border-aring-ink-100">
                  <p className="text-[15px] lg:text-[15px] font-bold text-aring-ink-400 tracking-wider uppercase mb-1">이메일</p>
                  <p className="text-[16px] font-semibold text-aring-ink-900 break-all">{profile.email}</p>
                </div>
                {profile.created_at && (
                  <div className="px-5 py-3.5 lg:px-6 lg:py-4">
                    <p className="text-[15px] lg:text-[15px] font-bold text-aring-ink-400 tracking-wider uppercase mb-1">가입일</p>
                    <p className="text-[16px] font-semibold text-aring-ink-900">{relativeDate(profile.created_at)}</p>
                  </div>
                )}
              </div>

              {/* MY 바로가기 */}
              <Link
                href="/my"
                className="flex items-center justify-between rounded-2xl border border-aring-green-line bg-white px-5 py-4 lg:px-6 active:scale-[0.99] transition"
              >
                <span className="text-[16px] font-bold text-aring-ink-900">내 활동 보기</span>
                <span className="text-aring-ink-400 text-[20px]">›</span>
              </Link>

              {/* 로그아웃 버튼 — PC에서 폭 제한 */}
              <div className="lg:flex lg:justify-end">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className={`w-full lg:w-[200px] py-4 rounded-2xl font-bold text-[16px] transition active:scale-95 ${loggingOut ? 'bg-aring-ink-100 text-aring-ink-400 cursor-not-allowed' : 'bg-aring-ink-900 text-white shadow-cta'}`}
                >
                  {loggingOut ? '로그아웃 중...' : '로그아웃'}
                </button>
              </div>

          </div>
        </div>

        <BottomNav active="my" />
      </div>
    </main>
  );
}
