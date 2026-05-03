'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TopNav, BottomNav } from '@/components/Nav';
import { thumbBg, type ThumbTone } from '@/lib/mock';
import { supabase, type Comment, type Listing } from '@/lib/supabase';

// ─────────────────────────────────────────────────────────────
// /comments — 내 댓글 활동 리스트
//   - 내가 작성한 댓글 (mine)
//   - 내 상품에 달린 댓글 (on_my_product)
// 두 set을 product_id로 그룹핑 → 각 그룹에서 마지막 댓글 + 상태 도출
// 카드 클릭 → /items/[id]#comments (해시 스크롤)
// ─────────────────────────────────────────────────────────────

const ANON_ID_KEY = 'aring_anon_user_id';

const TONE_ROTATION: ThumbTone[] = [
  'pink',
  'peach',
  'butter',
  'mint',
  'sky',
  'sage',
];

function pickTone(seed: string): ThumbTone {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return TONE_ROTATION[Math.abs(h) % TONE_ROTATION.length];
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}일 전`;
  return new Date(iso).toLocaleDateString('ko-KR');
}

type Status = 'inquiring' | 'answered' | 'closed';
type Kind = 'mine' | 'on_my_product';

type Summary = {
  productId: string;
  brand: string;
  productName: string;
  image: string;
  tone: ThumbTone;
  kind: Kind;
  lastMessage: string;
  lastAuthor: string;
  lastAt: string;
  status: Status;
};

// 댓글 리스트에서 상태 도출
function deriveStatus(
  productStatus: Listing['status'] | undefined,
  comments: Comment[]
): Status {
  if (productStatus === 'matched' || productStatus === 'closed') return 'closed';
  // 답변완료: 답글이 1개 이상 있으면
  const hasReply = comments.some((c) => c.parent_id);
  return hasReply ? 'answered' : 'inquiring';
}

// ─────────────────────────────────────────────────────────────
// 카드 한 개
// ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Status }) {
  const cfg: Record<Status, { label: string; className: string }> = {
    inquiring: {
      label: '문의중',
      className: 'bg-aring-pastel-pink/40 text-aring-ink-900',
    },
    answered: {
      label: '답변완료',
      className: 'bg-aring-pastel-mint/60 text-aring-ink-900',
    },
    closed: {
      label: '거래완료',
      className: 'bg-aring-ink-100 text-aring-ink-500',
    },
  };
  const { label, className } = cfg[status];
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded-pill text-[10.5px] font-extrabold tracking-wider',
        className,
      ].join(' ')}
    >
      {label}
    </span>
  );
}

function CommentSummaryCard({ s }: { s: Summary }) {
  return (
    <Link
      href={`/items/${s.productId}#comments`}
      className="flex gap-3 rounded-tile border border-aring-green-line bg-white p-3 active:scale-[0.99] transition"
    >
      {/* 썸네일 */}
      <div
        className="relative w-[68px] h-[68px] shrink-0 rounded-tile overflow-hidden"
        style={{ background: thumbBg(s.tone) }}
      >
        {s.image && (
          <img
            src={s.image}
            alt={`${s.brand} ${s.productName}`}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>

      {/* 본문 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={[
              'inline-flex items-center px-1.5 py-0.5 rounded-pill text-[9.5px] font-extrabold tracking-wider',
              s.kind === 'on_my_product'
                ? 'bg-aring-ink-900 text-white'
                : 'bg-aring-ink-100 text-aring-ink-700',
            ].join(' ')}
          >
            {s.kind === 'on_my_product' ? '내 상품 댓글' : '내가 남긴 댓글'}
          </span>
          <StatusBadge status={s.status} />
        </div>
        <p className="mt-1 text-[10.5px] font-bold tracking-wider text-aring-ink-500 truncate">
          {s.brand}
        </p>
        <p className="text-[13px] font-bold text-aring-ink-900 truncate">
          {s.productName}
        </p>
        <p className="mt-1 text-[12px] text-aring-ink-700 truncate">
          <span className="font-semibold">{s.lastAuthor}</span>{' '}
          <span className="text-aring-ink-500">·</span> {s.lastMessage}
        </p>
        <p className="mt-0.5 text-[10.5px] text-aring-ink-500">
          {relativeTime(s.lastAt)}
        </p>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
export default function CommentsPage() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const userId =
        typeof window !== 'undefined'
          ? localStorage.getItem(ANON_ID_KEY)
          : null;

      if (!supabase) {
        if (!cancelled) {
          setSummaries([]);
          setLoading(false);
        }
        return;
      }

      // 익명 id가 없으면 — 아직 댓글 안 남긴 사용자
      if (!userId) {
        if (!cancelled) {
          setSummaries([]);
          setLoading(false);
        }
        return;
      }

      try {
        // 1) 내가 작성한 댓글
        const { data: myCommentsRaw } = await supabase
          .from('comments')
          .select('*')
          .eq('user_id', userId);

        // 2) 내 상품 id 목록
        const { data: myListingsRaw } = await supabase
          .from('listings')
          .select('id')
          .eq('user_id', userId);

        const myListingIds = (myListingsRaw ?? []).map((l) => l.id);

        // 3) 내 상품에 달린 댓글 (작성자 ≠ 자신)
        let onMyProductRaw: Comment[] = [];
        if (myListingIds.length > 0) {
          const { data } = await supabase
            .from('comments')
            .select('*')
            .in('product_id', myListingIds)
            .neq('user_id', userId);
          onMyProductRaw = (data ?? []) as Comment[];
        }

        // 4) 합치고 product_id로 그룹핑
        const all: Comment[] = [
          ...((myCommentsRaw ?? []) as Comment[]),
          ...onMyProductRaw,
        ];

        // 중복 제거 (같은 댓글이 두 번 잡힐 수 있음)
        const dedup = Array.from(
          new Map(all.map((c) => [c.id, c])).values()
        );

        const byProduct = new Map<string, Comment[]>();
        for (const c of dedup) {
          if (!byProduct.has(c.product_id)) byProduct.set(c.product_id, []);
          byProduct.get(c.product_id)!.push(c);
        }

        const productIds = Array.from(byProduct.keys());
        if (productIds.length === 0) {
          if (!cancelled) {
            setSummaries([]);
            setLoading(false);
          }
          return;
        }

        // 5) 상품 정보 한 번에 fetch
        const { data: productsRaw } = await supabase
          .from('listings')
          .select('id,brand,detail,shape,photo_url,status,user_id')
          .in('id', productIds);

        const productMap = new Map(
          (productsRaw ?? []).map((p) => [p.id, p as Listing])
        );

        // 6) Summary 생성
        const list: Summary[] = productIds
          .map((pid) => {
            const comments = (byProduct.get(pid) ?? []).sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            );
            const last = comments[0];
            const product = productMap.get(pid);
            if (!product || !last) return null;

            const isMyProduct = product.user_id === userId;

            return {
              productId: pid,
              brand: product.brand ?? '브랜드 미상',
              productName:
                product.detail ?? product.shape ?? '한 짝',
              image: product.photo_url,
              tone: pickTone(pid),
              kind: isMyProduct ? 'on_my_product' : 'mine',
              lastMessage: last.message,
              lastAuthor: last.user_name,
              lastAt: last.created_at,
              status: deriveStatus(product.status, comments),
            } as Summary;
          })
          .filter((x): x is Summary => x !== null)
          .sort(
            (a, b) =>
              new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
          );

        if (!cancelled) {
          setSummaries(list);
          setLoading(false);
        }
      } catch (e) {
        console.error('[aring] /comments load error', e);
        if (!cancelled) {
          setError('댓글 활동을 불러오지 못했습니다');
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen flex justify-center bg-aring-grad-pastel">
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
          <div className="px-5 lg:px-8 pt-3 lg:pt-7 pb-3 lg:pb-5">
            <h1 className="text-[20px] lg:text-[26px] font-extrabold tracking-tight text-aring-ink-900">
              댓글
            </h1>
            <p className="mt-0.5 text-[12px] text-aring-ink-500">
              내가 남기거나, 내 상품에 달린 문의를 모아봤어요
            </p>
          </div>

          {/* 본문 */}
          {loading ? (
            <div className="px-5 lg:px-8 py-16 text-center">
              <div className="w-8 h-8 mx-auto rounded-full border-2 border-aring-ink-100 border-t-aring-ink-900 animate-spin" />
              <p className="mt-3 text-[12px] text-aring-ink-500">
                불러오는 중…
              </p>
            </div>
          ) : error ? (
            <div className="px-5 lg:px-8 py-16 text-center">
              <p className="text-[13px] font-bold text-aring-ink-900">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex items-center justify-center px-5 py-2.5 rounded-pill bg-aring-ink-900 text-white text-[13px] font-extrabold"
              >
                다시 시도
              </button>
            </div>
          ) : summaries.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="px-5 lg:px-8 space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
              {summaries.map((s) => (
                <CommentSummaryCard key={s.productId} s={s} />
              ))}
            </div>
          )}
        </div>
        <BottomNav active="chat" />
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="px-5 lg:px-8 py-16 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-aring-grad-pastel flex items-center justify-center text-aring-ink-900">
        <svg
          className="w-7 h-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" />
          <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
        </svg>
      </div>
      <h2 className="mt-4 text-[15px] font-extrabold text-aring-ink-900">
        아직 주고받은 댓글이 없어요
      </h2>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-aring-ink-500 max-w-[260px]">
        관심 있는 상품에 댓글을 남기면 이곳에서 확인할 수 있어요
      </p>
      <Link
        href="/products"
        className="mt-5 inline-flex items-center justify-center px-5 py-2.5 rounded-pill bg-aring-ink-900 text-white text-[13px] font-extrabold active:scale-95 transition"
      >
        한 짝 둘러보기
      </Link>
    </div>
  );
}
