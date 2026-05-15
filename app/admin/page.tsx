'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, type Listing } from '@/lib/supabase';
import { TrafficChart } from '@/components/admin/TrafficChart';

type Profile = {
  user_id: string;
  email: string;
  nickname: string;
  created_at: string;
};

type Kpi = {
  totalUsers: number;
  totalListings: number;
  todayUsers: number;
  todayListings: number;
};

function todayStartIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

function statusLabel(s: string): string {
  if (s === 'open') return '판매중';
  if (s === 'matched') return '매칭완료';
  return '마감';
}

export default function AdminDashboardPage() {
  const [kpi, setKpi] = useState<Kpi | null>(null);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [recentUsers, setRecentUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setErr('Supabase 연결 없음');
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const today = todayStartIso();
        const [
          totalUsersRes,
          totalListingsRes,
          todayUsersRes,
          todayListingsRes,
          recentListingsRes,
          recentUsersRes,
        ] = await Promise.all([
          supabase!.from('profiles').select('*', { count: 'exact', head: true }),
          supabase!.from('listings').select('*', { count: 'exact', head: true }),
          supabase!.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today),
          supabase!.from('listings').select('*', { count: 'exact', head: true }).gte('created_at', today),
          supabase!.from('listings').select('*').order('created_at', { ascending: false }).limit(5),
          supabase!.from('profiles').select('*').order('created_at', { ascending: false }).limit(5),
        ]);
        if (cancelled) return;
        setKpi({
          totalUsers:    totalUsersRes.count ?? 0,
          totalListings: totalListingsRes.count ?? 0,
          todayUsers:    todayUsersRes.count ?? 0,
          todayListings: todayListingsRes.count ?? 0,
        });
        setRecentListings((recentListingsRes.data ?? []) as Listing[]);
        setRecentUsers((recentUsersRes.data ?? []) as Profile[]);
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setErr(String(e));
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-6">
      {err && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[15px] lg:text-[15px] px-4 py-3 rounded-lg">
          {err}
        </div>
      )}

      {/* KPI 4개 (2x2) */}
      <div className="grid grid-cols-2 gap-4">
        <KpiCard label="전체 회원 수" value={kpi?.totalUsers}     loading={loading} />
        <KpiCard label="전체 게시물 수" value={kpi?.totalListings}  loading={loading} />
        <KpiCard label="오늘 신규 가입" value={kpi?.todayUsers}     loading={loading} />
        <KpiCard label="오늘 신규 등록" value={kpi?.todayListings}  loading={loading} />
      </div>

      {/* 방문자 통계 (PV/UV) */}
      <TrafficChart />

      {/* 최근 게시물 */}
      <section className="bg-white rounded-2xl shadow-card border border-aring-ink-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-bold text-aring-ink-900">최근 등록 게시물</h2>
          <Link href="/admin/listings" className="text-[15px] lg:text-[15px] font-semibold text-aring-green hover:underline">전체 보기 →</Link>
        </div>
        {loading ? (
          <SkeletonRows count={5} />
        ) : recentListings.length === 0 ? (
          <p className="text-[15px] lg:text-[15px] text-aring-ink-500">데이터 없음</p>
        ) : (
          <ul className="divide-y divide-aring-ink-100">
            {recentListings.map((it) => (
              <li key={it.id} className="flex items-center gap-3 py-3">
                <div className="w-12 h-12 rounded-lg bg-aring-ink-100 overflow-hidden shrink-0">
                  {it.photo_url && (
                    <img src={it.photo_url} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.opacity = '0'; }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] lg:text-[15px] font-bold text-aring-ink-400 truncate">{it.brand ?? '브랜드 미상'}</p>
                  <p className="text-[16px] font-bold text-aring-ink-900 truncate">{it.detail ?? it.shape ?? '한 짝'}</p>
                </div>
                <span className="text-[12px] lg:text-[13px] text-aring-ink-500 shrink-0">{fmtDate(it.created_at)}</span>
                <span className="text-[12px] lg:text-[13px] font-semibold text-aring-ink-700 shrink-0">{statusLabel(it.status)}</span>
                <Link
                  href={`/items/${it.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] lg:text-[13px] font-semibold text-aring-green hover:underline shrink-0"
                >
                  상세 →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 최근 회원 */}
      <section className="bg-white rounded-2xl shadow-card border border-aring-ink-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-bold text-aring-ink-900">최근 가입 회원</h2>
          <Link href="/admin/users" className="text-[15px] lg:text-[15px] font-semibold text-aring-green hover:underline">전체 보기 →</Link>
        </div>
        {loading ? (
          <SkeletonRows count={5} />
        ) : recentUsers.length === 0 ? (
          <p className="text-[15px] lg:text-[15px] text-aring-ink-500">데이터 없음</p>
        ) : (
          <ul className="divide-y divide-aring-ink-100">
            {recentUsers.map((u) => (
              <li key={u.user_id} className="flex items-center justify-between py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-bold text-aring-ink-900 truncate">{u.nickname}</p>
                  <p className="text-[12px] lg:text-[13px] text-aring-ink-500 truncate">{u.email}</p>
                </div>
                <span className="text-[12px] lg:text-[13px] text-aring-ink-500 shrink-0">{fmtDate(u.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function KpiCard({ label, value, loading }: { label: string; value?: number; loading: boolean }) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-aring-ink-100 p-6">
      <p className="text-[15px] lg:text-[15px] font-bold text-aring-ink-500">{label}</p>
      {loading ? (
        <div className="mt-2 h-8 w-20 bg-aring-ink-100 animate-pulse rounded" />
      ) : (
        <p className="mt-2 text-[28px] font-bold text-aring-ink-900">{(value ?? 0).toLocaleString('ko-KR')}</p>
      )}
    </div>
  );
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <ul className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 py-1">
          <div className="w-12 h-12 rounded-lg bg-aring-ink-100 animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-1/3 bg-aring-ink-100 animate-pulse rounded" />
            <div className="h-4 w-2/3 bg-aring-ink-100 animate-pulse rounded" />
          </div>
        </li>
      ))}
    </ul>
  );
}
