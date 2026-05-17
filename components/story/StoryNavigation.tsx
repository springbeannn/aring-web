'use client';

// aring 브랜드 스토리 시리즈 하단 네비게이션
// — 미니멀 에디토리얼 리스트. 호버 시 + 아이콘이 ×로 회전, 현재 페이지는 항상 −
// — '준비 중' 항목은 비활성 상태로 옅은 톤·이탤릭 처리

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { STORIES } from '@/lib/stories';

function Plus({ open, mute }: { open: boolean; mute: boolean }) {
  // + 두 획으로 구성. open=true(현재 페이지)면 세로획을 숨겨 − 처럼 보이게.
  // 비활성(mute) 항목은 호버 트랜스폼 없음.
  return (
    <span
      aria-hidden
      className={[
        'relative inline-flex w-[14px] h-[14px] items-center justify-center flex-shrink-0',
        'transition-transform duration-300 ease-out',
        open ? '' : mute ? '' : 'group-hover:rotate-90',
      ].join(' ')}
    >
      <span className="absolute left-0 right-0 mx-auto h-[1.5px] w-full bg-current rounded-full" />
      <span
        className={[
          'absolute top-0 bottom-0 my-auto w-[1.5px] h-full bg-current rounded-full',
          'transition-transform duration-300 ease-out origin-center',
          open ? 'scale-y-0' : '',
        ].join(' ')}
      />
    </span>
  );
}

export default function StoryNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="aring 브랜드 스토리 목록"
      className="mt-16 lg:mt-24 border-t border-aring-ink-100 pt-10 lg:pt-14"
    >
      <p className="text-[11px] lg:text-[12px] font-bold tracking-[0.18em] text-aring-ink-500 uppercase mb-6 lg:mb-8">
        more aring stories
      </p>

      <ul className="divide-y divide-aring-ink-100/80">
        {STORIES.map((s) => {
          const isCurrent = pathname === s.href;
          const isComing = s.status === 'coming-soon';

          if (isComing) {
            return (
              <li key={s.slug}>
                <div
                  aria-disabled="true"
                  className="flex items-center justify-between gap-4 py-[18px] lg:py-[22px] select-none cursor-default"
                >
                  <span className="text-[14px] lg:text-[16px] italic font-medium text-aring-ink-300 break-keep leading-[1.55]">
                    {s.title}
                    <span className="ml-2 inline-flex items-center gap-1 align-middle not-italic text-[10px] lg:text-[11px] font-semibold tracking-[0.06em] text-aring-ink-300/90">
                      <span className="inline-block w-1 h-1 rounded-full bg-aring-ink-300/70" />
                      준비 중
                    </span>
                  </span>
                  <span className="text-aring-ink-200">
                    <Plus open={false} mute />
                  </span>
                </div>
              </li>
            );
          }

          return (
            <li key={s.slug}>
              <Link
                href={s.href}
                aria-current={isCurrent ? 'page' : undefined}
                className={[
                  'group flex items-center justify-between gap-4 py-[18px] lg:py-[22px] transition-colors',
                  isCurrent
                    ? 'text-aring-green'
                    : 'text-aring-ink-900 hover:text-aring-green',
                ].join(' ')}
              >
                <span
                  className={[
                    'text-[14px] lg:text-[16px] break-keep leading-[1.55]',
                    isCurrent ? 'font-bold' : 'font-semibold',
                  ].join(' ')}
                >
                  {s.title}
                </span>
                <Plus open={isCurrent} mute={false} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
