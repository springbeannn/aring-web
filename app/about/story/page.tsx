import type { Metadata } from 'next';
import Link from 'next/link';
import { TopNav } from '@/components/Nav';

export const metadata: Metadata = {
  title: 'aring 서비스 소개 — 잃어버린 짝을 다시 연결하다',
  description:
    'aring(아링)은 한 짝만 남은 귀걸이를 AI로 다시 연결하는 P2P 리커머스 플랫폼입니다. 형태·컬러·소재·디테일을 분석해 동일·유사 디자인을 매칭합니다.',
  alternates: { canonical: '/about/story' },
  openGraph: {
    title: 'aring 서비스 소개 — 잃어버린 짝을 다시 연결하다',
    description:
      '버려질 수 있었던 물건에 다시 사용 가치를 부여하고, 사람과 사람, 잃어버린 조각들을 다시 연결하는 새로운 리커머스 경험.',
    url: 'https://aring.app/about/story',
  },
};

export default function AboutStoryPage() {
  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:rounded-none lg:shadow-none">
        <TopNav />

        <article className="px-5 pt-4 pb-24 lg:px-14 lg:pt-12 lg:pb-20 lg:max-w-[760px] lg:mx-auto">
          {/* Hero */}
          <header className="mb-10 lg:mb-14">
            <p className="text-[12px] lg:text-[13px] font-bold tracking-[0.12em] text-aring-green uppercase mb-3">
              aring brand story
            </p>
            <h1 className="text-[26px] lg:text-[34px] font-bold tracking-tight text-aring-ink-900 leading-snug break-keep">
              잃어버린 짝을<br />다시 연결하는<br />리커머스 플랫폼
            </h1>
          </header>

          {/* 문제 인식 + 질문 */}
          <Section>
            <Para>
              귀걸이는 다른 액세서리와 달리 한쪽만 남게 되는 순간 활용도가 크게 떨어지는 제품입니다.
            </Para>
            <Para>
              특히 자주 착용하던 귀걸이이거나, 오래 고민 끝에 구매한 제품일수록 쉽게 버리지 못하는 경우가 많습니다.
              단종되었거나 구매처를 찾기 어려운 경우에는 남은 한쪽이 그대로 보관되거나 서랍 속에 머무르는 일이 반복됩니다.
            </Para>
            <Para>aring은 이러한 문제에서 출발했습니다.</Para>

            <Pullquote>
              “한 짝만 남은 귀걸이도 다시 연결될 수 있지 않을까?”<br />
              “같은 귀걸이의 반대쪽을 가진 사람이 어딘가에 존재하지 않을까?”
            </Pullquote>

            <Para>
              aring은 이 질문을 기반으로 만들어진 AI 기반 P2P 리커머스 플랫폼입니다.
            </Para>
          </Section>

          {/* 서비스 작동 방식 */}
          <Section>
            <Para>
              사용자는 한쪽만 남은 귀걸이를 사진으로 등록할 수 있으며, AI는 이미지 분석을 통해 형태, 컬러, 소재, 디테일 등의 특징을 비교해 동일하거나 유사한 디자인의 귀걸이를 탐색합니다.
              이후 비슷한 귀걸이를 보유한 사용자 간 연결을 통해 거래 또는 교환이 가능하도록 설계했습니다.
            </Para>
            <Para>
              기존 중고거래 플랫폼이 완성된 상품 중심의 거래 구조였다면, aring은 ‘불완전한 상태의 물건’을 다시 연결하고 복원하는 경험에 집중합니다.
            </Para>
          </Section>

          {/* 매칭 근거 */}
          <Section>
            <Para>단순히 비슷한 상품을 추천하는 것이 아니라,</Para>
            <ul className="space-y-2 mb-6">
              {[
                '형태가 얼마나 유사한지',
                '컬러와 소재가 얼마나 닮았는지',
                '어떤 디테일이 매칭 근거가 되는지',
              ].map((item) => (
                <li
                  key={item}
                  className="rounded-tile border border-aring-green-line bg-white px-4 py-3 text-[14px] lg:text-[15px] text-aring-ink-700 break-keep"
                >
                  {item}
                </li>
              ))}
            </ul>
            <Para>
              등의 AI 분석 결과를 함께 제공해 사용자 스스로 매칭 과정을 이해할 수 있도록 기획하고 있습니다.
            </Para>
          </Section>

          {/* 현재 MVP */}
          <Section>
            <Para>현재 aring은 MVP 기반으로 개발 중이며,</Para>
            <ul className="grid gap-2 sm:grid-cols-2 mb-6">
              {[
                '귀걸이 등록',
                '탐색 리스트',
                '상세 페이지',
                'AI 매칭 결과',
                '댓글 기반 문의',
                'MY 페이지',
                '거래 상태 관리',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 rounded-tile bg-aring-ink-100 px-4 py-3 text-[14px] lg:text-[15px] font-semibold text-aring-ink-800 break-keep"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-aring-green flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Para>등 핵심 사용자 흐름을 우선 구현하고 있습니다.</Para>
          </Section>

          {/* 향후 확장 */}
          <Section>
            <Para>
              향후에는 Google Vision AI 기반 이미지 분석 기술을 활용해 동일·유사 디자인 매칭 정확도를 높이고, 귀걸이를 넘어 다양한 “짝을 이루는 물건” 영역으로 확장할 계획입니다.
            </Para>
            <Para>예를 들어,</Para>

            <ul className="grid gap-2 sm:grid-cols-3 mb-6">
              {['한 짝만 남은 이어폰', '일부만 남은 식기 세트', '짝이 맞지 않는 빈티지 소품'].map((item) => (
                <li
                  key={item}
                  className="rounded-card border border-aring-green-line bg-aring-green-bg px-4 py-4 text-center text-[14px] lg:text-[15px] font-bold text-aring-green-deep break-keep"
                >
                  {item}
                </li>
              ))}
            </ul>

            <Para>
              등 재사용 가능성이 있지만 연결되지 못했던 물건들까지 범위를 넓혀갈 예정입니다.
            </Para>
          </Section>

          {/* 결론 */}
          <Section>
            <Para className="font-semibold text-aring-ink-900">
              aring은 단순한 중고거래 서비스가 아닙니다.
            </Para>
            <Para>
              버려질 수 있었던 물건에 다시 사용 가치를 부여하고, 데이터와 AI를 통해 사람과 사람, 그리고 잃어버린 조각들을 다시 연결하는 새로운 리커머스 경험을 만들어가고 있습니다.
            </Para>
          </Section>

          {/* CTA — 딥 그린 카드 (텍스트 흰색용 토큰 의도대로) */}
          <section className="mt-12 lg:mt-16">
            <div className="rounded-card bg-aring-grad-green p-6 lg:p-8 text-center shadow-card">
              <h2 className="text-[20px] lg:text-[24px] font-bold text-white mb-2 break-keep">
                서랍 속 한 짝을 다시 꺼내보세요
              </h2>
              <p className="text-[14px] lg:text-[15px] text-white/75 mb-5 break-keep">
                사진 한 장이면 충분합니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center bg-white text-aring-green-deep rounded-tile py-3.5 px-6 font-bold text-[15px] shadow-cta active:scale-95 transition"
                >
                  한 짝 등록하기
                </Link>
                <Link
                  href="/discover"
                  className="inline-flex items-center justify-center bg-transparent text-white border border-white/40 rounded-tile py-3.5 px-6 font-bold text-[15px] active:scale-95 transition hover:bg-white/10"
                >
                  둘러보기
                </Link>
              </div>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// 내부 컴포넌트 — 본문 가독성을 위한 작은 빌딩블록
// ─────────────────────────────────────────────

function Section({ children }: { children: React.ReactNode }) {
  return <section className="mb-10 lg:mb-14">{children}</section>;
}

function Para({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={[
        'text-[15px] lg:text-[17px] leading-[1.85] text-aring-ink-700 mb-4 break-keep',
        className ?? '',
      ].join(' ')}
    >
      {children}
    </p>
  );
}

function Pullquote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-6 lg:my-8 pl-5 lg:pl-6 border-l-[3px] border-aring-green text-[16px] lg:text-[19px] font-bold leading-[1.7] text-aring-ink-900 break-keep">
      {children}
    </blockquote>
  );
}
