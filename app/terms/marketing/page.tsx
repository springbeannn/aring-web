'use client';
import { useRouter } from 'next/navigation';

export default function TermsMarketingPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white min-h-screen lg:max-w-[1200px]">
        <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-aring-ink-100">
          <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-aring-ink-50 transition text-[24px] text-aring-ink-700">
            ←
          </button>
          <h1 className="text-[20px] font-bold text-aring-ink-900">마케팅 정보 수신 동의</h1>
        </div>
        <div className="px-5 py-6 lg:max-w-[480px] lg:mx-auto">
          <div className="space-y-6 text-[16px] text-aring-ink-700 leading-relaxed">
            <section>
              <h2 className="text-[16px] font-bold text-aring-ink-900 mb-2">1. 마케팅 정보 수신 목적</h2>
              <p>회사는 이용자에게 유익한 서비스 및 혜택 정보를 제공하기 위해 마케팅 정보를 발송합니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다.</p>
            </section>
            <section>
              <h2 className="text-[16px] font-bold text-aring-ink-900 mb-2">2. 수신 채널</h2>
              <p>이메일, SMS, 앱 푸시 알림 등을 통해 마케팅 정보가 발송될 수 있습니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다.</p>
            </section>
            <section>
              <h2 className="text-[16px] font-bold text-aring-ink-900 mb-2">3. 수신 거부 방법</h2>
              <p>이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다.</p>
            </section>
            <section>
              <h2 className="text-[16px] font-bold text-aring-ink-900 mb-2">4. 수신 동의 철회</h2>
              <p>이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다.</p>
            </section>
            <section>
              <h2 className="text-[16px] font-bold text-aring-ink-900 mb-2">5. 보유 및 이용 기간</h2>
              <p>이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
