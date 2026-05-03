'use client';
import { useRouter } from 'next/navigation';

export default function TermsServicePage() {
  const router = useRouter();
  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white min-h-screen lg:max-w-[1200px]">
        <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-aring-ink-100">
          <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-aring-ink-50 transition text-[22px] text-aring-ink-700">
            ←
          </button>
          <h1 className="text-[17px] font-bold text-aring-ink-900">서비스 이용약관</h1>
        </div>
        <div className="px-5 py-6 lg:max-w-[480px] lg:mx-auto">
          <div className="space-y-6 text-[14px] text-aring-ink-700 leading-relaxed">
            <section>
              <h2 className="text-[14px] font-bold text-aring-ink-900 mb-2">제1조 (목적)</h2>
              <p>이 약관은 aring(이하 "회사")이 제공하는 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다.</p>
            </section>
            <section>
              <h2 className="text-[14px] font-bold text-aring-ink-900 mb-2">제2조 (정의)</h2>
              <p>이 약관에서 사용하는 용어의 정의는 다음과 같습니다. "서비스"란 회사가 제공하는 모든 온라인 서비스를 의미합니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다.</p>
            </section>
            <section>
              <h2 className="text-[14px] font-bold text-aring-ink-900 mb-2">제3조 (약관의 효력 및 변경)</h2>
              <p>이 약관은 서비스를 이용하고자 하는 모든 이용자에게 적용됩니다. 회사는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있습니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다.</p>
            </section>
            <section>
              <h2 className="text-[14px] font-bold text-aring-ink-900 mb-2">제4조 (서비스 이용)</h2>
              <p>이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다.</p>
            </section>
            <section>
              <h2 className="text-[14px] font-bold text-aring-ink-900 mb-2">제5조 (이용자의 의무)</h2>
              <p>이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다.</p>
            </section>
            <section>
              <h2 className="text-[14px] font-bold text-aring-ink-900 mb-2">제6조 (책임 제한)</h2>
              <p>이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다.</p>
            </section>
            <section>
              <h2 className="text-[14px] font-bold text-aring-ink-900 mb-2">제7조 (분쟁 해결)</h2>
              <p>이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다. 이 영역은 약관 내용이 들어가는 영역입니다.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
