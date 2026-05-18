import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TopNav, BottomNav } from '@/components/Nav';
import { LostFoundGrid } from '@/components/lost-found/LostFoundGrid';
import { LostFoundEmpty } from '@/components/lost-found/LostFoundEmpty';
import { LostFoundFilter } from '@/components/lost-found/LostFoundFilter';
import { fetchLostFoundList } from '@/lib/lost112/client';
import { LOST_FOUND_REVALIDATE_SECONDS } from '@/lib/lost112/constants';

// LOST112 OpenAPI 신규 발급 경로가 폐쇄되어 실제 데이터 연결은 보류 중.
// 페이지는 mock fallback으로 노출(robots noindex 유지 → 색인 차단).
// 키 확보 후 실제 데이터로 자동 전환되며, 색인 허용 시 robots 블록 제거.
const LOST_FOUND_ENABLED: boolean = true;

export const revalidate = LOST_FOUND_REVALIDATE_SECONDS;

const SITE_URL = 'https://aring.app';
const PAGE_URL = `${SITE_URL}/lost-found`;
const PAGE_TITLE = '분실물 통합 검색 · aring';
const PAGE_DESCRIPTION =
  '경찰청 LOST112와 연결된 액세서리 분실물을 aring에서 확인하세요. 직접 거래는 불가, 보관처에 문의해 확인할 수 있어요.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/lost-found' },
  robots: LOST_FOUND_ENABLED
    ? undefined
    : { index: false, follow: false, googleBot: { index: false, follow: false } },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
  },
};

// ─────────────────────────────────────────────
// FAQ — LOST112 통합 페이지에 자주 묻는 질문
// (STORY 01/02와 동일한 패턴: 화면 표시 + JSON-LD FAQPage 스키마)
// ─────────────────────────────────────────────
type Faq = {
  q: string;
  a: string;
  /** Schema.org FAQPage용 압축형 답변 */
  aSchema: string;
};

const FAQS: Faq[] = [
  {
    q: '여기 올라온 분실물을 aring에서 바로 거래할 수 있나요?',
    a: '아니요. 이 페이지의 정보는 경찰청 LOST112가 보관 중인 분실물 자료입니다. aring에서는 거래가 이루어지지 않으며, 본인 소유로 보이는 한 짝을 발견하셨다면 카드에 표시된 보관처에 직접 문의해 신원·소유 확인 절차를 진행해 주세요.',
    aSchema:
      '이 페이지의 분실물은 LOST112 보관 자료입니다. aring에서는 거래되지 않으며, 본인 소유로 보이는 한 짝을 발견하면 표시된 보관처에 직접 문의해 확인해야 합니다.',
  },
  {
    q: '이 분실물 정보는 어디서 오는 건가요?',
    a: '경찰청이 운영하는 유실물 통합포털 LOST112(www.lost112.go.kr)의 공공 API에서 가져옵니다. 전국 경찰서·지하철 유실물센터 등에 접수·보관 중인 습득물이 그 출처입니다. aring은 이 중 액세서리(귀걸이 등) 카테고리만 추려서 보여드립니다.',
    aSchema:
      '경찰청 LOST112(www.lost112.go.kr)의 공공 API 데이터를 가져옵니다. 전국 경찰서·지하철 유실물센터에 접수된 습득물 중 액세서리 카테고리만 보여드립니다.',
  },
  {
    q: '내 귀걸이 같은 한 짝을 발견했어요. 무엇부터 해야 하나요?',
    a: '먼저 카드에 표시된 보관처 연락처로 직접 전화해 해당 분실물이 아직 보관 중인지 확인해 주세요. 방문 시에는 신분증과 함께 소유를 증명할 수 있는 자료(구매 영수증, 같은 모델의 반대쪽 사진, SNS 착용 사진 등)를 준비해 가시는 편이 좋습니다.',
    aSchema:
      '카드에 표시된 보관처로 전화해 보관 여부를 먼저 확인하고, 신분증과 소유 증빙 자료(영수증·반대쪽 사진 등)를 준비해 방문하세요.',
  },
  {
    q: '왜 사진이 없는 분실물이 많은가요?',
    a: 'LOST112 원본 데이터 자체에 사진이 등록되지 않은 경우가 많아서 그렇습니다. 그래서 aring 카드는 사진 대신 “습득 장소”와 “보관처”를 가장 크게 보여드립니다. 같은 장소·날짜에 분실하신 기억이 있다면, 사진이 없더라도 보관처에 문의해 확인해 보시는 편이 좋습니다.',
    aSchema:
      'LOST112 원본 데이터에 사진이 등록되지 않은 경우가 많기 때문입니다. 사진이 없어도 습득 장소·날짜가 본인 분실 기억과 맞으면 보관처에 문의해 확인하세요.',
  },
  {
    q: '정보는 얼마나 자주 업데이트되나요?',
    a: '서비스 부하와 공공 API 트래픽을 고려해 1시간 간격으로 갱신됩니다. 갱신 직후라면 LOST112에 새로 등록된 분실물이 반영되기까지 짧은 시차가 있을 수 있습니다. 빠른 확인이 필요한 경우에는 LOST112 공식 사이트에서 직접 검색해 주세요.',
    aSchema:
      '1시간 간격으로 갱신됩니다. 갱신 직후 등록된 항목은 잠시 후 반영되며, 빠른 확인이 필요하면 LOST112 공식 사이트에서 직접 검색할 수 있습니다.',
  },
  {
    q: 'aring 사용자들이 등록한 한 짝과는 무엇이 다른가요?',
    a: 'aring 한 짝 등록은 사용자가 보관 중인 귀걸이를 다른 사용자와 매칭·거래하기 위한 데이터이고, 이 페이지의 LOST112 자료는 누군가가 잃어버려 경찰청·유실물센터에 보관 중인 물건입니다. 거래 채널과 확인 경로가 완전히 다르니, 본인이 잃어버린 한 짝을 찾는 중이라면 두 곳 모두 확인하시는 편이 좋습니다.',
    aSchema:
      'aring 한 짝 등록은 사용자 간 매칭·거래용 데이터, LOST112 자료는 보관 중인 습득물 정보입니다. 잃어버린 한 짝을 찾는다면 두 곳 모두 확인하는 것이 좋습니다.',
  },
];

// ─────────────────────────────────────────────
// JSON-LD: BreadcrumbList + FAQPage
// ─────────────────────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      '@id': `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: '분실물 통합 검색', item: PAGE_URL },
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
  ],
};

const IconArrowLeft = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

export default async function LostFoundPage() {
  if (!LOST_FOUND_ENABLED) notFound();

  const result = await fetchLostFoundList({ numOfRows: 30 });
  const { items, totalCount, isMock } = result;

  return (
    <main className="min-h-screen flex justify-center bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
        <div className="pb-28 lg:pb-10">
          <TopNav />

          {/* 페이지 헤더 */}
          <div className="px-5 lg:px-8 pt-3 lg:pt-7 pb-4 flex items-center gap-3">
            <Link
              href="/"
              aria-label="홈으로"
              className="lg:hidden w-9 h-9 rounded-full bg-aring-ink-100 flex items-center justify-center text-aring-ink-900 active:scale-95 transition"
            >
              <IconArrowLeft />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-[24px] lg:text-[26px] font-bold tracking-tight text-aring-ink-900">
                어딘가 잃어버린 한 짝
              </h1>
              <p className="mt-0.5 text-[13px] lg:text-[14px] leading-[1.55] text-aring-ink-500 break-keep">
                경찰청 LOST112와 연결된 액세서리 분실물이에요.
                <br className="sm:hidden" />
                {' '}직접 거래는 불가, 보관처에 문의해 확인해보세요.
                {totalCount > 0 && (
                  <>
                    {' '}· 총 <span className="font-semibold">{totalCount}</span>건
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Mock 안내 (실제 API 키 없을 때) */}
          {isMock && (
            <div className="mx-5 lg:mx-8 mb-3 rounded-tile border border-aring-green-line bg-aring-grad-pastel/40 px-3 py-2 text-[11px] lg:text-[12px] font-bold text-aring-ink-700"
                 style={{ background: '#FFF7E6' }}>
              샘플 데이터입니다. 공공데이터포털 서비스키 발급 후 실제 데이터로 전환됩니다.
            </div>
          )}

          {/* 필터 (Phase 1 UI placeholder) */}
          <LostFoundFilter />

          {/* 본문 */}
          {items.length === 0 ? (
            <LostFoundEmpty
              title="조건에 맞는 분실물이 없어요"
              description="잠시 후 다시 시도하거나 LOST112에서 직접 확인해보세요."
            />
          ) : (
            <LostFoundGrid items={items} />
          )}

          {/* FAQ */}
          <section className="mt-10 lg:mt-14 px-5 lg:px-8">
            <h2 className="text-[18px] lg:text-[22px] font-bold tracking-tight text-aring-ink-900 mb-4 lg:mb-5">
              자주 묻는 질문
            </h2>
            <div className="space-y-5 lg:space-y-6">
              {FAQS.map((f) => (
                <article
                  key={f.q}
                  className="border-b border-aring-ink-100 pb-5 lg:pb-6 last:border-b-0"
                >
                  <h3 className="text-[15px] lg:text-[17px] font-bold text-aring-ink-900 mb-2 break-keep">
                    Q. {f.q}
                  </h3>
                  <p className="text-[14px] lg:text-[15px] text-aring-ink-700 leading-[1.8] break-keep">
                    {f.a}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* 출처·안내 */}
          <div className="mt-8 mx-5 lg:mx-8 rounded-tile border border-aring-green-line bg-aring-ink-100 px-4 py-3.5 text-[12px] lg:text-[13px] leading-[1.6] text-aring-ink-500 break-keep">
            <p>
              이 정보는 LOST112 자료입니다. aring에서는 거래되지 않으며, 직접 보관처에
              문의해 확인하세요.
            </p>
            <p className="mt-1.5">
              자료 출처: 경찰청 유실물 통합포털 LOST112 (
              <a
                href="https://www.lost112.go.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-aring-green hover:underline"
              >
                www.lost112.go.kr
              </a>
              )
            </p>
          </div>
        </div>
        <BottomNav />
      </div>
    </main>
  );
}
