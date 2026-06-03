import type { Metadata } from 'next';

const TITLE = '전체 한 짝 — 매칭을 기다리는 귀걸이';
const DESCRIPTION =
  'aring에 등록된 모든 귀걸이 한 짝을 한곳에서 살펴보세요. 지금 짝을 기다리는 한 짝들을 브랜드·가격으로 빠르게 확인할 수 있습니다.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/products' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://aring.app/products',
  },
  twitter: {
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
