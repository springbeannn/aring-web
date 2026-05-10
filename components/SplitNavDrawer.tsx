'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

// ─────────────────────────────────────────────────
// 메뉴 데이터 (기존 SideMenu 구조 재사용)
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

// 현재 경로에 매칭되는 1-depth 라벨 찾기
function matchActiveLabel(pathname: string): string {
  for (const item of MENU_ITEMS) {
    if (pathname === item.href) return item.label;
    if (item.href !== '/' && pathname.startsWith(item.href)) return item.label;
  }
  return MENU_ITEMS[0].label;
}

// ─────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────
interface SplitNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─────────────────────────────────────────────────
// SplitNavDrawer — 좌측 1depth 고정 + 우측 2depth 펼침
// ─────────────────────────────────────────────────
export default function SplitNavDrawer({ isOpen, onClose }: SplitNavDrawerProps) {
  const router = useRouter();
  const pathname = usePathname() ?? '/';

  const [selected, setSelected] = useState<string>(() => matchActiveLabel(pathname));

  // 메뉴 열릴 때마다 현재 라우트로 selected 동기화
  useEffect(() => {
    if (isOpen) setSelected(matchActiveLabel(pathname));
  }, [isOpen, pathname]);

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

  function handleLeftClick(item: MenuItem) {
    if (!item.children?.length) {
      // 하위 메뉴 없는 경우 바로 라우팅
      router.push(item.href);
      onClose();
      return;
    }
    setSelected(item.label);
  }

  const selectedItem = useMemo(
    () => MENU_ITEMS.find((i) => i.label === selected),
    [selected],
  );
  const children = selectedItem?.children ?? [];

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

        {/* Split: 좌측 1depth + 우측 2depth */}
        <div className="flex-1 flex min-h-0">
          {/* 좌측 패널 — 38% */}
          <aside
            aria-label="1차 메뉴"
            className="w-[38%] bg-[#F5F5F5] overflow-y-auto"
          >
            {MENU_ITEMS.map((item) => {
              const isActive = item.label === selected;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleLeftClick(item)}
                  className={[
                    'w-full text-left flex items-center min-h-[52px] py-4 px-4 text-[16px] border-l-2 transition',
                    isActive
                      ? 'bg-white font-bold text-aring-ink-900 border-l-aring-green'
                      : item.cta
                        ? 'bg-[#F5F5F5] font-bold text-aring-green border-l-transparent hover:bg-aring-ink-100/40'
                        : 'bg-[#F5F5F5] font-semibold text-[#555555] border-l-transparent hover:bg-aring-ink-100/40',
                  ].join(' ')}
                >
                  {item.label}
                </button>
              );
            })}
          </aside>

          {/* 우측 패널 — 62% */}
          <section
            aria-label="2차 메뉴"
            className="flex-1 bg-white overflow-y-auto"
          >
            {children.length > 0 ? (
              <ul>
                {children.map((child) => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      onClick={onClose}
                      className="flex items-center justify-between h-[52px] px-4 text-[16px] font-semibold text-aring-ink-900 hover:bg-aring-ink-100/60 transition border-b border-[#EEEEEE]"
                    >
                      <span>{child.label}</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-aring-ink-300 shrink-0"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[200px] px-6 text-center">
                <p className="text-[15px] lg:text-[15px] text-aring-ink-400 leading-relaxed">
                  선택한 메뉴는<br />바로 이동해요
                </p>
                <Link
                  href={selectedItem?.href ?? '/'}
                  onClick={onClose}
                  className="mt-3 inline-flex items-center gap-1 px-4 py-2 rounded-full bg-aring-ink-900 text-white text-[12px] lg:text-[13px] font-bold hover:opacity-90 transition"
                >
                  {selectedItem?.label ?? ''} 페이지로
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </div>
            )}
          </section>
        </div>

        {/* 하단 CTA — 기존 스타일 유지 */}
        <div className="px-6 pt-4 pb-6 border-t border-[rgb(229,229,229)] flex-shrink-0 bg-white">
          <Link
            href="/register"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-1.5 py-[14px] bg-aring-ink-900 text-white rounded-full text-[16px] font-semibold tracking-tight hover:opacity-90 transition"
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
