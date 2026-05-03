'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { TopNav, BottomNav } from '@/components/Nav';
import { thumbBg, type ThumbTone } from '@/lib/mock';
import {
  supabase,
  type Listing,
  type Comment,
} from '@/lib/supabase';

// ─────────────────────────────────────────────────────────────
// /my — 내 활동 대시보드 (MVP)
// 1) Profile (닉네임/소개/활동 요약/랜덤 메시지)
// 2) Quick menu (3 카드)
// 3) 내 상품 (Supabase listings, 상태 cycle 토글 가능)
// 4) 관심 상품 (localStorage liked ids → Supabase fetch)
// 5) 댓글 활동 (= /comments 와 동일 로직, 거래 히스토리 톤)
// ─────────────────────────────────────────────────────────────

const ANON_ID_KEY = 'aring_anon_user_id';
const ANON_NICK_KEY = 'aring_anon_nickname';
const ANON_BIO_KEY = 'aring_anon_bio';
const LIKED_KEY = 'aring_liked_product_ids';

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

const PROFILE_MESSAGES = [
  '오늘도 한 짝을 찾는 중 👀',
  '거래 성사 직전일지도 몰라요',
  '댓글이 오면 기회도 옵니다',
  '한 짝씩, 천천히 모아가요',
  '오늘 누군가 당신의 짝을 찾고 있어요',
];

const STATE_HINTS: Record<Listing['status'], string[]> = {
  open: [
    '지금 누군가 보고 있어요',
    '댓글 하나면 거래 시작',
    '거의 다 왔어요',
  ],
  matched: ['거래 진행 중이에요', '한 발짝 더 가까워졌어요'],
  closed: ['수고하셨어요 ✨', '한 짝의 짝, 잘 보내드렸어요'],
};

function pickRandom<T>(arr: T[], seed?: string): T {
  // seed 있으면 결정적 — 같은 상품에 같은 메시지 보장
  if (seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
    return arr[Math.abs(h) % arr.length];
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

const STATUS_LABEL: Record<Listing['status'], string> = {
  open: '판매중',
  matched: '거래중',
  closed: '완료',
};

const STATUS_BADGE: Record<Listing['status'], string> = {
  open: 'bg-aring-pastel-pink/40 text-aring-ink-900',
  matched: 'bg-aring-pastel-butter/60 text-aring-ink-900',
  closed: 'bg-aring-ink-100 text-aring-ink-500',
};

function nextStatus(s: Listing['status']): Listing['status'] | null {
  if (s === 'open') return 'matched';
  if (s === 'matched') return 'closed';
  return null;
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

function readLikedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LIKED_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// 데이터 타입
// ─────────────────────────────────────────────────────────────
type CommentSummary = {
  productId: string;
  brand: string;
  productName: string;
  image: string;
  tone: ThumbTone;
  kind: 'mine' | 'on_my_product';
  lastMessage: string;
  lastAuthor: string;
  lastAt: string;
  status: 'inquiring' | 'answered' | 'closed';
};

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
export default function MyPage() {
  const [userId, setUserId] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [bio, setBio] = useState<string>('');

  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [myCommentsCount, setMyCommentsCount] = useState(0); // 받은 댓글 수
  const [closedCount, setClosedCount] = useState(0);

  const [likedItems, setLikedItems] = useState<Listing[]>([]);
  const [commentSummaries, setCommentSummaries] = useState<CommentSummary[]>([]);

  const [loading, setLoading] = useState(true);

  // 프로필 메시지 — 마운트 시 1회만 결정 (re-render 시에도 안 바뀜)
  const profileMessage = useMemo(
    () => pickRandom(PROFILE_MESSAGES),
    []
  );

  // 1) localStorage에서 익명 정보 hydrate
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let id = localStorage.getItem(ANON_ID_KEY);
    if (!id) {
      id =
        (crypto.randomUUID && crypto.randomUUID()) ||
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      localStorage.setItem(ANON_ID_KEY, id);
    }
    setUserId(id);
    setNickname(localStorage.getItem(ANON_NICK_KEY) ?? '아링 친구');
    setBio(
      localStorage.getItem(ANON_BIO_KEY) ?? '한 짝의 짝을 찾고 있어요'
    );
  }, []);

  // 2) 데이터 fetch — userId 결정된 후
  useEffect(() => {
    if (!userId || !supabase) return;
    let cancelled = false;

    async function load() {
      setLoading(true);

      // (a) 내 상품 — 최신순
      const { data: listingsRaw } = await supabase!
        .from('listings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      const listings = (listingsRaw ?? []) as Listing[];
      const listingIds = listings.map((l) => l.id);

      // (b) 받은 댓글 수 — 내 상품에 달린 (작성자 ≠ 자신)
      let receivedCount = 0;
      let myProductCommentsRaw: Comment[] = [];
      if (listingIds.length > 0) {
        const { data, count } = await supabase!
          .from('comments')
          .select('*', { count: 'exact' })
          .in('product_id', listingIds)
          .neq('user_id', userId);
        receivedCount = count ?? 0;
        myProductCommentsRaw = (data ?? []) as Comment[];
      }

      // (c) 거래 완료 수
      const closed = listings.filter(
        (l) => l.status === 'matched' || l.status === 'closed'
      ).length;

      // (d) 관심 상품 — localStorage ids → Supabase fetch
      const likedIds = readLikedIds();
      let likedRaw: Listing[] = [];
      if (likedIds.length > 0) {
        const { data } = await supabase!
          .from('listings')
          .select('*')
          .in('id', likedIds);
        likedRaw = (data ?? []) as Listing[];
        // 최신 등록순 (= 등록일 desc)
        likedRaw.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
      }

      // (e) 댓글 활동 — /comments 와 동일 로직
      const { data: myCommentsRaw } = await supabase!
        .from('comments')
        .select('*')
        .eq('user_id', userId);
      const allComments: Comment[] = [
        ...((myCommentsRaw ?? []) as Comment[]),
        ...myProductCommentsRaw,
      ];
      const dedup = Array.from(
        new Map(allComments.map((c) => [c.id, c])).values()
      );

      const byProduct = new Map<string, Comment[]>();
      for (const c of dedup) {
        if (!byProduct.has(c.product_id)) byProduct.set(c.product_id, []);
        byProduct.get(c.product_id)!.push(c);
      }

      const productIds = Array.from(byProduct.keys());
      let summaries: CommentSummary[] = [];
      if (productIds.length > 0) {
        const { data: productsRaw } = await supabase!
          .from('listings')
          .select('id,brand,detail,shape,photo_url,status,user_id')
          .in('id', productIds);
        const productMap = new Map(
          (productsRaw ?? []).map((p) => [p.id, p as Listing])
        );

        summaries = productIds
          .map<CommentSummary | null>((pid) => {
            const list = (byProduct.get(pid) ?? []).sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            );
            const last = list[0];
            const product = productMap.get(pid);
            if (!product || !last) return null;

            const isMyProduct = product.user_id === userId;
            const productClosed =
              product.status === 'matched' || product.status === 'closed';
            const hasReply = list.some((c) => c.parent_id);

            return {
              productId: pid,
              brand: product.brand ?? '브랜드 미상',
              productName: product.detail ?? product.shape ?? '한 짝',
              image: product.photo_url,
              tone: pickTone(pid),
              kind: isMyProduct ? 'on_my_product' : 'mine',
              lastMessage: last.message,
              lastAuthor: last.user_name,
              lastAt: last.created_at,
              status: productClosed
                ? 'closed'
                : hasReply
                ? 'answered'
                : 'inquiring',
            };
          })
          .filter((x): x is CommentSummary => x !== null)
          .sort(
            (a, b) =>
              new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
          );
      }

      if (cancelled) return;
      setMyListings(listings);
      setMyCommentsCount(receivedCount);
      setClosedCount(closed);
      setLikedItems(likedRaw);
      setCommentSummaries(summaries);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // 상태 변경
  async function handleStatusChange(listing: Listing) {
    const next = nextStatus(listing.status);
    if (!next || !supabase) return;
    const { error } = await supabase
      .from('listings')
      .update({ status: next })
      .eq('id', listing.id)
      .eq('user_id', userId);
    if (error) {
      alert('상태 변경에 실패했습니다');
      return;
    }
    setMyListings((prev) =>
      prev.map((l) => (l.id === listing.id ? { ...l, status: next } : l))
    );
    if (next === 'matched' || next === 'closed') {
      // 거래 완료 카운트 재계산
      setClosedCount((c) => (listing.status === 'open' ? c + 1 : c));
    }
  }

  return (
    <main className="min-h-screen flex justify-center bg-gradient-to-b from-green-50 via-yellow-50 to-pink-50">
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

          {/* 1) Profile */}
          <ProfileHeader
            nickname={nickname}
            bio={bio}
            message={profileMessage}
            stats={{
              listings: myListings.length,
              comments: myCommentsCount,
              closed: closedCount,
            }}
          />

          {/* 2) Quick Menu */}
          <QuickMenu
            counts={{
              listings: myListings.length,
              liked: likedItems.length,
              comments: commentSummaries.length,
            }}
          />

          {/* 3) 내 상품 */}
          <MyListingsSection
            listings={myListings}
            loading={loading}
            onStatusChange={handleStatusChange}
          />

          {/* 4) 관심 상품 */}
          <LikedSection items={likedItems} loading={loading} />

          {/* 5) 댓글 활동 */}
          <CommentActivitySection
            items={commentSummaries}
            loading={loading}
          />
        </div>
        <BottomNav active="my" />
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// Profile Header
// ─────────────────────────────────────────────────────────────
function ProfileHeader({
  nickname,
  bio,
  message,
  stats,
}: {
  nickname: string;
  bio: string;
  message: string;
  stats: { listings: number; comments: number; closed: number };
}) {
  return (
    <section className="px-5 lg:px-8 pt-3 lg:pt-7 pb-5">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 lg:w-16 lg:h-16 shrink-0 rounded-full bg-aring-grad-pastel flex items-center justify-center text-[20px] lg:text-[22px] font-extrabold text-aring-ink-900">
          {(nickname || '?').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[16px] lg:text-[18px] font-extrabold text-aring-ink-900 truncate">
            {nickname || '아링 친구'}
          </p>
          <p className="mt-0.5 text-[12px] text-aring-ink-500 truncate">
            {bio}
          </p>
        </div>
      </div>

      {/* 랜덤 상태 메시지 */}
      <div className="mt-4 rounded-card bg-aring-grad-pastel px-4 py-3">
        <p className="text-[12.5px] font-bold text-aring-ink-900">
          {message}
        </p>
      </div>

      {/* 활동 요약 */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="등록" value={stats.listings} />
        <Stat label="받은 댓글" value={stats.comments} />
        <Stat label="거래 완료" value={stats.closed} />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-tile border border-aring-green-line bg-white px-3 py-3 text-center">
      <p className="text-[20px] font-extrabold tracking-tight text-aring-ink-900">
        {value}
      </p>
      <p className="mt-0.5 text-[10.5px] font-medium text-aring-ink-500">
        {label}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Quick Menu — 3개 카드 (anchor scroll)
// ─────────────────────────────────────────────────────────────
function QuickMenu({
  counts,
}: {
  counts: { listings: number; liked: number; comments: number };
}) {
  const items = [
    { key: 'listings', label: '내 상품', count: counts.listings, anchor: '#my-listings' },
    { key: 'liked', label: '관심 상품', count: counts.liked, anchor: '#liked' },
    { key: 'comments', label: '댓글', count: counts.comments, anchor: '#comments' },
  ];
  return (
    <section className="px-5 lg:px-8 pb-5">
      <div className="grid grid-cols-3 gap-2">
        {items.map((m) => (
          <a
            key={m.key}
            href={m.anchor}
            className="relative rounded-tile border border-aring-green-line bg-white px-3 py-3 text-center active:scale-[0.99] transition"
          >
            <p className="text-[12.5px] font-bold text-aring-ink-900">
              {m.label}
            </p>
            {m.count > 0 && (
              <span className="absolute top-1.5 right-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-pill bg-aring-ink-900 text-white text-[9.5px] font-extrabold">
                {m.count > 99 ? '99+' : m.count}
              </span>
            )}
          </a>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 내 상품 섹션
// ─────────────────────────────────────────────────────────────
function MyListingsSection({
  listings,
  loading,
  onStatusChange,
}: {
  listings: Listing[];
  loading: boolean;
  onStatusChange: (l: Listing) => void;
}) {
  return (
    <section id="my-listings" className="pt-3 pb-5 scroll-mt-20">
      <SectionHead title="내 상품" count={listings.length} />
      <div className="px-5 lg:px-8">
        {loading ? (
          <Skeleton />
        ) : listings.length === 0 ? (
          <EmptyBlock
            title="아직 등록한 상품이 없어요"
            sub="한 짝을 등록해 짝을 찾아주세요"
            ctaLabel="한 짝 등록하기"
            ctaHref="/register"
          />
        ) : (
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {listings.map((l) => (
              <MyListingCard
                key={l.id}
                listing={l}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function MyListingCard({
  listing,
  onStatusChange,
}: {
  listing: Listing;
  onStatusChange: (l: Listing) => void;
}) {
  const tone = pickTone(listing.id);
  const hint = pickRandom(STATE_HINTS[listing.status], listing.id);
  const canChange = listing.status !== 'closed';

  return (
    <div className="flex gap-3 rounded-tile border border-aring-green-line bg-white p-3">
      <Link
        href={`/items/${listing.id}`}
        className="shrink-0 w-[72px] h-[72px] rounded-tile overflow-hidden relative"
        style={{ background: thumbBg(tone) }}
      >
        {listing.photo_url && (
          <img
            src={listing.photo_url}
            alt={listing.brand ?? '한 짝'}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/items/${listing.id}`} className="block">
          <p className="text-[10.5px] font-bold tracking-wider text-aring-ink-500 truncate">
            {listing.brand ?? '브랜드 미상'}
          </p>
          <p className="mt-0.5 text-[13px] font-bold text-aring-ink-900 truncate">
            {listing.detail ?? listing.shape ?? '한 짝'}
          </p>
          <p className="mt-0.5 text-[10.5px] text-aring-ink-500">
            {relativeTime(listing.created_at)}
          </p>
        </Link>
        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => canChange && onStatusChange(listing)}
            disabled={!canChange}
            className={[
              'inline-flex items-center px-2 py-0.5 rounded-pill text-[10.5px] font-extrabold tracking-wider transition',
              STATUS_BADGE[listing.status],
              canChange ? 'active:scale-95' : 'opacity-70 cursor-default',
            ].join(' ')}
            title={canChange ? '클릭해서 다음 상태로' : ''}
          >
            {STATUS_LABEL[listing.status]}
            {canChange && <span className="ml-1 opacity-70">›</span>}
          </button>
          <span className="text-[10.5px] text-aring-ink-500 italic truncate">
            {hint}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 관심 상품 섹션
// ─────────────────────────────────────────────────────────────
function LikedSection({
  items,
  loading,
}: {
  items: Listing[];
  loading: boolean;
}) {
  return (
    <section id="liked" className="pt-3 pb-5 scroll-mt-20">
      <SectionHead
        title="관심 상품"
        count={items.length}
        sub={
          items.length > 0
            ? '이 중에 당신의 한 짝이 있을지도 몰라요'
            : undefined
        }
      />
      <div className="px-5 lg:px-8">
        {loading ? (
          <Skeleton />
        ) : items.length === 0 ? (
          <EmptyBlock
            title="관심만 두지 말고 말을 걸어보세요"
            sub="마음에 드는 한 짝을 발견하면 ♡로 모아보세요"
            ctaLabel="한 짝 둘러보기"
            ctaHref="/products"
          />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((l) => (
              <LikedCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function LikedCard({ listing }: { listing: Listing }) {
  const tone = pickTone(listing.id);
  return (
    <div className="flex flex-col rounded-tile border border-aring-green-line bg-white overflow-hidden">
      <Link
        href={`/items/${listing.id}`}
        className="relative aspect-square overflow-hidden block"
        style={{ background: thumbBg(tone) }}
      >
        {listing.photo_url && (
          <img
            src={listing.photo_url}
            alt={listing.brand ?? '한 짝'}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </Link>
      <div className="p-2.5">
        <p className="text-[10px] font-bold tracking-wider text-aring-ink-500 truncate">
          {listing.brand ?? '브랜드 미상'}
        </p>
        <p className="mt-0.5 text-[12px] font-bold text-aring-ink-900 truncate">
          {listing.detail ?? listing.shape ?? '한 짝'}
        </p>
        <Link
          href={`/items/${listing.id}#comments`}
          className="mt-2 inline-flex w-full items-center justify-center h-8 rounded-pill bg-aring-ink-900 text-white text-[11px] font-extrabold active:scale-[0.98] transition"
        >
          댓글 남기기
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 댓글 활동 섹션
// ─────────────────────────────────────────────────────────────
function CommentActivitySection({
  items,
  loading,
}: {
  items: CommentSummary[];
  loading: boolean;
}) {
  return (
    <section id="comments" className="pt-3 pb-5 scroll-mt-20">
      <SectionHead
        title="댓글"
        count={items.length}
        sub={
          items.length > 0
            ? '대화가 시작되면 거래도 시작됩니다'
            : undefined
        }
      />
      <div className="px-5 lg:px-8">
        {loading ? (
          <Skeleton />
        ) : items.length === 0 ? (
          <EmptyBlock
            title="첫 댓글이 거래를 만듭니다"
            sub="관심 있는 상품에 말을 걸어보세요"
            ctaLabel="한 짝 둘러보기"
            ctaHref="/products"
          />
        ) : (
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {items.map((s) => (
              <CommentSummaryCard key={s.productId} s={s} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CommentSummaryCard({ s }: { s: CommentSummary }) {
  const STATUS_TAG: Record<
    CommentSummary['status'],
    { label: string; cls: string }
  > = {
    inquiring: {
      label: '문의중',
      cls: 'bg-aring-pastel-pink/40 text-aring-ink-900',
    },
    answered: {
      label: '답변완료',
      cls: 'bg-aring-pastel-mint/60 text-aring-ink-900',
    },
    closed: {
      label: '거래완료',
      cls: 'bg-aring-ink-100 text-aring-ink-500',
    },
  };
  const tag = STATUS_TAG[s.status];

  return (
    <Link
      href={`/items/${s.productId}#comments`}
      className="flex gap-3 rounded-tile border border-aring-green-line bg-white p-3 active:scale-[0.99] transition"
    >
      <div
        className="relative w-[64px] h-[64px] shrink-0 rounded-tile overflow-hidden"
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
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
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
          <span
            className={[
              'inline-flex items-center px-1.5 py-0.5 rounded-pill text-[9.5px] font-extrabold tracking-wider',
              tag.cls,
            ].join(' ')}
          >
            {tag.label}
          </span>
        </div>
        <p className="mt-1 text-[10.5px] font-bold tracking-wider text-aring-ink-500 truncate">
          {s.brand}
        </p>
        <p className="text-[12.5px] font-bold text-aring-ink-900 truncate">
          {s.productName}
        </p>
        <p className="mt-1 text-[11.5px] text-aring-ink-700 truncate">
          <span className="font-semibold">{s.lastAuthor}</span>{' '}
          <span className="text-aring-ink-500">·</span> {s.lastMessage}
        </p>
        <p className="mt-0.5 text-[10px] text-aring-ink-500">
          {relativeTime(s.lastAt)}
        </p>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// 공통 — Section header / Empty / Skeleton
// ─────────────────────────────────────────────────────────────
function SectionHead({
  title,
  count,
  sub,
}: {
  title: string;
  count?: number;
  sub?: string;
}) {
  return (
    <div className="px-5 lg:px-8 mb-3 flex items-end justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-[16px] lg:text-[18px] font-extrabold tracking-tight text-aring-ink-900">
            {title}
          </h2>
          {typeof count === 'number' && count > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-pill bg-aring-ink-900 text-white text-[10px] font-extrabold">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </div>
        {sub && (
          <p className="mt-1 text-[11.5px] text-aring-ink-500">{sub}</p>
        )}
      </div>
    </div>
  );
}

function EmptyBlock({
  title,
  sub,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  sub: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="rounded-card bg-aring-ink-100 px-5 py-8 text-center">
      <p className="text-[14px] font-extrabold text-aring-ink-900">{title}</p>
      <p className="mt-1 text-[11.5px] text-aring-ink-500">{sub}</p>
      <Link
        href={ctaHref}
        className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-pill bg-aring-ink-900 text-white text-[12px] font-extrabold active:scale-95 transition"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="h-[88px] rounded-tile bg-aring-ink-100 animate-pulse"
        />
      ))}
    </div>
  );
}
