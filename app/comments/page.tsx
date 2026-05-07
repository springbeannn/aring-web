'use client';

import { useEffect, useState } from 'react';
import { TopNav, BottomNav } from '@/components/Nav';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

/* ── 유틸 ───────────────────────────────────── */
function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}일 전`;
  if (day < 30) return `${Math.floor(day / 7)}주 전`;
  if (day < 365) return `${Math.floor(day / 30)}개월 전`;
  return `${Math.floor(day / 365)}년 전`;
}

/* ── 상태 뱃지 ──────────────────────────────── */
const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  open:    { label: '문의중',   cls: 'bg-pink-100 text-pink-700' },
  matched: { label: '거래완료', cls: 'bg-gray-100 text-gray-500' },
  closed:  { label: '거래완료', cls: 'bg-gray-100 text-gray-500' },
  selling: { label: '판매중',   cls: 'bg-green-100 text-green-700' },
  trading: { label: '거래중',   cls: 'bg-yellow-100 text-yellow-700' },
};
function StatusBadge({ status }: { status?: string | null }) {
  const s = STATUS_MAP[status ?? ''] ?? { label: '문의중', cls: 'bg-pink-100 text-pink-700' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-bold ${s.cls}`}>
      {s.label}
    </span>
  );
}

/* ── 태그 칩 ─────────────────────────────────── */
function TagChips({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t, i) => (
        <span key={i} className="px-1.5 py-0.5 rounded-md bg-aring-ink-100 text-aring-ink-600 text-[12px] font-medium">
          {t}
        </span>
      ))}
    </div>
  );
}

/* ── 타입 ────────────────────────────────────── */
interface Listing {
  brand?: string | null;
  material?: string | null;
  shape?: string | null;
  photo_url?: string | null;
  status?: string | null;
  view_count?: number | null;
}
interface Comment {
  id: string;
  product_id: string;
  user_name: string;
  message: string;
  created_at: string;
  parent_id?: string | null;
  listing: Listing | null;
}

/* ── 모바일 Row ──────────────────────────────── */
function MobileRow({ c, no }: { c: Comment; no: number }) {
  const listing = c.listing;
  const brand = listing?.brand ?? '브랜드 미상';
  const tags = [listing?.material, listing?.shape].filter(Boolean) as string[];
  const imgUrl = listing?.photo_url;

  return (
    <Link href={`/items/${c.product_id}`} className="block">
      <div className="hover:bg-aring-ink-50 transition-colors pt-3 pb-2">
        {/* 썸네일 + 내용 */}
        <div className="flex gap-3 px-4">
          {/* 썸네일 */}
          <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-aring-ink-100">
            {imgUrl ? (
              <img src={imgUrl} alt={brand} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-aring-ink-300 text-xl">◇</div>
            )}
          </div>

          {/* 내용 */}
          <div className="flex-1 min-w-0">
            {/* 상단: 번호 + 상태 */}
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[12px] font-bold text-aring-ink-400">No.{no}</span>
              <StatusBadge status={listing?.status} />
            </div>

            {/* 브랜드 */}
            <p className="text-[12px] font-bold text-aring-ink-900 truncate">{brand}</p>

            {/* 태그 */}
            {tags.length > 0 && (
              <div className="mt-0.5">
                <TagChips tags={tags} />
              </div>
            )}

            {/* 댓글 내용 */}
            <p className="mt-1 text-[12px] text-aring-ink-800 line-clamp-2 leading-relaxed">
              {c.message}
            </p>
          </div>
        </div>

        {/* 하단 메타: 작성자 · 시간 · 조회 · 좋아요 — 전체 너비 */}
        <div className="mt-2 px-4 flex items-center gap-2 text-[12px] text-aring-ink-400 whitespace-nowrap overflow-hidden">
          <span className="font-medium text-aring-ink-600 truncate">{c.user_name || '익명'}</span>
          <span>·</span>
          <span className="flex-shrink-0">{relativeTime(c.created_at)}</span>
          <span>·</span>
          <span className="flex-shrink-0">조회 {c.listing?.view_count ?? 0}</span>
          <span>·</span>
          <span className="flex-shrink-0">♡ 0</span>
        </div>
      </div>
    </Link>
  );
}

/* ── PC Row ──────────────────────────────────── */
function PcRow({ c, no }: { c: Comment; no: number }) {
  const listing = c.listing;
  const brand = listing?.brand ?? '브랜드 미상';
  const tags = [listing?.material, listing?.shape].filter(Boolean) as string[];
  const imgUrl = listing?.photo_url;

  return (
    <Link href={`/items/${c.product_id}`} className="block">
      <div className="flex items-center gap-3 px-6 py-3 hover:bg-aring-ink-50 transition-colors border-b border-aring-ink-100 last:border-b-0">
        {/* No */}
        <div className="w-10 text-center text-[13px] text-aring-ink-400 font-bold flex-shrink-0">
          {no}
        </div>

        {/* 사진 */}
        <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-aring-ink-100">
          {imgUrl ? (
            <img src={imgUrl} alt={brand} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-aring-ink-300 text-xl">◇</div>
          )}
        </div>

        {/* 제품명 */}
        <div className="w-28 flex-shrink-0">
          <p className="text-[12px] font-bold text-aring-ink-900 truncate">{brand}</p>
        </div>

        {/* 상태 */}
        <div className="w-16 flex-shrink-0">
          <StatusBadge status={listing?.status} />
        </div>

        {/* 태그 */}
        <div className="w-28 flex-shrink-0">
          <TagChips tags={tags} />
        </div>

        {/* 댓글 내용 */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-aring-ink-800 line-clamp-2 leading-relaxed">{c.message}</p>
        </div>

        {/* 작성자 */}
        <div className="w-20 flex-shrink-0 text-[12px] text-aring-ink-600 font-medium truncate">
          {c.user_name || '익명'}
        </div>

        {/* 시간 */}
        <div className="w-16 flex-shrink-0 text-[12px] text-aring-ink-400 text-right">
          {relativeTime(c.created_at)}
        </div>

        {/* 조회 */}
        <div className="w-10 flex-shrink-0 text-[12px] text-aring-ink-400 text-right">{c.listing?.view_count ?? 0}</div>

        {/* 좋아요 */}
        <div className="w-10 flex-shrink-0 text-[12px] text-aring-ink-400 text-right">♡ 0</div>
      </div>
    </Link>
  );
}

/* ── 메인 페이지 ─────────────────────────────── */
export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    async function load() {
      const { data: rawComments } = await supabase!
        .from('comments')
        .select('id, product_id, user_id, user_name, role, message, parent_id, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      const raw = rawComments ?? [];
      const productIds = [...new Set(raw.map((c: any) => c.product_id))];
      let listingMap: Record<string, Listing> = {};

      if (productIds.length > 0) {
        const { data: listings } = await supabase!
          .from('listings')
          .select('id, brand, material, shape, photo_url, status, view_count')
          .in('id', productIds);
        for (const l of listings ?? []) {
          listingMap[l.id] = { brand: l.brand, material: l.material, shape: l.shape, photo_url: l.photo_url, status: l.status, view_count: l.view_count };
        }
      }

      const merged: Comment[] = raw.map((c: any) => ({
        ...c,
        listing: listingMap[c.product_id] ?? null,
      }));

      setComments(merged);
      setLoading(false);
    }
    load();
  }, []);

  const total = comments.length;

  return (
    <main className="min-h-screen flex justify-center bg-gradient-to-b from-pink-50 via-yellow-50 to-green-50">
      <div className="relative w-full max-w-[440px] min-h-screen overflow-hidden sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
        <div className="pb-28 lg:pb-12">
          <TopNav />

          {/* 헤더 */}
          <div className="px-5 lg:px-8 pt-3 pb-2">
            <h1 className="text-[22px] font-extrabold tracking-tight text-aring-ink-900">댓글</h1>
            <p className="mt-0.5 text-[13px] text-aring-ink-500">한 짝을 찾는 이야기들이 시간순으로 모였어요</p>
            {!loading && (
              <p className="mt-1 text-[13px] font-bold text-aring-ink-700">전체 댓글 {total}개</p>
            )}
          </div>

          {/* 로딩 */}
          {loading && (
            <div className="flex justify-center py-20 text-aring-ink-400 text-sm">불러오는 중…</div>
          )}

          {/* 빈 상태 */}
          {!loading && comments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-aring-ink-400">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-sm">아직 댓글이 없어요</p>
            </div>
          )}

          {/* ── 모바일 리스트 (lg 미만) ── */}
          {!loading && comments.length > 0 && (
            <div className="lg:hidden mt-2 mx-4 rounded-2xl bg-white shadow-card border border-aring-ink-100 overflow-hidden divide-y divide-aring-ink-100">
              {comments.map((c, i) => (
                <MobileRow key={c.id} c={c} no={total - i} />
              ))}
            </div>
          )}

          {/* ── PC 테이블 (lg 이상) ── */}
          {!loading && comments.length > 0 && (
            <div className="hidden lg:block mt-2 mx-6 rounded-2xl bg-white shadow-card border border-aring-ink-100 overflow-hidden">
              {/* 헤더 */}
              <div className="flex items-center gap-3 px-6 py-2.5 bg-aring-ink-50 border-b border-aring-ink-100 text-[13px] font-bold text-aring-ink-500 uppercase tracking-wide">
                <div className="w-10 text-center flex-shrink-0">No.</div>
                <div className="w-14 flex-shrink-0">사진</div>
                <div className="w-28 flex-shrink-0">제품명</div>
                <div className="w-16 flex-shrink-0">상태</div>
                <div className="w-28 flex-shrink-0">특징</div>
                <div className="flex-1 min-w-0">댓글 내용</div>
                <div className="w-20 flex-shrink-0">작성자</div>
                <div className="w-16 flex-shrink-0 text-right">시간</div>
                <div className="w-10 flex-shrink-0 text-right">조회</div>
                <div className="w-10 flex-shrink-0 text-right">좋아요</div>
              </div>
              {/* 바디 */}
              {comments.map((c, i) => (
                <PcRow key={c.id} c={c} no={total - i} />
              ))}
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </main>
  );
}
