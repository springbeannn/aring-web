'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const IDLE_MS = 30 * 60 * 1000;
const CHECK_INTERVAL_MS = 30 * 1000;
const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
  'wheel',
  'click',
];

export function IdleLogout() {
  const router = useRouter();

  useEffect(() => {
    if (!supabase) return;

    let isLoggedIn = false;
    let lastActivity = Date.now();
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let loggingOut = false;

    const markActive = () => {
      lastActivity = Date.now();
    };

    const performLogout = async () => {
      if (loggingOut || !supabase) return;
      loggingOut = true;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          loggingOut = false;
          return;
        }
        await supabase.auth.signOut();
        if (typeof window !== 'undefined') {
          alert('30분 동안 조작이 없어 자동 로그아웃되었습니다.\n다시 로그인해 주세요.');
        }
        router.replace('/');
      } catch {
        loggingOut = false;
      }
    };

    const check = () => {
      if (!isLoggedIn) return;
      if (Date.now() - lastActivity >= IDLE_MS) {
        void performLogout();
      }
    };

    const startInterval = () => {
      if (intervalId) return;
      intervalId = setInterval(check, CHECK_INTERVAL_MS);
    };

    const stopInterval = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') check();
    };

    ACTIVITY_EVENTS.forEach((e) =>
      window.addEventListener(e, markActive, { passive: true }),
    );
    document.addEventListener('visibilitychange', onVisibility);

    supabase.auth.getSession().then(({ data: { session } }) => {
      isLoggedIn = !!session;
      if (isLoggedIn) {
        markActive();
        startInterval();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const wasLoggedIn = isLoggedIn;
        isLoggedIn = !!session;
        if (isLoggedIn && !wasLoggedIn) {
          markActive();
          startInterval();
        } else if (!isLoggedIn) {
          stopInterval();
          loggingOut = false;
        }
      },
    );

    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, markActive));
      document.removeEventListener('visibilitychange', onVisibility);
      stopInterval();
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
