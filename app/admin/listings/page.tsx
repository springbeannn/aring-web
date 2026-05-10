'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase, type Listing } from '@/lib/supabase';

type Status = 'all' | 'open' | 'matched' | 'closed';
type SortKey = 'created_at' | 'view_count';

const PAGE_SIZE = 20;

const STATUS_LABEL: Record<string, string> = {
  open: '판매중',
  matched: '매칭완료',
  closed: '마감',
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function fmtPrice(p: number | null): string {
  if (p == null || p <= 0) return '협의';
  return p.toLocaleString('ko-KR') + '원';
}

export default function AdminListingsPage() {
  const [items, setItems] = useState<Listing[]>([]);
  const [profileMap, setProfileMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<Status>('all');
  const [sort, setSort] = useState<SortKey>('created_at');
  const [page, setPage] = useState(1);

  // delete modal
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
      const { data, error } = await supabase!
        .from('listings')
        .select('*')
        .order(sort, { ascending: false })
        .limit(500);
      if (cancelled) return;
      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }
      const rows = (data ?? []) as Listing[];
      setItems(rows);
      // 작성자 닉네임 매핑
      const ids = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean))) as string[];
      if (ids.length > 0) {
        const { data: profiles } = await supabase!
          .from('profiles')
          .select('user_id, nickname')
          .in('user_id', ids);
        if (cancelled) return;
        const map = new Map<string, string>();
        (profiles ?? []).forEach((p: any) => map.set(p.user_id, p.nickname));
        setProfileMap(map);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [sort]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (status !== 'all' && it.status !== status) return false;
      if (q) {
        const nick = it.user_id ? (profileMap.get(it.user_id) ?? '') : '';
        const hay = [it.brand ?? '', it.detail ?? '', it.shape ?? '', nick].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, profileMap, status, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, status, sort]);

  async function changeStatus(id: string, next: 'open' | 'matched' | 'closed') {
    if (!supabase) return;
    const prev = items;
    setItems((arr) => arr.map((i) => i.id === id ? { ...i, status: next } : i));
    const { error } = await supabase.from('listings').update({ status: next }).eq('id', id);
    if (error) {
      alert('상태 변경 실패: ' + error.message);
      setItems(prev);
    }
  }

  async function deleteItem(id: string) {
    if (!supabase) return;
    const prev = items;
    setItems((arr) => arr.filter((i) => i.id !== id));
    setDeleteId(null);
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) {
      alert('삭제 실패: ' + error.message);
      setItems(prev);
    }
  }

  return (
    <div className="space-y-4">
      {/* 필터/검색 영역 */}
      <div className="bg-white rounded-2xl shadow-card border border-aring-ink-100 p-4 flex items-center gap-3 flex-wrap">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="브랜드, 제품명, 작성자 검색"
          className="flex-1 min-w-[240px] border border-aring-ink-200 rounded-xl px-4 py-2 text-[16px] outline-none focus:border-aring-green transition"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Status)}
          className="border border-aring-ink-200 rounded-xl px-3 py-2 text-[15px] lg:text-[15px] outline-none focus:border-aring-green"
        >
          <option value="all">전체 상태</option>
          <option value="open">판매중</option>
          <option value="matched">매칭완료</option>
          <option value="closed">마감</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="border border-aring-ink-200 rounded-xl px-3 py-2 text-[15px] lg:text-[15px] outline-none focus:border-aring-green"
        >
          <option value="created_at">등록일 최신순</option>
          <option value="view_count">조회수 높은순</option>
        </select>
        <span className="text-[15px] lg:text-[15px] text-aring-ink-500">총 {filtered.length}건</span>
      </div>

      {err && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[15px] lg:text-[15px] px-4 py-3 rounded-lg">{err}</div>
      )}

      {/* 테이블 */}
      <div className="bg-white rounded-2xl shadow-card border border-aring-ink-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-aring-ink-50 text-[15px] lg:text-[15px] font-bold text-aring-ink-500">
            <tr>
              <th className="text-left px-4 py-3 w-[64px]">이미지</th>
              <th className="text-left px-3 py-3">브랜드</th>
              <th className="text-left px-3 py-3">제품명</th>
              <th className="text-left px-3 py-3 w-[80px]">소재</th>
              <th className="text-left px-3 py-3 w-[80px]">형태</th>
              <th className="text-left px-3 py-3 w-[100px]">가격</th>
              <th className="text-left px-3 py-3 w-[100px]">작성자</th>
              <th className="text-left px-3 py-3 w-[140px]">등록일</th>
              <th className="text-right px-3 py-3 w-[60px]">조회</th>
              <th className="text-left px-3 py-3 w-[120px]">상태</th>
              <th className="text-left px-3 py-3 w-[120px]">액션</th>
            </tr>
          </thead>
          <tbody className="text-[16px] text-aring-ink-800">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-aring-ink-100">
                  <td colSpan={11} className="px-4 py-3">
                    <div className="h-10 bg-aring-ink-100 animate-pulse rounded" />
                  </td>
                </tr>
              ))
            ) : pageItems.length === 0 ? (
              <tr><td colSpan={11} className="px-4 py-10 text-center text-aring-ink-500 text-[15px] lg:text-[15px]">검색 결과가 없습니다</td></tr>
            ) : (
              pageItems.map((it) => (
                <tr key={it.id} className="border-b border-aring-ink-100 hover:bg-aring-ink-50">
                  <td className="px-4 py-2">
                    <div className="w-12 h-12 rounded-lg bg-aring-ink-100 overflow-hidden">
                      {it.photo_url && <img src={it.photo_url} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.opacity = '0'; }} />}
                    </div>
                  </td>
                  <td className="px-3 py-2 truncate max-w-[140px]">{it.brand ?? '-'}</td>
                  <td className="px-3 py-2 truncate max-w-[200px]">
                    <Link href={`/items/${it.id}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {it.detail ?? it.shape ?? '한 짝'}
                    </Link>
                  </td>
                  <td className="px-3 py-2 truncate">{it.material ?? '-'}</td>
                  <td className="px-3 py-2 truncate">{it.shape ?? '-'}</td>
                  <td className="px-3 py-2">{fmtPrice(it.price)}</td>
                  <td className="px-3 py-2 truncate">{it.user_id ? (profileMap.get(it.user_id) ?? '익명') : '익명'}</td>
                  <td className="px-3 py-2 text-[12px] lg:text-[13px] text-aring-ink-500">{fmtDate(it.created_at)}</td>
                  <td className="px-3 py-2 text-right">{it.view_count}</td>
                  <td className="px-3 py-2">
                    <select
                      value={it.status}
                      onChange={(e) => changeStatus(it.id, e.target.value as 'open' | 'matched' | 'closed')}
                      className="text-[12px] lg:text-[13px] border border-aring-ink-200 rounded-lg px-2 py-1 outline-none focus:border-aring-green"
                    >
                      <option value="open">판매중</option>
                      <option value="matched">매칭완료</option>
                      <option value="closed">마감</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => setDeleteId(it.id)}
                      className="text-[12px] lg:text-[13px] bg-red-500 text-white font-semibold rounded-lg px-3 py-1 hover:opacity-90"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-1 pt-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="border border-aring-ink-200 text-aring-ink-700 text-[15px] lg:text-[15px] rounded-lg px-3 py-1.5 disabled:opacity-40 hover:bg-aring-ink-50"
          >
            이전
          </button>
          {Array.from({ length: pageCount }).slice(0, 10).map((_, i) => {
            const n = i + 1;
            return (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={[
                  'rounded-lg px-3 py-1.5 text-[15px] lg:text-[15px]',
                  n === page
                    ? 'bg-aring-green text-white font-semibold'
                    : 'border border-aring-ink-200 text-aring-ink-700 hover:bg-aring-ink-50',
                ].join(' ')}
              >
                {n}
              </button>
            );
          })}
          <button
            disabled={page === pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            className="border border-aring-ink-200 text-aring-ink-700 text-[15px] lg:text-[15px] rounded-lg px-3 py-1.5 disabled:opacity-40 hover:bg-aring-ink-50"
          >
            다음
          </button>
        </div>
      )}

      {/* 삭제 모달 */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-[360px] w-full">
            <p className="text-[16px] font-bold text-aring-ink-900 mb-2">게시물 삭제</p>
            <p className="text-[15px] lg:text-[15px] text-aring-ink-500 mb-4">정말 삭제하시겠어요? 이 작업은 되돌릴 수 없어요.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteId(null)} className="border border-aring-ink-200 text-aring-ink-700 text-[15px] lg:text-[15px] rounded-lg px-4 py-2">취소</button>
              <button onClick={() => deleteItem(deleteId)} className="bg-red-500 text-white text-[15px] lg:text-[15px] font-semibold rounded-lg px-4 py-2 hover:opacity-90">삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
