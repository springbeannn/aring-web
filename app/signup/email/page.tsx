'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/Nav';

const IconCheck = ({ checked }: { checked: boolean }) => (
  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full border-2 transition ${checked ? 'bg-aring-ink-900 border-aring-ink-900' : 'border-aring-ink-300 bg-white'}`}>
    {checked && (
      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 13l4 4L19 7" />
      </svg>
    )}
  </span>
);

export default function SignupEmailPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [terms, setTerms] = useState({ age: false, service: false, privacy: false, marketing: false });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const allRequired = terms.age && terms.service && terms.privacy;
  const allChecked = allRequired && terms.marketing;

  const toggleAll = () => {
    const next = !allChecked;
    setTerms({ age: next, service: next, privacy: next, marketing: next });
  };

  const isFormValid = () => {
    if (!email.trim() || !email.includes('@')) return false;
    if (!password.trim()) return false;
    if (password !== passwordConfirm) return false;
    if (!nickname.trim() || nickname.trim().length < 2) return false;
    if (!allRequired) return false;
    return true;
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim() || !email.includes('@')) newErrors.email = '올바른 이메일 주소를 입력해주세요';
    if (!password.trim()) newErrors.password = '비밀번호를 입력해주세요';
    if (password !== passwordConfirm) newErrors.passwordConfirm = '비밀번호가 일치하지 않아요';
    if (!nickname.trim()) newErrors.nickname = '닉네임을 입력해주세요';
    else if (nickname.trim().length < 2) newErrors.nickname = '닉네임은 2자 이상이어야 해요';
    if (!allRequired) newErrors.terms = '필수 약관에 동의해야 가입할 수 있어요';
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) router.push('/');
  };

  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
        <TopNav />
        <div className="px-5 pt-4 pb-24 lg:max-w-[480px] lg:mx-auto">

          <div className="mb-7 text-center">
            <h1 className="text-[22px] font-extrabold tracking-tight text-aring-ink-900">회원가입</h1>
          </div>

          <div className="flex flex-col gap-3 mb-5">
            <div>
              <input type="email" placeholder="이메일" style={{ background: "linear-gradient(to right, rgba(255,235,235,0.6), rgba(255,200,200,0.8))" }} value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-aring-ink-200 text-[14px] text-aring-ink-900 placeholder:text-aring-ink-400 bg-white outline-none focus:border-aring-ink-500 transition" />
              {errors.email && <p className="mt-1 text-[11.5px] text-red-500">{errors.email}</p>}
            </div>
            <div>
              <input type="password" placeholder="비밀번호" style={{ background: "linear-gradient(to right, rgba(225,245,225,0.6), rgba(195,230,200,0.8))" }} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-aring-ink-200 text-[14px] text-aring-ink-900 placeholder:text-aring-ink-400 bg-white outline-none focus:border-aring-ink-500 transition" />
              {errors.password && <p className="mt-1 text-[11.5px] text-red-500">{errors.password}</p>}
            </div>
            <div>
              <input type="password" placeholder="비밀번호 확인" style={{ background: "linear-gradient(to right, rgba(225,245,225,0.6), rgba(195,230,200,0.8))" }} value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-aring-ink-200 text-[14px] text-aring-ink-900 placeholder:text-aring-ink-400 bg-white outline-none focus:border-aring-ink-500 transition" />
              {errors.passwordConfirm && <p className="mt-1 text-[11.5px] text-red-500">{errors.passwordConfirm}</p>}
            </div>
          </div>

          <div className="mb-5">
            <input type="text" placeholder="닉네임 (2~12자)" maxLength={12} value={nickname} onChange={(e) => setNickname(e.target.value)} style={{ background: "linear-gradient(to right, rgba(255,253,220,0.6), rgba(255,245,180,0.8))" }}
              className="w-full px-4 py-2.5 rounded-2xl border border-aring-ink-200 text-[14px] text-aring-ink-900 placeholder:text-aring-ink-400 bg-white outline-none focus:border-aring-ink-500 transition" />
            {errors.nickname && <p className="mt-1.5 text-[11.5px] text-red-500">{errors.nickname}</p>}
          </div>

          <p className="mb-2 text-[13px] font-bold text-aring-ink-700">약관동의</p>
          <div className="mb-6 rounded-2xl border border-aring-ink-100 overflow-hidden">
            <button onClick={toggleAll} className="w-full flex items-center gap-3 px-4 py-3.5 bg-aring-ink-50 border-b border-aring-ink-100">
              <IconCheck checked={allChecked} />
              <span className="text-[13.5px] font-bold text-aring-ink-900">전체 동의</span>
            </button>
            {([
              { key: 'age', label: '(필수) 만 14세 이상입니다', link: null },
              { key: 'service', label: '(필수) 서비스 이용약관 동의', link: '/terms/service' },
              { key: 'privacy', label: '(필수) 개인정보 수집 및 이용 동의', link: '/terms/privacy' },
              { key: 'marketing', label: '(선택) 마케팅 정보 수신 동의', link: '/terms/marketing' },
            ] as { key: string; label: string; link: string | null }[]).map(({ key, label, link }) => (
              <button key={key} onClick={() => setTerms((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                className="w-full flex items-center gap-3 px-4 py-3 border-b border-aring-ink-100 last:border-b-0 bg-white">
                <IconCheck checked={terms[key as keyof typeof terms]} />
                <span className="flex-1 text-left text-[13px] text-aring-ink-700">{label}</span>
                {link && <Link href={link} onClick={(e) => e.stopPropagation()} className="text-[11px] text-aring-ink-400 underline shrink-0">보기</Link>}
              </button>
            ))}
          </div>

          {errors.terms && <p className="mb-3 text-[11.5px] text-red-500 text-center">{errors.terms}</p>}

          <button onClick={handleSubmit} disabled={!isFormValid()}
            className={`w-full py-4 rounded-2xl font-extrabold text-[15px] transition active:scale-95 ${isFormValid() ? 'bg-aring-ink-900 text-white shadow-cta' : 'bg-aring-ink-100 text-aring-ink-400 cursor-not-allowed'}`}>
            가입하기
          </button>

          <p className="mt-4 text-center text-[12.5px] text-aring-ink-500">
            이미 계정이 있으신가요?{' '}
            <Link href="/" className="font-bold text-aring-ink-900 underline">로그인</Link>
          </p>

        </div>
      </div>
    </main>
  );
}
