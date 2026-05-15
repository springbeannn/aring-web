import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { ScrollToTop } from '@/components/ScrollToTop';
import { IdleLogout } from '@/components/IdleLogout';
import { PageViewTracker } from '@/components/PageViewTracker';

const SITE_URL = 'https://aring.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'aring — 한 짝의 짝을 찾다',
    template: '%s | aring',
  },
  description:
    '한 짝만 남은 귀걸이를 등록하면, AI가 비슷하거나 정확히 맞는 짝을 찾아 연결해주는 매칭 서비스.',
  keywords: [
    '귀걸이 한 짝',
    '귀걸이 분실',
    '귀걸이 매칭',
    '잃어버린 귀걸이',
    '귀걸이 짝 찾기',
    '귀걸이 중고거래',
    '비대칭 귀걸이',
    'earring matching',
    'lost earring',
    'single earring',
  ],
  applicationName: 'aring',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: SITE_URL,
    siteName: 'aring',
    title: 'aring — 한 짝의 짝을 찾다',
    description:
      '한 짝만 남은 귀걸이를 등록하면, AI가 비슷하거나 정확히 맞는 짝을 찾아 연결해주는 매칭 서비스.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'aring — 한 짝의 짝을 찾다',
    description:
      '한 짝만 남은 귀걸이를 등록하면, AI가 비슷하거나 정확히 맞는 짝을 찾아 연결해주는 매칭 서비스.',
  },
  verification: {
    other: {
      'naver-site-verification': '3191773a36cc5fbe3950dd20e62bc4fc625a3253',
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2A4A3C',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'aring',
      alternateName: '아링',
      url: SITE_URL,
      description:
        '한 짝만 남은 귀걸이를 등록하면, AI가 비슷하거나 정확히 맞는 짝을 찾아 연결해주는 매칭 서비스.',
      slogan: '한 짝의 짝',
      email: 'aring.official@gmail.com',
      areaServed: { '@type': 'Country', name: 'KR' },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'aring',
      inLanguage: 'ko-KR',
      description:
        '귀걸이 한 짝을 잃어버린 사람들이 잃어버린 짝을 찾거나 비슷한 디자인의 짝을 구할 수 있도록 연결해주는 매칭 플랫폼.',
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Service',
      '@id': `${SITE_URL}/#service`,
      name: 'aring 귀걸이 매칭',
      serviceType: '귀걸이 한 짝 매칭 및 중고거래 플랫폼',
      provider: { '@id': `${SITE_URL}/#organization` },
      areaServed: { '@type': 'Country', name: 'KR' },
      audience: {
        '@type': 'Audience',
        audienceType:
          '귀걸이 한 짝을 잃어버린 사람, 짝이 맞지 않는 귀걸이를 가진 사람, 비대칭 스타일링을 원하는 사람',
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'KRW',
        availability: 'https://schema.org/InStock',
      },
      category: ['패션', '주얼리', '중고거래', '매칭 플랫폼'],
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'aring은 무엇인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'aring(아링)은 귀걸이 한 짝을 잃어버렸거나 짝이 맞지 않는 귀걸이를 가진 사람들이 서로 연결될 수 있는 매칭 플랫폼입니다. 남은 한 짝을 사진으로 등록하면 AI가 유사하거나 정확히 맞는 짝을 찾아드립니다.',
          },
        },
        {
          '@type': 'Question',
          name: '귀걸이 한 짝을 잃어버렸는데 aring에서 찾을 수 있나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '네, 남은 한 짝의 사진을 등록하면 AI가 모양·소재·색상·브랜드를 분석해 유사한 디자인을 매칭합니다. 동일한 짝을 찾거나 비슷한 디자인으로 대체할 수 있습니다.',
          },
        },
        {
          '@type': 'Question',
          name: '어떻게 사용하나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '1) 잃어버린 귀걸이의 남은 한 짝을 사진으로 등록 → 2) AI가 모양·소재·색상·브랜드를 자동 분석 → 3) 비슷하거나 동일한 짝을 가진 다른 사용자와 댓글로 연결. 직접 탐색이나 사진 검색도 가능합니다.',
          },
        },
        {
          '@type': 'Question',
          name: '무료로 사용할 수 있나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '네, aring의 기본 서비스(등록·매칭·탐색·댓글)는 모두 무료입니다.',
          },
        },
        {
          '@type': 'Question',
          name: '어떤 브랜드 귀걸이를 등록할 수 있나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '국내 브랜드(골든듀, 스톤헨지, 제이에스티나, 로이드, 디디에 두보, 로즈몽 등)와 해외 브랜드(까르띠에, 반클리프 아펠, 불가리, 티파니앤코, 샤넬, 디올, 에르메스, 판도라, 스와로브스키 등) 모두 등록 가능합니다. 핸드메이드와 빈티지 제품도 포함됩니다.',
          },
        },
        {
          '@type': 'Question',
          name: '한 짝만 남은 명품 귀걸이도 거래할 수 있나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '네, aring은 한 짝만 남은 귀걸이의 가치를 인정하고 동일한 짝을 찾는 사람들과 연결합니다. 브랜드 명품도 짝을 잃었다면 등록해보세요.',
          },
        },
        {
          '@type': 'Question',
          name: '비대칭으로 한 쌍을 맞춰 쓰는 것도 가능한가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '가능합니다. aring은 정확한 짝뿐 아니라 비대칭 스타일링을 원하는 사용자에게도 어울리는 한 짝을 추천합니다.',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        <Suspense fallback={null}>
          <ScrollToTop />
        </Suspense>
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <IdleLogout />
        {children}
      </body>
    </html>
  );
}
