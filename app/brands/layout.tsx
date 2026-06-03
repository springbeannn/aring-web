import type { Metadata } from 'next';

const TITLE = '브랜드별 탐색 — 골든듀·스톤헨지·까르띠에 외';
const DESCRIPTION =
  '국내외 브랜드별로 귀걸이 한 짝을 탐색하세요. 골든듀, 스톤헨지, 디디에 두보, 까르띠에, 티파니앤코 등 가장 많이 등록된 브랜드부터 확인할 수 있습니다.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/brands' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://aring.app/brands',
  },
  twitter: {
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function BrandsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
