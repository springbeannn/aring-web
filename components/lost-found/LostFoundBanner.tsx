import Link from 'next/link';

const IconArrow = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m13 5 7 7-7 7" />
  </svg>
);

// 홈에 마운트되는 LOST112 진입 배너.
// 메인 톤: aring-grad-green (Deep, 텍스트 흰색).
export function LostFoundBanner() {
  return (
    <section className="px-5 lg:px-8 pt-2 pb-5">
      <Link
        href="/lost-found"
        aria-label="분실물 통합 검색 페이지로 이동"
        className="relative block overflow-hidden rounded-card bg-aring-grad-green px-5 py-4 lg:px-7 lg:py-[22px] shadow-card active:scale-[0.99] transition"
      >
        {/* 블러 데코 */}
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 w-[160px] h-[160px] rounded-full opacity-25" style={{ background: 'radial-gradient(circle at center, #C5DDF0 0%, transparent 70%)' }} />
        <div aria-hidden className="pointer-events-none absolute -left-12 -bottom-12 w-[160px] h-[160px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle at center, #FBC8DC 0%, transparent 70%)' }} />

        <span className="relative inline-flex items-center gap-1.5 rounded-pill border border-white/30 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white">
          <span className="w-1.5 h-1.5 rounded-full bg-aring-accent" />
          LOST112 연결
        </span>

        <h2 className="relative mt-3 text-[18px] lg:text-[22px] leading-[1.4] font-bold tracking-tight text-white break-keep">
          혹시 잃어버린 그 한 짝,<br />
          어딘가 보관 중일지도
        </h2>
        <p className="relative mt-1.5 text-[13px] lg:text-[14px] leading-[1.55] text-white/75 break-keep">
          경찰청 분실물 데이터에서 같이 찾아드릴게요
        </p>

        <span className="relative mt-3.5 inline-flex items-center gap-1 text-[13px] lg:text-[14px] font-bold text-white">
          분실물 통합 검색
          <IconArrow className="w-3.5 h-3.5" />
        </span>
      </Link>
    </section>
  );
}
