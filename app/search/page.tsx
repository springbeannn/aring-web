'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { TopNav, BottomNav } from '@/components/Nav';
import { thumbBg, type ThumbTone } from '@/lib/mock';
import { supabase, type Listing } from '@/lib/supabase';

// ââââââââââââââââââââââââââââââââââââââââââââ
// /search â íì¤í¸ ê²ì ê²°ê³¼ íì´ì§
// ê²ì ëì: brand, shape, material, detail, color, story, region
// ââââââââââââââââââââââââââââââââââââââââââââ

const PAGE_SIZE = 20;

const TONE_ROTATION: ThumbTone[] = [
  'pink', 'peach', 'butter', 'mint', 'sky', 'sage',
];

function pickTone(seed: string): ThumbTone {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h * 31) + seed.charCodeAt(i)) | 0;
  return TONE_ROTATION[Math.abs(h) % TONE_ROTATION.length];
}

// ââ SVG Icons ââ
const IconArrowLeft = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

const IconSearch = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

// ââ Search Card ââ
function SearchCard({ row }: { row: Listing }) {
  const tone = pickTone(row.id);
  return (
    <Link
      href={`/items/${row.id}`}
      className="flex flex-col rounded-tile border border-aring-green-line bg-white overflow-hidden text-left active:scale-[0.99] transition"
    >
      {/* ì¸ë¤ì¼ */}
      <div className={`relative w-full aspect-square ${thumbBg(tone)} flex items-center justify-center overflow-hidden`}>
        {row.photo_url ? (
          <img
            src={row.photo_url}
            alt={row.brand ?? 'ê·ê±¸ì´'}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              const fallback = target.nextElementSibling as HTMLElement | null;
              target.style.display = 'none';
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <span
          aria-hidden
          className="absolute inset-0 hidden items-center justify-center text-[42px]"
        >
          â
        </span>
      </div>

      {/* ë³¸ë¬¸ */}
      <div className="px-3 py-3">
        <p className="text-[10.5px] font-bold tracking-wider text-aring-ink-500 truncate">
          {row.brand ?? 'ë¸ëë ë¯¸ì'}
        </p>
        <p className="mt-0.5 text-[13px] font-bold text-aring-ink-900 truncate">
          {row.detail ?? row.shape ?? 'í ì§'}
        </p>
        {row.story && (
          <p className="mt-1 text-[10.5px] text-aring-ink-500 truncate">
            Â· {row.story}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[12px] font-bold text-aring-ink-900">
            {row.price ? `â©${row.price.toLocaleString('ko-KR')}` : 'ê°ê²© ë¯¸ì'}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ââ Search Bar ââ
function SearchInput({
  defaultValue,
  onSearch,
}: {
  defaultValue?: string;
  onSearch: (q: string) => void;
}) {
  const [value, setValue] = useState(defaultValue ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2.5 mx-5 lg:mx-8 mb-5 rounded-pill bg-aring-ink-100 px-4 py-3">
      <IconSearch className="w-4 h-4 text-aring-ink-500 shrink-0" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="ë¸ëë, ëª¨ì, ì»¬ë¬ë¡ ê²ì"
        className="flex-1 bg-transparent border-0 outline-none text-[14px] text-aring-ink-700 placeholder:text-aring-ink-500"
        autoFocus
      />
      <button
        type="submit"
        className="shrink-0 px-3 py-1 rounded-pill bg-aring-ink-900 text-white text-[12px] font-bold active:scale-95 transition"
      >
        ê²ì
      </button>
    </form>
  );
}

// ââ Main Page Inner ââ
function SearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const [rows, setRows] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(
    (q: string) => {
      if (!q) {
        router.push('/search');
      } else {
        router.push(`/search?q=${encodeURIComponent(q)}`);
      }
    },
    [router]
  );

  useEffect(() => {
    if (!query) {
      setRows([]);
      setTotal(0);
      setPage(1);
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);

      if (!supabase) {
        if (!cancelled) {
          setRows([]);
          setTotal(0);
          setLoading(false);
        }
        return;
      }

      const q = query.trim().toLowerCase();

      // ì¬ë¬ íëë¥¼ ilikeë¡ ê²ì (OR ì¡°ê±´)
      const { data, error: fetchError, count } = await supabase
        .from('listings')
        .select('*', { count: 'exact' })
        .or(
          `brand.ilike.%${q}%,shape.ilike.%${q}%,material.ilike.%${q}%,detail.ilike.%${q}%,color.ilike.%${q}%,story.ilike.%${q}%,region.ilike.%${q}%`
        )
        .order('created_at', { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (cancelled) return;

      if (fetchError) {
        setError('ê²ì ì¤ ì¤ë¥ê° ë°ìíì´ì. ì ì í ë¤ì ìëí´ ì£¼ì¸ì.');
        setLoading(false);
        return;
      }

      setRows(data as Listing[]);
      setTotal(count ?? 0);
      setPage(1);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [query]);

  // ë ë³´ê¸°
  const handleLoadMore = async () => {
    if (!supabase || !query) return;
    const nextPage = page + 1;
    const from = (nextPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const q = query.trim().toLowerCase();
    const { data } = await supabase
      .from('listings')
      .select('*')
      .or(
        `brand.ilike.%${q}%,shape.ilike.%${q}%,material.ilike.%${q}%,detail.ilike.%${q}%,color.ilike.%${q}%,story.ilike.%${q}%,region.ilike.%${q}%`
      )
      .order('created_at', { ascending: false })
      .range(from, to);

    if (data && data.length > 0) {
      setRows((prev) => [...prev, ...(data as Listing[])]);
      setPage(nextPage);
    }
  };

  const hasMore = rows.length < total && rows.length >= PAGE_SIZE;

  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="
        relative w-full max-w-[440px] bg-white overflow-hidden
        min-h-screen
        sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone
        lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible
      ">
        <div className="pb-28 lg:pb-12">
          <TopNav />

          {/* í¤ë */}
          <div className="px-5 lg:px-8 pt-3 lg:pt-7 pb-4 flex items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="ë¤ë¡ê°ê¸°"
              className="lg:hidden w-9 h-9 rounded-full bg-aring-ink-100 flex items-center justify-center text-aring-ink-900 active:scale-95 transition"
            >
              <IconArrowLeft />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-[20px] lg:text-[26px] font-extrabold tracking-tight text-aring-ink-900">
                ê²ìê²°ê³¼
              </h1>
              {query && (
                <p className="mt-0.5 text-[12px] text-aring-ink-500">
                  &apos;{query}&apos; ê²ì ê²°ê³¼
                  {!loading && total > 0 && (
                    <> Â· ì´ <span className="font-semibold">{total}</span>ê°</>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* ê²ìë° */}
          <SearchInput defaultValue={query} onSearch={handleSearch} />

          {/* ë³¸ë¬¸ */}
          {!query ? (
            /* ê²ìì´ ìì */
            <div className="px-5 lg:px-8 py-16 text-center">
              <p className="text-[15px] font-bold text-aring-ink-900">
                ì°¾ê³  ì¶ì ê·ê±¸ì´ ì ë³´ë¥¼ ìë ¥í´ ì£¼ì¸ì
              </p>
              <p className="mt-2 text-[12px] text-aring-ink-500">
                ë¸ëë, ëª¨ì, ì»¬ë¬ë¡ ê²ìí  ì ìì´ì
              </p>
            </div>
          ) : loading ? (
            /* ë¡ë© */
            <div className="px-5 lg:px-8 py-16 text-center">
              <div className="w-8 h-8 mx-auto rounded-full border-2 border-aring-ink-100 border-t-aring-ink-900 animate-spin" />
              <p className="mt-3 text-[12px] text-aring-ink-500">ê²ì ì¤â¦</p>
            </div>
          ) : error ? (
            /* ìë¬ */
            <div className="px-5 lg:px-8 py-16 text-center">
              <p className="text-[13px] font-bold text-aring-ink-900">{error}</p>
              <button
                onClick={() => handleSearch(query)}
                className="mt-4 px-5 py-2.5 rounded-pill bg-aring-ink-900 text-white text-[13px] font-extrabold"
              >
                ë¤ì ìë
              </button>
            </div>
          ) : rows.length === 0 ? (
            /* ê²°ê³¼ ìì */
            <div className="px-5 lg:px-8 py-16 text-center">
              <p className="text-[15px] font-bold text-aring-ink-900">
                ìì§ ë§ë ê·ê±¸ì´ë¥¼ ì°¾ì§ ëª»íì´ì
              </p>
              <p className="mt-2 text-[12px] text-aring-ink-500">
                ë¤ë¥¸ ë¸ëëëªì´ë ì»¬ë¬, ëª¨ìì¼ë¡ ë¤ì ê²ìí´ ë³´ì¸ì
              </p>
              <Link
                href="/register"
                className="mt-5 inline-flex items-center justify-center px-5 py-2.5 rounded-pill bg-aring-ink-900 text-white text-[13px] font-extrabold"
              >
                ê·ê±¸ì´ ë±ë¡íê¸°
              </Link>
            </div>
          ) : (
            /* ê²°ê³¼ ìì */
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 px-5 lg:px-8">
                {rows.map((row) => (
                  <SearchCard key={row.id} row={row} />
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center mt-6 mb-2 px-5">
                  <button
                    onClick={handleLoadMore}
                    className="w-full max-w-[320px] py-3 rounded-pill border border-aring-green-line text-[13px] font-bold text-aring-ink-700 bg-white active:scale-[0.99] transition hover:bg-aring-ink-100"
                  >
                    ë ë³´ê¸°
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <BottomNav />
      </div>
    </main>
  );
}

// ââ Suspense Wrapper (useSearchParams íì) ââ
export default function SearchPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 rounded-full border-2 border-aring-ink-100 border-t-aring-ink-900 animate-spin" />
      </main>
    }>
      <SearchPageInner />
    </Suspense>
  );
}
