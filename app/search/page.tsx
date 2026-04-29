'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { TopNav, BottomNav } from '@/components/Nav';
import { thumbBg, type ThumbTone } from '@/lib/mock';
import { supabase, type Listing } from '@/lib/supabase';

// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
// /search Ã¢ÂÂ Ã­ÂÂÃ¬ÂÂ¤Ã­ÂÂ¸ ÃªÂ²ÂÃ¬ÂÂ ÃªÂ²Â°ÃªÂ³Â¼ Ã­ÂÂÃ¬ÂÂ´Ã¬Â§Â
// ÃªÂ²ÂÃ¬ÂÂ Ã«ÂÂÃ¬ÂÂ: brand, shape, material, detail, color, story, region
// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ

const PAGE_SIZE = 20;

const TONE_ROTATION: ThumbTone[] = [
  'pink', 'peach', 'butter', 'mint', 'sky', 'sage',
];

function pickTone(seed: string): ThumbTone {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h * 31) + seed.charCodeAt(i)) | 0;
  return TONE_ROTATION[Math.abs(h) % TONE_ROTATION.length];
}

// Ã¢ÂÂÃ¢ÂÂ SVG Icons Ã¢ÂÂÃ¢ÂÂ
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

// Ã¢ÂÂÃ¢ÂÂ Search Card Ã¢ÂÂÃ¢ÂÂ
function SearchCard({ row }: { row: Listing }) {
  const tone = pickTone(row.id);
  return (
    <Link
      href={`/items/${row.id}`}
      className="flex flex-col rounded-tile border border-aring-green-line bg-white overflow-hidden text-left active:scale-[0.99] transition"
    >
      {/* Ã¬ÂÂ¸Ã«ÂÂ¤Ã¬ÂÂ¼ */}
      <div className={`relative w-full aspect-square ${thumbBg(tone)} flex items-center justify-center overflow-hidden`}>
        {row.photo_url ? (
          <img
            src={row.photo_url}
            alt={row.brand ?? 'ÃªÂ·ÂÃªÂ±Â¸Ã¬ÂÂ´'}
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
          Ã¢ÂÂ
        </span>
      </div>

      {/* Ã«Â³Â¸Ã«Â¬Â¸ */}
      <div className="px-3 py-3">
        <p className="text-[10.5px] font-bold tracking-wider text-aring-ink-500 truncate">
          {row.brand ?? 'Ã«Â¸ÂÃ«ÂÂÃ«ÂÂ Ã«Â¯Â¸Ã¬ÂÂ'}
        </p>
        <p className="mt-0.5 text-[13px] font-bold text-aring-ink-900 truncate">
          {row.detail ?? row.shape ?? 'Ã­ÂÂ Ã¬Â§Â'}
        </p>
        {row.story && (
          <p className="mt-1 text-[10.5px] text-aring-ink-500 truncate">
            ÃÂ· {row.story}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[12px] font-bold text-aring-ink-900">
            {row.price ? `Ã¢ÂÂ©${row.price.toLocaleString('ko-KR')}` : 'ÃªÂ°ÂÃªÂ²Â© Ã«Â¯Â¸Ã¬ÂÂ'}
          </span>
        </div>
      </div>
    </Link>
  );
}

// Ã¢ÂÂÃ¢ÂÂ Search Bar Ã¢ÂÂÃ¢ÂÂ
function SearchInput({
  defaultValue,
  onSearch,
}: {
  defaultValue?: string;
  onSearch: (q: string) => void;
}) {
  const [value, setValue] = useState(defaultValue ?? '');

  const handleSubmit = (e: { preventDefault: () => void }) => {
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
        placeholder="Ã«Â¸ÂÃ«ÂÂÃ«ÂÂ, Ã«ÂªÂ¨Ã¬ÂÂ, Ã¬Â»Â¬Ã«ÂÂ¬Ã«Â¡Â ÃªÂ²ÂÃ¬ÂÂ"
        className="flex-1 bg-transparent border-0 outline-none text-[14px] text-aring-ink-700 placeholder:text-aring-ink-500"
        autoFocus
      />
      <button
        type="submit"
        className="shrink-0 px-3 py-1 rounded-pill bg-aring-ink-900 text-white text-[12px] font-bold active:scale-95 transition"
      >
        ÃªÂ²ÂÃ¬ÂÂ
      </button>
    </form>
  );
}

// Ã¢ÂÂÃ¢ÂÂ Main Page Inner Ã¢ÂÂÃ¢ÂÂ
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

      // Ã¬ÂÂ¬Ã«ÂÂ¬ Ã­ÂÂÃ«ÂÂÃ«Â¥Â¼ ilikeÃ«Â¡Â ÃªÂ²ÂÃ¬ÂÂ (OR Ã¬Â¡Â°ÃªÂ±Â´)
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
        setError('ÃªÂ²ÂÃ¬ÂÂ Ã¬Â¤Â Ã¬ÂÂ¤Ã«Â¥ÂÃªÂ°Â Ã«Â°ÂÃ¬ÂÂÃ­ÂÂÃ¬ÂÂ´Ã¬ÂÂ. Ã¬ÂÂ Ã¬ÂÂ Ã­ÂÂ Ã«ÂÂ¤Ã¬ÂÂ Ã¬ÂÂÃ«ÂÂÃ­ÂÂ´ Ã¬Â£Â¼Ã¬ÂÂ¸Ã¬ÂÂ.');
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

  // Ã«ÂÂ Ã«Â³Â´ÃªÂ¸Â°
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

          {/* Ã­ÂÂ¤Ã«ÂÂ */}
          <div className="px-5 lg:px-8 pt-3 lg:pt-7 pb-4 flex items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Ã«ÂÂ¤Ã«Â¡ÂÃªÂ°ÂÃªÂ¸Â°"
              className="lg:hidden w-9 h-9 rounded-full bg-aring-ink-100 flex items-center justify-center text-aring-ink-900 active:scale-95 transition"
            >
              <IconArrowLeft />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-[20px] lg:text-[26px] font-extrabold tracking-tight text-aring-ink-900">
                ÃªÂ²ÂÃ¬ÂÂÃªÂ²Â°ÃªÂ³Â¼
              </h1>
              {query && (
                <p className="mt-0.5 text-[12px] text-aring-ink-500">
                  &apos;{query}&apos; ÃªÂ²ÂÃ¬ÂÂ ÃªÂ²Â°ÃªÂ³Â¼
                  {!loading && total > 0 && (
                    <> ÃÂ· Ã¬Â´Â <span className="font-semibold">{total}</span>ÃªÂ°Â</>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* ÃªÂ²ÂÃ¬ÂÂÃ«Â°Â */}
          <SearchInput defaultValue={query} onSearch={handleSearch} />

          {/* Ã«Â³Â¸Ã«Â¬Â¸ */}
          {!query ? (
            /* ÃªÂ²ÂÃ¬ÂÂÃ¬ÂÂ´ Ã¬ÂÂÃ¬ÂÂ */
            <div className="px-5 lg:px-8 py-16 text-center">
              <p className="text-[15px] font-bold text-aring-ink-900">
                Ã¬Â°Â¾ÃªÂ³Â  Ã¬ÂÂ¶Ã¬ÂÂ ÃªÂ·ÂÃªÂ±Â¸Ã¬ÂÂ´ Ã¬Â ÂÃ«Â³Â´Ã«Â¥Â¼ Ã¬ÂÂÃ«Â Â¥Ã­ÂÂ´ Ã¬Â£Â¼Ã¬ÂÂ¸Ã¬ÂÂ
              </p>
              <p className="mt-2 text-[12px] text-aring-ink-500">
                Ã«Â¸ÂÃ«ÂÂÃ«ÂÂ, Ã«ÂªÂ¨Ã¬ÂÂ, Ã¬Â»Â¬Ã«ÂÂ¬Ã«Â¡Â ÃªÂ²ÂÃ¬ÂÂÃ­ÂÂ  Ã¬ÂÂ Ã¬ÂÂÃ¬ÂÂ´Ã¬ÂÂ
              </p>
            </div>
          ) : loading ? (
            /* Ã«Â¡ÂÃ«ÂÂ© */
            <div className="px-5 lg:px-8 py-16 text-center">
              <div className="w-8 h-8 mx-auto rounded-full border-2 border-aring-ink-100 border-t-aring-ink-900 animate-spin" />
              <p className="mt-3 text-[12px] text-aring-ink-500">ÃªÂ²ÂÃ¬ÂÂ Ã¬Â¤ÂÃ¢ÂÂ¦</p>
            </div>
          ) : error ? (
            /* Ã¬ÂÂÃ«ÂÂ¬ */
            <div className="px-5 lg:px-8 py-16 text-center">
              <p className="text-[13px] font-bold text-aring-ink-900">{error}</p>
              <button
                onClick={() => handleSearch(query)}
                className="mt-4 px-5 py-2.5 rounded-pill bg-aring-ink-900 text-white text-[13px] font-extrabold"
              >
                Ã«ÂÂ¤Ã¬ÂÂ Ã¬ÂÂÃ«ÂÂ
              </button>
            </div>
          ) : rows.length === 0 ? (
            /* ÃªÂ²Â°ÃªÂ³Â¼ Ã¬ÂÂÃ¬ÂÂ */
            <div className="px-5 lg:px-8 py-16 text-center">
              <p className="text-[15px] font-bold text-aring-ink-900">
                Ã¬ÂÂÃ¬Â§Â Ã«Â§ÂÃ«ÂÂ ÃªÂ·ÂÃªÂ±Â¸Ã¬ÂÂ´Ã«Â¥Â¼ Ã¬Â°Â¾Ã¬Â§Â Ã«ÂªÂ»Ã­ÂÂÃ¬ÂÂ´Ã¬ÂÂ
              </p>
              <p className="mt-2 text-[12px] text-aring-ink-500">
                Ã«ÂÂ¤Ã«Â¥Â¸ Ã«Â¸ÂÃ«ÂÂÃ«ÂÂÃ«ÂªÂÃ¬ÂÂ´Ã«ÂÂ Ã¬Â»Â¬Ã«ÂÂ¬, Ã«ÂªÂ¨Ã¬ÂÂÃ¬ÂÂ¼Ã«Â¡Â Ã«ÂÂ¤Ã¬ÂÂ ÃªÂ²ÂÃ¬ÂÂÃ­ÂÂ´ Ã«Â³Â´Ã¬ÂÂ¸Ã¬ÂÂ
              </p>
              <Link
                href="/register"
                className="mt-5 inline-flex items-center justify-center px-5 py-2.5 rounded-pill bg-aring-ink-900 text-white text-[13px] font-extrabold"
              >
                ÃªÂ·ÂÃªÂ±Â¸Ã¬ÂÂ´ Ã«ÂÂ±Ã«Â¡ÂÃ­ÂÂÃªÂ¸Â°
              </Link>
            </div>
          ) : (
            /* ÃªÂ²Â°ÃªÂ³Â¼ Ã¬ÂÂÃ¬ÂÂ */
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
                    Ã«ÂÂ Ã«Â³Â´ÃªÂ¸Â°
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

// Ã¢ÂÂÃ¢ÂÂ Suspense Wrapper (useSearchParams Ã­ÂÂÃ¬ÂÂ) Ã¢ÂÂÃ¢ÂÂ
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
