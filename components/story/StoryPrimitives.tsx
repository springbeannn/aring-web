// 스토리 페이지 본문용 타이포 빌딩블록
// — Section / SectionTitle / Para / Pullquote
// 기존 /about/story 페이지에서 사용하던 inline 컴포넌트를 그대로 추출

import type React from 'react';

export function Section({ children }: { children: React.ReactNode }) {
  return <section className="mb-10 lg:mb-14">{children}</section>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[20px] lg:text-[26px] font-bold text-aring-ink-900 mb-5 lg:mb-7 break-keep">
      {children}
    </h2>
  );
}

export function Para({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={[
        'text-[15px] lg:text-[17px] leading-[1.85] text-aring-ink-700 mb-4 break-keep',
        className ?? '',
      ].join(' ')}
    >
      {children}
    </p>
  );
}

export function Pullquote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-6 lg:my-8 pl-5 lg:pl-6 border-l-[3px] border-aring-green text-[16px] lg:text-[19px] font-bold leading-[1.7] text-aring-ink-900 break-keep">
      {children}
    </blockquote>
  );
}
