'use client';

import Link from 'next/link';
import type React from 'react';
import { useState } from 'react';
import HamburgerButton from './HamburgerButton';
import SideMenu from './SideMenu';

export type Tab = 'home' | 'discover' | 'register' | 'chat' | 'my';

type IconProps = { className?: string; strokeWidth?: number };

const IconComments = ({ className = 'w-5 h-5', strokeWidth = 1.8 }: IconProps) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" />
          <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
      </svg>
    );

const IconHome = ({ className = 'w-5 h-5', strokeWidth = 2 }: IconProps) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5 12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z" />
          <path d="M9 22V12h6v10" />
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

const IconPlus = ({ className = 'w-4 h-4', strokeWidth = 2.4 }: IconProps) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
      </svg>
    );

const desktopMenu = [
    { key: 'home', label: '홈', href: '/' },
    { key: 'discover', label: '탐색', href: '/discover' },
    { key: 'register', label: '등록', href: '/register' },
    { key: 'comments', label: '댓글', href: '/comments' },
    { key: 'my', label: 'MY', href: '/my' },
    ];

export function TopNav() {
      const [isMenuOpen, setIsMenuOpen] = useState(false);
    
      return (
              <>
                    <div className="flex items-center justify-between px-5 lg:px-8 pt-2 lg:pt-5 pb-3.5 lg:pb-5 lg:border-b lg:border-aring-green-line">
                            <div className="flex items-center gap-8">
                                      <Link className="flex items-baseline gap-1" href="/">
                                                  <span className="text-[26px] lg:text-[28px] font-black tracking-tight text-aring-green leading-none">aring</span>span>
                                                  <sup className="text-[10px] font-medium text-aring-ink-500">한 짝의 짝</sup>sup>
                                      </Link>Link>
                                      <nav className="hidden lg:flex items-center gap-1">
                                          {desktopMenu.map((m) => (
                                <Link key={m.key} href={m.href} className="px-3.5 py-2 rounded-pill text-[13px] font-semibold text-aring-ink-700 hover:bg-aring-ink-100 transition">
                                    {m.label}
                                </Link>Link>
                              ))}
                                      </nav>nav>
                            </div>div>
                            <div className="flex items-center gap-2.5">
                                      <Link href="/register" aria-label="한 짝 등록" className="hidden lg:inline-flex items-center gap-1.5 rounded-pill bg-aring-ink-900 px-4 py-2.5 text-[13px] font-extrabold text-white shadow-cta active:scale-95 transition">
                                                  <IconPlus className="w-4 h-4" strokeWidth={2.4} />
                                                  한 짝 등록
                                      </Link>Link>
                                      <button aria-label="로그인" className="relative w-10 h-10 rounded-full bg-aring-ink-100 flex items-center justify-center text-aring-ink-900 active:scale-95 transition">
                                                  <IconUser />
                                      </button>button>
                                      <HamburgerButton isOpen={isMenuOpen} onClick={() => setIsMenuOpen((prev) => !prev)} />
                            </div>div>
                    </div>div>
                    <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
              </>>
            );
}

export function BottomNav({ active }: { active?: Tab }) {
      const item = (key: Tab, label: string, href: string, icon: React.ReactNode, dot?: 'unread' | 'new') => {
              const isActive = active === key;
              return (
                        <Link href={href} className={`text-[12px] lg:text-[13px] font-semibold ${isActive ? 'text-aring-ink-900' : 'text-aring-ink-500'} active:opacity-70`}>
                                <div className="flex flex-col items-center gap-1 py-2 relative">
                                    {dot && (
                                        <span aria-label={dot === 'unread' ? '읽지 않은 알림' : '새 항목'} className="absolute inset-[-3px] rounded-full pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(251,200,220,.55), rgba(197,221,240,.55))', filter: 'blur(8px)', zIndex: -1 }} />
                                      )}
                                    {icon}
                                          <span>{label}</span>span>
                                </div>div>
                        </Link>Link>
                      );
      };
    
      return (
              <nav className="absolute left-0 right-0 bottom-0 z-30 lg:hidden">
                    <div className="relative mx-auto max-w-[440px] glass-strong border-t border-[rgb(229,229,229)]">
                            <Link
                                          href="/register"
                                          aria-label="한 짝 등록하기"
                                          className="absolute left-1/2 -translate-x-1/2 -top-6 w-[60px] h-[60px] rounded-full bg-aring-green flex items-center justify-center text-white shadow-cta active:scale-95 transition"
                                          style={{ boxShadow: '0 14px 28px rgba(28,51,40,0.35), 0 4px 10px rgba(28,51,40,0.18)' }}
                                        >
                                      <IconPlus />
                                      <span aria-hidden className="absolute inset-[-3px] rounded-full pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(251,200,220,.55), rgba(197,221,240,.55))', filter: 'blur(8px)', zIndex: -1 }} />
                            </Link>Link>
                            <div className="flex items-stretch px-2 pt-2 pb-2">
                                {item('home', '홈', '/', <IconHome />)}
                                {item('discover', '탐색', '/discover', <IconCompass />)}
                                      <div className="flex-1 flex flex-col items-center gap-1 py-2 select-none">
                                                  <IconPlus />
                                                  <span className="text-[10.5px]">등록</span>span>
                                      </div>div>
                                {item('chat', '댓글', '/comments', <IconComments />, 'unread')}
                                {item('my', 'MY', '/my', <IconUser />, 'new')}
                            </div>div>
                    </div>div>
              </nav>nav>
            );
}</></svg>
