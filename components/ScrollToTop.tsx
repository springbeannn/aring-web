'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// ─────────────────────────────────────────────────────────────
// 라우트 이동 시 항상 최상단으로 스크롤 초기화
// - pathname 변경 감지 → window.scrollTo(0, 0)
// - 브라우저 자동 복원(history.scrollRestoration) 비활성화
//   → 뒤로가기/앞으로가기에서도 일관되게 최상단 시작
// - URL hash(#anchor)가 있으면 해당 요소로 우선 이동
// ─────────────────────────────────────────────────────────────
export function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // hash(#brands 등)가 있으면 해당 요소로 스크롤
    if (window.location.hash) {
      const id = decodeURIComponent(window.location.hash.slice(1));
      // 다음 paint 이후 요소 탐색 (mount 직후엔 아직 없을 수 있음)
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ block: 'start', inline: 'nearest' });
        } else {
          window.scrollTo(0, 0);
        }
      });
      return;
    }

    window.scrollTo(0, 0);
  }, [pathname, searchParams]);

  return null;
}
