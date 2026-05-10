'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface WelcomeModalProps {
  isOpen: boolean;
  nickname: string;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, nickname, onClose }: WelcomeModalProps) {
  const router = useRouter();

  // body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  function handleRegister() {
    onClose();
    router.push('/register');
  }

  function handleHome() {
    onClose();
    router.push('/');
  }

  return (
    <>
      {/* 딤 배경 — 클릭으로는 닫히지 않음 */}
      <div
        aria-hidden
        className={[
          'fixed inset-0 z-[9998] bg-[rgba(30,27,46,0.45)] backdrop-blur-[2px]',
          'transition-opacity duration-300',
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none',
        ].join(' ')}
      />

      {/* 모달 컨테이너 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="회원가입 완료"
        className={[
          'fixed inset-0 z-[9999] flex items-center justify-center px-5',
          isOpen ? 'visible' : 'invisible pointer-events-none',
        ].join(' ')}
      >
        <div
          className={[
            'w-full max-w-[340px] bg-white rounded-3xl px-6 pt-8 pb-6',
            'shadow-[0_24px_60px_rgba(28,51,40,0.18)]',
            'transform transition-all duration-300 ease-out',
            isOpen
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-5 scale-95',
          ].join(' ')}
        >
          {/* 이모지 */}
          <div className="text-center mb-5">
            <span className="text-[52px] leading-none select-none" aria-hidden>🩷</span>
          </div>

          {/* 레이블 */}
          <p className="text-center text-[12px] font-bold tracking-[0.08em] text-aring-green uppercase mb-2">
            회원가입 완료
          </p>

          {/* 메인 타이틀 */}
          <h2 className="text-center text-[22px] font-bold text-aring-ink-900 leading-snug tracking-tight">
            {nickname ? `${nickname}님, 환영해요` : '환영해요!'}
          </h2>

          {/* 본문 */}
          <p className="mt-3 text-center text-[14px] text-aring-ink-400 leading-[1.7]">
            회원가입이 완료되었어요<br />
            한 짝만 남은 귀걸이를 등록하면<br />
            aring이 비슷한 반쪽을 함께 찾아볼게요
          </p>

          {/* 구분선 */}
          <div className="my-5 h-px bg-aring-ink-100" />

          {/* 버튼 영역 */}
          <div className="flex flex-col gap-2.5">
            {/* Primary CTA */}
            <button
              type="button"
              onClick={handleRegister}
              className="w-full rounded-2xl bg-aring-ink-900 py-4 text-[16px] font-bold text-white shadow-[0_12px_28px_rgba(28,51,40,0.28)] active:scale-95 transition"
            >
              첫 귀걸이 등록하기
            </button>

            {/* Secondary */}
            <button
              type="button"
              onClick={handleHome}
              className="w-full rounded-2xl border border-aring-ink-200 bg-white py-4 text-[16px] font-bold text-aring-ink-700 hover:bg-aring-ink-50 active:scale-95 transition"
            >
              홈으로 이동
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
