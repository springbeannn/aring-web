'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TopNav, BottomNav } from '@/components/Nav';
import { thumbBg, type ThumbTone } from '@/lib/mock';
import { supabase, type Listing } from '@/lib/supabase';

// ─────────────────────────────────────────────────────────────
// /popular — 조회수 순 전체 한 짝
// 홈 "오늘의 매칭 후보 → 전체보기" 진입점
// 카드는 RecentItemCard 와 비슷하나 조회수 표시 추가
// ─────────────────────────────────────────────────────────────

const TONE_ROTATION: ThumbTone[] = [
  'pink', 'peach', 'butter', 'mint', 'sky', 'sage',
];
function pickTone(seed: string): ThumbTone {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return TONE_ROTATION[Math.abs(h) % TONE_ROTATION.length];
}

const IconArrowLeft = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

const IconEye = ({ className = 'w-3 h-3' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

function PopularCard({ row, rank }: { row: Listing; rank: number }) {
  const tone = pickTone(row.id);
  return (
    <Link
      href={`/items/${row.id}`}
      className="flex flex-col rounded-tile border border-aring-green-line bg-white overflow-hidden text-left active:scale-[0.99] transition"
    >
      <div
        className="relative aspect-square overflow-hidden"
        style={{ background: thumbBg(tone) }}
      >
        {row.photo_url && (
          <img
            src={row.photo_url}
            alt={row.brand ?? '한 짝'}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* 랭크 뱃지 */}
        <span className="absolute top-2 left-2 inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-pill bg-aring-ink-900 text-white text-[10px] font-extrabold">
          {rank}
        </span>
        {/* 조회수 */}
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-pill glass-strong px-2 py-1 text-[10px] font-bold text-aring-ink-900">
          <IconEye className="w-3 h-3" />
          {row.view_count}
        </span>
      </div>
      <div className="px-3 py-3">
        <p className="text-[12px] font-bold tracking-wider text-aring-ink-500 truncate">
          {row.brand ?? '브랜드 미상'}
        </p>
        <p className="mt-px text-[13px] lg:text-[14px] font-bold text-aring-ink-900 truncate">
          {row.detail ?? row.shape ?? '한 짝'}
        </p>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[13px] font-bold text-aring-ink-900">
            {row.price ? `₩${row.price.toLocaleString('ko-KR')}` : '가격 협의'}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function PopularPage() {
  const [rows, setRows] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      if (!supabase) {
        if (!cancelled) {
          setRows([]);
          setLoading(false);
        }
        return;
      }
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'open')
        .order('view_count', { ascending: false })
        .order('created_at', { ascending: false }) // 동수일 때 최신
        .limit(60);
      if (cancelled) return;
      if (error) {
        console.error('[aring] popular fetch error', error);
        setError('인기 한 짝을 불러오지 못했습니다');
        setLoading(false);
        return;
      }
      setRows((data ?? []) as Listing[]);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="
        relative w-full max-w-[440px] bg-white overflow-hidden
        min-h-screen
        sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone
        lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible
      ">
        <div className="pb-28 lg:pb-10">
          <TopNav />

          {/* 페이지 헤더 */}
          <div className="px-5 lg:px-8 pt-3 lg:pt-7 pb-4 flex items-center gap-3">
            <Link
              href="/"
              aria-label="홈으로"
              className="lg:hidden w-9 h-9 rounded-full bg-aring-ink-100 flex items-center justify-center text-aring-ink-900 active:scale-95 transition"
            >
              <IconArrowLeft />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-[22px] lg:text-[26px] font-extrabold tracking-tight text-aring-ink-900">
                오늘의 매칭 후보
              </h1>
              <p className="mt-0.5 text-[13px] lg:text-[14px] text-aring-ink-500">
                조회수 순으로 모았어요
                {rows.length > 0 && (
                  <>
                    {' '}· 총 <span className="font-semibold">{rows.length}</span>개
                  </>
                )}
              </p>
            </div>
          </div>

          {/* 본문 */}
          {loading ? (
            <div className="px-5 lg:px-8 py-16 text-center">
              <div className="w-8 h-8 mx-auto rounded-full border-2 border-aring-ink-100 border-t-aring-ink-900 animate-spin" />
              <p className="mt-3 text-[13px] text-aring-ink-500">불러오는 중…</p>
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
          ) : rows.length === 0 ? (
            <div className="px-5 lg:px-8 py-16 text-center">
              <p className="text-[13px] font-bold text-aring-ink-900">아직 등록된 한 짝이 없어요</p>
              <p className="mt-1 text-[13px] lg:text-[14px] text-aring-ink-500">첫 등록자가 되어 보세요</p>
              <Link
                href="/register"
                className="mt-4 inline-flex items-center justify-center px-5 py-2.5 rounded-pill bg-aring-ink-900 text-white text-[13px] font-extrabold"
              >
                한 짝 등록하기
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 px-5 lg:px-8">
              {rows.map((row, idx) => (
                <PopularCard key={row.id} row={row} rank={idx + 1} />
              ))}
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    </main>
  );
}
