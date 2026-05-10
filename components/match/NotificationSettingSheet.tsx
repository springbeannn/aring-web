'use client';

import { useEffect, useState } from 'react';
import { Toast } from '@/components/Toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  earringId: string;
}

const THRESHOLDS = [40, 50, 60, 70, 80] as const;
type Threshold = typeof THRESHOLDS[number];

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

const IconCheck = ({ className = 'w-3 h-3' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function NotificationSettingSheet({ isOpen, onClose, userEmail, earringId }: Props) {
  const [threshold, setThreshold] = useState<Threshold>(60);
  const [emailOn, setEmailOn] = useState(true);
  const [smsOn, setSmsOn] = useState(false);
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 시트 열릴 때 상태 초기화 + body 스크롤 잠금
  useEffect(() => {
    if (!isOpen) return;
    setThreshold(60);
    setEmailOn(true);
    setSmsOn(false);
    setPhone('');
    setError(null);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // ESC로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const phoneDigits = phone.replace(/\D/g, '');
  const phoneValid = phoneDigits.length >= 10 && phoneDigits.length <= 11;
  const atLeastOne = emailOn || smsOn;
  const valid = atLeastOne && (!smsOn || phoneValid);

  async function handleSubmit() {
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { supabase } = await import('@/lib/supabase');
      if (!supabase) throw new Error('no supabase');
      const { data: userRes } = await supabase.auth.getUser();
      const userId = userRes.user?.id;
      if (!userId) throw new Error('not signed in');

      const { error: upsertErr } = await supabase.from('match_alerts').upsert({
        user_id: userId,
        listing_id: earringId,
        match_threshold: threshold,
        notify_email: emailOn,
        email: emailOn ? userEmail : null,
        notify_sms: smsOn,
        phone: smsOn ? phoneDigits : null,
      }, { onConflict: 'user_id,listing_id' });
      if (upsertErr) throw upsertErr;

      setToast('알림이 설정됐어요 🔔');
      setTimeout(() => onClose(), 1200);
    } catch (e) {
      console.error('[aring] match-alert save', e);
      setError('알림 설정에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen && !toast) return null;

  return (
    <>
      {isOpen && (
        <>
          {/* 딤 배경 */}
          <div
            className="fixed inset-0 bg-black/40 z-40 transition-opacity"
            onClick={onClose}
            aria-hidden
          />

          {/* Bottom Sheet */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="새 매치 알림 받기"
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white shadow-xl px-5 pt-4 pb-8 mx-auto w-full max-w-[440px] lg:max-w-[480px] left-1/2 -translate-x-1/2 animate-[slideUp_220ms_ease-out]"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)' }}
          >
            {/* 드래그 핸들 */}
            <div className="mx-auto h-1 w-10 rounded-full bg-aring-ink-200 mb-5" />

            {/* 타이틀 + 서브 */}
            <div className="mb-5">
              <h2 className="text-[16px] lg:text-[18px] font-bold text-aring-ink-900">
                새 매치 알림 받기
              </h2>
              <p className="mt-1 text-[15px] text-aring-ink-400 leading-[1.5]">
                설정한 매칭율 이상의 한 짝이 등록되면 알려드릴게요.
              </p>
            </div>

            {/* 매칭율 기준 */}
            <section className="mb-5">
              <p className="text-[12px] font-bold tracking-[0.08em] text-aring-green uppercase mb-2">
                매칭율 기준
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {THRESHOLDS.map((t) => {
                  const active = threshold === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setThreshold(t)}
                      className={[
                        'rounded-full border px-2 py-2 text-[15px] font-semibold transition active:scale-95',
                        active
                          ? 'border-aring-green bg-aring-green text-white'
                          : 'border-aring-ink-200 text-aring-ink-500 hover:text-aring-ink-900',
                      ].join(' ')}
                    >
                      {t}%
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 알림 방법 */}
            <section className="mb-5">
              <p className="text-[12px] font-bold tracking-[0.08em] text-aring-green uppercase mb-2">
                알림 방법
              </p>

              {/* 이메일 */}
              <button
                type="button"
                onClick={() => setEmailOn((v) => !v)}
                className="w-full flex items-center gap-3 py-3 text-left"
                aria-pressed={emailOn}
              >
                <span
                  className={[
                    'w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center shrink-0 transition',
                    emailOn ? 'bg-aring-green border-aring-green text-white' : 'border-aring-ink-300 text-transparent',
                  ].join(' ')}
                >
                  <IconCheck />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[15px] font-semibold text-aring-ink-900">이메일</span>
                  <span className="block text-[12px] text-aring-ink-400 truncate">{userEmail}</span>
                </span>
              </button>

              {/* 문자 */}
              <button
                type="button"
                onClick={() => setSmsOn((v) => !v)}
                className="w-full flex items-center gap-3 py-3 text-left"
                aria-pressed={smsOn}
              >
                <span
                  className={[
                    'w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center shrink-0 transition',
                    smsOn ? 'bg-aring-green border-aring-green text-white' : 'border-aring-ink-300 text-transparent',
                  ].join(' ')}
                >
                  <IconCheck />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[15px] font-semibold text-aring-ink-900">문자(SMS)</span>
                </span>
              </button>

              {smsOn && (
                <div className="pl-8 pb-1">
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="010-1234-5678"
                    className="w-full rounded-xl border border-aring-ink-200 px-4 py-3 text-[15px] text-aring-ink-900 placeholder:text-aring-ink-300 focus:border-aring-green focus:outline-none transition"
                  />
                  {smsOn && phone.length > 0 && !phoneValid && (
                    <p className="mt-1.5 text-[12px] text-aring-accent">
                      전화번호를 정확히 입력해주세요 (10~11자리).
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* 에러 */}
            {error && (
              <p className="mb-3 text-[13px] text-aring-accent text-center">{error}</p>
            )}

            {!atLeastOne && (
              <p className="mb-3 text-[12px] text-aring-ink-400 text-center">
                이메일·문자 중 최소 1개를 선택해주세요.
              </p>
            )}

            {/* CTA */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!valid || submitting}
              className={[
                'w-full py-[14px] rounded-full text-[16px] font-semibold transition',
                valid && !submitting
                  ? 'bg-aring-ink-900 text-white active:scale-[0.99]'
                  : 'bg-aring-ink-200 text-aring-ink-400 cursor-not-allowed',
              ].join(' ')}
            >
              {submitting ? '저장 중…' : '알림 받기'}
            </button>

            {/* 닫기 */}
            <button
              type="button"
              onClick={onClose}
              className="w-full mt-2 py-3 text-[15px] text-aring-ink-400 font-semibold"
            >
              닫기
            </button>
          </div>

          <style jsx global>{`
            @keyframes slideUp {
              from { transform: translate(-50%, 100%); }
              to   { transform: translate(-50%, 0); }
            }
          `}</style>
        </>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
