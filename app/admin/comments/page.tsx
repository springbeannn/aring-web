'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase, type Comment, type Listing } from '@/lib/supabase';

type ListingStatus = 'all' | 'open' | 'matched' | 'closed';

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function listingStatusLabel(s: string): string {
  if (s === 'open') return '문의중';
  if (s === 'matched') return '답변완료';
  return '거래완료';
}

const PAGE_SIZE = 20;

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [listingMap, setListingMap] = useState<Map<string, Listing>>(new Map());
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ListingStatus>('all');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setErr('Supabase 연결 없음');
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: cmtData, error } = await supabase!
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      if (cancelled) return;
      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }
      const list = (cmtData ?? []) as Comment[];
      setComments(list);

      const productIds = Array.from(new Set(list.map((c) => c.product_id)));
      if (productIds.length > 0) {
        const { data: listings } = await supabase!
          .from('listings')
          .select('id, brand, detail, shape, photo_url, status')
          .in('id', productIds);
        if (cancelled) return;
        const m = new Map<string, Listing>();
        (listings ?? []).forEach((l: any) => m.set(l.id, l));
        setListingMap(m);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return comments.filter((c) => {
      const listing = listingMap.get(c.product_id);
      if (statusFilter !== 'all' && listing?.status !== statusFilter) return false;
      if (q && !c.message.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [comments, listingMap, search, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  async function deleteComment(id: string) {
    if (!supabase) return;
    const prev = comments;
    setComments((arr) => arr.filter((c) => c.id !== id));
    setDeleteId(null);
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) {
      alert('삭제 실패: ' + error.message);
      setComments(prev);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-card border border-aring-ink-100 p-4 flex items-center gap-3 flex-wrap">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="댓글 내용 검색"
          className="flex-1 min-w-[240px] border border-aring-ink-200 rounded-xl px-4 py-2 text-[14px] outline-none focus:border-aring-green transition"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ListingStatus)}
          className="border border-aring-ink-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-aring-green"
        >
          <option value="all">전체</option>
          <option value="open">문의중</option>
          <option value="matched">답변완료</option>
          <option value="closed">거래완료</option>
        </select>
        <span className="text-[13px] text-aring-ink-500">총 {filtered.length}건</span>
      </div>

      {err && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[13px] px-4 py-3 rounded-lg">{err}</div>
      )}

      <div className="bg-white rounded-2xl shadow-card border border-aring-ink-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-aring-ink-50 text-[13px] font-bold text-aring-ink-500">
            <tr>
              <th className="text-right px-3 py-3 w-[60px]">No.</th>
              <th className="text-left px-3 py-3">대상 게시물</th>
              <th className="text-left px-3 py-3 w-[100px]">작성자</th>
              <th className="text-left px-3 py-3">댓글 내용</th>
              <th className="text-right px-3 py-3 w-[60px]">좋아요</th>
              <th className="text-left px-3 py-3 w-[100px]">상태</th>
              <th className="text-left px-3 py-3 w-[140px]">작성일</th>
              <th className="text-left px-3 py-3 w-[80px]">액션</th>
            </tr>
          </thead>
          <tbody className="text-[14px] text-aring-ink-800">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-aring-ink-100">
                  <td colSpan={8} className="px-4 py-3">
                    <div className="h-8 bg-aring-ink-100 animate-pulse rounded" />
                  </td>
                </tr>
              ))
            ) : pageItems.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-aring-ink-500 text-[13px]">검색 결과가 없습니다</td></tr>
            ) : (
              pageItems.map((c, i) => {
                const idx = (page - 1) * PAGE_SIZE + i + 1;
                const listing = listingMap.get(c.product_id);
                return (
                  <tr key={c.id} className="border-b border-aring-ink-100 hover:bg-aring-ink-50">
                    <td className="px-3 py-3 text-right text-[13px] text-aring-ink-500">{idx}</td>
                    <td className="px-3 py-3 truncate max-w-[200px]">
                      {listing ? (
                        <Link href={`/items/${listing.id}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          <span className="text-[12px] font-bold text-aring-ink-400 block">{listing.brand ?? '브랜드 미상'}</span>
                          <span className="text-[13px] text-aring-ink-800">{listing.detail ?? listing.shape ?? '한 짝'}</span>
                        </Link>
                      ) : (
                        <span className="text-[13px] text-aring-ink-400">삭제된 게시물</span>
                      )}
                    </td>
                    <td className="px-3 py-3 truncate max-w-[100px] text-aring-ink-700">{c.user_name ?? '익명'}</td>
                    <td className="px-3 py-3 max-w-[280px] truncate" title={c.message}>{c.message}</td>
                    <td className="px-3 py-3 text-right text-aring-ink-500">0</td>
                    <td className="px-3 py-3 text-[12px]">{listing ? listingStatusLabel(listing.status) : '-'}</td>
                    <td className="px-3 py-3 text-[12px] text-aring-ink-500">{fmtDate(c.created_at)}</td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => setDeleteId(c.id)}
                        className="text-[12px] bg-red-500 text-white font-semibold rounded-lg px-3 py-1 hover:opacity-90"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-1 pt-2">
          <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="border border-aring-ink-200 text-aring-ink-700 text-[13px] rounded-lg px-3 py-1.5 disabled:opacity-40 hover:bg-aring-ink-50">이전</button>
          {Array.from({ length: pageCount }).slice(0, 10).map((_, i) => {
            const n = i + 1;
            return (
              <button key={n} onClick={() => setPage(n)} className={['rounded-lg px-3 py-1.5 text-[13px]', n === page ? 'bg-aring-green text-white font-semibold' : 'border border-aring-ink-200 text-aring-ink-700 hover:bg-aring-ink-50'].join(' ')}>{n}</button>
            );
          })}
          <button disabled={page === pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))} className="border border-aring-ink-200 text-aring-ink-700 text-[13px] rounded-lg px-3 py-1.5 disabled:opacity-40 hover:bg-aring-ink-50">다음</button>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-[360px] w-full">
            <p className="text-[15px] font-extrabold text-aring-ink-900 mb-2">댓글 삭제</p>
            <p className="text-[13px] text-aring-ink-500 mb-4">정말 삭제하시겠어요? 이 작업은 되돌릴 수 없어요.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteId(null)} className="border border-aring-ink-200 text-aring-ink-700 text-[13px] rounded-lg px-4 py-2">취소</button>
              <button onClick={() => deleteComment(deleteId)} className="bg-red-500 text-white text-[13px] font-semibold rounded-lg px-4 py-2 hover:opacity-90">삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
