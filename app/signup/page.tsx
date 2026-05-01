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

export default function SignupPage() {
  const router = useRouter();
  const [showEmail, setShowEmail] = useState(false);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState({ age: false, service: false, privacy: false, marketing: false });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const allRequired = terms.age && terms.service && terms.privacy;
  const allChecked = allRequired && terms.marketing;

  const toggleAll = () => {
    const next = !allChecked;
    setTerms({ age: next, service: next, privacy: next, marketing: next });
  };

  const isFormValid = () => {
    if (!nickname.trim() || nickname.trim().length < 2) return false;
    if (!allRequired) return false;
    if (showEmail) {
      if (!email.trim() || !email.includes('@')) return false;
      if (!password.trim()) return false;
    }
    return true;
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!nickname.trim()) newErrors.nickname = '닉네임을 입력해주세요';
    else if (nickname.trim().length < 2) newErrors.nickname = '닉네임은 2자 이상이어야 해요';
    if (!allRequired) newErrors.terms = '필수 약관에 동의해야 가입할 수 있어요';
    if (showEmail) {
      if (!email.trim() || !email.includes('@')) newErrors.email = '올바른 이메일 주소를 입력해주세요';
      if (!password.trim()) newErrors.password = '비밀번호를 입력해주세요';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) router.push('/');
  };

  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
        <TopNav />
        <div className="px-5 pt-4 pb-24 lg:max-w-[480px] lg:mx-auto">

          <div className="mb-7 text-center">
            <h1 className="text-[22px] font-extrabold tracking-tight text-aring-ink-900">aring 시작하기</h1>
            <p className="mt-1.5 text-[13px] text-aring-ink-500 leading-snug">잃어버린 한 짝을 찾거나,<br />누군가의 반쪽이 되어보세요</p>
          </div>

          {/* ✅ 수정: items-center sm:items-stretch 추가 → 모바일 중앙 정렬 */}
          <div className="flex flex-col gap-3 mb-4 items-center sm:items-stretch">

            {/* ✅ 수정: w-[60%] sm:w-full whitespace-nowrap */}
            <button
              className="w-[60%] sm:w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-[14px] text-[#3C1E1E] transition active:scale-95 whitespace-nowrap"
              style={{ background: '#FEE500' }}
            >
              <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                <ellipse cx="20" cy="19" rx="18" ry="17" fill="#3C1E1E"/>
                <ellipse cx="13" cy="19" rx="3" ry="4" fill="#FEE500"/>
                <ellipse cx="27" cy="19" rx="3" ry="4" fill="#FEE500"/>
                <path d="M13 26c2 2 12 2 14 0" stroke="#FEE500" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              카카오톡으로 계속하기
            </button>

            {/* ✅ 수정: w-[60%] sm:w-full whitespace-nowrap */}
            <button
              className="w-[60%] sm:w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-[14px] text-white transition active:scale-95 whitespace-nowrap"
              style={{ background: '#03C75A' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
              </svg>
              네이버로 계속하기
            </button>

            {/* ✅ 수정: w-[60%] sm:w-full whitespace-nowrap */}
            <button className="w-[60%] sm:w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-[14px] text-aring-ink-800 border border-aring-ink-200 bg-white transition active:scale-95 whitespace-nowrap">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google로 계속하기
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-aring-ink-100" />
            <span className="text-[12px] text-aring-ink-400 font-medium">또는</span>
            <div className="flex-1 h-px bg-aring-ink-100" />
          </div>

          {/* ✅ 수정: w-[60%] sm:w-full whitespace-nowrap mx-auto */}
          <button
            onClick={() => setShowEmail((v) => !v)}
            className="w-[60%] sm:w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-[14px] text-aring-ink-700 border border-aring-ink-200 bg-white transition active:scale-95 mb-5 whitespace-nowrap mx-auto"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            이메일로 가입하기
            <svg className={`w-4 h-4 transition-transform ${showEmail ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>

          {showEmail && (
            <div className="flex flex-col gap-3 mb-5 p-4 rounded-2xl border border-aring-ink-100 bg-aring-ink-50">
              <div>
                <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-aring-ink-200 text-[14px] text-aring-ink-900 placeholder:text-aring-ink-400 bg-white outline-none focus:border-aring-ink-500 transition" />
                {errors.email && <p className="mt-1 text-[11.5px] text-red-500">{errors.email}</p>}
              </div>
              <div>
                <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-aring-ink-200 text-[14px] text-aring-ink-900 placeholder:text-aring-ink-400 bg-white outline-none focus:border-aring-ink-500 transition" />
                {errors.password && <p className="mt-1 text-[11.5px] text-red-500">{errors.password}</p>}
              </div>
            </div>
          )}

          <div className="mb-5">
            <input type="text" placeholder="닉네임 (2~12자)" maxLength={12} value={nickname} onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border border-aring-ink-200 text-[14px] text-aring-ink-900 placeholder:text-aring-ink-400 bg-white outline-none focus:border-aring-ink-500 transition" />
            {errors.nickname && <p className="mt-1.5 text-[11.5px] text-red-500">{errors.nickname}</p>}
          </div>

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