import type { Metadata } from 'next';
import Link from 'next/link';
import StoryLayout from '@/components/story/StoryLayout';
import {
  Section,
  SectionTitle,
  Para,
  Pullquote,
} from '@/components/story/StoryPrimitives';

const SITE_URL = 'https://aring.app';
const PAGE_URL = `${SITE_URL}/about/story/why-register-first`;
const TITLE = '귀걸이 한 짝을 잃어버렸다면, 검색보다 등록이 먼저인 이유';
const DESCRIPTION =
  '귀걸이 한 짝을 잃어버렸다면 검색보다 aring에 남은 한쪽을 먼저 등록하세요. 같은 모델의 반대쪽을 가진 사람과 시간에 구애받지 않고 자동 매칭됩니다. 사진 한 장, 30초면 충분합니다.';

export const metadata: Metadata = {
  title: `${TITLE} — aring 브랜드 스토리`,
  description: DESCRIPTION,
  keywords: [
    '귀걸이 잃어버림',
    '귀걸이 한 짝 분실',
    '잃어버린 귀걸이 찾기',
    '한쪽 귀걸이',
    '귀걸이 한 쪽만 사기',
    '단종 귀걸이 짝 찾기',
    '귀걸이 등록',
    'aring 등록',
    '귀걸이 매칭',
    'AI 귀걸이 매칭',
    'aring',
    '에이링',
  ],
  alternates: { canonical: '/about/story/why-register-first' },
  openGraph: {
    title: `${TITLE} — aring 브랜드 스토리`,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} — aring 브랜드 스토리`,
    description: DESCRIPTION,
  },
};

type Faq = {
  q: string;
  a: string;
  /** Schema.org FAQPage용 압축형 답변 (Rich Result 친화) */
  aSchema: string;
};

const FAQS: Faq[] = [
  {
    q: '귀걸이 한 짝을 잃어버렸을 때 가장 먼저 무엇을 해야 하나요?',
    a: '같은 모델을 다시 사려고 검색부터 하기보다, 남아 있는 한쪽 사진을 aring에 먼저 등록하시는 편이 빠릅니다. 등록해 두면 반대쪽을 가진 다른 사용자가 등록하는 순간 자동으로 매칭이 시도됩니다.',
    aSchema:
      '남아 있는 한쪽 사진을 aring에 먼저 등록하세요. 반대쪽을 가진 사용자가 등록하는 순간 자동으로 매칭됩니다.',
  },
  {
    q: '왜 검색이 아니라 등록이 먼저인가요?',
    a: 'aring은 검색 정확도가 아니라 등록과 등록을 시간에 구애받지 않고 연결합니다. 한쪽을 잃어버린 두 사람이 같은 순간에 같은 검색어를 입력할 확률은 매우 낮지만, 두 사람 모두 남은 한쪽을 등록해 두면 그 만남은 시점의 문제가 됩니다.',
    aSchema:
      'aring은 검색 정확도가 아니라 등록과 등록을 시간차 없이 연결하기 때문입니다. 양쪽이 모두 등록해 두면 시점만 다를 뿐 매칭은 일어납니다.',
  },
  {
    q: '단종된 명품 귀걸이의 한 짝도 매칭이 되나요?',
    a: '단종 모델일수록 더 등록을 권장합니다. 다시 판매되지 않는 모델은 같은 한 짝을 가진 다른 사용자도 보관 중일 가능성이 높습니다. 동일 모델 보유자가 없는 경우에는 형태·소재가 가까운 비슷한 한 짝을 함께 안내해드립니다.',
    aSchema:
      '단종 모델도 등록 가능합니다. 동일 모델 보유자가 없으면 형태·소재가 가까운 비슷한 한 짝을 함께 제안합니다.',
  },
  {
    q: '등록은 얼마나 걸리나요?',
    a: '사진 한 장과 한 줄 메모만 있으면 등록되며, 보통 30초 이내입니다. 자연광에서 정면 한 컷, 가능하다면 측면 한 컷을 함께 올리시면 매칭 정확도가 올라갑니다.',
    aSchema:
      '사진 한 장과 한 줄 메모면 등록되며 보통 30초입니다. 자연광·정면 사진이 가장 정확합니다.',
  },
  {
    q: '오늘 등록하면 매칭은 언제 되나요?',
    a: '등록 즉시 기존에 등록된 모든 한 짝과 자동 비교가 시작되고, 그 이후에도 새로운 사용자가 등록할 때마다 다시 매칭이 시도됩니다. 오늘이 아니더라도 시간이 흐를수록 매칭 확률은 누적됩니다.',
    aSchema:
      '등록 즉시 자동 매칭이 시작되며, 신규 등록이 발생할 때마다 재매칭이 누적 시도됩니다.',
  },
  {
    q: '등록한 한 짝의 매칭 결과는 어디서 확인하나요?',
    a: '본인이 등록한 한 짝의 상태와 매칭 결과는 로그인 후 MY 페이지에서 언제든 확인할 수 있습니다. 매칭이 발생하면 알림으로도 안내됩니다.',
    aSchema: '로그인 후 MY 페이지에서 매칭 상태를 확인할 수 있으며, 매칭 시 알림이 전송됩니다.',
  },
];

// ─────────────────────────────────────────────
// JSON-LD: Article / BreadcrumbList / FAQPage / HowTo (4종, @graph)
// ─────────────────────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      '@id': `${PAGE_URL}#article`,
      headline: TITLE,
      description: DESCRIPTION,
      url: PAGE_URL,
      inLanguage: 'ko-KR',
      isPartOf: { '@id': `${SITE_URL}/about/story#website` },
      mainEntityOfPage: PAGE_URL,
      author: { '@type': 'Organization', name: 'aring' },
      publisher: {
        '@type': 'Organization',
        name: 'aring',
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
      },
      about: '귀걸이 한 짝 분실 시 aring 등록을 먼저 해야 하는 이유',
      keywords:
        '귀걸이 한 짝 분실, 잃어버린 귀걸이, 한쪽 귀걸이, 단종 귀걸이, AI 귀걸이 매칭, aring 등록',
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: `${SITE_URL}/` },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'aring 브랜드 스토리',
          item: `${SITE_URL}/about/story`,
        },
        { '@type': 'ListItem', position: 3, name: TITLE, item: PAGE_URL },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${PAGE_URL}#faq`,
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.aSchema },
      })),
    },
    {
      '@type': 'HowTo',
      '@id': `${PAGE_URL}#howto`,
      name: '한 짝 귀걸이 aring 등록 방법',
      description:
        '귀걸이 한 짝을 잃어버렸을 때 남아 있는 반대쪽을 aring에 등록하는 절차입니다.',
      totalTime: 'PT30S',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: '남아 있는 한쪽 촬영',
          text: '자연광에서 단색 배경 위에 두고 정면 한 컷을 촬영합니다. 가능하다면 측면 한 컷을 추가합니다.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'aring 등록 페이지에서 사진 업로드',
          text: 'aring 등록 페이지에 접속해 사진을 업로드하고 한 줄 메모를 남깁니다.',
          url: `${SITE_URL}/register`,
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'AI 자동 특징 추출 확인',
          text: 'AI가 형태·컬러·소재·디테일을 자동으로 추출하고 매칭을 시작합니다.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'MY 페이지에서 매칭 결과 확인',
          text: 'MY 페이지에서 매칭 진행 상태를 확인하고, 신규 등록자가 생길 때마다 자동 재매칭이 누적됩니다.',
          url: `${SITE_URL}/my/match`,
        },
      ],
    },
  ],
};

export default function WhyRegisterFirstPage() {
  return (
    <StoryLayout
      head={
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      }
      eyebrow="STORY 02 · AARING"
      title={TITLE}
      intro={
        <>
          <strong className="font-bold text-aring-ink-900">
            귀걸이 한 짝을 잃어버린 순간, 가장 빠른 행동은 검색이 아니라 등록입니다.
          </strong>{' '}
          에이링(aring)은 남아 있는 반대쪽 사진 한 장을 등록해 두면, 같은 모델의 한 짝을 가진 다른
          사용자가 등록하는 시점에 자동으로 매칭해주는 AI 기반 P2P 리커머스 서비스입니다.
        </>
      }
      cta={
        <section className="mt-12 lg:mt-16">
          <div className="rounded-card bg-aring-grad-green p-6 lg:p-8 text-center shadow-card">
            <h2 className="text-[20px] lg:text-[24px] font-bold text-white mb-2 break-keep">
              남아 있는 한쪽을 먼저 등록해 보세요
            </h2>
            <p className="text-[14px] lg:text-[15px] text-white/75 mb-5 break-keep">
              사진 한 장이면 충분합니다. 30초면 됩니다.
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
                다른 한 짝 둘러보기
              </Link>
            </div>
          </div>
        </section>
      }
    >
      {/* H2 #1 — 잃어버린 순간 */}
      <Section>
        <SectionTitle>잃어버린 순간, 우리는 검색부터 합니다</SectionTitle>
        <Para>
          귀걸이는 잃어버리는 방식이 늘 비슷합니다. 외투를 벗다가, 머리를 묶다가, 자고 일어났더니
          한쪽만 남아 있는 식입니다. 대부분의 사람들은 그 순간 가장 먼저 검색창을 엽니다. 어디서
          샀는지, 같은 모델이 아직 판매되는지, 한 짝만 따로 살 수는 없는지.
        </Para>
        <Para>
          그러나 자주 사용하던 귀걸이일수록 단종된 경우가 많고, 같은 모델을 다시 구하는 일은 생각보다
          쉽지 않습니다. 그렇게 한참을 헤매다, 남은 한쪽은 다시 작은 파우치 안으로 들어갑니다.
        </Para>
      </Section>

      {/* H2 #2 — 등록이 먼저인 이유 */}
      <Section>
        <SectionTitle>검색이 아니라 등록이 먼저인 이유</SectionTitle>
        <Para>
          aring이 사용자에게 가장 먼저 권하는 행동은 검색이 아니라{' '}
          <Link
            href="/register"
            className="text-aring-green font-bold underline underline-offset-2"
          >
            등록
          </Link>
          입니다. 이유는 단순합니다.
        </Para>

        <Pullquote>
          같은 귀걸이의 반대쪽을 가진 사람은,<br />
          지금도 어딘가에서 똑같이 검색을 하고 있을지 모릅니다.
        </Pullquote>

        <Para>
          한쪽을 잃어버린 사람과, 반대쪽을 잃어버린 사람. 두 사람이 같은 시점에 같은 검색어를 입력할
          가능성은 매우 낮습니다. 그러나 두 사람이 모두 자신의 남은 한쪽을 등록해 두었다면, 그 만남은
          시간문제가 됩니다.
        </Para>
        <Para>
          aring은 검색의 정확도를 다투는 서비스가 아니라, 등록된 한 짝과 한 짝을 시간에 구애받지 않고
          연결해주는 서비스입니다. 등록이 먼저인 이유입니다.
        </Para>
        <Para>
          서비스 전반의 매칭 원리는{' '}
          <Link
            href="/about/story"
            className="text-aring-green font-bold underline underline-offset-2"
          >
            aring 브랜드 스토리 1편
          </Link>
          에서 더 자세히 설명드리고 있습니다.
        </Para>
      </Section>

      {/* H2 #3 — 등록은 30초 */}
      <Section>
        <SectionTitle>등록은 30초, 매칭은 계속 진행됩니다</SectionTitle>
        <Para>
          남아 있는 한쪽을 정면에서 한 컷, 가능하다면 측면에서 한 컷 더 촬영해 주세요. aring은 사진
          한 장만으로도 등록을 시작할 수 있도록 설계되어 있습니다.
        </Para>

        <ul className="grid gap-2 sm:grid-cols-2 mb-6">
          {[
            '사진 업로드 1장',
            '간단한 한 줄 메모',
            'AI 자동 특징 추출',
            '등록 즉시 매칭 시작',
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

        <Para>
          한 번 등록된 한 짝은 사라지지 않습니다. 새로운 사용자가 자신의 한쪽을 등록할 때마다, AI는
          기존에 등록된 모든 한 짝과 다시 비교를 시도합니다. 오늘 매칭되지 않더라도, 내일 누군가의
          등록 한 번으로 연결될 수 있습니다.
        </Para>
        <Para>
          본인이 등록한 한 짝의 현재 매칭 상태는{' '}
          <Link
            href="/my/match"
            className="text-aring-green font-bold underline underline-offset-2"
          >
            MY 페이지
          </Link>
          에서 언제든 확인할 수 있습니다. 등록 방법이 더 궁금하다면{' '}
          <Link
            href="/qna"
            className="text-aring-green font-bold underline underline-offset-2"
          >
            Q&amp;A
          </Link>
          에서도 안내드리고 있습니다.
        </Para>
      </Section>

      {/* H2 #4 — 다시 만나기 위한 신호 */}
      <Section>
        <SectionTitle>다시 만나기 위한 첫 번째 신호</SectionTitle>
        <Para>
          잃어버린 물건은 어딘가에서 사라지는 것이 아니라, 다른 어딘가에 그대로 존재합니다. 연결되지
          않았을 뿐입니다.
        </Para>
        <Para>
          aring은 그 연결의 가능성을 사진 한 장으로 시작합니다. 등록된 한 짝은 단순한 데이터가 아니라,
          이 귀걸이를 다시 한 쌍으로 만들고 싶다는 작은 신호입니다.
        </Para>
        <Para className="font-semibold text-aring-ink-900">
          그래서 잃어버린 순간, 가장 먼저 해야 할 일은 등록입니다.
        </Para>
        <Para>
          다른 사용자들이 이미 등록해 둔 한 짝은{' '}
          <Link
            href="/discover"
            className="text-aring-green font-bold underline underline-offset-2"
          >
            탐색하기
          </Link>
          또는{' '}
          <Link
            href="/products"
            className="text-aring-green font-bold underline underline-offset-2"
          >
            전체 리스트
          </Link>
          에서 살펴볼 수 있습니다. 혹시 익숙한 모양이 보인다면, 그 한쪽은 당신의 짝일 수도 있습니다.
        </Para>
      </Section>

      {/* H2 #5 — FAQ */}
      <Section>
        <SectionTitle>자주 묻는 질문</SectionTitle>
        <div className="space-y-5 lg:space-y-6">
          {FAQS.map((f) => (
            <article
              key={f.q}
              className="border-b border-aring-ink-100 pb-5 lg:pb-6 last:border-b-0"
            >
              <h3 className="text-[16px] lg:text-[18px] font-bold text-aring-ink-900 mb-2 break-keep">
                Q. {f.q}
              </h3>
              <p className="text-[14px] lg:text-[16px] text-aring-ink-700 leading-[1.85] break-keep">
                {f.a}
              </p>
            </article>
          ))}
        </div>
      </Section>
    </StoryLayout>
  );
}
