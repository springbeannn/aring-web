'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const NAV_ITEMS = [
  { href: '/admin',          label: '대시보드',     icon: '📊' },
  { href: '/admin/listings', label: '게시물 관리',  icon: '📦' },
  { href: '/admin/users',    label: '회원 관리',    icon: '👥' },
  { href: '/admin/comments', label: '댓글 관리',    icon: '💬' },
];

function pageTitle(pathname: string): string {
  const item = NAV_ITEMS.find((n) => n.href === pathname);
  return item?.label ?? '관리자';
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/admin';
  const router = useRouter();
  const [email, setEmail] = useState<string>('');

  // 로그인 페이지는 레이아웃을 적용하지 않음
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!supabase || isLoginPage) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email);
    });
  }, [isLoginPage]);

  async function handleLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  if (isLoginPage) return <>{children}</>;

  return (
    <div className="flex min-h-screen min-w-[1024px] bg-aring-ink-50">
      {/* 좌측 사이드바 */}
      <aside className="w-[240px] shrink-0 bg-white border-r border-aring-ink-100 flex flex-col">
        {/* 로고 */}
        <div className="h-16 flex items-center px-6 border-b border-aring-ink-100">
          <div className="flex items-baseline gap-1">
            <span className="text-[22px] font-black tracking-tight text-aring-green leading-none">aring</span>
            <sup className="text-[11px] font-medium text-aring-ink-500">관리자</sup>
          </div>
        </div>

        {/* 네비 */}
        <nav className="flex-1 py-4">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'flex items-center gap-3 px-6 py-3 text-[14px] transition border-l-2',
                  active
                    ? 'bg-aring-green/10 text-aring-green font-bold border-l-aring-green'
                    : 'text-aring-ink-700 font-medium border-l-transparent hover:bg-aring-ink-50',
                ].join(' ')}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 로그아웃 */}
        <div className="p-4 border-t border-aring-ink-100">
          <button
            onClick={handleLogout}
            className="w-full text-[13px] font-semibold text-aring-ink-600 hover:text-aring-ink-900 border border-aring-ink-200 rounded-lg py-2 transition"
          >
            로그아웃
          </button>
        </div>
      </aside>

      {/* 우측 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 헤더 */}
        <header className="h-16 bg-white border-b border-aring-ink-100 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-[18px] font-extrabold text-aring-ink-900">{pageTitle(pathname)}</h1>
          <div className="flex items-center gap-2 text-[13px] text-aring-ink-500">
            <span>👤</span>
            <span className="font-semibold text-aring-ink-800">{email || '관리자'}</span>
          </div>
        </header>

        {/* 콘텐츠 */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
