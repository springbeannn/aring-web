'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// ─────────────────────────────────────────────────
// 메뉴 데이터 (2-depth)
// ─────────────────────────────────────────────────
type MenuItem = {
  label: string;
  href: string;
  cta?: boolean;
  children?: { label: string; href: string }[];
};

const MENU_ITEMS: MenuItem[] = [
  { label: '홈', href: '/' },
  {
    label: '탐색하기',
    href: '/discover',
    children: [
      { label: '모양으로 찾기',   href: '/discover?filter=shape' },
      { label: '소재로 찾기',     href: '/discover?filter=material' },
      { label: '가격대로 찾기',   href: '/discover?filter=price' },
      { label: '브랜드로 찾기',   href: '/discover?filter=brand' },
    ],
  },
  {
    label: '한 짝 등록하기',
    href: '/register',
    cta: true,
    children: [
      { label: '검색으로 찾기', href: '/search' },
    ],
  },
  {
    label: '댓글',
    href: '/comments',
    children: [
      { label: '내 댓글 보기', href: '/my#comments' },
    ],
  },
  {
    label: 'MY',
    href: '/my',
    children: [
      { label: '내 상품',     href: '/my#my-listings' },
      { label: '관심 상품',   href: '/my#liked' },
      { label: '로그인',      href: '/login' },
      { label: '회원가입',    href: '/signup' },
    ],
  },
];

// ─────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────
interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─────────────────────────────────────────────────
// SideMenu 컴포넌트
// ─────────────────────────────────────────────────
export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // 메뉴 열릴 때 body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ESC 키로 닫기
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [isOpen, onClose]);

  function toggleExpand(key: string) {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
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

      {/* 사이드 패널 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="메뉴"
        style={{
          transition: 'transform 0.35s cubic-bezier(0.32,0.72,0,1)',
          boxShadow: '-8px 0 40px rgba(30,27,46,0.12)',
        }}
        className={`fixed top-0 right-0 z-[9999] h-screen w-[min(88vw,420px)] bg-white flex flex-col rounded-l-[22px] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[rgb(229,229,229)] flex-shrink-0">
          <div className="flex items-baseline gap-1">
            <span className="text-[22px] lg:text-[26px] font-black tracking-tight text-aring-green leading-none">aring</span>
            <sup className="text-[12px] lg:text-[13px] font-medium text-aring-ink-500">한 짝의 짝</sup>
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

        {/* 메뉴 목록 */}
        <nav aria-label="사이트 메뉴" className="flex-1 overflow-y-auto py-2">
          {MENU_ITEMS.map((item) => {
            const isExpanded = !!expanded[item.label];
            const hasChildren = !!item.children?.length;
            return (
              <div key={item.label}>
                {/* 1-depth row: Link(navigate) + chevron(toggle) */}
                <div
                  className={[
                    'flex items-stretch border-b border-[rgb(243,243,245)]',
                    item.cta ? 'bg-gradient-to-r from-aring-green/10 to-transparent border-l-[3px] border-l-aring-green' : '',
                  ].join(' ')}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={[
                      'flex-1 px-6 py-4 text-[17px] lg:text-[20px] font-semibold transition hover:bg-aring-ink-100',
                      item.cta ? 'text-aring-green font-extrabold' : 'text-aring-ink-900',
                    ].join(' ')}
                  >
                    {item.label}
                  </Link>
                  {hasChildren && (
                    <button
                      type="button"
                      aria-label={`${item.label} ${isExpanded ? '접기' : '펼치기'}`}
                      aria-expanded={isExpanded}
                      onClick={() => toggleExpand(item.label)}
                      className="flex items-center justify-center w-12 hover:bg-aring-ink-100 transition"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`text-aring-ink-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* 2-depth sub-menu */}
                {hasChildren && isExpanded && (
                  <div className="bg-aring-ink-50">
                    {item.children!.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onClose}
                        className="flex items-center px-6 py-3 pl-10 text-[14px] lg:text-[15px] font-medium text-aring-ink-700 hover:bg-aring-ink-100 transition border-b border-[rgba(229,229,229,0.5)] last:border-none"
                      >
                        <span aria-hidden className="text-aring-ink-300 mr-2.5">└</span>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* 하단 CTA */}
        <div className="px-6 pt-4 pb-6 border-t border-[rgb(229,229,229)] flex-shrink-0">
          <Link
            href="/register"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-1.5 py-[14px] bg-aring-ink-900 text-white rounded-full text-[14px] font-semibold tracking-tight hover:opacity-90 transition"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            등록하기
          </Link>
        </div>
      </div>
    </>
  );
}
