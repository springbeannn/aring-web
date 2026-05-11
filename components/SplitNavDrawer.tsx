'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// ─────────────────────────────────────────────────
// 메뉴 데이터 — 1depth + 아코디언 2depth
// ─────────────────────────────────────────────────
type LeafItem = { label: string; href: string };
type GroupItem = { label: string; children: LeafItem[] };
type MenuItem = LeafItem | GroupItem;

const MENU_ITEMS: MenuItem[] = [
  {
    label: '탐색하기',
    children: [
      { label: '내 귀걸이 매칭 현황', href: '/my/match' },
      { label: '오늘의 매칭 후보',   href: '/popular' },
      { label: '브랜드별 탐색',       href: '/#brands' },
      { label: '탐색',                 href: '/discover' },
      { label: '전체 리스트',          href: '/products' },
    ],
  },
  { label: '댓글', href: '/comments' },
  {
    label: 'MY',
    children: [
      { label: '내 정보', href: '/my/profile' },
    ],
  },
  { label: 'Q&A', href: '/qa' },
];

// ─────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────
interface SplitNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn?: boolean | null;
}

// ─────────────────────────────────────────────────
// SplitNavDrawer — 아코디언 드로어
// ─────────────────────────────────────────────────
export default function SplitNavDrawer({ isOpen, onClose, isLoggedIn = null }: SplitNavDrawerProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  // 드로어 열리면 body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ESC 닫기
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [isOpen, onClose]);

  // 닫힐 때 펼침 상태 초기화
  useEffect(() => {
    if (!isOpen) setExpanded(null);
  }, [isOpen]);

  async function handleLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    onClose();
    if (typeof window !== 'undefined') window.location.href = '/';
  }

  function isGroup(item: MenuItem): item is GroupItem {
    return 'children' in item;
  }

  return (
    <>
      {/* 오버레이 */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{ transition: 'opacity 0.3s ease, visibility 0.3s ease' }}
        className={`fixed inset-0 z-[9998] bg-[rgba(30,27,46,0.45)] backdrop-blur-[2px] ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      />

      {/* 드로어 패널 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="메뉴"
        style={{
          transition: 'transform 0.35s cubic-bezier(0.32,0.72,0,1)',
          boxShadow: '-8px 0 40px rgba(30,27,46,0.12)',
        }}
        className={`fixed top-0 right-0 z-[9999] h-screen w-[min(88vw,420px)] bg-white flex flex-col rounded-l-[22px] overflow-hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[rgb(229,229,229)] flex-shrink-0">
          <div className="flex items-baseline gap-1">
            <span className="text-[24px] lg:text-[26px] font-black tracking-tight text-aring-green leading-none">aring</span>
            <sup className="text-[12px] lg:text-[13px] font-semibold text-aring-ink-500">한 짝의 짝</sup>
          </div>
          <button
            onClick={onClose}
            aria-label="메뉴 닫기"
            className="w-10 h-10 rounded-full bg-[rgb(243,243,245)] flex items-center justify-center text-aring-ink-900 hover:bg-aring-ink-100 transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 메뉴 본문 — 1depth 아래 아코디언 2depth */}
        <nav className="flex-1 overflow-y-auto py-2">
          {MENU_ITEMS.map((item) => {
            if (!isGroup(item)) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center min-h-[52px] px-6 text-[16px] font-semibold text-aring-ink-900 hover:bg-aring-ink-100/60 transition border-b border-[rgb(243,243,245)]"
                >
                  {item.label}
                </Link>
              );
            }

            const isExpanded = expanded === item.label;
            return (
              <div key={item.label} className="border-b border-[rgb(243,243,245)]">
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : item.label)}
                  aria-expanded={isExpanded}
                  className="w-full flex items-center justify-between min-h-[52px] px-6 text-[16px] font-semibold text-aring-ink-900 hover:bg-aring-ink-100/60 transition"
                >
                  <span>{item.label}</span>
                  <svg
                    className={`w-[18px] h-[18px] transition-transform duration-[250ms] ${isExpanded ? 'rotate-180 text-aring-green' : 'text-aring-ink-500'}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div
                  className="overflow-hidden bg-[rgb(248,248,250)]"
                  style={{
                    maxHeight: isExpanded ? `${item.children.length * 48}px` : '0',
                    transition: 'max-height 0.3s ease',
                  }}
                >
                  {item.children.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      onClick={onClose}
                      className="flex items-center h-[48px] pl-12 pr-6 text-[15px] font-semibold text-aring-ink-700 hover:bg-aring-ink-100/60 transition"
                    >
                      <span className="w-1 h-1 rounded-full bg-aring-accent mr-2.5 flex-shrink-0" />
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}

          {/* 회원가입/로그인 또는 로그아웃 */}
          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center min-h-[52px] px-6 text-[16px] font-semibold text-aring-ink-500 hover:bg-aring-ink-100/60 transition text-left"
            >
              로그아웃
            </button>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center min-h-[52px] px-6 text-[16px] font-bold text-aring-green hover:bg-aring-ink-100/60 transition"
            >
              회원가입 / 로그인
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}
