'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TopNav, BottomNav } from '@/components/Nav';
import { supabase } from '@/lib/supabase';

function relativeTime(iso: string): string {
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

type CommunityComment = {
  id: string;
  product_id: string;
  user_name: string;
  message: string;
  created_at: string;
  listing: {
    brand: string | null;
    material: string | null;
    shape: string | null;
    photo_url: string | null;
    status: string;
  } | null;
};

const STATUS_LABEL: Record<string, string> = {
  open: '문의중',
  matched: '거래완료',
  closed: '거래완료',
};

const STATUS_BADGE: Record<string, string> = {
  open: 'bg-pink-100 text-pink-700',
  matched: 'bg-gray-100 text-gray-500',
  closed: 'bg-gray-100 text-gray-500',
};

export default function CommentsPage() {
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    async function load() {
      const { data: rawComments } = await supabase!
        .from('comments')
        .select('id, product_id, user_name, message, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      const raw = (rawComments ?? []) as {
        id: string; product_id: string; user_name: string;
        message: string; created_at: string;
      }[];

      const productIds = [...new Set(raw.map(c => c.product_id))];
      let listingMap: Record<string, CommunityComment['listing']> = {};

      if (productIds.length > 0) {
        const { data: listings } = await supabase!
          .from('listings')
          .select('id, brand, material, shape, photo_url, status')
          .in('id', productIds);

        for (const l of (listings ?? [])) {
          listingMap[l.id] = {
            brand: l.brand,
            material: l.material,
            shape: l.shape,
            photo_url: l.photo_url,
            status: l.status,
          };
        }
      }

      const merged: CommunityComment[] = raw.map(c => ({
        ...c,
        listing: listingMap[c.product_id] ?? null,
      }));

      setComments(merged);
      setLoading(false);
    }

    load();
  }, []);

  return (
    <main className="min-h-screen flex justify-center bg-gradient-to-b from-pink-50 via-yellow-50 to-green-50">
      <div className="relative w-full max-w-[440px] min-h-screen overflow-hidden sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
        <div className="pb-28 lg:pb-12">
          <TopNav />

          {/* 헤더 */}
          <div className="px-5 lg:px-8 pt-3 pb-3">
            <h1 className="text-[22px] font-extrabold tracking-tight text-aring-ink-900">커뮤니티</h1>
            <p className="mt-0.5 text-[13px] text-aring-ink-500">서로의 한 짝을 찾기 위해 남긴 이야기들이 모였어요</p>
            {!loading && (
              <p className="mt-1.5 text-[11px] font-bold text-aring-ink-700">전체 댓글 {comments.length}개</p>
            )}
          </div>

          {/* 본문 */}
          {loading ? (
            <div className="px-5 py-16 text-center">
              <div className="w-8 h-8 mx-auto rounded-full border-2 border-aring-ink-100 border-t-aring-ink-900 animate-spin" />
              <p className="mt-3 text-[11px] text-aring-ink-500">불러오는 중…</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="text-[14px] font-bold text-aring-ink-900">아직 댓글이 없어요</p>
              <p className="mt-1 text-[11px] text-aring-ink-500">첫 번째 이야기를 남겨보세요!</p>
            </div>
          ) : (
            <div className="px-5 lg:px-8 space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
              {comments.map((c, idx) => {
                const listing = c.listing;
                const status = listing?.status ?? 'open';
                const badgeLabel = STATUS_LABEL[status] ?? '문의중';
                const badgeClass = STATUS_BADGE[status] ?? STATUS_BADGE.open;
                const tags = [listing?.material, listing?.shape].filter(Boolean);
                const no = comments.length - idx;

                return (
                  <Link
                    key={c.id}
                    href={`/items/${c.product_id}#comments`}
                    className="block bg-white rounded-2xl overflow-hidden shadow-sm border border-white/80 active:scale-[0.99] transition"
                  >
                    {/* 상단: 사진 + 브랜드/태그/뱃지 */}
                    <div className="flex items-start gap-3 px-4 pt-4 pb-2">
                      {listing?.photo_url ? (
                        <img
                          src={listing.photo_url}
                          alt={listing.brand ?? ''}
                          className="w-[64px] h-[64px] rounded-xl object-cover shrink-0 bg-gray-100"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-[64px] h-[64px] rounded-xl bg-pink-50 shrink-0 flex items-center justify-center">
                          <span className="text-[22px]">💍</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}`}>
                          {badgeLabel}
                        </span>
                        <p className="mt-1 text-[14px] font-extrabold text-aring-ink-900 truncate">{listing?.brand ?? '브랜드 미상'}</p>
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tags.map(tag => (
                              <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-600">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 댓글 내용 */}
                    <div className="px-4 pb-2">
                      <p className="text-[13px] text-aring-ink-900 leading-relaxed line-clamp-2">{c.message}</p>
                    </div>

                    {/* 하단: 닉네임 + 시간 + No */}
                    <div className="px-4 pb-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-aring-ink-900">{c.user_name || 'aring 사용자'}</span>
                        <span className="text-aring-ink-300">·</span>
                        <span className="text-[11px] text-aring-ink-500">{relativeTime(c.created_at)}</span>
                      </div>
                      <span className="text-[11px] text-aring-ink-400 font-medium">No.{no}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        <BottomNav active="chat" />
      </div>
    </main>
  );
}
