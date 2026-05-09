import type { Metadata } from 'next';
import Link from 'next/link';
import { TopNav } from '@/components/Nav';

export const metadata: Metadata = {
  title: 'aring 서비스 이용약관',
  description: 'aring 서비스 이용약관. 한 짝 귀걸이 등록, 탐색, AI 매칭, 댓글 등 서비스 이용 조건과 이용자/운영자 권리·의무.',
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

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <TopNav />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <Link href="/" className="inline-block text-sm text-gray-500 hover:text-aring-olive transition mb-6">
          ← 돌아가기
        </Link>

        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">aring 서비스 이용약관</h1>
        <span className="inline-block px-2.5 py-1 rounded-full bg-aring-pastel-green text-[12px] font-semibold text-aring-olive mb-6">
          2026년 5월 9일부터 적용
        </span>

        <p className="text-sm text-gray-700 leading-relaxed">
          본 약관은 aring이 제공하는 한 짝 귀걸이 등록, 탐색, AI 매칭, 댓글 및 관련 서비스 이용에 필요한 기본 사항을 정합니다.
        </p>

        <Section title="제1조 목적">
          <p>본 약관은 aring 서비스의 이용 조건, 이용자와 운영자 간의 권리와 의무, 책임 사항 및 서비스 이용에 필요한 기본 사항을 정하는 것을 목적으로 합니다.</p>
        </Section>

        <Section title="제2조 서비스 내용">
          <p>aring은 이용자가 한 짝만 남은 귀걸이를 등록하고, 유사한 귀걸이를 탐색하거나 매칭 후보를 확인할 수 있도록 돕는 서비스입니다.</p>
          <p>aring은 다음과 같은 기능을 제공할 수 있습니다.</p>
          <Bullets items={[
            '귀걸이 이미지 및 상품 정보 등록',
            '브랜드, 소재, 형태, 컬러, 가격대 등 정보 입력 및 수정',
            '이미지 및 입력 정보를 기반으로 한 유사 귀걸이 매칭',
            '등록된 귀걸이 탐색 및 검색',
            '댓글을 통한 이용자 간 문의',
            '관심 상품 및 내 상품 관리',
            '기타 서비스 운영자가 제공하는 기능',
          ]} />
          <p>aring은 귀걸이의 동일성, 진품 여부, 실제 상태, 거래 성사 여부를 보장하지 않습니다.</p>
        </Section>

        <Section title="제3조 회원가입 및 계정 관리">
          <p>이용자는 이메일 또는 외부 계정 연동 방식을 통해 회원가입할 수 있습니다.</p>
          <p>이용자는 가입 시 정확한 정보를 입력해야 하며, 계정 및 비밀번호 관리 책임은 이용자 본인에게 있습니다.</p>
          <p>타인의 정보를 도용하거나 부정확한 정보를 입력하여 발생한 문제에 대해 aring은 책임지지 않습니다.</p>
          <p>운영자는 부정 가입, 타인 정보 도용, 서비스 운영 방해 등이 확인될 경우 이용자의 서비스 이용을 제한할 수 있습니다.</p>
        </Section>

        <Section title="제4조 이용자의 의무">
          <p>이용자는 서비스를 이용할 때 다음 행위를 해서는 안 됩니다.</p>
          <Bullets items={[
            '타인의 개인정보 또는 계정을 도용하는 행위',
            '허위 상품 정보를 등록하는 행위',
            '실제 보유하지 않은 상품을 등록하는 행위',
            '위조품, 도난품, 불법 상품, 거래 금지 물품을 등록하는 행위',
            '타인의 이미지, 게시물, 상표권, 저작권 등 권리를 침해하는 행위',
            '욕설, 비방, 혐오, 음란, 광고, 스팸성 댓글을 작성하는 행위',
            '다른 이용자에게 불쾌감이나 피해를 주는 행위',
            '서비스의 정상적인 운영을 방해하는 행위',
            '관련 법령 또는 본 약관을 위반하는 행위',
          ]} />
          <p>운영자는 위 행위가 확인될 경우 게시물 삭제, 노출 제한, 이용 제한, 계정 정지 등의 조치를 할 수 있습니다.</p>
        </Section>

        <Section title="제5조 상품 등록 및 게시물 관리">
          <p>이용자가 등록한 귀걸이 이미지, 상품 정보, 댓글 등 게시물의 책임은 작성자에게 있습니다.</p>
          <p>이용자는 본인이 직접 촬영하거나 사용할 권리가 있는 이미지만 등록해야 합니다.</p>
          <p>운영자는 다음에 해당하는 게시물을 사전 통보 없이 삭제하거나 노출을 제한할 수 있습니다.</p>
          <Bullets items={[
            '허위 또는 오해의 소지가 있는 정보',
            '타인의 권리를 침해하는 내용',
            '위조품, 도난품, 불법 상품 또는 거래 금지 상품으로 의심되는 내용',
            '서비스 목적과 무관한 광고성 내용',
            '욕설, 비방, 혐오, 음란 등 부적절한 내용',
            '운영자가 서비스 운영상 부적절하다고 판단하는 내용',
          ]} />
        </Section>

        <Section title="제6조 AI 매칭 및 검색 결과">
          <p>aring의 AI 매칭 및 검색 결과는 이용자가 입력한 이미지와 상품 정보를 바탕으로 유사한 귀걸이를 찾는 참고 기능입니다.</p>
          <p>AI 분석 결과는 실제 상품의 동일성, 브랜드, 소재, 진품 여부, 상태, 가치 등을 보증하지 않습니다.</p>
          <p>이용자는 AI 매칭 결과를 참고 자료로 활용해야 하며, 실제 거래 또는 문의 전 상품 정보와 상태를 직접 확인해야 합니다.</p>
          <p>AI 분석 결과는 이미지 품질, 입력 정보, 등록 데이터의 양과 정확도에 따라 달라질 수 있습니다.</p>
        </Section>

        <Section title="제7조 이용자 간 문의 및 거래">
          <p>aring은 이용자 간 귀걸이 매칭과 문의를 돕는 서비스이며, 실제 거래의 당사자가 아닙니다.</p>
          <p>이용자 간 거래, 교환, 배송, 결제, 환불, 반품, 분쟁은 거래 당사자 간 책임으로 해결해야 합니다.</p>
          <p>aring은 이용자 간 거래의 성사 여부, 상품 상태, 대금 지급, 배송, 환불 등을 보증하지 않습니다.</p>
          <p>운영자는 신고 접수 또는 운영상 필요가 있는 경우 게시물 삭제, 댓글 제한, 계정 이용 제한 등 최소한의 조치를 할 수 있습니다.</p>
        </Section>

        <Section title="제8조 신고 및 이용 제한">
          <p>이용자는 부적절한 게시물, 허위 상품, 권리 침해, 사기 의심 행위 등을 발견한 경우 운영자에게 신고할 수 있습니다.</p>
          <p>운영자는 신고 내용을 검토한 뒤 필요한 경우 다음 조치를 할 수 있습니다.</p>
          <Bullets items={[
            '게시물 삭제 또는 노출 제한',
            '댓글 삭제 또는 작성 제한',
            '이용자 경고',
            '계정 이용 제한 또는 정지',
            '관계기관 신고 또는 자료 제출',
          ]} />
        </Section>

        <Section title="제9조 서비스 변경 및 중단">
          <p>운영자는 서비스 개선, 점검, 장애 대응, 운영상 필요에 따라 서비스의 일부 또는 전부를 변경하거나 중단할 수 있습니다.</p>
          <p>서비스 변경 또는 중단이 필요한 경우 가능한 범위 내에서 사전에 안내합니다.</p>
          <p>다만 긴급 점검, 장애, 보안 문제 등 부득이한 경우 사전 안내 없이 서비스가 일시 중단될 수 있습니다.</p>
        </Section>

        <Section title="제10조 면책">
          <p>aring은 무료 MVP 서비스로 제공되며, 서비스 이용 과정에서 발생하는 이용자 간 분쟁, 거래 문제, 게시물의 정확성, AI 매칭 결과의 정확성에 대해 책임을 지지 않습니다.</p>
          <p>다만 운영자의 고의 또는 중대한 과실로 인해 발생한 손해에 대해서는 관련 법령에 따릅니다.</p>
          <p>운영자는 이용자의 귀책 사유로 인한 서비스 이용 장애, 정보 유출, 계정 피해에 대해 책임지지 않습니다.</p>
        </Section>

        <Section title="제11조 개인정보 보호">
          <p>aring은 서비스 제공을 위해 필요한 최소한의 개인정보를 수집하며, 개인정보 처리에 관한 자세한 사항은{' '}
            <Link href="/privacy" className="text-aring-olive underline">개인정보처리방침</Link>에 따릅니다.
          </p>
        </Section>

        <Section title="제12조 문의">
          <p>서비스 이용, 신고, 개인정보 관련 문의는 아래 연락처로 접수할 수 있습니다.</p>
          <p>운영자: 김의정 / 연락처: 010-5059-6110 / 이메일: letitdigit@gmail.com</p>
        </Section>

        <Section title="제13조 시행일">
          <p>본 약관은 2026년 5월 9일부터 적용됩니다.</p>
        </Section>
      </div>
    </main>
  );
}
