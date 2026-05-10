'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { WelcomeModal } from '@/components/auth/WelcomeModal';

export default function NicknamePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [savedNickname, setSavedNickname] = useState('');

  const isValid = nickname.trim().length >= 2 && nickname.trim().length <= 12;

  const handleSubmit = async () => {
    if (!isValid || !supabase) return;
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/signup'); return; }

    const trimmed = nickname.trim();
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ nickname: trimmed })
      .eq('user_id', user.id);

    setLoading(false);
    if (updateError) { setError('닉네임 저장에 실패했습니다. 다시 시도해주세요.'); return; }
    setSavedNickname(trimmed);
    setWelcomeOpen(true);
  };

  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
        <div className="px-5 pt-16 pb-24 lg:max-w-[480px] lg:mx-auto">

          <div className="mb-10 text-center">
            <h1 className="text-[24px] lg:text-[26px] font-bold tracking-tight text-aring-ink-900">닉네임을 정해주세요</h1>
            <p className="mt-2 text-[15px] lg:text-[15px] leading-[1.5] text-aring-ink-500 leading-snug">aring에서 사용할 이름이에요<br />나중에 변경할 수 있어요</p>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="닉네임 (2~12자)"
              maxLength={12}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3.5 rounded-2xl border border-aring-ink-200 text-[16px] lg:text-[16px] lg:font-normal text-aring-ink-900 placeholder:text-aring-ink-400 outline-none focus:border-aring-ink-500 transition text-center font-bold input-aurora"
              style={{ background: 'linear-gradient(to right, rgba(235,228,200,0.5), rgba(232,218,205,0.5))' }}
              autoFocus
            />
            <p className="mt-2 text-right text-[15px] lg:text-[15px] leading-[1.5] text-aring-ink-400">{nickname.length}/12</p>
            {error && <p className="mt-1 text-[15px] lg:text-[15px] text-red-500 text-center">{error}</p>}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className={`w-full py-4 rounded-2xl font-bold text-[16px] transition active:scale-95 ${isValid && !loading ? 'bg-aring-ink-900 text-white shadow-cta' : 'bg-aring-ink-100 text-aring-ink-400 cursor-not-allowed'}`}
          >
            {loading ? '저장 중...' : '시작하기'}
          </button>

        </div>
      </div>

      <WelcomeModal
        isOpen={welcomeOpen}
        nickname={savedNickname}
        onClose={() => setWelcomeOpen(false)}
      />
    </main>
  );
}
