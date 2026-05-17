'use client';

import { useEffect } from 'react';
import { TopNav, BottomNav } from '@/components/Nav';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[aring][lost-found] page error', error);
  }, [error]);

  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
        <div className="pb-28 lg:pb-10">
          <TopNav />
          <div className="px-5 lg:px-8 py-16 text-center">
            <p className="text-[16px] font-bold text-aring-ink-900">분실물 정보를 불러오지 못했어요</p>
            <p className="mt-1 text-[13px] lg:text-[14px] leading-[1.55] text-aring-ink-500 break-keep">
              잠시 후 다시 시도하거나, LOST112에서 직접 확인해보세요.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-pill bg-aring-ink-900 text-white text-[13px] font-bold active:scale-95 transition"
              >
                다시 시도
              </button>
              <a
                href="https://www.lost112.go.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-pill bg-aring-ink-100 text-aring-ink-900 text-[13px] font-bold active:scale-95 transition"
              >
                LOST112 바로가기
              </a>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    </main>
  );
}
