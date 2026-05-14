'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const IDLE_MS = 30 * 60 * 1000;
const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
];

export function IdleLogout() {
  const router = useRouter();

  useEffect(() => {
    if (!supabase) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let isLoggedIn = false;

    const clearTimer = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const armTimer = () => {
      clearTimer();
      if (!isLoggedIn) return;
      timer = setTimeout(async () => {
        if (!supabase) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        await supabase.auth.signOut();
        if (typeof window !== 'undefined') {
          alert('30분 동안 조작이 없어 자동 로그아웃되었습니다.\n다시 로그인해 주세요.');
        }
        router.replace('/');
      }, IDLE_MS);
    };

    const onActivity = () => armTimer();

    ACTIVITY_EVENTS.forEach((e) =>
      window.addEventListener(e, onActivity, { passive: true }),
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      isLoggedIn = !!session;
      armTimer();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        isLoggedIn = !!session;
        if (!isLoggedIn) clearTimer();
        else armTimer();
      },
    );

    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
      clearTimer();
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
