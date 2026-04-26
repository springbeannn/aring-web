'use client';

import Link from 'next/link';
import type React from 'react';

// ─────────────────────────────────────────────────────────────
// 공통 Nav (TopNav + BottomNav) — 모든 페이지에 동일 적용
// 디자인 시스템 v3 + 딥그린 단일 앵커 룰 준수
// ─────────────────────────────────────────────────────────────

export type Tab = 'home' | 'discover' | 'register' | 'chat' | 'my';

type IconProps = { className?: string; strokeWidth?: number };

const IconBell = ({ className = 'w-5 h-5', strokeWidth = 1.8 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const IconChat = ({ className = 'w-5 h-5', strokeWidth = 1.8 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const IconHome = ({ className = 'w-5 h-5', strokeWidth = 2 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5 12 3l9 6.5V20a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2V9.5z" />
  </svg>
);

const IconCompass = ({ className = 'w-5 h-5', strokeWidth = 2 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m16 8-2 6-6 2 2-6 6-2z" />
  </svg>
);

const IconUser = ({ className = 'w-5 h-5', strokeWidth = 2 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconPlus = ({ className = 'w-6 h-6', strokeWidth = 2.6 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const log =
  (label: string, payload?: unknown) =>
  () =>
    console.log('[aring]', label, payload ?? '');

// ─────────────────────────────────────────────────────────────
// TopNav — 로고 / 데스크탑 메뉴 / 등록 CTA / 알림 / 채팅
// ─────────────────────────────────────────────────────────────
export function TopNav() {
  const desktopMenu: { key: Tab; label: string; href: string }[] = [
    { key: 'home', label: '홈', href: '/' },
    { key: 'discover', label: '탐색', href: '/discover' },
    { key: 'register', label: '등록', href: '/register' },
    { key: 'chat', label: '채팅', href: '/chat' },
    { key: 'my', label: 'MY', href: '/my' },
  ];

  return (
    <div className="flex items-center justify-between px-5 lg:px-8 pt-2 lg:pt-5 pb-3.5 lg:pb-5 lg:border-b lg:border-aring-green-line">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-baseline gap-1">
          <span className="text-[26px] lg:text-[28px] font-black tracking-tight text-aring-green leading-none">
            aring
          </span>
          <sup className="text-[10px] font-medium text-aring-ink-500">
            한 짝의 짝
          </sup>
        </Link>
        {/* 데스크탑 메뉴 */}
        <nav className="hidden lg:flex items-center gap-1">
          {desktopMenu.map((m) => (
            <Link
              key={m.key}
              href={m.href}
              className="px-3.5 py-2 rounded-pill text-[13px] font-semibold text-aring-ink-700 hover:bg-aring-ink-100 transition"
            >
              {m.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2.5">
        <Link
          href="/register"
          aria-label="한 짝 등록"
          className="hidden lg:inline-flex items-center gap-1.5 rounded-pill bg-aring-ink-900 px-4 py-2.5 text-[13px] font-extrabold text-white shadow-cta active:scale-95 transition"
        >
          <IconPlus className="w-4 h-4" strokeWidth={2.4} />
          한 짝 등록
        </Link>
        <button
          onClick={log('topnav:bell')}
          aria-label="알림"
          className="relative w-10 h-10 rounded-full bg-aring-ink-100 flex items-center justify-center text-aring-ink-900 active:scale-95 transition"
        >
          <IconBell />
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-aring-accent ring-2 ring-white" />
        </button>
        <button
          onClick={log('topnav:chat')}
          aria-label="채팅"
          className="relative w-10 h-10 rounded-full bg-aring-ink-100 flex items-center justify-center text-aring-ink-900 active:scale-95 transition"
        >
          <IconChat />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BottomNav — 5탭 + 중앙 FAB (모바일/태블릿. 데스크탑은 TopNav 메뉴로 대체)
// ─────────────────────────────────────────────────────────────
export function BottomNav({ active }: { active?: Tab }) {
  const item = (
    key: Tab,
    label: string,
    href: string,
    icon: React.ReactNode,
    dot?: 'unread' | 'new'
  ) => {
    const isActive = active === key;
    return (
      <Link
        key={key}
        href={href}
        onClick={log(`nav:${key}`)}
        className={[
          'relative flex flex-col items-center gap-1 flex-1 py-2',
          isActive ? 'text-aring-green' : 'text-aring-ink-500',
        ].join(' ')}
      >
        <span className="relative">
          {icon}
          {dot === 'unread' && (
            <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] px-1 rounded-full bg-aring-accent text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white">
              2
            </span>
          )}
          {dot === 'new' && (
            <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-aring-accent ring-2 ring-white" />
          )}
        </span>
        <span
          className={[
            'text-[10.5px]',
            isActive ? 'font-extrabold' : 'font-semibold',
          ].join(' ')}
        >
          {label}
        </span>
        {isActive && (
          <span className="absolute -bottom-0.5 w-5 h-0.5 rounded-full bg-aring-green" />
        )}
      </Link>
    );
  };

  return (
    <nav className="absolute left-0 right-0 bottom-0 z-30 lg:hidden">
      <div className="relative mx-auto max-w-[440px] glass-strong border-t border-white/60 pb-[env(safe-area-inset-bottom,0px)]">
        {/* 중앙 FAB — 등록 */}
        <Link
          href="/register"
          aria-label="한 짝 등록하기"
          className="absolute left-1/2 -translate-x-1/2 -top-6 w-[60px] h-[60px] rounded-full bg-aring-green text-white flex items-center justify-center shadow-cta active:scale-95 transition"
          style={{
            boxShadow:
              '0 14px 28px rgba(28,51,40,0.35), 0 4px 10px rgba(28,51,40,0.18)',
          }}
        >
          <IconPlus />
          <span
            aria-hidden
            className="absolute inset-[-3px] rounded-full pointer-events-none"
            style={{
              background:
                'linear-gradient(135deg, rgba(251,200,220,.55), rgba(197,221,240,.55))',
              filter: 'blur(8px)',
              zIndex: -1,
            }}
          />
        </Link>

        <div className="flex items-stretch px-2 pt-2 pb-2">
          {item('home', '홈', '/', <IconHome />)}
          {item('discover', '탐색', '/discover', <IconCompass />)}
          {/* 가운데 자리 비워둠 (FAB가 차지) */}
          <div className="flex-1 flex flex-col items-center gap-1 py-2 select-none pointer-events-none opacity-0">
            <IconPlus />
            <span className="text-[10.5px]">등록</span>
          </div>
          {item('chat', '채팅', '/chat', <IconChat />, 'unread')}
          {item('my', 'MY', '/my', <IconUser />, 'new')}
        </div>
      </div>
    </nav>
  );
}
