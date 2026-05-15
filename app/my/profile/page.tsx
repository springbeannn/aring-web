'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TopNav, BottomNav } from '@/components/Nav';
import { supabase } from '@/lib/supabase';
import {
  signOut,
  getCurrentProfile,
  getUserIdentities,
  linkOAuthIdentity,
} from '@/lib/auth';

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

  // 연결된 SNS identity 목록 (provider 문자열 배열)
  const [linkedProviders, setLinkedProviders] = useState<string[]>([]);
  const [linkingProvider, setLinkingProvider] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

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

      // 연결된 SNS identity 조회 — 카드 표시용
      const identities = await getUserIdentities();
      setLinkedProviders(identities.map((i) => i.provider));

      setLoading(false);

      // 콜백에서 ?linked=google로 돌아온 경우 토스트
      const params = new URLSearchParams(window.location.search);
      const linked = params.get('linked');
      if (linked === 'google') showToast('Google 계정이 연결되었어요');
      else if (linked === 'kakao') showToast('카카오 계정이 연결되었어요');
      if (linked) {
        // URL 정리 — 새로고침 시 다시 토스트 안 뜨도록
        window.history.replaceState({}, '', '/my/profile');
      }
    }
    load();
  }, [router]);

  async function handleLinkGoogle() {
    setLinkingProvider('google');
    // 콜백이 /my/profile?linked=google로 돌아오게 함
    const { error } = await linkOAuthIdentity('google', '/my/profile?linked=google');
    if (error) {
      setLinkingProvider(null);
      showToast(error);
    }
    // 정상 흐름이면 페이지 이탈 → 상태 reset 불필요
  }

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

  const googleLinked = linkedProviders.includes('google');

  return (
    <main className="min-h-screen flex justify-center bg-gradient-to-b from-white to-blue-50">
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-aring-ink-900 text-white text-[15px] font-semibold px-5 py-3 rounded-2xl shadow-lg whitespace-nowrap">
          {toast}
        </div>
      )}
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

              {/* 다른 로그인 방법 — 비번 가입자도 Google로 로그인 가능하게 연결 */}
              <div className="rounded-2xl border border-aring-green-line bg-white overflow-hidden">
                <div className="px-5 py-3.5 lg:px-6 lg:py-4 border-b border-aring-ink-100">
                  <p className="text-[15px] lg:text-[15px] font-bold text-aring-ink-400 tracking-wider uppercase mb-1">다른 로그인 방법</p>
                  <p className="text-[13px] lg:text-[14px] text-aring-ink-500 leading-relaxed break-keep">
                    SNS 계정을 연결하면 같은 계정으로 다양한 방법으로 로그인할 수 있어요.
                  </p>
                </div>

                {/* Google */}
                <div className="px-5 py-3.5 lg:px-6 lg:py-4 flex items-center gap-3">
                  <span className="w-9 h-9 shrink-0 rounded-full bg-aring-ink-100 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] lg:text-[16px] font-bold text-aring-ink-900">Google</p>
                    <p className="text-[13px] lg:text-[14px] text-aring-ink-500">
                      {googleLinked ? '연결됨' : '연결하면 Google로도 로그인할 수 있어요'}
                    </p>
                  </div>
                  {googleLinked ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-aring-green-bg text-[12px] lg:text-[13px] font-bold text-aring-green">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <path d="m5 12 5 5 9-11" />
                      </svg>
                      연결됨
                    </span>
                  ) : (
                    <button
                      onClick={handleLinkGoogle}
                      disabled={linkingProvider !== null}
                      className={`px-3.5 py-2 rounded-pill text-[13px] lg:text-[14px] font-bold transition active:scale-95 ${
                        linkingProvider !== null
                          ? 'bg-aring-ink-100 text-aring-ink-400 cursor-not-allowed'
                          : 'bg-aring-ink-900 text-white'
                      }`}
                    >
                      {linkingProvider === 'google' ? '연결 중...' : '연결하기'}
                    </button>
                  )}
                </div>
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
