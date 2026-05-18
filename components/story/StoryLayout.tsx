// aring 브랜드 스토리 페이지 공용 레이아웃
// — TopNav · 폰 프레임 컨테이너 · 히어로(eyebrow + H1 + intro) · 본문 슬롯 · 하단 시리즈 네비
// — 페이지 진입 시 .story-fade-in 으로 부드러운 등장(globals.css 키프레임)

import type React from 'react';
import { TopNav } from '@/components/Nav';
import StoryNavigation from './StoryNavigation';

type Props = {
  /** 상단 eyebrow 라벨 (예: "STORY 02 · ARING") — 생략 시 미표시 */
  eyebrow?: string;
  /** 페이지 H1. `\n` 줄바꿈 지원 (whitespace-pre-line) */
  title: string;
  /** 히어로 인트로 한 단락 */
  intro: React.ReactNode;
  /** 본문 — Section/Para/Pullquote 등으로 구성 */
  children: React.ReactNode;
  /** 본문 하단 CTA 슬롯 (선택). 시리즈 네비 위에 렌더됨 */
  cta?: React.ReactNode;
  /** JSON-LD 등 페이지 단위 사이드 슬롯 */
  head?: React.ReactNode;
};

export default function StoryLayout({
  eyebrow,
  title,
  intro,
  children,
  cta,
  head,
}: Props) {
  return (
    <main className="min-h-screen flex justify-center bg-white">
      {head}
      <div className="relative w-full max-w-[440px] bg-white min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:rounded-none lg:shadow-none">
        <TopNav />

        <article className="story-fade-in px-5 pt-4 pb-20 lg:px-14 lg:pt-12 lg:pb-24 lg:max-w-[760px] lg:mx-auto">
          <header className="mb-10 lg:mb-14">
            {eyebrow && (
              <p className="text-[11px] lg:text-[12px] font-bold tracking-[0.18em] text-aring-green uppercase mb-3">
                {eyebrow}
              </p>
            )}
            <h1 className="text-[26px] lg:text-[34px] font-bold tracking-tight text-aring-ink-900 leading-snug break-keep mb-4 lg:mb-5 whitespace-pre-line">
              {title}
            </h1>
            <p className="text-[15px] lg:text-[17px] leading-[1.85] text-aring-ink-700 break-keep">
              {intro}
            </p>
          </header>

          {children}

          {cta}

          <StoryNavigation />
        </article>
      </div>
    </main>
  );
}
