import type { Metadata } from 'next';
import Link from 'next/link';
import { TopNav } from '@/components/Nav';

export const metadata: Metadata = {
  title: 'aring 서비스 소개 — 잃어버린 짝을 다시 연결하다',
  description:
    'aring(아링)은 한 짝만 남은 귀걸이를 AI로 다시 연결해주는 P2P 리커머스 서비스입니다. 어떻게 시작되었고, 무엇을 만들고 있으며, 어디로 향하는지 직접 이야기합니다.',
  alternates: { canonical: '/about/story' },
  openGraph: {
    title: 'aring 서비스 소개 — 잃어버린 짝을 다시 연결하다',
    description:
      '서랍 속에 잠들어 있던 한 짝의 귀걸이가, 누군가에게 다시 완성되는 경험. aring이 만들고 싶은 이야기.',
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
              aring 서비스 소개
            </p>
            <h1 className="text-[26px] lg:text-[34px] font-bold tracking-tight text-aring-ink-900 leading-snug break-keep">
              AI로 잃어버린 짝을<br />다시 연결하는<br />리커머스 플랫폼, aring
            </h1>
          </header>

          {/* 시작 — 왜 만들게 되었나 */}
          <Section>
            <Para>
              액세서리를 좋아해서 귀걸이를 자주 착용하지만, 오래 하고 있으면 불편해서 중간에 빼두는 습관이 있었기 때문입니다.
              카페 테이블 위, 사무실 책상, 파우치 안, 주머니 속에 잠깐 넣어두었다가 어느 순간 한쪽만 사라지는 일이 반복됐습니다.
            </Para>
            <Para>좋아해서 자주 착용하지만, 불편해서 자주 빼게 되는 제 습관이 결국 귀걸이 분실로 이어졌습니다.</Para>
            <Para>
              그런데 귀걸이를 잃어버렸을 때의 아쉬움은 단순히 “물건 하나를 잃어버렸다”는 감정과는 조금 달랐습니다.
            </Para>
            <Para>
              특히 가격대가 있는 귀걸이는 쉽게 사지 않습니다. 돈을 모으고, 여러 디자인을 비교하고, 오래 고민한 뒤 구매를 결정합니다.
              때로는 여행지에서 샀던 기억, 월급 받고 스스로에게 선물했던 순간, 누군가와 함께 쇼핑했던 추억까지 함께 담겨 있습니다.
            </Para>
            <Para>
              그래서 한쪽을 잃어버리면 단순히 귀걸이 하나가 사라지는 게 아니라, 그때의 감정과 기억도 함께 잃어버린 것 같은 기분이 들었습니다.
            </Para>
            <Para>
              저 역시 20대 때부터 마음에 들던 귀걸이의 한쪽을 잃어버리고도 남은 한쪽을 쉽게 버리지 못한 경험이 많았습니다.
              다시 사기엔 부담스럽고, 버리기엔 아까운 귀걸이들이 서랍 속에 계속 남아 있었습니다.
            </Para>

            <Pullquote>
              “나와 반대쪽 귀걸이를 가진 사람이 어딘가에 있지 않을까?”<br />
              “한 짝만 남은 귀걸이도 다시 연결될 수 있지 않을까?”
            </Pullquote>

            <Para>
              오랫동안 막연한 아이디어로만 남아 있던 이 생각은, 회사에서 AI 기술 변화와 서비스 구조를 고민하던 중 조금씩 구체화되기 시작했습니다.
              사진 기반 AI 분석 기술을 활용하면 귀걸이의 형태, 색상, 소재, 디테일 등을 비교해 같거나 유사한 디자인을 찾을 수 있겠다고 생각했습니다.
            </Para>
            <Para>그리고 여기서 한 단계 더 나아갔습니다.</Para>
            <Para className="font-semibold text-aring-ink-800">
              한 짝만 남은 귀걸이를 사진으로 등록하면<br />
              AI가 비슷한 짝을 찾아주고,<br />
              그 귀걸이를 가진 다른 사용자와 연결해준다면 어떨까?
            </Para>
            <Para>
              단순한 중고거래가 아니라, 잃어버린 짝을 다시 완성해주는 새로운 리커머스 경험이 될 수 있다고 생각했습니다.
            </Para>
          </Section>

          {/* aring은 어떤 서비스인가요? */}
          <Section>
            <SectionTitle>aring은 어떤 서비스인가요?</SectionTitle>
            <Para>
              aring은 한 짝만 남은 귀걸이를 다시 연결하는 AI 기반 P2P 리커머스 서비스입니다.
            </Para>
            <Para>
              사용자는 남은 귀걸이 한쪽을 사진으로 등록합니다.
              그러면 AI가 형태, 컬러, 소재, 브랜드, 디테일 등을 분석해 같거나 유사한 디자인의 귀걸이를 찾아줍니다.
              그리고 비슷한 귀걸이를 가진 사용자와 연결되어 거래하거나 교환할 수 있습니다.
            </Para>
            <Para>
              기존 중고거래 플랫폼은 완성된 상품을 사고파는 구조입니다.
              하지만 귀걸이는 한쪽만 남으면 활용도가 급격히 떨어집니다.
              특히 단종되었거나 구매처를 알 수 없는 경우에는 남은 한쪽이 그대로 서랍 속에 보관되는 경우가 많습니다.
            </Para>
            <Para>
              aring은 바로 그 문제에서 출발했습니다.
              버려질 수 있는 귀걸이에 다시 사용 가치를 부여하고, 사용자에게는 잃어버린 짝을 되찾는 경험을 제공합니다.
            </Para>
          </Section>

          {/* 앞으로의 방향 */}
          <Section>
            <SectionTitle>앞으로의 방향</SectionTitle>
            <Para>
              현재는 귀걸이에 집중하고 있지만, 앞으로는 더 다양한 영역으로 확장하고 싶습니다. 예를 들면,
            </Para>

            <ul className="grid gap-2 sm:grid-cols-3 mb-6">
              {['한 짝만 남은 이어폰', '일부만 남은 식기 세트', '짝이 맞지 않는 빈티지 소품'].map((item) => (
                <li
                  key={item}
                  className="rounded-card border border-aring-green-line bg-aring-grad-green px-4 py-4 text-center text-[14px] lg:text-[15px] font-bold text-aring-ink-900 break-keep"
                >
                  {item}
                </li>
              ))}
            </ul>

            <Para>
              처럼 “짝을 이루는 물건” 전체로 확장 가능한 플랫폼으로 발전시키고 싶습니다.
            </Para>
            <Para>
              또한 Google Vision AI 기반 이미지 분석 기술 등을 활용해 동일·유사 디자인 매칭 정확도를 계속 높여나갈 계획입니다.
            </Para>
          </Section>

          {/* 거래보다 연결 */}
          <Section>
            <SectionTitle>결국 만들고 싶은 것은 ‘거래’보다 ‘연결’입니다</SectionTitle>
            <Para>aring은 단순히 물건을 사고파는 서비스가 아닙니다.</Para>
            <Para>
              누군가에게는 쓸모를 잃은 물건이, 다른 누군가에게는 오래 찾던 마지막 한 조각일 수 있습니다.
            </Para>
            <Para>
              저는 AI가 단순히 효율을 높이는 기술이 아니라, 사람들의 기억과 감정을 다시 연결하는 방식으로도 사용될 수 있다고 생각합니다.
            </Para>
            <Pullquote>
              서랍 속에 잠들어 있던 한 짝의 귀걸이가<br />
              누군가에게 다시 완성되는 경험.
            </Pullquote>
            <Para className="font-semibold text-aring-ink-800">
              aring은 바로 그 경험을 만드는 서비스가 되고 싶습니다.
            </Para>
          </Section>

          {/* CTA */}
          <section className="mt-12 lg:mt-16">
            <div className="rounded-card bg-aring-grad-green border border-aring-green-line p-6 lg:p-8 text-center shadow-card">
              <h2 className="text-[20px] lg:text-[24px] font-bold text-aring-ink-900 mb-2 break-keep">
                서랍 속 한 짝을 다시 꺼내보세요
              </h2>
              <p className="text-[14px] lg:text-[15px] text-aring-ink-500 mb-5 break-keep">
                사진 한 장이면 충분합니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center bg-aring-ink-900 text-white rounded-tile py-3.5 px-6 font-bold text-[15px] shadow-cta active:scale-95 transition"
                >
                  한 짝 등록하기
                </Link>
                <Link
                  href="/discover"
                  className="inline-flex items-center justify-center bg-white text-aring-ink-900 border border-aring-ink-200 rounded-tile py-3.5 px-6 font-bold text-[15px] active:scale-95 transition"
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[20px] lg:text-[26px] font-bold text-aring-ink-900 mb-5 lg:mb-7 break-keep">
      {children}
    </h2>
  );
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
