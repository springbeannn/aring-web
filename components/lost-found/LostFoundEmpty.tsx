// 빈 상태 — 결과가 없을 때 LOST112 직접 링크는 항상 노출
export function LostFoundEmpty({
  title = '아직 등록된 분실물이 없어요',
  description = '조건을 바꾸거나, LOST112에서 직접 확인해보세요.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="px-5 lg:px-8 py-16 text-center">
      <p className="text-[15px] lg:text-[16px] font-bold text-aring-ink-900">{title}</p>
      <p className="mt-1 text-[13px] lg:text-[14px] leading-[1.5] text-aring-ink-500">
        {description}
      </p>
      <a
        href="https://www.lost112.go.kr"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center justify-center px-5 py-2.5 rounded-pill bg-aring-ink-900 text-white text-[13px] font-bold active:scale-95 transition"
      >
        LOST112에서 직접 검색
      </a>
    </div>
  );
}
