import type { Metadata } from 'next';
import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabase/server';
import { ListItem, type CaseListItemData } from '@/components/cases/ListItem';
import { TopNav, BottomNav } from '@/components/Nav';

// ─────────────────────────────────────────────────
// SEO Metadata
// ─────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'aring 매칭 성공 사례',
  description:
    'aring을 통해 실제로 연결된 브랜드들의 협업·매칭 성공 사례 모음. 패션, 뷰티, F&B, 라이프스타일 등 다양한 카테고리의 사례를 소개합니다.',
  openGraph: {
    title: 'aring 매칭 성공 사례',
    description: 'aring을 통해 연결된 브랜드들의 이야기',
    type: 'website',
  },
};

// ─────────────────────────────────────────────────
// 카테고리 탭
// ─────────────────────────────────────────────────
const CATEGORIES = ['전체', '패션', '뷰티', 'F&B', '라이프스타일'] as const;
type CategoryKey = (typeof CATEGORIES)[number];

export const dynamic = 'force-dynamic';

export default async function CasesPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const supabase = createSupabaseServer();
  const selectedCategory = (CATEGORIES.includes(
    (searchParams.category ?? '전체') as CategoryKey,
  )
    ? (searchParams.category ?? '전체')
    : '전체') as CategoryKey;

  // ─── 데이터 fetch + admin role 체크 (병렬) ──────────────
  let cases: CaseListItemData[] = [];
  let fetchError = false;
  let isAdmin = false;

  if (supabase) {
    let casesQuery = supabase
      .from('success_cases')
      .select('id, slug, title, summary, category, tags, published_at, is_featured')
      .eq('published', true)
      .order('is_featured', { ascending: false })
      .order('published_at', { ascending: false });

    if (selectedCategory !== '전체') {
      casesQuery = casesQuery.eq('category', selectedCategory);
    }

    const [casesRes, userRes] = await Promise.all([
      casesQuery,
      supabase.auth.getUser(),
    ]);

    if (casesRes.error) {
      fetchError = true;
    } else {
      cases = (casesRes.data ?? []) as CaseListItemData[];
    }

    const user = userRes.data.user;
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      isAdmin = profile?.role === 'admin';
    }
  }

  // ─── JSON-LD CollectionPage 스키마 (AEO) ───────────────
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'aring 매칭 성공 사례',
    description: 'aring을 통해 실제로 연결된 브랜드들의 협업·매칭 성공 사례',
    hasPart: cases.map((c) => ({
      '@type': 'Article',
      headline: c.title,
      description: c.summary,
      datePublished: c.published_at,
      url: `/cases/${c.slug}`,
      ...(c.category ? { articleSection: c.category } : {}),
      ...(c.tags?.length ? { keywords: c.tags.join(', ') } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen flex justify-center bg-white">
        <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
          <div className="pb-28 lg:pb-10">
            <TopNav />

            {/* 헤더 — discover 와꾸 */}
            <div className="px-5 lg:px-8 pt-3 lg:pt-7 pb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-[24px] lg:text-[26px] font-bold tracking-tight text-aring-ink-900">
                  매칭 성공 사례
                </h1>
                <p className="mt-0.5 text-[15px] lg:text-[15px] leading-[1.5] text-aring-ink-500">
                  aring을 통해 연결된 브랜드들의 이야기
                </p>
              </div>
              {isAdmin && (
                <Link
                  href="/cases/new"
                  className="shrink-0 rounded-pill bg-aring-ink-900 px-4 py-2 text-[13px] font-bold text-white shadow-cta active:scale-[0.99] transition"
                >
                  + 사례 등록
                </Link>
              )}
            </div>

            {/* 카테고리 필터 탭 */}
            <nav
              aria-label="카테고리"
              className="px-5 lg:px-8 pb-3 flex gap-2 overflow-x-auto no-scrollbar"
            >
              {CATEGORIES.map((tab) => {
                const active = tab === selectedCategory;
                const href = tab === '전체' ? '/cases' : `/cases?category=${encodeURIComponent(tab)}`;
                return (
                  <Link
                    key={tab}
                    href={href}
                    className={[
                      'shrink-0 rounded-pill px-3.5 py-2 text-[13px] font-bold border transition',
                      active
                        ? 'bg-aring-ink-900 text-white border-aring-ink-900'
                        : 'border-aring-ink-200 text-aring-ink-500 hover:border-aring-green hover:text-aring-ink-900',
                    ].join(' ')}
                  >
                    {tab}
                  </Link>
                );
              })}
            </nav>

            {/* 리스트 / 빈 상태 / 에러 */}
            <div className="px-5 lg:px-8">
              {fetchError ? (
                <ErrorState />
              ) : cases.length === 0 ? (
                <EmptyState isAdmin={isAdmin} category={selectedCategory} />
              ) : (
                <div className="border-t border-aring-ink-100">
                  {cases.map((item) => (
                    <ListItem key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </div>
          <BottomNav />
        </div>
      </main>
    </>
  );
}

// ─────────────────────────────────────────────────
// Empty / Error 상태
// ─────────────────────────────────────────────────
function EmptyState({
  isAdmin,
  category,
}: {
  isAdmin: boolean;
  category: CategoryKey;
}) {
  const isAll = category === '전체';
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-4xl mb-4" aria-hidden>💍</span>
      <p className="text-[15px] font-bold text-aring-ink-900 mb-1">
        {isAll ? '아직 등록된 성공 사례가 없어요.' : `'${category}' 카테고리의 사례가 없어요.`}
      </p>
      <p className="text-[13px] text-aring-ink-500 mb-6">
        첫 번째 매칭 이야기를 등록해보세요.
      </p>
      {isAdmin && (
        <Link
          href="/cases/new"
          className="w-full max-w-[320px] inline-flex items-center justify-center rounded-pill bg-aring-ink-900 py-3.5 text-[16px] font-bold text-white shadow-cta active:scale-[0.99] transition"
        >
          + 사례 등록
        </Link>
      )}
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-4xl mb-4" aria-hidden>⚠️</span>
      <p className="text-[15px] font-bold text-aring-ink-900 mb-1">사례를 불러오지 못했어요.</p>
      <p className="text-[13px] text-aring-ink-500 mb-6">잠시 후 다시 시도해주세요.</p>
      <Link
        href="/cases"
        className="w-full max-w-[320px] inline-flex items-center justify-center rounded-pill border border-aring-ink-200 py-3.5 text-[15px] font-bold text-aring-ink-700 hover:border-aring-green hover:text-aring-ink-900 transition"
      >
        새로고침
      </Link>
    </div>
  );
}
