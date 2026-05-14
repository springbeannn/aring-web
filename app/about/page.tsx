import type { Metadata } from 'next';
import Link from 'next/link';
import { TopNav } from '@/components/Nav';

export const metadata: Metadata = {
  title: 'aring 소개 — 한 짝의 짝을 찾다',
  description:
    'aring은 귀걸이 한 짝을 잃어버린 사람들이 잃어버린 짝을 찾거나, 비슷한 디자인의 짝을 구할 수 있도록 연결해주는 매칭 플랫폼입니다. 사진을 등록하면 AI가 모양·소재·색상·브랜드를 분석해 어울리는 짝을 추천합니다.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'aring 소개 — 한 짝의 짝을 찾다',
    description:
      '한 짝만 남은 귀걸이를 등록하면 AI가 비슷하거나 정확히 맞는 짝을 찾아드립니다. 무료, 모바일 최적화.',
    url: 'https://aring.app/about',
  },
};

type Step = { num: string; title: string; body: string };
type Feature = { title: string; body: string };
type Faq = { q: string; a: string };

const STEPS: Step[] = [
  {
    num: '01',
    title: '한 짝 사진 등록',
    body: '잃어버린 귀걸이의 남은 한 짝을 사진으로 업로드합니다. 브랜드와 사연을 함께 적어두면 매칭 가능성이 높아집니다.',
  },
  {
    num: '02',
    title: 'AI가 자동 분석',
    body: 'aring의 AI가 사진을 보고 모양·소재·색상·브랜드를 자동으로 인식합니다. 유사한 디자인의 다른 등록물을 자동으로 매칭합니다.',
  },
  {
    num: '03',
    title: '댓글로 연결',
    body: '비슷한 짝을 가진 다른 사용자가 보이면 댓글로 소통하여 거래·교환·연결할 수 있습니다.',
  },
];

const FEATURES: Feature[] = [
  {
    title: 'AI 사진 매칭',
    body: '업로드한 사진을 분석해 모양·소재·색상이 비슷한 귀걸이를 자동으로 찾아냅니다.',
  },
  {
    title: '브랜드 탐색',
    body: '국내·해외 주얼리 브랜드별로 등록된 한 짝을 모아 볼 수 있습니다.',
  },
  {
    title: '필터 검색',
    body: '모양·소재·가격대·상태별로 원하는 한 짝을 빠르게 찾을 수 있습니다.',
  },
  {
    title: '사진으로 검색',
    body: '내가 가진 한 짝과 비슷한 디자인을 사진 업로드만으로 즉시 탐색할 수 있습니다.',
  },
  {
    title: '댓글 소통',
    body: '관심 있는 한 짝의 등록자와 댓글로 자유롭게 거래·교환 문의를 할 수 있습니다.',
  },
];

const FAQS: Faq[] = [
  {
    q: 'aring은 무엇인가요?',
    a: 'aring(아링)은 귀걸이 한 짝을 잃어버렸거나 짝이 맞지 않는 귀걸이를 가진 사람들이 서로 연결될 수 있는 매칭 플랫폼입니다. 남은 한 짝을 사진으로 등록하면 AI가 유사하거나 정확히 맞는 짝을 찾아드립니다.',
  },
  {
    q: '귀걸이 한 짝을 잃어버렸는데 aring에서 찾을 수 있나요?',
    a: '네, 남은 한 짝의 사진을 등록하면 AI가 모양·소재·색상·브랜드를 분석해 유사한 디자인을 매칭합니다. 동일한 짝을 찾거나 비슷한 디자인으로 대체할 수 있습니다.',
  },
  {
    q: '어떻게 사용하나요?',
    a: '① 남은 한 짝을 사진으로 등록 → ② AI가 자동 분석 → ③ 비슷한 짝을 가진 사용자와 댓글로 연결. 직접 탐색이나 사진 검색도 가능합니다.',
  },
  {
    q: '무료로 사용할 수 있나요?',
    a: '네, aring의 기본 서비스(등록·매칭·탐색·댓글)는 모두 무료입니다.',
  },
  {
    q: '어떤 브랜드 귀걸이를 등록할 수 있나요?',
    a: '국내 브랜드(골든듀, 스톤헨지, 제이에스티나, 로이드, 디디에 두보, 로즈몽 등)와 해외 브랜드(까르띠에, 반클리프 아펠, 불가리, 티파니앤코, 샤넬, 디올, 에르메스, 판도라, 스와로브스키 등) 모두 등록 가능합니다. 핸드메이드와 빈티지 제품도 포함됩니다.',
  },
  {
    q: '한 짝만 남은 명품 귀걸이도 거래할 수 있나요?',
    a: '네, aring은 한 짝만 남은 귀걸이의 가치를 인정하고 동일한 짝을 찾는 사람들과 연결합니다. 브랜드 명품도 짝을 잃었다면 등록해보세요.',
  },
  {
    q: '비대칭으로 한 쌍을 맞춰 쓰는 것도 가능한가요?',
    a: '가능합니다. aring은 정확한 짝뿐 아니라 비대칭 스타일링을 원하는 사용자에게도 어울리는 한 짝을 추천합니다.',
  },
  {
    q: '어떤 사진을 올려야 매칭이 잘 되나요?',
    a: '귀걸이가 화면 중앙에 또렷하게 보이는 단색 배경의 정면 사진이 가장 좋습니다. 너무 어둡거나 흐릿한 사진은 AI 분석 정확도가 떨어질 수 있습니다.',
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:rounded-none lg:shadow-none">
        <TopNav />

        <div className="px-5 pt-4 pb-24 lg:px-14 lg:pt-12 lg:pb-20 lg:max-w-[820px] lg:mx-auto">
          {/* Hero */}
          <header className="mb-10 lg:mb-14">
            <p className="text-[12px] lg:text-[13px] font-bold tracking-[0.12em] text-aring-green uppercase mb-3">
              aring 소개
            </p>
            <h1 className="text-[28px] lg:text-[36px] font-bold tracking-tight text-aring-ink-900 leading-snug mb-4 break-keep">
              한 짝만 남은 귀걸이의<br />
              짝을 찾아드립니다
            </h1>
            <p className="text-[15px] lg:text-[17px] leading-relaxed text-aring-ink-500 break-keep">
              aring(아링)은 한 짝만 남은 귀걸이를 등록하면 AI가 모양·소재·색상·브랜드를 분석해
              비슷하거나 정확히 맞는 짝을 가진 다른 사용자와 연결해주는 무료 매칭 플랫폼입니다.
            </p>
          </header>

          {/* How it works */}
          <section className="mb-12 lg:mb-16">
            <h2 className="text-[20px] lg:text-[24px] font-bold text-aring-ink-900 mb-5 lg:mb-7">
              어떻게 작동하나요
            </h2>
            <ol className="grid gap-3 lg:grid-cols-3 lg:gap-4">
              {STEPS.map((s) => (
                <li
                  key={s.num}
                  className="rounded-card border border-aring-green-line bg-white p-5 lg:p-6 shadow-card"
                >
                  <span className="inline-block text-[11px] lg:text-[12px] font-bold tracking-[0.1em] text-aring-green mb-3">
                    STEP {s.num}
                  </span>
                  <h3 className="text-[16px] lg:text-[18px] font-bold text-aring-ink-900 mb-2 break-keep">
                    {s.title}
                  </h3>
                  <p className="text-[14px] lg:text-[15px] text-aring-ink-500 leading-relaxed break-keep">
                    {s.body}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* Who it's for */}
          <section className="mb-12 lg:mb-16">
            <h2 className="text-[20px] lg:text-[24px] font-bold text-aring-ink-900 mb-5 lg:mb-7">
              누구를 위한 서비스인가요
            </h2>
            <ul className="space-y-3 lg:space-y-4">
              <li className="rounded-tile bg-aring-ink-50 px-5 py-4 lg:px-6 lg:py-5">
                <p className="text-[15px] lg:text-[16px] text-aring-ink-700 leading-relaxed break-keep">
                  <span className="font-bold text-aring-ink-900">짝을 잃어버린 분</span> — 아끼던
                  귀걸이 한 짝을 잃어버려 다시 한 쌍으로 만들고 싶은 분
                </p>
              </li>
              <li className="rounded-tile bg-aring-ink-50 px-5 py-4 lg:px-6 lg:py-5">
                <p className="text-[15px] lg:text-[16px] text-aring-ink-700 leading-relaxed break-keep">
                  <span className="font-bold text-aring-ink-900">한 짝만 남은 분</span> — 짝을 잃어
                  서랍 속에 두고 있는 한 짝의 새 주인을 찾고 싶은 분
                </p>
              </li>
              <li className="rounded-tile bg-aring-ink-50 px-5 py-4 lg:px-6 lg:py-5">
                <p className="text-[15px] lg:text-[16px] text-aring-ink-700 leading-relaxed break-keep">
                  <span className="font-bold text-aring-ink-900">비대칭 스타일링을 즐기는 분</span>{' '}
                  — 양쪽에 서로 다른 디자인을 매치해 스타일링하고 싶은 분
                </p>
              </li>
            </ul>
          </section>

          {/* Features */}
          <section className="mb-12 lg:mb-16">
            <h2 className="text-[20px] lg:text-[24px] font-bold text-aring-ink-900 mb-5 lg:mb-7">
              주요 기능
            </h2>
            <ul className="grid gap-3 lg:grid-cols-2 lg:gap-4">
              {FEATURES.map((f) => (
                <li
                  key={f.title}
                  className="rounded-tile border border-aring-green-line bg-white px-5 py-4 lg:px-6 lg:py-5"
                >
                  <h3 className="text-[15px] lg:text-[17px] font-bold text-aring-ink-900 mb-1.5 break-keep">
                    {f.title}
                  </h3>
                  <p className="text-[14px] lg:text-[15px] text-aring-ink-500 leading-relaxed break-keep">
                    {f.body}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* FAQ */}
          <section className="mb-12 lg:mb-16">
            <h2 className="text-[20px] lg:text-[24px] font-bold text-aring-ink-900 mb-5 lg:mb-7">
              자주 묻는 질문
            </h2>
            <div className="space-y-5 lg:space-y-6">
              {FAQS.map((f) => (
                <article key={f.q} className="border-b border-aring-ink-100 pb-5 lg:pb-6 last:border-b-0">
                  <h3 className="text-[16px] lg:text-[18px] font-bold text-aring-ink-900 mb-2 break-keep">
                    Q. {f.q}
                  </h3>
                  <p className="text-[14px] lg:text-[16px] text-aring-ink-500 leading-relaxed break-keep">
                    {f.a}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="mb-10">
            <div className="rounded-card bg-aring-grad-green border border-aring-green-line p-6 lg:p-8 text-center shadow-card">
              <h2 className="text-[20px] lg:text-[24px] font-bold text-aring-ink-900 mb-2 break-keep">
                지금 한 짝의 짝을 찾아보세요
              </h2>
              <p className="text-[14px] lg:text-[15px] text-aring-ink-500 mb-5 break-keep">
                사진 한 장이면 충분합니다. 가입 없이도 둘러볼 수 있어요.
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

          {/* Contact */}
          <section>
            <h2 className="text-[16px] lg:text-[18px] font-bold text-aring-ink-900 mb-3">연락처</h2>
            <p className="text-[14px] lg:text-[15px] text-aring-ink-500 leading-relaxed">
              운영자 이메일:{' '}
              <a
                href="mailto:aring.official@gmail.com"
                className="font-bold text-aring-ink-900 underline"
              >
                aring.official@gmail.com
              </a>
            </p>
            <p className="text-[14px] lg:text-[15px] text-aring-ink-500 leading-relaxed mt-2">
              <Link href="/terms/service" className="underline">이용약관</Link>
              <span className="mx-2 text-aring-ink-300">·</span>
              <Link href="/terms/privacy" className="underline">개인정보처리방침</Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
