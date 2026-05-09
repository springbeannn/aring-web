import type { Metadata } from 'next';
import Link from 'next/link';
import { TopNav } from '@/components/Nav';

export const metadata: Metadata = {
  title: 'aring 마케팅 정보 수신 동의',
  description: 'aring 마케팅 정보 수신 동의(선택). 동의하지 않아도 서비스 이용에 제한이 없습니다.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-[#1A1A1A] mt-8 mb-2">{title}</h2>
      <div className="text-sm text-gray-700 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
      {items.map((it, i) => <li key={i}>{it}</li>)}
    </ul>
  );
}

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-white">
      <TopNav />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <Link href="/" className="inline-block text-sm text-gray-500 hover:text-aring-olive transition mb-6">
          ← 돌아가기
        </Link>

        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">aring 마케팅 정보 수신 동의</h1>
        <span className="inline-block px-2.5 py-1 rounded-full bg-aring-pastel-green text-[12px] font-semibold text-aring-olive mb-4">
          2026년 5월 9일부터 적용
        </span>

        {/* 선택 동의 안내 뱃지 */}
        <div className="rounded-xl bg-aring-pastel-yellow border border-aring-olive/20 px-4 py-3 mb-6">
          <p className="text-sm font-semibold text-[#1A1A1A]">
            ✅ 선택 동의 — 동의하지 않아도 서비스 이용에 제한이 없습니다.
          </p>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">
          aring은 이용자에게 서비스 소식, 이벤트, 업데이트, 혜택 안내 등 마케팅 정보를 제공하기 위해 아래와 같이 개인정보를 이용할 수 있습니다.
        </p>

        <Section title="제1조 수집 및 이용 항목">
          <p>이메일 주소, 닉네임, 서비스 이용 정보, 등록 상품 정보, 관심 상품 정보, 이벤트 참여 정보</p>
        </Section>

        <Section title="제2조 이용 목적">
          <Bullets items={[
            'aring 서비스 업데이트 안내',
            '신규 기능 및 콘텐츠 안내',
            '이벤트 및 프로모션 안내',
            '서비스 이용 혜택 안내',
            '맞춤형 서비스 소식 제공',
            '이용자 참여 캠페인 안내',
          ]} />
        </Section>

        <Section title="제3조 발송 방법">
          <p>이메일, 서비스 내 알림, 문자 메시지, 기타 이용자가 동의한 연락 수단으로 발송됩니다.</p>
          <p className="text-xs text-gray-500">(초기 MVP 단계에서는 이메일 또는 서비스 내 안내 중심)</p>
        </Section>

        <Section title="제4조 보유 및 이용 기간">
          <p>동의 철회 시까지 유지하며, 회원 탈퇴 시 삭제합니다.</p>
          <p>법령에 따라 보관이 필요한 경우 해당 기간 동안 보관합니다.</p>
        </Section>

        <Section title="제5조 동의 거부 및 철회">
          <p>마케팅 정보 수신 동의는 선택 사항이며, 동의하지 않아도 기본 서비스 이용에 제한이 없습니다.</p>
          <p>동의 후에도 언제든지 철회할 수 있으며, 아래 연락처로 접수할 수 있습니다.</p>
        </Section>

        <Section title="제6조 문의">
          <p>운영자: 김의정 / 연락처: 010-5059-6110 / 이메일: letitdigit@gmail.com</p>
        </Section>

        <Section title="제7조 시행일">
          <p>본 마케팅 정보 수신 동의는 2026년 5월 9일부터 적용됩니다.</p>
        </Section>
      </div>
    </main>
  );
}
