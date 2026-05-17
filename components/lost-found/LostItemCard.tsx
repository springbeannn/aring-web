import type { LostItem } from '@/lib/lost112/types';

// ─────────────────────────────────────────────────────────────
// LostItemCard — LOST112 데이터는 이미지가 없는 경우가 많아
// 텍스트(습득장소 + 보관처)를 메인으로 잡은 카드
// ─────────────────────────────────────────────────────────────

const IconPin = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 1 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconBuilding = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h6" />
  </svg>
);

const IconPhone = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconExternal = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export function LostItemCard({ item }: { item: LostItem }) {
  const ariaLabel = `${item.title} 분실물 상세 페이지 열기, LOST112로 이동`;

  return (
    <article className="rounded-tile border border-aring-green-line bg-white overflow-hidden">
      <div className="px-4 pt-3.5 pb-4">
        {/* 메타: 출처 + 습득일 */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[11px] font-bold tracking-wider"
                style={{ background: '#E1F5EE', color: '#085041' }}>
            LOST112 자료
          </span>
          <time className="text-[11px] lg:text-[12px] font-bold text-aring-ink-400">
            {item.foundDate}{item.foundTime ? ` · ${item.foundTime}` : ''}
          </time>
        </div>

        {/* 타이틀 영역 — 텍스트가 메인 */}
        <div className="mt-2.5 flex items-start gap-3">
          {item.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt={`${item.title} 사진 (LOST112 자료)`}
              loading="lazy"
              className="w-[60px] h-[60px] rounded-tile object-cover border border-aring-green-line shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-[16px] lg:text-[17px] leading-[1.4] font-bold text-aring-ink-900 break-keep">
              {item.title}
            </h3>
            <p className="mt-0.5 text-[12px] lg:text-[13px] font-normal text-aring-ink-500 truncate">
              {item.category}
            </p>
          </div>
        </div>

        {/* 본문: 장소 / 보관처 / 전화 */}
        <dl className="mt-3 space-y-1.5 text-[13px] lg:text-[14px] leading-[1.45]">
          <div className="flex items-start gap-1.5 text-aring-ink-900">
            <IconPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-aring-green" />
            <span className="font-bold break-keep">{item.foundPlace}</span>
          </div>
          <div className="flex items-start gap-1.5 text-aring-ink-700">
            <IconBuilding className="w-3.5 h-3.5 mt-0.5 shrink-0 text-aring-ink-500" />
            <span className="font-normal break-keep">{item.storagePlace}</span>
            {item.status && (
              <span className="ml-auto shrink-0 inline-flex items-center rounded-pill px-2 py-0.5 text-[11px] font-bold bg-aring-ink-100 text-aring-ink-700">
                {item.status}
              </span>
            )}
          </div>
          {item.storagePhone && (
            <div className="flex items-center gap-1.5 text-aring-ink-700">
              <IconPhone className="w-3.5 h-3.5 shrink-0 text-aring-ink-500" />
              <a
                href={`tel:${item.storagePhone.replace(/[^0-9+]/g, '')}`}
                className="font-bold text-aring-ink-900 hover:text-aring-green transition"
              >
                {item.storagePhone}
              </a>
            </div>
          )}
        </dl>

        {/* CTA */}
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ariaLabel}
          className="mt-3.5 inline-flex items-center gap-1.5 rounded-pill bg-aring-ink-100 px-3.5 py-2 text-[13px] font-bold text-aring-ink-900 active:scale-95 transition"
        >
          LOST112에서 보기
          <IconExternal className="w-3.5 h-3.5" />
        </a>
      </div>
    </article>
  );
}
