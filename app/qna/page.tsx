'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TopNav, BottomNav } from '@/components/Nav';
import { supabase } from '@/lib/supabase';
import {
  type QnaRow,
  QNA_CATEGORY_LABEL,
  ANSWER_STATUS_LABEL,
  getAnswerStatus,
  formatQnaDate,
} from '@/lib/qna';

// ─────────────────────────────────────────────────────────────
// /qna — Q&A 목록
// ─────────────────────────────────────────────────────────────

export default function QnaListPage() {
  const router = useRouter();
  const [rows, setRows] = useState<QnaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabase) { setLoading(false); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      setIsLoggedIn(!!session);
      setCurrentUserId(session?.user?.id ?? null);

      const { data, error } = await supabase
        .from('qna')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (cancelled) return;
      if (error) {
        console.error('[aring] qna list error', error);
        setError('문의 목록을 불러오지 못했어요');
        setLoading(false);
        return;
      }
      setRows((data ?? []) as QnaRow[]);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  function handleAsk() {
    if (!isLoggedIn) {
      router.push('/login?redirect=/qna/new');
      return;
    }
    router.push('/qna/new');
  }

  // 비공개 글은 작성자 본인에게만 노출 (관리자 권한은 TODO)
  const visibleRows = rows.filter((r) =>
    !r.is_private || (currentUserId && r.user_id === currentUserId)
  );
  const total = visibleRows.length;

  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
        <div className="pb-28 lg:pb-10">
          <TopNav />

          {/* 헤더 */}
          <div className="px-5 lg:px-8 pt-3 lg:pt-7 pb-3">
            <h1 className="text-[24px] lg:text-[26px] font-bold tracking-tight text-aring-ink-900">Q&amp;A</h1>
            <p className="mt-1 text-[15px] lg:text-[15px] leading-[1.5] text-aring-ink-500">
              aring 이용 중 궁금한 점을 남겨주세요.<br />
              확인 후 답변드릴게요.
            </p>
          </div>

          {/* 문의하기 + 카운트 */}
          <div className="px-5 lg:px-8 pb-3 flex items-center justify-between">
            <p className="text-[15px] lg:text-[15px] font-bold text-aring-ink-700">
              전체 <span className="text-aring-ink-900">{total}</span>건
            </p>
            <button
              onClick={handleAsk}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-pill bg-aring-ink-900 text-white text-[14px] lg:text-[15px] font-bold shadow-cta active:scale-95 transition"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              문의하기
            </button>
          </div>

          {/* ── 본문 ── */}
          {loading ? (
            <div className="px-5 lg:px-8 py-16 text-center">
              <div className="w-8 h-8 mx-auto rounded-full border-2 border-aring-ink-100 border-t-aring-ink-900 animate-spin" />
              <p className="mt-3 text-[15px] lg:text-[15px] text-aring-ink-500">불러오는 중…</p>
            </div>
          ) : error ? (
            <div className="px-5 lg:px-8 py-16 text-center">
              <p className="text-[15px] lg:text-[15px] font-bold text-aring-ink-900">{error}</p>
            </div>
          ) : visibleRows.length === 0 ? (
            <div className="px-5 lg:px-8 py-16 text-center">
              <p className="text-[15px] lg:text-[15px] font-bold text-aring-ink-900">아직 등록된 문의가 없어요</p>
              <p className="mt-1 text-[15px] lg:text-[15px] leading-[1.5] text-aring-ink-500">첫 문의를 남겨주세요</p>
              <button
                onClick={handleAsk}
                className="mt-4 inline-flex items-center justify-center px-5 py-2.5 rounded-pill bg-aring-ink-900 text-white text-[15px] lg:text-[15px] font-bold"
              >
                문의하기
              </button>
            </div>
          ) : (
            <>
              {/* 모바일 카드 */}
              <ul className="lg:hidden mx-5 rounded-2xl bg-white border border-aring-green-line overflow-hidden divide-y divide-aring-ink-100">
                {visibleRows.map((r, i) => (
                  <MobileRow key={r.id} row={r} no={total - i} />
                ))}
              </ul>

              {/* PC 테이블 */}
              <div className="hidden lg:block mx-8 rounded-2xl bg-white border border-aring-green-line overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-2.5 bg-aring-ink-100/40 border-b border-aring-ink-100 text-[14px] font-bold text-aring-ink-500 uppercase tracking-wide">
                  <div className="w-12 text-center flex-shrink-0">No.</div>
                  <div className="w-28 flex-shrink-0">문의 유형</div>
                  <div className="flex-1 min-w-0">제목</div>
                  <div className="w-24 flex-shrink-0">작성자</div>
                  <div className="w-20 text-center flex-shrink-0">답변 상태</div>
                  <div className="w-24 text-right flex-shrink-0">작성일</div>
                </div>
                {visibleRows.map((r, i) => (
                  <PcRow key={r.id} row={r} no={total - i} />
                ))}
              </div>
            </>
          )}
        </div>
        <BottomNav />
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: 'pending' | 'answered' }) {
  const cls = status === 'answered'
    ? 'bg-aring-green/10 text-aring-green'
    : 'bg-aring-ink-100 text-aring-ink-500';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-pill text-[11px] lg:text-[12px] font-bold ${cls}`}>
      {ANSWER_STATUS_LABEL[status]}
    </span>
  );
}

function CategoryBadge({ category }: { category: QnaRow['category'] }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-pill text-[11px] lg:text-[12px] font-bold bg-aring-ink-100 text-aring-ink-700">
      {QNA_CATEGORY_LABEL[category]}
    </span>
  );
}

function MobileRow({ row, no }: { row: QnaRow; no: number }) {
  const status = getAnswerStatus(row);
  return (
    <li>
      <Link href={`/qna/${row.id}`} className="block px-4 py-3 active:bg-aring-ink-100/40 transition">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[12px] font-bold text-aring-ink-400">#{no}</span>
          <CategoryBadge category={row.category} />
          {row.is_private && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-pill text-[11px] font-bold bg-aring-ink-100 text-aring-ink-500">
              비공개
            </span>
          )}
          <StatusBadge status={status} />
        </div>
        <p className="mt-1.5 text-[15px] font-bold text-aring-ink-900 truncate">{row.title}</p>
        <div className="mt-1 flex items-center justify-between text-[12px] text-aring-ink-500">
          <span className="truncate">{row.nickname || '익명 사용자'}</span>
          <span>{formatQnaDate(row.created_at)}</span>
        </div>
      </Link>
    </li>
  );
}

function PcRow({ row, no }: { row: QnaRow; no: number }) {
  const status = getAnswerStatus(row);
  return (
    <Link href={`/qna/${row.id}`} className="block">
      <div className="flex items-center gap-3 px-6 py-3 hover:bg-aring-ink-100/30 transition-colors border-b border-aring-ink-100 last:border-b-0">
        <div className="w-12 text-center text-[14px] font-bold text-aring-ink-400 flex-shrink-0">{no}</div>
        <div className="w-28 flex-shrink-0">
          <CategoryBadge category={row.category} />
        </div>
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <p className="text-[15px] font-bold text-aring-ink-900 truncate">{row.title}</p>
          {row.is_private && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-pill text-[11px] font-bold bg-aring-ink-100 text-aring-ink-500 flex-shrink-0">
              비공개
            </span>
          )}
        </div>
        <div className="w-24 flex-shrink-0 text-[13px] text-aring-ink-700 truncate">{row.nickname || '익명 사용자'}</div>
        <div className="w-20 text-center flex-shrink-0">
          <StatusBadge status={status} />
        </div>
        <div className="w-24 text-right flex-shrink-0 text-[13px] text-aring-ink-400">{formatQnaDate(row.created_at)}</div>
      </div>
    </Link>
  );
}
