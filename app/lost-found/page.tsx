import type { Metadata } from 'next';
import Link from 'next/link';
import { TopNav, BottomNav } from '@/components/Nav';
import { LostFoundGrid } from '@/components/lost-found/LostFoundGrid';
import { LostFoundEmpty } from '@/components/lost-found/LostFoundEmpty';
import { LostFoundFilter } from '@/components/lost-found/LostFoundFilter';
import { fetchLostFoundList } from '@/lib/lost112/client';
import { LOST_FOUND_REVALIDATE_SECONDS } from '@/lib/lost112/constants';

export const revalidate = LOST_FOUND_REVALIDATE_SECONDS;

export const metadata: Metadata = {
  title: '분실물 통합 검색 · aring',
  description:
    '경찰청 LOST112와 연결된 액세서리 분실물을 aring에서 확인하세요. 직접 거래는 불가, 보관처에 문의해 확인할 수 있어요.',
};

const IconArrowLeft = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

export default async function LostFoundPage() {
  const result = await fetchLostFoundList({ numOfRows: 30 });
  const { items, totalCount, isMock } = result;

  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
        <div className="pb-28 lg:pb-10">
          <TopNav />

          {/* 페이지 헤더 */}
          <div className="px-5 lg:px-8 pt-3 lg:pt-7 pb-4 flex items-center gap-3">
            <Link
              href="/"
              aria-label="홈으로"
              className="lg:hidden w-9 h-9 rounded-full bg-aring-ink-100 flex items-center justify-center text-aring-ink-900 active:scale-95 transition"
            >
              <IconArrowLeft />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-[24px] lg:text-[26px] font-bold tracking-tight text-aring-ink-900">
                어딘가 잃어버린 한 짝
              </h1>
              <p className="mt-0.5 text-[13px] lg:text-[14px] leading-[1.55] text-aring-ink-500 break-keep">
                경찰청 LOST112와 연결된 액세서리 분실물이에요.
                <br className="sm:hidden" />
                {' '}직접 거래는 불가, 보관처에 문의해 확인해보세요.
                {totalCount > 0 && (
                  <>
                    {' '}· 총 <span className="font-semibold">{totalCount}</span>건
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Mock 안내 (실제 API 키 없을 때) */}
          {isMock && (
            <div className="mx-5 lg:mx-8 mb-3 rounded-tile border border-aring-green-line bg-aring-grad-pastel/40 px-3 py-2 text-[11px] lg:text-[12px] font-bold text-aring-ink-700"
                 style={{ background: '#FFF7E6' }}>
              샘플 데이터입니다. 공공데이터포털 서비스키 발급 후 실제 데이터로 전환됩니다.
            </div>
          )}

          {/* 필터 (Phase 1 UI placeholder) */}
          <LostFoundFilter />

          {/* 본문 */}
          {items.length === 0 ? (
            <LostFoundEmpty
              title="조건에 맞는 분실물이 없어요"
              description="잠시 후 다시 시도하거나 LOST112에서 직접 확인해보세요."
            />
          ) : (
            <LostFoundGrid items={items} />
          )}

          {/* 출처·안내 */}
          <div className="mt-8 mx-5 lg:mx-8 rounded-tile border border-aring-green-line bg-aring-ink-100 px-4 py-3.5 text-[12px] lg:text-[13px] leading-[1.6] text-aring-ink-500 break-keep">
            <p>
              이 정보는 LOST112 자료입니다. aring에서는 거래되지 않으며, 직접 보관처에
              문의해 확인하세요.
            </p>
            <p className="mt-1.5">
              자료 출처: 경찰청 유실물 통합포털 LOST112 (
              <a
                href="https://www.lost112.go.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-aring-green hover:underline"
              >
                www.lost112.go.kr
              </a>
              )
            </p>
          </div>
        </div>
        <BottomNav />
      </div>
    </main>
  );
}
