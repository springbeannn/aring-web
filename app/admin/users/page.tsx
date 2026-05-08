'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase, type Listing } from '@/lib/supabase';

type Profile = {
  user_id: string;
  email: string;
  nickname: string;
  provider: string | null;
  created_at: string;
  is_banned?: boolean;
  role?: 'user' | 'admin';
};

type UserStat = {
  listingCount: number;
  receivedCommentCount: number;
  closedCount: number;
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [statsMap, setStatsMap] = useState<Map<string, UserStat>>(new Map());
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [detailUserId, setDetailUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setErr('Supabase 연결 없음');
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: profiles, error } = await supabase!
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }
      const list = (profiles ?? []) as Profile[];
      setUsers(list);

      // 통계 집계 — 모든 listings 한번에 fetch 후 user_id별 분류
      const { data: listings } = await supabase!
        .from('listings')
        .select('id, user_id, status');
      if (cancelled) return;
      const byUser = new Map<string, Listing[]>();
      (listings ?? []).forEach((l: any) => {
        if (!l.user_id) return;
        if (!byUser.has(l.user_id)) byUser.set(l.user_id, []);
        byUser.get(l.user_id)!.push(l);
      });

      // 댓글 수 — 본인 게시물에 달린 (user_id != 본인) 댓글
      const { data: comments } = await supabase!
        .from('comments')
        .select('product_id, user_id');
      if (cancelled) return;

      // listing_id → owner_id 매핑
      const listingOwner = new Map<string, string>();
      (listings ?? []).forEach((l: any) => {
        if (l.user_id) listingOwner.set(l.id, l.user_id);
      });

      const receivedByUser = new Map<string, number>();
      (comments ?? []).forEach((c: any) => {
        const owner = listingOwner.get(c.product_id);
        if (!owner || owner === c.user_id) return;
        receivedByUser.set(owner, (receivedByUser.get(owner) ?? 0) + 1);
      });

      const m = new Map<string, UserStat>();
      list.forEach((u) => {
        const ls = byUser.get(u.user_id) ?? [];
        m.set(u.user_id, {
          listingCount: ls.length,
          receivedCommentCount: receivedByUser.get(u.user_id) ?? 0,
          closedCount: ls.filter((l) => l.status === 'matched' || l.status === 'closed').length,
        });
      });
      setStatsMap(m);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const hay = `${u.nickname} ${u.email}`.toLowerCase();
      return hay.includes(q);
    });
  }, [users, search]);

  async function toggleBan(userId: string, currentBanned: boolean) {
    if (!supabase) return;
    const next = !currentBanned;
    const prev = users;
    setUsers((arr) => arr.map((u) => u.user_id === userId ? { ...u, is_banned: next } : u));
    const { error } = await supabase.from('profiles').update({ is_banned: next }).eq('user_id', userId);
    if (error) {
      alert('상태 변경 실패: ' + error.message);
      setUsers(prev);
    }
  }

  const detailUser = users.find((u) => u.user_id === detailUserId) ?? null;

  return (
    <div className="space-y-4">
      {/* 검색 */}
      <div className="bg-white rounded-2xl shadow-card border border-aring-ink-100 p-4 flex items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="닉네임, 이메일 검색"
          className="flex-1 border border-aring-ink-200 rounded-xl px-4 py-2 text-[14px] outline-none focus:border-aring-green transition"
        />
        <span className="text-[13px] text-aring-ink-500">총 {filtered.length}명</span>
      </div>

      {err && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[13px] px-4 py-3 rounded-lg">{err}</div>
      )}

      {/* 테이블 */}
      <div className="bg-white rounded-2xl shadow-card border border-aring-ink-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-aring-ink-50 text-[13px] font-bold text-aring-ink-500">
            <tr>
              <th className="text-left px-4 py-3">닉네임</th>
              <th className="text-left px-3 py-3">이메일</th>
              <th className="text-left px-3 py-3 w-[100px]">가입일</th>
              <th className="text-right px-3 py-3 w-[80px]">등록수</th>
              <th className="text-right px-3 py-3 w-[100px]">받은댓글</th>
              <th className="text-right px-3 py-3 w-[100px]">거래완료</th>
              <th className="text-left px-3 py-3 w-[100px]">상태</th>
              <th className="text-left px-3 py-3 w-[140px]">액션</th>
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
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-aring-ink-500 text-[13px]">회원이 없습니다</td></tr>
            ) : (
              filtered.map((u) => {
                const stat = statsMap.get(u.user_id);
                const banned = !!u.is_banned;
                return (
                  <tr key={u.user_id} className="border-b border-aring-ink-100 hover:bg-aring-ink-50">
                    <td className="px-4 py-3">
                      <button onClick={() => setDetailUserId(u.user_id)} className="font-bold text-aring-ink-900 hover:underline">
                        {u.nickname}
                      </button>
                      {u.role === 'admin' && <span className="ml-2 text-[10px] font-extrabold text-aring-green bg-aring-green/10 px-1.5 py-0.5 rounded">관리자</span>}
                    </td>
                    <td className="px-3 py-3 truncate max-w-[220px] text-aring-ink-600">{u.email}</td>
                    <td className="px-3 py-3 text-[13px] text-aring-ink-500">{fmtDate(u.created_at)}</td>
                    <td className="px-3 py-3 text-right">{stat?.listingCount ?? 0}</td>
                    <td className="px-3 py-3 text-right">{stat?.receivedCommentCount ?? 0}</td>
                    <td className="px-3 py-3 text-right">{stat?.closedCount ?? 0}</td>
                    <td className="px-3 py-3">
                      {banned ? (
                        <span className="text-[12px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">정지</span>
                      ) : (
                        <span className="text-[12px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">정상</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => toggleBan(u.user_id, banned)}
                        className={[
                          'text-[12px] font-semibold rounded-lg px-3 py-1',
                          banned
                            ? 'bg-aring-green text-white hover:opacity-90'
                            : 'bg-red-500 text-white hover:opacity-90',
                        ].join(' ')}
                      >
                        {banned ? '정지 해제' : '정지'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 상세 슬라이드 패널 */}
      {detailUser && (
        <UserDetailPanel user={detailUser} onClose={() => setDetailUserId(null)} />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────
// 회원 상세 슬라이드 패널
// ──────────────────────────────────────────────────
function UserDetailPanel({ user, onClose }: { user: Profile; onClose: () => void }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    (async () => {
      const [listRes, commentRes] = await Promise.all([
        supabase!.from('listings').select('*').eq('user_id', user.user_id).order('created_at', { ascending: false }),
        supabase!.from('comments').select('*').eq('user_id', user.user_id).order('created_at', { ascending: false }).limit(50),
      ]);
      if (cancelled) return;
      setListings((listRes.data ?? []) as Listing[]);
      setComments(commentRes.data ?? []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user.user_id]);

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/40" />
      <aside className="fixed top-0 right-0 z-50 h-screen w-[480px] bg-white shadow-xl overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-aring-ink-100">
          <div>
            <p className="text-[18px] font-extrabold text-aring-ink-900">{user.nickname}</p>
            <p className="text-[13px] text-aring-ink-500">{user.email}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-aring-ink-100 hover:bg-aring-ink-200 flex items-center justify-center" aria-label="닫기">✕</button>
        </div>

        <section className="p-6 border-b border-aring-ink-100">
          <h3 className="text-[14px] font-extrabold text-aring-ink-900 mb-3">등록한 게시물 {listings.length}건</h3>
          {loading ? (
            <div className="h-12 bg-aring-ink-100 animate-pulse rounded" />
          ) : listings.length === 0 ? (
            <p className="text-[13px] text-aring-ink-500">없음</p>
          ) : (
            <ul className="space-y-2">
              {listings.slice(0, 20).map((l) => (
                <li key={l.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-aring-ink-100 overflow-hidden shrink-0">
                    {l.photo_url && <img src={l.photo_url} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.opacity = '0'; }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-aring-ink-900 truncate">{l.detail ?? l.shape ?? '한 짝'}</p>
                    <p className="text-[12px] text-aring-ink-500 truncate">{l.brand ?? '브랜드 미상'} · {l.status}</p>
                  </div>
                  <Link href={`/items/${l.id}`} target="_blank" rel="noopener noreferrer" className="text-[12px] font-semibold text-aring-green hover:underline shrink-0">→</Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="p-6">
          <h3 className="text-[14px] font-extrabold text-aring-ink-900 mb-3">작성한 댓글 {comments.length}건</h3>
          {loading ? (
            <div className="h-12 bg-aring-ink-100 animate-pulse rounded" />
          ) : comments.length === 0 ? (
            <p className="text-[13px] text-aring-ink-500">없음</p>
          ) : (
            <ul className="space-y-2">
              {comments.slice(0, 20).map((c) => (
                <li key={c.id} className="text-[13px] text-aring-ink-700 border-b border-aring-ink-100 pb-2">
                  <p className="line-clamp-2">{c.message}</p>
                  <p className="text-[11px] text-aring-ink-400 mt-1">{new Date(c.created_at).toLocaleString('ko-KR')}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
    </>
  );
}
