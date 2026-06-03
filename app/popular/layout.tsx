import type { Metadata } from 'next';

const TITLE = '인기 한 짝 — 오늘의 매칭 후보';
const DESCRIPTION =
  '지금 가장 많이 조회되는 귀걸이 한 짝을 모았습니다. 누군가가 짝을 찾고 있는 인기 한 짝을 aring에서 확인하세요.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/popular' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://aring.app/popular',
  },
  twitter: {
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function PopularLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
