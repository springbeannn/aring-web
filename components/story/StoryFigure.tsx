// 스토리 본문용 이미지 블록
// — next/image 기반(자동 최적화·lazy), 디자인 토큰(rounded-card / border-aring-green-line)
// — alt 필수(SEO·접근성), caption 선택, 첫 화면 노출 이미지는 priority

import Image from 'next/image';

type Props = {
  /** /public 기준 절대경로 (예: /images/story/cant-throw-away/drawer-pouch.png) */
  src: string;
  /** 대체 텍스트 — 검색엔진·스크린리더용. 장면을 구체적으로 */
  alt: string;
  /** 원본 픽셀 너비 — 레이아웃 시프트 방지용 */
  width: number;
  /** 원본 픽셀 높이 */
  height: number;
  /** 이미지 아래 설명 캡션 (선택) */
  caption?: string;
  /** 히어로 등 첫 화면 이미지면 true (lazy 해제) */
  priority?: boolean;
};

export default function StoryFigure({
  src,
  alt,
  width,
  height,
  caption,
  priority = false,
}: Props) {
  return (
    <figure className="my-8 lg:my-12">
      <div className="overflow-hidden rounded-card border border-aring-green-line bg-aring-green-bg">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="(min-width: 1024px) 760px, 100vw"
          priority={priority}
          className="w-full h-auto"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-[12px] lg:text-[13px] text-aring-ink-400 break-keep">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
