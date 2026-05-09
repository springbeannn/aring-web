import type { Metadata } from 'next';
import Link from 'next/link';
import { TopNav } from '@/components/Nav';

export const metadata: Metadata = {
  title: 'aring 개인정보처리방침',
  description: 'aring 개인정보처리방침. 수집 항목·이용 목적·보유 기간·제3자 제공·이용자 권리.',
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

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <TopNav />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <Link href="/" className="inline-block text-sm text-gray-500 hover:text-aring-olive transition mb-6">
          ← 돌아가기
        </Link>

        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">aring 개인정보처리방침</h1>
        <span className="inline-block px-2.5 py-1 rounded-full bg-aring-pastel-green text-[12px] font-semibold text-aring-olive mb-6">
          2026년 5월 9일부터 적용
        </span>

        <p className="text-sm text-gray-700 leading-relaxed">
          aring은 이용자의 개인정보를 중요하게 생각하며, 서비스 제공에 필요한 최소한의 개인정보를 수집하고 안전하게 관리하기 위해 노력합니다.
        </p>

        <Section title="제1조 수집하는 개인정보 항목">
          <p><strong className="text-[#1A1A1A]">1. 회원가입 시</strong> — 이메일 주소, 닉네임, 비밀번호, 외부 계정 연동 시 제공되는 계정 식별 정보</p>
          <p><strong className="text-[#1A1A1A]">2. 서비스 이용 시</strong> — 등록한 귀걸이 이미지, 브랜드·소재·형태·컬러·가격대 등 상품 정보, 상품 설명 및 등록자 한마디, 댓글 및 문의 내용, 관심 상품·내 상품 등록 정보, 서비스 이용 기록, 접속 일시, IP 주소, 기기 및 브라우저 정보</p>
          <p><strong className="text-[#1A1A1A]">3. 문의 및 신고 시</strong> — 이름 또는 닉네임, 이메일 주소, 연락처, 문의 또는 신고 내용, 관련 게시물 및 서비스 이용 기록</p>
        </Section>

        <Section title="제2조 개인정보 수집 및 이용 목적">
          <Bullets items={[
            '회원가입 및 이용자 식별',
            '계정 관리 및 로그인 기능 제공',
            '귀걸이 등록, 수정, 삭제 기능 제공',
            '이미지 기반 AI 매칭 및 유사 상품 탐색 기능 제공',
            '댓글 및 이용자 간 문의 기능 제공',
            '관심 상품 및 내 상품 관리 기능 제공',
            '부정 이용 방지 및 신고·분쟁 대응',
            '서비스 품질 개선 및 기능 고도화',
            '서비스 공지 및 운영 안내',
          ]} />
        </Section>

        <Section title="제3조 개인정보 보유 및 이용 기간">
          <p>원칙적으로 회원 탈퇴 시 지체 없이 삭제합니다. 다만 부정 이용 방지, 분쟁 처리, 관련 법령에 따라 보관이 필요한 경우 최소 기간 보관 후 삭제합니다.</p>
        </Section>

        <Section title="제4조 개인정보 제3자 제공">
          <p>원칙적으로 외부에 제공하지 않습니다. 다음의 예외가 적용됩니다.</p>
          <Bullets items={[
            '이용자가 사전에 동의한 경우',
            '법령에 따라 의무가 있는 경우',
            '공공기관의 적법한 요청이 있는 경우',
            '이용자 또는 제3자의 생명·신체·재산 보호가 필요한 경우',
          ]} />
        </Section>

        <Section title="제5조 개인정보 처리 위탁 및 외부 서비스 이용">
          <Bullets items={[
            'Supabase — 회원 인증, 데이터베이스, 서비스 데이터 저장',
            'Vercel — 웹서비스 배포 및 호스팅',
            'Google 또는 기타 AI API — 이미지 분석 및 매칭 기능 제공',
            '이메일 또는 알림 발송 서비스 — 서비스 안내 및 문의 대응',
          ]} />
        </Section>

        <Section title="제6조 AI 이미지 분석 관련 안내">
          <p>등록 이미지와 상품 정보는 유사성 판단을 위해 AI 분석에 활용될 수 있습니다.</p>
          <p>AI 분석 결과의 정확성은 보장하지 않으며, 참고 자료로만 제공됩니다.</p>
        </Section>

        <Section title="제7조 개인정보 파기">
          <p>보유 기간이 종료되거나 처리 목적이 달성된 경우 지체 없이 파기합니다.</p>
          <p>전자 파일 형태로 저장된 개인정보는 복구가 불가능한 방식으로 삭제합니다.</p>
        </Section>

        <Section title="제8조 이용자의 권리와 행사 방법">
          <p>이용자는 본인의 개인정보에 대해 열람·수정·삭제·처리 정지·탈퇴를 요청할 수 있습니다.</p>
          <p>요청은 아래 연락처로 접수할 수 있으며, 운영자는 관련 법령에 따라 신속히 처리합니다.</p>
        </Section>

        <Section title="제9조 개인정보 보호를 위한 조치">
          <Bullets items={[
            '접근 권한 최소화',
            '비밀번호 암호화',
            '외부 서비스 접근 권한 관리',
            '불필요한 수집 최소화',
            '보안 이슈 발견 시 신속한 개선',
          ]} />
        </Section>

        <Section title="제10조 만 14세 미만 아동의 이용">
          <p>aring은 만 14세 미만 아동의 회원가입을 의도하지 않습니다.</p>
          <p>만 14세 미만 아동이 서비스를 이용하는 경우 법정대리인의 동의가 필요합니다.</p>
        </Section>

        <Section title="제11조 개인정보 보호책임자">
          <p>개인정보 보호책임자: 김의정 / 연락처: 010-5059-6110 / 이메일: letitdigit@gmail.com</p>
        </Section>

        <Section title="제12조 고지 및 시행일">
          <p>본 개인정보처리방침은 2026년 5월 9일부터 적용됩니다.</p>
        </Section>
      </div>
    </main>
  );
}
