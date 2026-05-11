'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TopNav, BottomNav } from '@/components/Nav';
import { supabase } from '@/lib/supabase';
import {
  type QnaRow,
  QNA_CATEGORY_LABEL,
  ANSWER_STATUS_LABEL,
  getAnswerStatus,
  formatQnaDate,
  isAdminUser,
} from '@/lib/qna';

// ─────────────────────────────────────────────────────────────
// /qna/[id] — 문의 상세
// ─────────────────────────────────────────────────────────────

type LoadState =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'private' }
  | { status: 'ready'; row: QnaRow };

const IconArrowLeft = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

export default function QnaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!id || !supabase) { setState({ status: 'not-found' }); return; }
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id ?? null;

      const { data, error } = await supabase
        .from('qna')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        console.error('[aring] qna detail error', error);
        setState({ status: 'not-found' });
        return;
      }
      const row = data as QnaRow;

      // 비공개 글: 본인 또는 관리자만 열람 가능
      if (row.is_private && !(userId && (row.user_id === userId || isAdminUser(userId)))) {
        setState({ status: 'private' });
        return;
      }

      setState({ status: 'ready', row });
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  if (state.status === 'loading') {
    return (
      <main className="min-h-screen flex justify-center bg-white">
        <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen lg:max-w-[1200px]">
          <TopNav />
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 rounded-full border-2 border-aring-ink-100 border-t-aring-ink-900 animate-spin" />
          </div>
        </div>
      </main>
    );
  }

  if (state.status === 'not-found') {
    return (
      <main className="min-h-screen flex justify-center bg-white">
        <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen lg:max-w-[1200px]">
          <TopNav />
          <div className="px-5 lg:px-8 py-20 text-center">
            <p className="text-[16px] font-bold text-aring-ink-900">존재하지 않는 문의입니다</p>
            <Link href="/qna" className="mt-4 inline-flex items-center justify-center px-5 py-2.5 rounded-pill bg-aring-ink-900 text-white text-[15px] font-bold">
              목록으로
            </Link>
          </div>
          <BottomNav />
        </div>
      </main>
    );
  }

  if (state.status === 'private') {
    return (
      <main className="min-h-screen flex justify-center bg-white">
        <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen lg:max-w-[1200px]">
          <TopNav />
          <div className="px-5 lg:px-8 py-20 text-center">
            <p className="text-[16px] font-bold text-aring-ink-900">비공개 문의입니다</p>
            <p className="mt-1 text-[15px] text-aring-ink-500">작성자와 관리자만 볼 수 있어요.</p>
            <Link href="/qna" className="mt-4 inline-flex items-center justify-center px-5 py-2.5 rounded-pill bg-aring-ink-900 text-white text-[15px] font-bold">
              목록으로
            </Link>
          </div>
          <BottomNav />
        </div>
      </main>
    );
  }

  const row = state.row;
  const status = getAnswerStatus(row);

  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
        <div className="pb-28 lg:pb-16">
          <TopNav />

          {/* 헤더 */}
          <div className="px-5 lg:px-8 pt-3 lg:pt-7 pb-3 flex items-center gap-3">
            <button
              onClick={() => router.push('/qna')}
              aria-label="목록으로"
              className="lg:hidden w-9 h-9 rounded-full bg-aring-ink-100 flex items-center justify-center text-aring-ink-900 active:scale-95 transition"
            >
              <IconArrowLeft />
            </button>
            <h1 className="text-[24px] lg:text-[26px] font-bold tracking-tight text-aring-ink-900">문의 상세</h1>
          </div>

          {/* 본문 — 사이트 표준 폭 (1200px) */}
          <article className="px-5 lg:px-8 space-y-4">
              {/* 메타: 유형 / 비공개 / 답변 상태 */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded-pill text-[12px] font-bold bg-aring-ink-100 text-aring-ink-700">
                  {QNA_CATEGORY_LABEL[row.category]}
                </span>
                {row.is_private && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-pill text-[12px] font-bold bg-aring-ink-100 text-aring-ink-500">
                    비공개
                  </span>
                )}
                <span className={[
                  'inline-flex items-center px-2 py-0.5 rounded-pill text-[12px] font-bold',
                  status === 'answered' ? 'bg-aring-green/10 text-aring-green' : 'bg-aring-ink-100 text-aring-ink-500',
                ].join(' ')}>
                  {ANSWER_STATUS_LABEL[status]}
                </span>
              </div>

              {/* 제목 */}
              <h2 className="text-[20px] lg:text-[22px] font-bold text-aring-ink-900 leading-snug">{row.title}</h2>

              {/* 작성자 / 작성일 */}
              <div className="flex items-center gap-2 text-[13px] text-aring-ink-500">
                <span className="font-bold text-aring-ink-700">{row.nickname || '익명 사용자'}</span>
                <span aria-hidden>·</span>
                <span>{formatQnaDate(row.created_at)}</span>
              </div>

              {/* 본문 */}
              <div className="rounded-2xl border border-aring-green-line bg-white p-5 lg:p-6">
                <p className="text-[15px] lg:text-[16px] leading-[1.7] text-aring-ink-900 whitespace-pre-wrap break-words">
                  {row.content}
                </p>
                {row.image_url && (
                  <div className="mt-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={row.image_url}
                      alt="첨부 이미지"
                      className="max-w-full rounded-tile border border-aring-ink-100"
                    />
                  </div>
                )}
              </div>

              {/* 관리자 답변 */}
              <section className="rounded-2xl border border-aring-green-line bg-aring-green/[0.04] p-5 lg:p-6">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-aring-green tracking-wider">aring 답변</span>
                  {row.answered_at && (
                    <span className="text-[12px] text-aring-ink-400">· {formatQnaDate(row.answered_at)}</span>
                  )}
                </div>
                {status === 'answered' ? (
                  <p className="mt-2 text-[15px] lg:text-[16px] leading-[1.7] text-aring-ink-900 whitespace-pre-wrap break-words">
                    {row.answer}
                  </p>
                ) : (
                  <p className="mt-2 text-[15px] lg:text-[15px] leading-[1.6] text-aring-ink-500">
                    아직 답변이 등록되지 않았어요.<br />
                    확인 후 답변드릴게요.
                  </p>
                )}
              </section>

              {/* 하단 액션 */}
              <div className="pt-2 lg:flex lg:justify-end">
                <Link
                  href="/qna"
                  className="w-full lg:w-[200px] inline-flex items-center justify-center py-4 rounded-2xl font-bold text-[16px] border border-aring-ink-200 text-aring-ink-700 transition active:scale-95"
                >
                  목록으로
                </Link>
              </div>
            </article>
        </div>
        <BottomNav />
      </div>
    </main>
  );
}
