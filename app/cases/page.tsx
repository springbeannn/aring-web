import type { Metadata } from 'next';
import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabase/server';
import { ListItem, type CaseListItemData } from '@/components/cases/ListItem';

// ─────────────────────────────────────────────────
// SEO Metadata
// ─────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'aring 매칭 성공 사례',
  description:
    'aring을 통해 실제로 연결된 브랜드들의 협업·매칭 성공 사례 모음. 패션, 뷰티, F&B, 라이프스타일 등 다양한 카테고리의 사례를 소개합니다.',
  openGraph: {
    title: 'aring 매칭 성공 사례',
    description: '실제로 연결된 브랜드들의 이야기',
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

  // ─── 데이터 fetch ───────────────────────────────────────
  let cases: CaseListItemData[] = [];
  let fetchError = false;

  if (supabase) {
    let query = supabase
      .from('success_cases')
      .select('id, slug, title, summary, category, tags, published_at, is_featured')
      .eq('published', true)
      .order('is_featured', { ascending: false })
      .order('published_at', { ascending: false });

    if (selectedCategory !== '전체') {
      query = query.eq('category', selectedCategory);
    }

    const { data, error } = await query;
    if (error) {
      fetchError = true;
    } else {
      cases = (data ?? []) as CaseListItemData[];
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
    <main className="min-h-screen bg-aring-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-2xl mx-auto px-5 pt-12 pb-20">
        {/* Header */}
        <header className="mb-10">
          <p className="text-[12px] font-bold tracking-[0.2em] text-aring-olive mb-3">
            ARING
          </p>
          <h1 className="text-[32px] sm:text-[40px] font-bold text-aring-black leading-tight mb-2">
            매칭 성공 사례
          </h1>
          <p className="text-[14px] text-aring-gray">
            실제로 연결된 브랜드들의 이야기
          </p>
        </header>

        {/* 카테고리 탭 */}
        <nav aria-label="카테고리" className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => {
            const active = cat === selectedCategory;
            const href =
              cat === '전체' ? '/cases' : `/cases?category=${encodeURIComponent(cat)}`;
            return (
              <Link
                key={cat}
                href={href}
                className={[
                  'inline-flex items-center px-4 py-1.5 rounded-full text-[13px] font-semibold transition',
                  active
                    ? 'bg-aring-black text-white'
                    : 'bg-white text-aring-black border border-aring-gray-light hover:border-aring-olive',
                ].join(' ')}
              >
                {cat}
              </Link>
            );
          })}
        </nav>

        {/* 리스트 */}
        <section className="bg-white rounded-2xl overflow-hidden border border-aring-gray-light">
          {fetchError ? (
            <div className="px-5 py-16 text-center">
              <p className="text-[14px] text-aring-gray">사례를 불러오지 못했어요.</p>
            </div>
          ) : cases.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="text-[14px] text-aring-gray">
                {selectedCategory === '전체'
                  ? '아직 등록된 사례가 없어요.'
                  : `'${selectedCategory}' 카테고리의 사례가 없어요.`}
              </p>
            </div>
          ) : (
            cases.map((item) => <ListItem key={item.id} item={item} />)
          )}
        </section>
      </div>
    </main>
  );
}
