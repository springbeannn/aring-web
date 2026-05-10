import Link from 'next/link';

export interface CaseListItemData {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string | null;
  tags: string[];
  published_at: string;
  is_featured: boolean;
}

interface Props {
  item: CaseListItemData;
}

export function ListItem({ item }: Props) {
  if (item.is_featured) return <FeaturedItem item={item} />;
  return <DefaultItem item={item} />;
}

// ─────────────────────────────────────────────────
// Default (일반) 항목 — 흰 배경, 토스피드 스타일
// ─────────────────────────────────────────────────
function DefaultItem({ item }: Props) {
  return (
    <Link
      href={`/cases/${item.slug}`}
      className="group block border-b border-aring-gray-light px-5 py-7 hover:bg-aring-pastel-green/30 transition-colors"
    >
      {item.category && (
        <p className="text-[11px] font-bold tracking-[0.15em] text-aring-olive uppercase mb-2">
          {item.category}
        </p>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-[20px] sm:text-[22px] font-bold text-aring-black leading-snug mb-1.5 group-hover:text-aring-olive transition-colors">
            {item.title}
          </h2>
          <p className="text-[16px] text-aring-gray leading-relaxed line-clamp-2">
            {item.summary}
          </p>
          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {item.tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center px-2 py-0.5 rounded-full bg-aring-pastel-blue text-[11px] font-semibold text-aring-black"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
        <span
          aria-hidden
          className="text-aring-olive text-[24px] font-bold shrink-0 group-hover:translate-x-1 transition-transform"
        >
          →
        </span>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────
// Featured 항목 — 검정 배경 + 흰 텍스트 + 올리브 배지
// ─────────────────────────────────────────────────
function FeaturedItem({ item }: Props) {
  return (
    <Link
      href={`/cases/${item.slug}`}
      className="group block border-b border-aring-gray-light bg-aring-black px-5 py-8 hover:bg-aring-black/90 transition-colors"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-aring-olive text-white text-[10px] font-bold tracking-[0.15em] uppercase">
          Featured
        </span>
        {item.category && (
          <span className="text-[11px] font-bold tracking-[0.15em] text-aring-olive-light uppercase">
            {item.category}
          </span>
        )}
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-[24px] sm:text-[26px] font-bold text-white leading-snug mb-2">
            {item.title}
          </h2>
          <p className="text-[16px] text-white/70 leading-relaxed line-clamp-2">
            {item.summary}
          </p>
          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {item.tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/15 text-[11px] font-semibold text-white"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
        <span
          aria-hidden
          className="text-aring-olive-light text-[28px] font-bold shrink-0 group-hover:translate-x-1 transition-transform"
        >
          →
        </span>
      </div>
    </Link>
  );
}
