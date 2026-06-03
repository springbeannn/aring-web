import type { Metadata } from 'next';

const TITLE = '탐색 — 모양·소재·브랜드로 한 짝 찾기';
const DESCRIPTION =
  'aring에 등록된 귀걸이 한 짝을 모양·소재·가격대·브랜드로 좁혀 탐색하세요. 잃어버린 한 짝의 짝을 빠르게 찾을 수 있습니다.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/discover' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://aring.app/discover',
  },
  twitter: {
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
