import type { LostItem } from '@/lib/lost112/types';

// ─────────────────────────────────────────────────────────────
// LostItemCard
// - 카드 목적: "실제 유실 귀걸이 탐색 경험" — 메타정보(습득/보관/상태)를 명확히 노출
// - 이미지/설명형 콘텐츠 제거: 탐색성과 메타정보 전달이 우선
// - LOST112 CTA는 제목 우측 inline (외부 상세 즉시 이동)
// ─────────────────────────────────────────────────────────────

const IconPin = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 1 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconBuilding = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h6" />
  </svg>
);

const IconShield = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const IconPhone = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconExternal = ({ className = 'w-3 h-3' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// MetaRow — 한 줄에 [아이콘] [라벨] [값] 으로 표시.
// 값이 없으면 "정보 없음"으로 fallback (회색 처리).
function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  const hasValue = !!value?.trim();
  return (
    <div className="flex items-start gap-2.5">
      <span className="shrink-0 mt-0.5 text-aring-ink-400" aria-hidden="true">
        {icon}
      </span>
      <span className="shrink-0 w-[56px] lg:w-[64px] text-aring-ink-500 font-normal">
        {label}
      </span>
      <span
        className={
          hasValue
            ? 'flex-1 min-w-0 break-keep text-aring-ink-900 font-bold'
            : 'flex-1 min-w-0 break-keep text-aring-ink-400 font-normal'
        }
      >
        {hasValue ? value : '정보 없음'}
      </span>
    </div>
  );
}

export function LostItemCard({ item }: { item: LostItem }) {
  const ariaLabel = `${item.title} — LOST112 상세 페이지 열기 (새 창)`;

  return (
    <article className="rounded-tile border border-aring-green-line bg-white">
      <div className="p-4 lg:p-5">
        {/* 1. 제목 + 우측 LOST112 CTA inline */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="flex-1 min-w-0 text-[16px] lg:text-[18px] leading-[1.4] font-bold text-aring-ink-900 break-keep">
            {item.title}
          </h3>
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ariaLabel}
            className="shrink-0 inline-flex items-center gap-1 rounded-pill border border-aring-green-line bg-white px-3 py-1.5 text-[11px] lg:text-[12px] font-bold text-aring-ink-700 hover:border-aring-green hover:text-aring-green active:scale-95 transition whitespace-nowrap"
          >
            LOST112
            <IconExternal className="w-3 h-3" />
          </a>
        </div>

        {/* 2. 메타 3행: 습득장소 · 보관장소 · 상태 */}
        <dl className="mt-4 space-y-2.5 text-[13px] lg:text-[14px] leading-[1.45]">
          <MetaRow icon={<IconPin />} label="습득장소" value={item.foundPlace} />
          <MetaRow icon={<IconBuilding />} label="보관장소" value={item.storagePlace} />
          <MetaRow icon={<IconShield />} label="상태" value={item.status} />
        </dl>

        {/* 3. 보관처 연락 (전화번호가 있을 때만) */}
        {item.storagePhone && (
          <a
            href={`tel:${item.storagePhone.replace(/[^0-9+]/g, '')}`}
            className="mt-3 inline-flex items-center gap-1.5 text-[12px] lg:text-[13px] font-bold text-aring-green hover:underline active:scale-95 transition"
            aria-label={`보관처 ${item.storagePhone}로 전화 걸기`}
          >
            <IconPhone />
            {item.storagePhone}
          </a>
        )}

        {/* 4. 하단 메타: 등록일 + 카테고리 */}
        <div className="mt-4 pt-3 border-t border-aring-ink-100 flex items-center gap-2 flex-wrap">
          <time className="text-[11px] lg:text-[12px] font-bold text-aring-ink-500">
            {item.foundDate} 습득
            {item.foundTime ? ` · ${item.foundTime}` : ''}
          </time>
          <span className="text-aring-ink-300" aria-hidden="true">·</span>
          <span className="inline-flex items-center rounded-pill bg-aring-ink-100 px-2 py-0.5 text-[11px] lg:text-[12px] font-bold text-aring-ink-700">
            {item.category}
          </span>
        </div>
      </div>
    </article>
  );
}
