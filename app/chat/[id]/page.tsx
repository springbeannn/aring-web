'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopNav, BottomNav } from '@/components/Nav';

// ─────────────────────────────────────────────────────────────
// /chat/[id] — 채팅 기능 준비 중 (P1)
// MVP에선 빈 페이지로, "댓글로 먼저 문의" 안내
// ─────────────────────────────────────────────────────────────

const IconArrowLeft = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

const IconChat = ({ className = 'w-10 h-10' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export default function ChatRoomPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div
        className="
          relative w-full max-w-[440px] bg-white overflow-hidden
          min-h-screen
          sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone
          lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible
        "
      >
        <div className="pb-28 lg:pb-12">
          <TopNav />

          {/* 페이지 헤더 */}
          <div className="px-5 lg:px-8 pt-3 lg:pt-7 flex items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="뒤로"
              className="w-9 h-9 rounded-full bg-aring-ink-100 flex items-center justify-center text-aring-ink-900 active:scale-95 transition"
            >
              <IconArrowLeft />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-[18px] lg:text-[22px] font-extrabold tracking-tight text-aring-ink-900">
                채팅
              </h1>
            </div>
          </div>

          {/* 준비 중 컨텐츠 */}
          <div className="px-5 lg:px-8 pt-16 pb-12 flex flex-col items-center text-center">
            <div className="relative w-20 h-20 rounded-full bg-aring-grad-pastel flex items-center justify-center text-aring-ink-900">
              <IconChat />
              <span className="aring-pulse absolute inset-0 rounded-full bg-aring-pastel-pink/40" />
            </div>
            <h2 className="mt-5 text-[18px] font-extrabold text-aring-ink-900">
              1:1 채팅 준비 중이에요
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-aring-ink-500 max-w-[280px]">
              곧 등록자와 직접 대화로 거래하실 수 있어요.
              <br />
              지금은 <span className="font-bold text-aring-ink-900">댓글</span>로 먼저 문의를 남겨보세요.
            </p>

            <div className="mt-7 flex flex-col gap-2 w-full max-w-[280px]">
              <Link
                href={`/items/${params.id}`}
                className="inline-flex items-center justify-center h-12 rounded-pill bg-aring-ink-900 text-white text-[13px] font-extrabold active:scale-[0.99] transition"
              >
                상품으로 돌아가서 문의 남기기
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center h-11 rounded-pill bg-aring-ink-100 text-aring-ink-900 text-[12.5px] font-bold active:scale-[0.99] transition"
              >
                다른 한 짝 둘러보기
              </Link>
            </div>
          </div>
        </div>
        <BottomNav active="chat" />
      </div>
    </main>
  );
}
