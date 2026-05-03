'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getItemDetail,
  getItemSummary,
  formatKRW,
  thumbBg,
  type ItemDetail,
  type ItemSummary,
  type ThumbTone,
    readLikedIds, writeLikedIds,
} from '@/lib/mock';
import { supabase, type Listing } from '@/lib/supabase';
import { TopNav, BottomNav } from '@/components/Nav';
import { CommentSection } from '@/components/CommentSection';

// ─────────────────────────────────────────────────────────────
// 아이콘 (inline SVG)
// ─────────────────────────────────────────────────────────────
type IconProps = { className?: string; strokeWidth?: number };

const IconArrowLeft = ({ className = 'w-5 h-5', strokeWidth = 2 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

const IconShare = ({ className = 'w-5 h-5', strokeWidth = 2 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const IconHeart = ({ className = 'w-5 h-5', strokeWidth = 2, filled = false }: IconProps & { filled?: boolean }) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const IconChat = ({ className = 'w-5 h-5', strokeWidth = 2 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const IconMore = ({ className = 'w-5 h-5', strokeWidth = 2 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="12" cy="19" r="1.6" />
  </svg>
);

const IconSparkle = ({ className = 'w-3.5 h-3.5', strokeWidth = 2 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M5.5 18.5l2.8-2.8M15.7 8.3l2.8-2.8" />
  </svg>
);

const IconStar = ({ className = 'w-3.5 h-3.5' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const IconChevronRight = ({ className = 'w-4 h-4', strokeWidth = 2 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// 헬퍼
// ─────────────────────────────────────────────────────────────
const log =
  (label: string, payload?: unknown) =>
  () =>
    console.log('[aring]', label, payload ?? '');

// Listing → ItemDetail 변환 (Supabase row → UI 모델)
const TONE_ROTATION: ThumbTone[] = ['pink', 'peach', 'butter', 'mint', 'sky', 'sage'];

function pickTone(seed: string, idx = 0): ThumbTone {
  // 같은 id는 항상 같은 톤이 되도록 seed hash
  let h = idx;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return TONE_ROTATION[Math.abs(h) % TONE_ROTATION.length];
}

function listingToItemDetail(row: Listing): ItemDetail & { viewCount?: number } {
  const detailTags = row.detail
    ? row.detail.split(/[,·\s]+/).filter(Boolean).slice(0, 5)
    : [];
  return {
    id: row.id,
    brand: row.brand ?? '브랜드 미상',
    name: row.detail ?? row.shape ?? '한 짝',
    price: row.price ?? 0,
    likes: (row as any).likes_count ?? 0,
    viewCount: row.view_count ?? 0,
    side: row.side,
    emoji: '◇',
    tone: pickTone(row.id),
    story: row.story ?? undefined,
    image: row.photo_url,
    images: [row.photo_url],
    ownerId: row.user_id, // 댓글 role 판정용
    ai: {
      shape: row.shape ?? '미상',
      material: row.material ?? '미상',
      color: '—',
      details: detailTags,
    },
    seller: {
      nickname: row.user_id ? row.user_id.slice(0, 6) + '…' : '등록자',
      rating: 5.0,
      deals: 0,
      region: row.region ?? '',
    },
    matchCandidateIds: [],
    createdAt: row.created_at,
  };
}

function listingToSummary(row: Listing, idx: number): ItemSummary {
  return {
    id: row.id,
    brand: row.brand ?? '브랜드 미상',
    name: row.detail ?? row.shape ?? '한 짝',
    price: row.price ?? undefined,
    side: row.side,
    image: row.photo_url,
    tone: pickTone(row.id, idx),
  };
}

// ─────────────────────────────────────────────────────────────
// 1) 갤러리 위 floating 액션 (back / share / more)
//    공통 TopNav가 항상 떠있으므로, back 버튼은 갤러리 위에 floating으로 배치
// ─────────────────────────────────────────────────────────────
function GalleryFloatingActions({ onBack, isOwner, itemId }: { onBack: () => void; isOwner: boolean; itemId: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setMenuOpen(false);
    if (!supabase) return;
    const confirmed = window.confirm('정말 삭제할까요? 삭제된 상품은 복구할 수 없어요.');
    if (!confirmed) return;
    const { error } = await supabase.from('listings').delete().eq('id', itemId);
    if (error) { alert('삭제에 실패했어요. 다시 시도해 주세요.'); return; }
    router.push('/my');
    router.refresh();
  }

  return (
    <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
      <button
        onClick={onBack}
        aria-label="뒤로"
        className="pointer-events-auto w-10 h-10 rounded-full glass-strong flex items-center justify-center text-aring-ink-900 active:scale-95 transition"
      >
        <IconArrowLeft />
      </button>
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          onClick={log('detail:share')}
          aria-label="공유"
          className="w-10 h-10 rounded-full glass-strong flex items-center justify-center text-aring-ink-900 active:scale-95 transition"
        >
          <IconShare />
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label="더보기"
            className="w-10 h-10 rounded-full glass-strong flex items-center justify-center text-aring-ink-900 active:scale-95 transition"
          >
            <IconMore />
          </button>
          {menuOpen && (
            <div className="absolute top-full right-0 mt-1.5 z-50 min-w-[140px] rounded-2xl bg-white border border-aring-green-line shadow-card overflow-hidden">
              {isOwner && (
                <>
                  <button
                    onClick={() => { setMenuOpen(false); router.push(`/items/${itemId}/edit`); }}
                    className="w-full text-left px-4 py-3 text-[13px] font-semibold text-aring-ink-900 hover:bg-aring-ink-100 transition"
                  >
                    ✏️ 수정하기
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-3 text-[13px] font-semibold text-red-400 hover:bg-red-50 transition border-t border-aring-ink-100"
                  >
                    🗑️ 삭제하기
                  </button>
                </>
              )}
              {!isOwner && (
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-left px-4 py-3 text-[13px] font-semibold text-aring-ink-500 hover:bg-aring-ink-100 transition"
                >
                  🚨 신고하기
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2) 이미지 갤러리 — swipe + dots
// ─────────────────────────────────────────────────────────────
function GallerySection({
  images,
  tone,
  onBack,
  isOwner,
  itemId,
}: {
  images: string[];
  tone: ItemDetail['tone'];
  onBack: () => void;
  isOwner?: boolean;
  itemId?: string;
}) {
  const [active, setActive] = useState(0);
  const showDots = images.length > 1;

  return (
    <section className="lg:mb-6">
      <div
        className="relative aspect-square w-full lg:rounded-card overflow-hidden bg-white"
        style={{ background: thumbBg(tone) }}
      >
        {/* 갤러리 floating 액션 (back / share / more) */}
        <GalleryFloatingActions onBack={onBack} isOwner={isOwner ?? false} itemId={itemId ?? ''} />

        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="shrink-0 w-full h-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          ))}
        </div>
        {showDots && (
          <>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`${i + 1}번 이미지`}
                  className={[
                    'rounded-full transition-all',
                    active === i ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/60',
                  ].join(' ')}
                />
              ))}
            </div>
            <div className="absolute bottom-4 right-4 px-2 py-1 rounded-pill bg-black/40 text-white text-[11px] font-bold backdrop-blur">
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 3) 핵심 정보 헤더
// ─────────────────────────────────────────────────────────────
function HeaderInfo({ item }: { item: ItemDetail }) {
  const [liked, setLiked] = useState(false);

  // 마운트 시 localStorage에서 현재 상태 hydrate
  useEffect(() => {
    setLiked(readLikedIds().includes(item.id));
  }, [item.id]);

  function toggle() {
    const ids = readLikedIds();
    const next = ids.includes(item.id)
      ? ids.filter((id) => id !== item.id)
      : [...ids, item.id];
        writeLikedIds(next);
    setLiked(next.includes(item.id));
    log('detail:like', { id: item.id, liked: next.includes(item.id) })();
  }

  return (
    <section className="px-5 lg:px-8 pt-5 lg:pt-7">
      <p className="text-[12px] font-bold tracking-wider text-aring-ink-500">{item.brand}</p>
      <h1 className="mt-1 text-[22px] lg:text-[26px] font-extrabold tracking-tight text-aring-ink-900">
        {item.name}
      </h1>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-[22px] lg:text-[26px] font-extrabold text-aring-ink-900">
          {item.price > 0 ? formatKRW(item.price) : '가격 협의'}
        </p>
        <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1 text-aring-ink-400">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="text-[12px] font-semibold">{((item as ItemDetail & {viewCount?: number}).viewCount) ?? 0}</span>
            </div>
            <button
          onClick={toggle}
          aria-label="찜하기"
          className={[
            'inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[12px] font-bold transition',
            liked
              ? 'bg-aring-pastel-pink text-aring-accent'
              : 'bg-aring-ink-100 text-aring-ink-500',
          ].join(' ')}
        >
          <IconHeart className="w-3.5 h-3.5" filled={liked} />
          {item.likes + (liked ? 1 : 0)}
        </button>
          </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 4) AI 분석 카드 — 형태 / 소재 / 컬러 / 디테일
// ─────────────────────────────────────────────────────────────
function AIAnalysisCard({ ai }: { ai: ItemDetail['ai'] }) {
  return (
    <section className="px-5 lg:px-8 mt-6">
      <div className="rounded-card border border-aring-green-line bg-white p-4 lg:p-5">
        <div className="flex items-center gap-1.5 mb-3">
          <IconSparkle className="w-3.5 h-3.5 text-aring-green" />
          <p className="text-[11px] font-extrabold tracking-wider text-aring-green">
            AI 분석
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 lg:gap-4">
          <KV label="형태" value={ai.shape} />
          <KV label="소재" value={ai.material} />
          <KV label="컬러" value={ai.color} />
        </div>
        {ai.details.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {ai.details.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-1 rounded-pill bg-aring-ink-100 text-[11px] font-semibold text-aring-ink-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10.5px] font-medium text-aring-ink-500">{label}</p>
      <p className="mt-0.5 text-[13px] font-bold text-aring-ink-900 leading-tight">
        {value}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5) 등록자 스토리
// ─────────────────────────────────────────────────────────────
function StorySection({ story, createdAt }: { story?: string; createdAt: string }) {
  if (!story) return null;
  const ago = relativeTime(createdAt);
  return (
    <section className="px-5 lg:px-8 mt-6">
      <h2 className="text-[14px] font-extrabold text-aring-ink-900 mb-2">
        등록자 한마디
      </h2>
      <p className="text-[13.5px] leading-[1.7] text-aring-ink-700 whitespace-pre-wrap break-words overflow-wrap-anywhere">{story}</p>
      <p className="mt-2 text-[11px] text-aring-ink-500">{ago}</p>
    </section>
  );
}

function relativeTime(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 0) return '방금 전';
    const min = Math.floor(diff / 60000);
    if (min < 1) return '방금 전';
    if (min < 60) return min + '분 전';
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr + '시간 전';
    const day = Math.floor(hr / 24);
    if (day < 7) return day + '일 전';
    const week = Math.floor(day / 7);
    if (day < 30) return week + '주 전';
    const month = Math.floor(day / 30);
    if (day < 365) return month + '개월 전';
    return Math.floor(day / 365) + '년 전';
  } catch {
    return '방금 전';
  }
}

// ─────────────────────────────────────────────────────────────
// 6) 비슷한 귀걸이 — 최대 5개, 카드 클릭 시 detail 이동
// ─────────────────────────────────────────────────────────────
function SimilarSection({ items }: { items: ItemSummary[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mt-7">
      <div className="px-5 lg:px-8 mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-[16px] lg:text-[18px] font-extrabold tracking-tight text-aring-ink-900">
            비슷한 귀걸이
          </h2>
          <p className="mt-0.5 text-[11.5px] text-aring-ink-500">
            AI가 형태·소재·디테일을 분석해 추천
          </p>
        </div>
        <span className="text-[11px] font-semibold text-aring-ink-500">
          {items.length}개
        </span>
      </div>

      <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 lg:px-8 pb-1">
        {items.map((it) => (
          <SimilarCard key={it.id} item={it} />
        ))}
      </div>
    </section>
  );
}

function SimilarCard({ item }: { item: ItemSummary }) {
  return (
    <Link
      href={`/items/${item.id}`}
      onClick={log('similar:tap', item.id)}
      className="shrink-0 w-[150px] flex flex-col rounded-tile border border-aring-green-line bg-white overflow-hidden text-left active:scale-[0.99] transition"
    >
      <div
        className="relative aspect-square overflow-hidden"
        style={{ background: thumbBg(item.tone) }}
      >
        <img
          src={item.image}
          alt={`${item.brand} ${item.name}`}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {typeof item.similarity === 'number' && (
          <span className="absolute top-2 left-2 rounded-pill bg-aring-ink-900 px-2 py-0.5 text-[10px] font-extrabold text-white">
            {item.similarity}%
          </span>
        )}
      </div>
      <div className="px-2.5 py-2">
        <p className="text-[10px] font-bold tracking-wider text-aring-ink-500 truncate">
          {item.brand}
        </p>
        <p className="mt-0.5 text-[12px] font-bold text-aring-ink-900 truncate">
          {item.name}
        </p>
        {typeof item.price === 'number' && item.price > 0 && (
          <p className="mt-1 text-[12px] font-extrabold text-aring-ink-900">
            {formatKRW(item.price)}
          </p>
        )}
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// 7) 등록자 프로필
// ─────────────────────────────────────────────────────────────
function SellerCard({ seller }: { seller: ItemDetail['seller'] }) {
  return (
    <section className="px-5 lg:px-8 mt-7">
      <h2 className="text-[14px] font-extrabold text-aring-ink-900 mb-2">
        등록자
      </h2>
      <button
        onClick={log('detail:seller')}
        className="w-full flex items-center gap-3 rounded-tile border border-aring-green-line bg-white p-3 lg:p-4 text-left active:scale-[0.99] transition"
      >
        <div className="w-11 h-11 shrink-0 rounded-full bg-aring-grad-pastel flex items-center justify-center text-[15px] font-extrabold text-aring-ink-900">
          {seller.nickname.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-bold text-aring-ink-900 truncate">
            {seller.nickname}
          </p>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-aring-ink-500">
            <span className="inline-flex items-center gap-0.5 text-aring-ink-700 font-semibold">
              <IconStar className="w-3 h-3 text-aring-accent" />
              {seller.rating.toFixed(1)}
            </span>
            <span>·</span>
            <span>거래 {seller.deals}회</span>
            {seller.region && (
              <>
                <span>·</span>
                <span>{seller.region}</span>
              </>
            )}
          </div>
        </div>
        <IconChevronRight className="w-4 h-4 shrink-0 text-aring-ink-500" />
      </button>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 로딩 / 404
// ─────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-10 h-10 mx-auto rounded-full border-2 border-aring-ink-100 border-t-aring-ink-900 animate-spin" />
        <p className="mt-3 text-[12px] text-aring-ink-500">불러오는 중…</p>
      </div>
    </main>
  );
}

function NotFoundScreen() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="text-center">
        <p className="text-[16px] font-extrabold text-aring-ink-900">
          상품을 찾을 수 없습니다
        </p>
        <p className="mt-1 text-[12.5px] text-aring-ink-500">
          등록이 종료되었거나 잘못된 링크일 수 있어요.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex items-center justify-center px-5 py-2.5 rounded-pill bg-aring-ink-900 text-white text-[13px] font-extrabold"
        >
          홈으로
        </Link>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
type LoadState = { status: 'loading' } | { status: 'ok'; item: ItemDetail & { viewCount?: number }; similars: ItemSummary[] } | { status: 'not-found' };

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // 1) mock id (r1~r4)는 mock 우선
      const mock = getItemDetail(params.id);
      if (mock) {
        const sims = mock.matchCandidateIds
          .slice(0, 5)
          .map((id) => getItemSummary(id))
          .filter((x): x is ItemSummary => x !== null);
        if (!cancelled) setState({ status: 'ok', item: mock, similars: sims });
        return;
      }

      // 2) Supabase fetch
      if (!supabase) {
        if (!cancelled) setState({ status: 'not-found' });
        return;
      }

      const { data: row, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', params.id)
        .maybeSingle();

      if (cancelled) return;
      if (error || !row) {
        setState({ status: 'not-found' });
        return;
      }

      const item = listingToItemDetail(row as Listing);

      // 2-1) 조회수 +1 — DB 서버에서 직접 증가 (race condition 안전)
      const nextViewCount = ((row as Listing).view_count ?? 0) + 1;
      supabase
        .rpc('increment_view_count', { listing_id: params.id })
        .then(({ error: vcErr }) => {
          if (vcErr) console.error('[aring] view_count update', vcErr);
        });

      // 3) 비슷한 귀걸이 5건 (자기 제외, open 상태, 최신순)
      const { data: simRows } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'open')
        .neq('id', params.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (cancelled) return;
      const similars = (simRows ?? []).map((r, i) =>
        listingToSummary(r as Listing, i)
      );

      setState({ status: 'ok', item: { ...item, viewCount: nextViewCount }, similars });

      // 4) 소유자 여부 체크
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id && session.user.id === row.user_id) {
        setIsOwner(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (state.status === 'loading') return <LoadingScreen />;
  if (state.status === 'not-found') return <NotFoundScreen />;

  const { item, similars } = state;

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
        {/* 본문 — BottomNav(64px) + safe-area 만큼 padding */}
        <div className="pb-28 lg:pb-12">
          <TopNav />
          <GallerySection
            images={item.images}
            tone={item.tone}
            onBack={() => router.back()}
            isOwner={isOwner}
            itemId={item.id}
          />
          <HeaderInfo item={item} />
          <AIAnalysisCard ai={item.ai} />
          <StorySection story={item.story} createdAt={item.createdAt} />
          <SimilarSection items={similars} />
          <SellerCard seller={item.seller} />
          <div id="comments">
            <CommentSection productId={item.id} ownerId={item.ownerId} />
          </div>
        </div>
        <BottomNav />
      </div>
    </main>
  );
}
