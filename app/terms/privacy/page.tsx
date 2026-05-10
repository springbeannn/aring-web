'use client';
import { useRouter } from 'next/navigation';

export default function TermsPrivacyPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white min-h-screen lg:max-w-[1200px]">
        <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-aring-ink-100">
          <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-aring-ink-50 transition text-[24px] text-aring-ink-700">
            ←
          </button>
          <h1 className="text-[20px] font-bold text-aring-ink-900">개인정보 수집 및 이용 동의</h1>
        </div>
        <div className="px-5 py-6 lg:max-w-[480px] lg:mx-auto">
          <div className="space-y-6 text-[16px] text-aring-ink-700 leading-relaxed">
            <section>
              <h2 className="text-[16px] font-bold text-aring-ink-900 mb-2">1. 수집하는 개인정보 항목</h2>
              <p>회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다.</p>
            </section>
            <section>
              <h2 className="text-[16px] font-bold text-aring-ink-900 mb-2">2. 개인정보 수집 및 이용 목적</h2>
              <p>수집한 개인정보는 서비스 제공 및 계약의 이행, 회원 관리, 마케팅 및 광고 활용을 위해 사용됩니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다.</p>
            </section>
            <section>
              <h2 className="text-[16px] font-bold text-aring-ink-900 mb-2">3. 개인정보 보유 및 이용 기간</h2>
              <p>이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다.</p>
            </section>
            <section>
              <h2 className="text-[16px] font-bold text-aring-ink-900 mb-2">4. 개인정보의 제3자 제공</h2>
              <p>이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다.</p>
            </section>
            <section>
              <h2 className="text-[16px] font-bold text-aring-ink-900 mb-2">5. 이용자의 권리</h2>
              <p>이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다.</p>
            </section>
            <section>
              <h2 className="text-[16px] font-bold text-aring-ink-900 mb-2">6. 개인정보 처리 위탁</h2>
              <p>이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다.</p>
            </section>
            <section>
              <h2 className="text-[16px] font-bold text-aring-ink-900 mb-2">7. 개인정보 보호책임자</h2>
              <p>이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
