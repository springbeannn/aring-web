'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/Nav';
import { signUpWithEmail } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const IconCheck = ({ checked }: { checked: boolean }) => (
  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full border-2 transition ${checked ? 'bg-aring-ink-900 border-aring-ink-900' : 'border-aring-ink-300 bg-white'}`}>
    {checked && (
      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 13l4 4L19 7" />
      </svg>
    )}
  </span>
);

const IconEye = ({ open }: { open: boolean }) => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {open ? (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>) : (<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>)}
  </svg>
);

function isValidEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }
function isValidNickname(v: string) { return /^[가-힣a-zA-Z0-9]{2,12}$/.test(v.trim()); }
function looksLikePII(v: string) {
  const t = v.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t) || /^[\d\-+]{7,}$/.test(t);
}
function isValidPassword(pw: string): boolean {
  if (pw.length < 8 || pw.length > 20 || /\s/.test(pw)) return false;
  const hasLetter = /[a-zA-Z]/.test(pw);
  const hasNum = /[0-9]/.test(pw);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pw);
  return [hasLetter, hasNum, hasSpecial].filter(Boolean).length >= 2;
}

type DupState = 'idle' | 'checking' | 'available' | 'taken' | 'error';

function EmailHint({ state, email }: { state: DupState; email: string }) {
  if (!email) return null;
  if (!isValidEmail(email)) return <p className="mt-1.5 text-[11px] text-amber-500">이메일 형식을 확인해주세요.</p>;
  if (state === 'idle') return <p className="mt-1.5 text-[11px] text-aring-ink-400">이메일 중복 확인이 필요해요.</p>;
  if (state === 'checking') return <p className="mt-1.5 text-[11px] text-aring-ink-400">확인 중...</p>;
  if (state === 'available') return <p className="mt-1.5 text-[11px] text-emerald-500">✓ 사용 가능한 이메일이에요.</p>;
  if (state === 'taken') return <p className="mt-1.5 text-[11px] text-rose-400">이미 가입된 이메일이에요.</p>;
  return <p className="mt-1.5 text-[11px] text-amber-500">오류가 발생했어요. 다시 시도해주세요.</p>;
}

function NicknameHint({ state, nickname }: { state: DupState; nickname: string }) {
  if (!nickname) return null;
  if (looksLikePII(nickname)) return <p className="mt-1.5 text-[11px] text-amber-500">이메일이나 전화번호는 사용할 수 없어요.</p>;
  if (!isValidNickname(nickname)) return <p className="mt-1.5 text-[11px] text-amber-500">닉네임은 2~12자, 한글/영문/숫자만 사용할 수 있어요.</p>;
  if (state === 'idle') return <p className="mt-1.5 text-[11px] text-aring-ink-400">닉네임 중복 확인이 필요해요.</p>;
  if (state === 'checking') return <p className="mt-1.5 text-[11px] text-aring-ink-400">확인 중...</p>;
  if (state === 'available') return <p className="mt-1.5 text-[11px] text-emerald-500">✓ 사용 가능한 닉네임이에요.</p>;
  if (state === 'taken') return <p className="mt-1.5 text-[11px] text-rose-400">이미 사용 중인 닉네임이에요.</p>;
  return <p className="mt-1.5 text-[11px] text-amber-500">오류가 발생했어요. 다시 시도해주세요.</p>;
}

function PasswordHint({ pw }: { pw: string }) {
  if (!pw) return <p className="mt-1.5 text-[11px] text-aring-ink-400">8~20자, 영문/숫자/특수문자 중 2가지 이상 조합</p>;
  if (/\s/.test(pw)) return <p className="mt-1.5 text-[11px] text-rose-400">공백은 사용할 수 없어요.</p>;
  if (pw.length < 8) return <p className="mt-1.5 text-[11px] text-amber-500">8자 이상 입력해주세요. ({pw.length}/20)</p>;
  if (pw.length > 20) return <p className="mt-1.5 text-[11px] text-rose-400">20자 이하로 입력해주세요.</p>;
  const combos = [/[a-zA-Z]/.test(pw), /[0-9]/.test(pw), /[^a-zA-Z0-9]/.test(pw)].filter(Boolean).length;
  if (combos < 2) return <p className="mt-1.5 text-[11px] text-amber-500">영문/숫자/특수문자 중 2가지 이상 조합해주세요.</p>;
  return <p className="mt-1.5 text-[11px] text-emerald-500">✓ 사용 가능한 비밀번호예요. ({pw.length}/20)</p>;
}

function DupButton({ label, onClick, disabled, checking }: { label: string; onClick: () => void; disabled: boolean; checking: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`w-full mt-2 py-2.5 rounded-2xl text-[13px] font-bold transition ${!disabled ? 'bg-aring-ink-900 text-white active:scale-95' : 'bg-aring-ink-100 text-aring-ink-400 cursor-not-allowed'}`}>
      {checking ? '확인 중...' : label}
    </button>
  );
}

export default function SignupEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailDup, setEmailDup] = useState<DupState>('idle');
  const [nickname, setNickname] = useState('');
  const [nickDup, setNickDup] = useState<DupState>('idle');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPwC, setShowPwC] = useState(false);
  const [pwConfirmTouched, setPwConfirmTouched] = useState(false);
  const [terms, setTerms] = useState({ age: false, service: false, privacy: false, marketing: false });
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const allRequired = terms.age && terms.service && terms.privacy;
  const allChecked = allRequired && terms.marketing;
  const toggleAll = () => { const n = !allChecked; setTerms({ age: n, service: n, privacy: n, marketing: n }); };

  const pwOk = isValidPassword(password);
  const pwMatch = password === passwordConfirm;

  const canSubmit =
    isValidEmail(email) && emailDup === 'available' &&
    isValidNickname(nickname) && !looksLikePII(nickname) && nickDup === 'available' &&
    pwOk && pwMatch && passwordConfirm.length > 0 && allRequired;

  async function checkEmail() {
    if (!isValidEmail(email) || !supabase) return;
    setEmailDup('checking');
    try {
      const { data } = await supabase.from('profiles').select('id').eq('email', email.toLowerCase().trim()).maybeSingle();
      setEmailDup(data ? 'taken' : 'available');
    } catch { setEmailDup('error'); }
  }

  async function checkNickname() {
    if (!isValidNickname(nickname) || looksLikePII(nickname) || !supabase) return;
    setNickDup('checking');
    try {
      const { data } = await supabase.from('profiles').select('id').ilike('nickname', nickname.trim()).maybeSingle();
      setNickDup(data ? 'taken' : 'available');
    } catch { setNickDup('error'); }
  }

  async function handleSubmit() {
    if (!canSubmit || loading) return;
    setLoading(true); setSubmitError('');
    const { error } = await signUpWithEmail(email.toLowerCase().trim(), password, nickname.trim());
    setLoading(false);
    if (error) {
      setSubmitError(error === 'User already registered' ? '이미 가입된 이메일이에요.' : '회원가입에 실패했어요. 잠시 후 다시 시도해주세요.');
      return;
    }
    router.push('/login');
  }

  const inputBase = "w-full px-4 py-3 rounded-2xl border border-aring-ink-200 text-[14px] text-aring-ink-900 placeholder:text-aring-ink-400 outline-none focus:border-aring-ink-500 transition";

  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
        <TopNav />
        <div className="px-5 pt-4 pb-32 lg:max-w-[480px] lg:mx-auto">
          <div className="mb-7 text-center">
            <h1 className="text-[22px] font-extrabold tracking-tight text-aring-ink-900">회원가입</h1>
          </div>

          {/* 이메일 */}
          <div className="mb-4">
            <label className="block text-[11.5px] font-bold text-aring-ink-700 mb-1.5">이메일</label>
            <input type="email" placeholder="이메일" value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailDup('idle'); }}
              className={inputBase}
              style={{ background: 'linear-gradient(to right, rgba(235,218,210,0.5), rgba(225,205,212,0.5))' }} />
            <DupButton label="이메일 중복 확인" onClick={checkEmail}
              disabled={!isValidEmail(email) || emailDup === 'checking' || emailDup === 'available'}
              checking={emailDup === 'checking'} />
            <EmailHint state={emailDup} email={email} />
          </div>

          {/* 비밀번호 */}
          <div className="mb-4">
            <label className="block text-[11.5px] font-bold text-aring-ink-700 mb-1.5">비밀번호</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} placeholder="비밀번호" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputBase} pr-11`}
                style={{ background: 'linear-gradient(to right, rgba(200,220,213,0.5), rgba(210,205,225,0.5))' }} />
              <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-aring-ink-400 hover:text-aring-ink-700 transition">
                <IconEye open={showPw} />
              </button>
            </div>
            <PasswordHint pw={password} />
          </div>

          {/* 비밀번호 확인 */}
          <div className="mb-4">
            <label className="block text-[11.5px] font-bold text-aring-ink-700 mb-1.5">비밀번호 확인</label>
            <div className="relative">
              <input type={showPwC ? 'text' : 'password'} placeholder="비밀번호 확인" value={passwordConfirm}
                onChange={(e) => { setPasswordConfirm(e.target.value); setPwConfirmTouched(true); }}
                className={`${inputBase} pr-11`}
                style={{ background: 'linear-gradient(to right, rgba(210,235,255,0.4), rgba(210,245,235,0.4))' }} />
              <button type="button" onClick={() => setShowPwC(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-aring-ink-400 hover:text-aring-ink-700 transition">
                <IconEye open={showPwC} />
              </button>
            </div>
            {pwConfirmTouched && passwordConfirm.length > 0 && (
              <p className={`mt-1.5 text-[11px] ${pwMatch ? 'text-emerald-500' : 'text-rose-400'}`}>
                {pwMatch ? '✓ 비밀번호가 일치해요.' : '비밀번호가 일치하지 않아요.'}
              </p>
            )}
          </div>

          {/* 닉네임 */}
          <div className="mb-6">
            <label className="block text-[11.5px] font-bold text-aring-ink-700 mb-1.5">닉네임</label>
            <input type="text" placeholder="닉네임 (2~12자)" maxLength={12} value={nickname}
              onChange={(e) => { setNickname(e.target.value); setNickDup('idle'); }}
              className={inputBase}
              style={{ background: 'linear-gradient(to right, rgba(235,228,200,0.5), rgba(232,218,205,0.5))' }} />
            <DupButton label="닉네임 중복 확인" onClick={checkNickname}
              disabled={!isValidNickname(nickname) || looksLikePII(nickname) || nickDup === 'checking' || nickDup === 'available'}
              checking={nickDup === 'checking'} />
            <NicknameHint state={nickDup} nickname={nickname} />
          </div>

          {/* 약관 */}
          <p className="mb-2 text-[13px] font-bold text-aring-ink-700">약관동의</p>
          <div className="mb-6 rounded-2xl border border-aring-ink-100 overflow-hidden">
            <button onClick={toggleAll} className="w-full flex items-center gap-3 px-4 py-3.5 bg-aring-ink-50 border-b border-aring-ink-100">
              <IconCheck checked={allChecked} />
              <span className="text-[13px] font-bold text-aring-ink-900">전체 동의</span>
            </button>
            {([
              { key: 'age', label: '(필수) 만 14세 이상입니다', link: null },
              { key: 'service', label: '(필수) 서비스 이용약관 동의', link: '/terms/service' },
              { key: 'privacy', label: '(필수) 개인정보 수집 및 이용 동의', link: '/terms/privacy' },
              { key: 'marketing', label: '(선택) 마케팅 정보 수신 동의', link: '/terms/marketing' },
            ] as { key: string; label: string; link: string | null }[]).map(({ key, label, link }) => (
              <button key={key} onClick={() => setTerms(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                className="w-full flex items-center gap-3 px-4 py-3 border-b border-aring-ink-100 last:border-b-0 bg-white">
                <IconCheck checked={terms[key as keyof typeof terms]} />
                <span className="flex-1 text-left text-[13px] text-aring-ink-700">{label}</span>
                {link && <Link href={link} onClick={(e) => e.stopPropagation()} className="text-[11px] text-aring-ink-400 underline shrink-0">보기</Link>}
              </button>
            ))}
          </div>

          {!allRequired && (
            <p className="mb-3 text-[11px] text-amber-500 text-center">필수 약관에 동의해야 가입할 수 있어요.</p>
          )}
          {submitError && <p className="mb-3 text-[11px] text-rose-400 text-center">{submitError}</p>}

          <button onClick={handleSubmit} disabled={!canSubmit || loading}
            className={`w-full py-4 rounded-2xl font-extrabold text-[14px] transition active:scale-95 ${canSubmit && !loading ? 'bg-aring-ink-900 text-white shadow-cta' : 'bg-aring-ink-100 text-aring-ink-400 cursor-not-allowed'}`}>
            {loading ? '가입 중...' : '가입하기'}
          </button>

          <p className="mt-4 text-center text-[13px] text-aring-ink-500">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="font-bold text-aring-ink-900 underline">로그인</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
