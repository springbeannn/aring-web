'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// 라우트 변경 시마다 /api/track 으로 PV/UV 핑을 보낸다.
// 같은 path가 연속해서 들어오면 중복 발사하지 않는다 (StrictMode 대응).
export function PageViewTracker() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith('/admin')) return;
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    const referrer = typeof document !== 'undefined' ? document.referrer || null : null;

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, referrer }),
      keepalive: true,
    }).catch(() => { /* 트래커 실패는 무시 */ });
  }, [pathname]);

  return null;
}
