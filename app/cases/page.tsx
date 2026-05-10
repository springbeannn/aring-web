import type { Metadata } from 'next';
import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabase/server';
import { ListItem, type CaseListItemData } from '@/components/cases/ListItem';
import { TopNav, BottomNav } from '@/components/Nav';

// ─────────────────────────────────────────────────
// SEO Metadata
// ─────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'aring 이야기',
  description:
    'aring을 통해 실제로 연결된 브랜드들의 협업·매칭 성공 사례 모음.',
  openGraph: {
    title: 'aring 이야기',
    description: 'aring을 통해 연결된 브랜드들의 이야기',
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';

export default async function CasesPage() {
  const supabase = createSupabaseServer();

  // ─── 데이터 fetch + admin role 체크 (병렬) ──────────────
  let cases: CaseListItemData[] = [];
  let fetchError = false;
  let isAdmin = false;

  if (supabase) {
    const casesQuery = supabase
      .from('success_cases')
      .select('id, slug, title, summary, category, tags, published_at, is_featured')
      .eq('published', true)
      .order('is_featured', { ascending: false })
      .order('published_at', { ascending: false });

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
    name: 'aring 이야기',
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
          {/* admin일 때 하단 sticky CTA가 떠있으므로 콘텐츠 하단 패딩 추가 */}
          <div className={isAdmin ? 'pb-[180px] lg:pb-[120px]' : 'pb-28 lg:pb-10'}>
            <TopNav />

            {/* 헤더 — discover 와꾸 */}
            <div className="px-5 lg:px-8 pt-3 lg:pt-7 pb-3">
              <h1 className="text-[24px] lg:text-[26px] font-bold tracking-tight text-aring-ink-900">
                aring 이야기
              </h1>
              <p className="mt-0.5 text-[15px] lg:text-[15px] leading-[1.5] text-aring-ink-500">
                aring을 통해 연결된 브랜드들의 이야기
              </p>
            </div>

            {/* 리스트 / 빈 상태 / 에러 */}
            <div className="px-5 lg:px-8">
              {fetchError ? (
                <ErrorState />
              ) : cases.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="border-t border-aring-ink-100">
                  {cases.map((item) => (
                    <ListItem key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 하단 sticky CTA — register 페이지 StickyCTA 패턴 (admin only) */}
          {isAdmin && (
            <div className="fixed left-0 right-0 bottom-0 z-40 pointer-events-none">
              <div className="mx-auto w-full max-w-[440px] lg:max-w-[1200px] glass-strong border-t border-white/60 px-5 lg:px-8 py-4 pb-[calc(env(safe-area-inset-bottom,0px)+88px)] lg:pb-4 pointer-events-auto">
                <Link
                  href="/cases/new"
                  className="block w-full rounded-pill bg-aring-ink-900 py-3.5 text-center text-[16px] font-bold text-white shadow-cta active:scale-[0.99] transition"
                >
                  + 사례 등록
                </Link>
              </div>
            </div>
          )}

          <BottomNav />
        </div>
      </main>
    </>
  );
}

// ─────────────────────────────────────────────────
// Empty / Error 상태
// ─────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-4xl mb-4" aria-hidden>💍</span>
      <p className="text-[15px] font-bold text-aring-ink-900 mb-1">
        아직 등록된 이야기가 없어요.
      </p>
      <p className="text-[13px] text-aring-ink-500">
        첫 번째 매칭 이야기를 기다리고 있어요.
      </p>
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
