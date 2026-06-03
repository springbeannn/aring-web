import type { Metadata } from 'next';
import Link from 'next/link';
import StoryLayout from '@/components/story/StoryLayout';
import StoryFigure from '@/components/story/StoryFigure';
import {
  Section,
  SectionTitle,
  Para,
  Pullquote,
} from '@/components/story/StoryPrimitives';

const SITE_URL = 'https://aring.app';
const PAGE_URL = `${SITE_URL}/about/story/cant-throw-away`;
const TITLE = '왜 우리는 남은 한 짝을 버리지 못할까';
const DESCRIPTION =
  '한쪽만 남은 귀걸이를 쉽게 버리지 못하는 이유를 소유효과·자이가르닉 효과·확장된 자아로 풀어봤습니다. 잃어버린 귀걸이 한 짝을 찾는 방법, 남은 한짝 귀걸이를 다시 연결하는 aring의 매칭 이야기.';

export const metadata: Metadata = {
  title: `${TITLE} — aring 브랜드 스토리`,
  description: DESCRIPTION,
  keywords: [
    '귀걸이 한 짝 잃어버림',
    '한쪽 귀걸이 찾기',
    '귀걸이 한짝만 남았을 때',
    '잃어버린 귀걸이 찾는 방법',
    '귀걸이 버리지 못하는 이유',
    '남은 한짝 귀걸이',
    '외짝 귀걸이',
    '소유효과',
    '자이가르닉 효과',
    '확장된 자아',
    'aring',
    '에이링',
  ],
  alternates: { canonical: '/about/story/cant-throw-away' },
  openGraph: {
    title: `${TITLE} — aring 브랜드 스토리`,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'article',
    siteName: 'aring',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} — aring 브랜드 스토리`,
    description: DESCRIPTION,
  },
};

// ─────────────────────────────────────────────
// JSON-LD: Article / BreadcrumbList (@graph)
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
      about:
        '한쪽만 남은 귀걸이를 쉽게 버리지 못하는 심리와 다시 연결하는 방법',
      keywords:
        '귀걸이 한 짝 잃어버림, 한쪽 귀걸이 찾기, 남은 한짝 귀걸이, 잃어버린 귀걸이 찾는 방법, 귀걸이 버리지 못하는 이유, 소유효과, 자이가르닉 효과',
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
  ],
};

// ─────────────────────────────────────────────
// 본문 중간 인라인 CTA — 읽기 흐름을 끊지 않는 카드형
// ─────────────────────────────────────────────
type InlineCtaProps = {
  variant?: 'soft' | 'accent';
  eyebrow?: string;
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
};

function InlineCta({
  variant = 'soft',
  eyebrow,
  title,
  description,
  href,
  buttonLabel,
}: InlineCtaProps) {
  if (variant === 'accent') {
    return (
      <aside
        aria-label={title}
        className="my-10 lg:my-14 rounded-card bg-aring-grad-green p-6 lg:p-8 shadow-card"
      >
        {eyebrow && (
          <p className="text-[10px] lg:text-[11px] font-bold tracking-[0.18em] uppercase text-white/70 mb-3">
            {eyebrow}
          </p>
        )}
        <h3 className="text-[18px] lg:text-[22px] font-bold text-white mb-2 break-keep leading-snug">
          {title}
        </h3>
        <p className="text-[14px] lg:text-[15px] leading-[1.75] text-white/85 mb-5 break-keep whitespace-pre-line">
          {description}
        </p>
        <Link
          href={href}
          className="inline-flex items-center justify-center bg-white text-aring-green-deep rounded-tile py-3 px-5 font-bold text-[14px] lg:text-[15px] shadow-cta active:scale-95 transition"
        >
          {buttonLabel}
          <span aria-hidden className="ml-1.5">
            →
          </span>
        </Link>
      </aside>
    );
  }

  return (
    <aside
      aria-label={title}
      className="my-10 lg:my-14 rounded-card border border-aring-green-line bg-aring-green-bg p-6 lg:p-7"
    >
      {eyebrow && (
        <p className="text-[10px] lg:text-[11px] font-bold tracking-[0.18em] uppercase text-aring-green mb-3">
          {eyebrow}
        </p>
      )}
      <h3 className="text-[17px] lg:text-[20px] font-bold text-aring-ink-900 mb-2 break-keep leading-snug">
        {title}
      </h3>
      <p className="text-[14px] lg:text-[15px] leading-[1.75] text-aring-ink-700 mb-5 break-keep whitespace-pre-line">
        {description}
      </p>
      <Link
        href={href}
        className="inline-flex items-center justify-center bg-aring-ink-900 text-white rounded-tile py-3 px-5 font-bold text-[14px] lg:text-[15px] active:scale-95 transition"
      >
        {buttonLabel}
        <span aria-hidden className="ml-1.5">
          →
        </span>
      </Link>
    </aside>
  );
}

export default function CantThrowAwayPage() {
  return (
    <StoryLayout
      head={
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      }
      eyebrow="STORY 03 · ARING"
      title={TITLE}
      intro={
        <>
          <strong className="font-bold text-aring-ink-900">
            서랍 속에 한쪽만 남은 귀걸이가 있나요?
          </strong>{' '}
          쓸 수 없는데도 버리지 못하는 이유는 단순한 미련이 아닙니다. 소유효과,
          자이가르닉 효과, 확장된 자아 — 심리학이 설명하는 ‘남은 한 짝’의 이야기와,
          그 한 짝을 다시 연결하는 에이링(aring)의 시작을 이야기합니다.
        </>
      }
      cta={
        <section className="mt-12 lg:mt-16">
          <div className="rounded-card bg-aring-grad-green p-6 lg:p-8 text-center shadow-card">
            <h2 className="text-[20px] lg:text-[24px] font-bold text-white mb-2 break-keep">
              혹시 아직 버리지 못한 귀걸이가 있나요?
            </h2>
            <p className="text-[14px] lg:text-[15px] text-white/80 mb-5 break-keep whitespace-pre-line">
              {'그건 미련이 아니라,\n아직 끝나지 않은 이야기일지도 모릅니다.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center bg-white text-aring-green-deep rounded-tile py-3.5 px-6 font-bold text-[15px] shadow-cta active:scale-95 transition"
              >
                내 한 짝 등록하기
              </Link>
              <Link
                href="/discover"
                className="inline-flex items-center justify-center bg-transparent text-white border border-white/40 rounded-tile py-3.5 px-6 font-bold text-[15px] active:scale-95 transition hover:bg-white/10"
              >
                반대쪽 찾으러 가기
              </Link>
            </div>
          </div>
        </section>
      }
    >
      {/* 히어로 이미지 — 도입부 "서랍 속 파우치"와 호응 */}
      <StoryFigure
        src="/images/story/cant-throw-away/drawer-pouch.png"
        alt="서랍 속 파우치에 한쪽씩 남은 금빛 귀걸이들이 담겨 있는 모습"
        width={1086}
        height={1448}
        caption="서랍 속에 남은 한 짝들 — 쓰지 못하는데도 버리지 못하는 귀걸이"
        priority
      />

      {/* H2 #1 — 도입 */}
      <Section>
        <SectionTitle>왜 우리는 남은 한 짝을 버리지 못할까</SectionTitle>
        <Para>서랍 속 작은 파우치를 열어본다.</Para>
        <Para>몇 년째 사용하지 않은 귀걸이들이 있다.</Para>
        <Para>
          짝을 잃어버린 귀걸이. 한쪽만 남은 귀걸이. 언젠가 찾을 거라 생각하며
          넣어둔 귀걸이.
        </Para>

        <Pullquote>“나중에 정리해야지.”</Pullquote>

        <Para>그 생각을 한 것이 벌써 몇 년 전이다.</Para>
        <Para>그런데도 우리는 이상할 만큼 쉽게 버리지 못한다.</Para>
        <Para>
          사용할 수 없는 물건인데도, 공간만 차지하는 물건인데도, 왜 남겨두고 있는
          걸까.
        </Para>
      </Section>

      {/* H2 #2 — 소유효과 */}
      <Section>
        <SectionTitle>사람은 자신의 물건에 특별한 가치를 부여한다</SectionTitle>
        <Para>
          행동경제학에는 <strong className="font-bold text-aring-ink-900">‘소유효과(Endowment Effect)’</strong>라는
          개념이 있다.
        </Para>
        <Para>
          같은 물건이라도 내 것이 되는 순간 더 가치 있게 느껴지는 현상이다.
        </Para>
        <Para>
          그래서 남들에게는 평범한 귀걸이일지 몰라도, 나에게는 다르다.
        </Para>

        <ul className="grid gap-2 sm:grid-cols-3 my-6">
          {[
            '첫 월급으로 샀던 귀걸이',
            '여행 중 우연히 발견한 귀걸이',
            '중요한 날 착용했던 귀걸이',
          ].map((item) => (
            <li
              key={item}
              className="rounded-card border border-aring-green-line bg-aring-green-bg px-4 py-4 text-center text-[13px] lg:text-[14px] font-bold text-aring-green-deep break-keep leading-[1.5]"
            >
              {item}
            </li>
          ))}
        </ul>

        <Para className="font-semibold text-aring-ink-900">
          귀걸이의 가격보다 그 안에 담긴 기억이 더 크다.
        </Para>
      </Section>

      {/* H2 #3 — 자이가르닉 효과 */}
      <Section>
        <SectionTitle>우리는 끝나지 않은 이야기를 쉽게 놓지 못한다</SectionTitle>
        <Para>
          심리학자 블루마 자이가르닉은 흥미로운 사실을 발견했다.
        </Para>
        <Para>
          사람은 완료된 일보다 완료되지 않은 일을 더 오래 기억한다. 이를{' '}
          <strong className="font-bold text-aring-ink-900">
            ‘자이가르닉 효과(Zeigarnik Effect)’
          </strong>
          라고 부른다.
        </Para>
        <Para>한 짝을 잃어버린 귀걸이도 비슷하다.</Para>

        <Pullquote>
          찾지 못했다.
          <br />
          하지만 포기한 것도 아니다.
        </Pullquote>

        <Para>
          그래서 그 귀걸이는 우리의 기억 속에서 계속{' '}
          <em className="not-italic font-semibold text-aring-green-deep">진행 중인 상태</em>로
          남는다.
        </Para>
        <Para>
          언젠가 침대 밑에서 발견할 수도 있고, 겨울 코트 주머니에서 나올 수도
          있고, 이사하는 날 우연히 찾게 될 수도 있다고 생각한다.
        </Para>
        <Para>그래서 버리지 못한다. 이야기가 아직 끝나지 않았기 때문이다.</Para>

        <StoryFigure
          src="/images/story/cant-throw-away/vanity-pouch.png"
          alt="햇살 드는 화장대에서 한쪽만 남은 귀걸이가 담긴 파우치를 바라보는 사람"
          width={1254}
          height={1254}
          caption="끝나지 않은 이야기처럼, 남은 한 짝은 오래도록 곁에 머문다"
        />
      </Section>

      {/* H2 #4 — 확장된 자아 */}
      <Section>
        <SectionTitle>
          귀걸이는 물건이 아니라 ‘그 시절의 나’이기도 하다
        </SectionTitle>
        <Para>
          심리학자 러셀 벨크는 사람이 자신의 물건을 자아의 일부처럼 인식한다고
          설명했다. 이를{' '}
          <strong className="font-bold text-aring-ink-900">
            ‘확장된 자아(Extended Self)’
          </strong>
          라고 부른다.
        </Para>
        <Para>
          우리는 물건을 소유하는 것이 아니라, 그 안에 자신의 시간을 담는다.
        </Para>
        <Para>그래서 어떤 귀걸이는 단순한 액세서리가 아니다.</Para>

        <ul className="grid gap-2 sm:grid-cols-3 my-6">
          {['스무 살의 나', '첫 직장의 나', '누군가를 좋아하던 시절의 나'].map(
            (item) => (
              <li
                key={item}
                className="rounded-tile border border-aring-green-line bg-white px-4 py-4 text-center text-[14px] lg:text-[15px] font-bold text-aring-ink-900 break-keep leading-[1.5]"
              >
                {item}
              </li>
            ),
          )}
        </ul>

        <Para>그 시절의 나를 기억하게 하는 작은 기록이다.</Para>
        <Para>한 짝이 남았다고 해서 쉽게 버릴 수 없는 이유다.</Para>
      </Section>

      {/* H2 #5 — 사람들의 선택 */}
      <Section>
        <SectionTitle>사람들은 남은 한 짝을 어떻게 할까</SectionTitle>
        <Para>누군가는 버린다.</Para>
        <Para>누군가는 짝짝이 귀걸이로 사용한다.</Para>
        <Para>누군가는 비슷한 제품을 찾아 새 한 짝을 주문한다.</Para>
        <Para>
          목걸이 펜던트로 바꾸거나, 참 장식으로 활용하는 사람도 있다.
        </Para>
        <Para>방법은 다르다. 하지만 공통점이 있다.</Para>

        <Pullquote>
          그 누구도 귀걸이와의 관계를
          <br />
          쉽게 끝내고 싶어 하지 않는다는 점이다.
        </Pullquote>

        {/* INLINE CTA #1 — soft 톤. 본문과 자연스럽게 연결 */}
        <InlineCta
          variant="soft"
          eyebrow="아직 서랍 속에 있다면"
          title="아직도 서랍 속에 보관 중이라면"
          description="한쪽만 남은 귀걸이들이 어떻게 등록되어 있는지 둘러보세요. 어쩌면 익숙한 모양이 보일 수도 있습니다."
          href="/discover"
          buttonLabel="한 짝 찾으러 가기"
        />
      </Section>

      {/* H2 #6 — 미련이 아니다 */}
      <Section>
        <SectionTitle>버리지 못하는 것은 미련이 아니다</SectionTitle>
        <Para>사람들은 종종 말한다.</Para>

        <Pullquote>“그냥 버리지 왜 아직도 가지고 있어?”</Pullquote>

        <Para>하지만 어쩌면 그건 미련이 아닐지도 모른다.</Para>
        <Para className="font-semibold text-aring-ink-900">
          완결되지 않은 이야기는 살아있기 때문이다.
        </Para>
        <Para>
          누군가는 지금도 반대쪽 귀걸이를 보관하고 있을 수 있다.
        </Para>
        <Para>누군가는 같은 디자인의 한 짝을 찾고 있을 수 있다.</Para>
        <Para>
          세상 어딘가에는 나와 같은 이유로 서랍 속에 귀걸이를 남겨둔 사람이
          있을지도 모른다.
        </Para>

        {/* INLINE CTA #2 — accent 톤. 강조형 */}
        <InlineCta
          variant="accent"
          eyebrow="어딘가에 반대쪽이 있다면"
          title="어딘가에 반대쪽을 가진 사람이 있다면?"
          description={
            '생각보다 많은 사람들이 같은 이유로 귀걸이 한 짝을 보관하고 있습니다.\n지금 등록된 한 짝들을 확인해보세요.'
          }
          href="/discover"
          buttonLabel="등록된 귀걸이 보기"
        />
      </Section>

      {/* H2 #7 — 보관은 희망 */}
      <Section>
        <SectionTitle>보관은 희망의 다른 이름일지도 모른다</SectionTitle>
        <Para>그래서 우리는 버리지 못한다.</Para>

        <ul className="space-y-2 my-6">
          {[
            '언젠가 찾을 수 있을지 모른다는 희망',
            '언젠가 다시 사용할 수 있을지 모른다는 희망',
            '언젠가 다시 연결될 수 있을지 모른다는 희망',
          ].map((item) => (
            <li
              key={item}
              className="rounded-tile border border-aring-green-line bg-white px-4 py-3 text-[14px] lg:text-[15px] text-aring-ink-700 break-keep"
            >
              {item}
            </li>
          ))}
        </ul>

        <Para>ARING은 바로 그 작은 희망에서 시작됐다.</Para>
        <Para>
          한 짝을 잃어버렸다고 끝이 되는 것이 아니라, 어딘가에 있을 또 다른 한
          짝과 다시 연결될 가능성.
        </Para>
        <Para className="font-semibold text-aring-ink-900">
          보관이 희망의 다른 이름이라면, 이제 그 희망을 연결할 방법도 생겼다.
        </Para>

        <Para>
          서비스 전반의 시작 이야기는{' '}
          <Link
            href="/about/story"
            className="text-aring-green font-bold underline underline-offset-2"
          >
            aring 브랜드 스토리 1편
          </Link>
          에서, 왜 검색보다 등록이 먼저인지는{' '}
          <Link
            href="/about/story/why-register-first"
            className="text-aring-green font-bold underline underline-offset-2"
          >
            2편
          </Link>
          에서 이어집니다.
        </Para>
      </Section>
    </StoryLayout>
  );
}
