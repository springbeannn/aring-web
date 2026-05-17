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
const PAGE_URL = `${SITE_URL}/about/story`;

export const metadata: Metadata = {
  title: 'aring 브랜드 스토리 — 한 짝의 짝을 찾는 AI 매칭 서비스',
  description:
    '한 짝만 남은 귀걸이를 잃어버렸나요? aring(아링)은 사진 한 장으로 짝을 찾는 AI 매칭 서비스입니다. 형태·컬러·소재·디테일 분석으로 동일 또는 유사 디자인을 연결합니다.',
  keywords: [
    '귀걸이 한 짝',
    '귀걸이 분실',
    '귀걸이 매칭',
    '잃어버린 귀걸이',
    '귀걸이 짝 찾기',
    '외짝 귀걸이',
    '한쪽 귀걸이',
    '한 짝 귀걸이 찾기',
    'AI 귀걸이 매칭',
    'aring',
    '아링',
  ],
  alternates: { canonical: '/about/story' },
  openGraph: {
    title: 'aring 브랜드 스토리 — 한 짝의 짝을 찾는 AI 매칭 서비스',
    description:
      '한 짝만 남은 귀걸이를 사진 한 장으로 매칭. AI 기반 P2P 리커머스 서비스 aring(아링).',
    url: PAGE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'aring 브랜드 스토리 — 한 짝의 짝을 찾는 AI 매칭 서비스',
    description:
      '한 짝만 남은 귀걸이를 사진 한 장으로 매칭. AI 기반 P2P 리커머스 서비스.',
  },
};

type Faq = {
  q: string;
  a: string;
  /** Schema.org FAQPage에 들어가는 압축형 답변 (Rich Result 친화) */
  aSchema: string;
};

const FAQS: Faq[] = [
  {
    q: 'aring은 무료로 사용할 수 있나요?',
    a: '한 짝 등록과 AI 매칭 탐색은 무료로 이용하실 수 있습니다. 사용자 간 거래·교환 시점의 정책은 별도로 안내됩니다.',
    aSchema: '한 짝 등록과 AI 매칭 탐색은 무료로 이용하실 수 있습니다.',
  },
  {
    q: '단종된 명품 귀걸이도 매칭이 되나요?',
    a: '단종 모델도 등록 가능합니다. 동일 모델 보유자가 등록되어 있다면 직접 매칭이 가능하고, 그렇지 않은 경우 형태·소재가 가까운 비슷한 짝을 함께 안내해드립니다.',
    aSchema:
      '단종 모델도 등록 가능합니다. 동일 모델 보유자가 없으면 형태·소재가 가까운 비슷한 짝을 안내합니다.',
  },
  {
    q: 'AI는 어떤 기준으로 귀걸이를 매칭하나요?',
    a: '형태(실루엣), 컬러, 소재(반사·질감), 디테일(세팅·후크·표면 마감) 네 가지를 종합 분석합니다. 분석 결과는 매칭 근거와 함께 사용자에게 제공됩니다.',
    aSchema: '형태, 컬러, 소재, 디테일 네 가지를 종합 분석하며 매칭 근거를 함께 제공합니다.',
  },
  {
    q: '어떤 사진을 올려야 정확도가 높아지나요?',
    a: '자연광·단색 배경·정면에서 촬영한 사진이 가장 정확합니다. 가능하다면 정면 한 컷과 측면 한 컷을 함께 등록해주세요.',
    aSchema:
      '자연광, 단색 배경, 정면에서 촬영한 사진이 가장 정확합니다. 정면과 측면 두 컷을 함께 등록하면 좋습니다.',
  },
  {
    q: '매칭이 되지 않으면 어떻게 되나요?',
    a: '정확히 같은 짝이 없는 경우 비슷한 한 짝 또는 어울리는 새로운 한 짝을 함께 제안합니다. 새 사용자가 등록될 때마다 자동으로 재매칭이 시도됩니다.',
    aSchema:
      '비슷한 한 짝 또는 어울리는 새로운 한 짝을 함께 제안하며, 신규 등록 시 자동으로 재매칭이 시도됩니다.',
  },
  {
    q: '귀걸이 외에 다른 물건도 매칭되나요?',
    a: '현재는 귀걸이를 중심으로 운영 중이며, 향후 한 짝짜리 이어폰·식기·빈티지 소품 등으로 확장 예정입니다.',
    aSchema:
      '현재는 귀걸이 중심이며, 향후 한 짝짜리 이어폰·식기·빈티지 소품 등으로 확장할 계획입니다.',
  },
];

// ─────────────────────────────────────────────
// JSON-LD Schema 4종 (Organization / WebSite / BreadcrumbList / FAQPage)
// @graph로 묶어 단일 <script> 블록으로 삽입
// ─────────────────────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/about/story#organization`,
      name: 'aring',
      alternateName: '아링',
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      description: '한 짝만 남은 귀걸이를 AI로 다시 연결하는 P2P 리커머스 플랫폼',
      sameAs: ['https://www.instagram.com/aring.app'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/about/story#website`,
      name: 'aring',
      url: SITE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/discover?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${SITE_URL}/about/story#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: `${SITE_URL}/` },
        {
          '@type': 'ListItem',
          position: 2,
          name: '서비스 소개',
          item: PAGE_URL,
        },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/about/story#faq`,
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.aSchema },
      })),
    },
  ],
};

export default function AboutStoryPage() {
  return (
    <StoryLayout
      head={
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      }
      eyebrow="STORY 01 · AARING"
      title={'aring 브랜드 스토리 —\n한 짝의 짝을 찾는 AI 매칭 서비스'}
      intro={
        <>
          aring(아링)은 한 짝만 남은 귀걸이를 사진 한 장으로 매칭해주는 AI 기반 P2P 리커머스
          서비스입니다. 형태·컬러·소재·디테일을 AI가 분석해 같은 짝 또는 비슷한 짝을 가진
          사용자와 연결합니다.
        </>
      }
      cta={
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
      }
    >
      {/* H2 #1 — 문제 */}
      <Section>
        <SectionTitle>aring이 해결하는 문제</SectionTitle>
        <Para>
          귀걸이는 다른 액세서리와 달리 한쪽만 남게 되는 순간 활용도가 크게 떨어지는 제품입니다.
        </Para>
        <Para>
          특히 자주 착용하던 귀걸이이거나, 오래 고민 끝에 구매한 제품일수록 쉽게 버리지 못하는 경우가
          많습니다. 단종되었거나 구매처를 찾기 어려운 경우에는 남은 한쪽이 그대로 보관되거나 서랍 속에
          머무르는 일이 반복됩니다.
        </Para>
        <Para>aring은 이러한 문제에서 출발했습니다.</Para>

        <Pullquote>
          “한 짝만 남은 귀걸이도 다시 연결될 수 있지 않을까?”<br />
          “같은 귀걸이의 반대쪽을 가진 사람이 어딘가에 존재하지 않을까?”
        </Pullquote>
      </Section>

      {/* H2 #2 — 서비스 정의 */}
      <Section>
        <SectionTitle>aring은 어떤 서비스인가요</SectionTitle>
        <Para>aring은 위 질문을 기반으로 만들어진 AI 기반 P2P 리커머스 플랫폼입니다.</Para>
        <Para>
          사용자는 한쪽만 남은 귀걸이를 사진으로{' '}
          <Link
            href="/register"
            className="text-aring-green font-bold underline underline-offset-2"
          >
            등록
          </Link>
          할 수 있으며, AI는 이미지 분석을 통해 형태, 컬러, 소재, 디테일 등의 특징을 비교해 동일하거나
          유사한 디자인의 귀걸이를 탐색합니다. 이후 비슷한 귀걸이를 보유한 사용자 간 연결을 통해 거래
          또는 교환이 가능하도록 설계했습니다.
        </Para>
        <Para>
          다른 사용자들이 올린 한 짝은{' '}
          <Link
            href="/discover"
            className="text-aring-green font-bold underline underline-offset-2"
          >
            탐색하기
          </Link>
          에서 확인할 수 있습니다.
        </Para>

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

        <Para>
          본인이 등록한 한 짝의 매칭 현황은{' '}
          <Link
            href="/my/match"
            className="text-aring-green font-bold underline underline-offset-2"
          >
            MY 페이지
          </Link>
          에서 확인하실 수 있습니다.
        </Para>
      </Section>

      {/* H2 #3 — 매칭 방식 */}
      <Section>
        <SectionTitle>어떻게 매칭이 이루어지나요</SectionTitle>
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
          등의 AI 분석 결과를 함께 제공해 사용자 스스로 매칭 과정을 이해할 수 있도록 기획하고
          있습니다.
        </Para>
        <Para>
          더 자세한 사용 방법은{' '}
          <Link
            href="/qna"
            className="text-aring-green font-bold underline underline-offset-2"
          >
            Q&amp;A
          </Link>
          에서 안내드리고 있습니다.
        </Para>
      </Section>

      {/* H2 #4 — 다른 중고거래와 차별점 */}
      <Section>
        <SectionTitle>다른 중고거래와 무엇이 다른가요</SectionTitle>
        <Para>
          기존 중고거래 플랫폼이 완성된 상품 중심의 거래 구조였다면, aring은 ‘불완전한 상태의 물건’을
          다시 연결하고 복원하는 경험에 집중합니다.
        </Para>
        <Para className="font-semibold text-aring-ink-900">
          aring은 단순한 중고거래 서비스가 아닙니다.
        </Para>
        <Para>
          버려질 수 있었던 물건에 다시 사용 가치를 부여하고, 데이터와 AI를 통해 사람과 사람, 그리고
          잃어버린 조각들을 다시 연결하는 새로운 리커머스 경험을 만들어가고 있습니다.
        </Para>
        <Para>
          현재 등록된 한 짝의{' '}
          <Link
            href="/products"
            className="text-aring-green font-bold underline underline-offset-2"
          >
            전체 리스트
          </Link>
          도 둘러보실 수 있습니다.
        </Para>
      </Section>

      {/* H2 #5 — 확장 */}
      <Section>
        <SectionTitle>앞으로의 확장 계획</SectionTitle>
        <Para>
          향후에는 Google Vision AI 기반 이미지 분석 기술을 활용해 동일·유사 디자인 매칭 정확도를
          높이고, 귀걸이를 넘어 다양한 “짝을 이루는 물건” 영역으로 확장할 계획입니다.
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

      {/* H2 #6 — FAQ */}
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
