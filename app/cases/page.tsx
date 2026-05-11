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

  let cases: CaseListItemData[] = [];
  let fetchError = false;
  let isAdmin = false;
  let isLoggedIn = false;
  let openCount: number | null = null;

  if (supabase) {
    const casesQuery = supabase
      .from('success_cases')
      .select('id, slug, title, summary, category, tags, published_at, is_featured')
      .eq('published', true)
      .order('is_featured', { ascending: false })
      .order('published_at', { ascending: false });

    const countQuery = supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open');

    const [casesRes, userRes, countRes] = await Promise.all([
      casesQuery,
      supabase.auth.getUser(),
      countQuery,
    ]);

    if (casesRes.error) {
      fetchError = true;
    } else {
      cases = (casesRes.data ?? []) as CaseListItemData[];
    }

    const user = userRes.data.user;
    isLoggedIn = !!user;
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      isAdmin = profile?.role === 'admin';
    }

    openCount = countRes.error ? null : countRes.count ?? 0;
  }

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

  // ─── 비로그인: 게이트 화면 ─────────────────────
  if (!isLoggedIn) {
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
              <PageHeader />
              <BlurredPreview cases={cases.slice(0, 2)} />
              <WaitingCounter count={openCount} />
              <LoginGateCTA />
              <SocialProof count={openCount} />
            </div>
            <BottomNav />
          </div>
        </main>
      </>
    );
  }

  // ─── 로그인: 기존 흐름 ─────────────────────────
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
            <PageHeader />
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

              {/* 등록하기 — /my/profile 로그아웃 버튼과 동일 디자인·위치 */}
              {isAdmin && (
                <div className="mt-6 lg:flex lg:justify-end">
                  <Link
                    href="/cases/new"
                    className="inline-flex items-center justify-center gap-1.5 w-full lg:w-[200px] py-4 rounded-2xl font-bold text-[16px] transition active:scale-95 bg-aring-ink-900 text-white shadow-cta"
                  >
                    등록하기
                    <span aria-hidden>→</span>
                  </Link>
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
// 공용 헤더
// ─────────────────────────────────────────────────
function PageHeader() {
  return (
    <div className="px-5 lg:px-8 pt-3 lg:pt-7 pb-3">
      <h1 className="text-[24px] lg:text-[26px] font-bold tracking-tight text-aring-ink-900">
        aring 이야기
      </h1>
      <p className="mt-0.5 text-[15px] lg:text-[15px] leading-[1.5] text-aring-ink-500">
        aring을 통해 연결된 브랜드들의 이야기
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────
// 비로그인 — 블러 처리된 카드 미리보기
// ─────────────────────────────────────────────────
function BlurredPreview({ cases }: { cases: CaseListItemData[] }) {
  const items = cases.length > 0 ? cases : [null, null];
  const showCount = Math.min(items.length, 2);

  return (
    <div className="relative px-5 lg:px-8 mt-2">
      <div
        aria-hidden
        className="select-none pointer-events-none border-t border-aring-ink-100"
        style={{ filter: 'blur(6px)' }}
      >
        {Array.from({ length: showCount }).map((_, i) => {
          const c = cases[i];
          return c ? (
            <ListItem key={c.id} item={c} />
          ) : (
            <SkeletonCard key={`sk-${i}`} />
          );
        })}
      </div>
      {/* 흰 반투명 오버레이 */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.15)' }}
      />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="border-b border-aring-ink-100 px-5 py-7">
      <div className="h-3 w-16 rounded bg-aring-ink-100 mb-2" />
      <div className="h-5 w-3/4 rounded bg-aring-ink-100 mb-2" />
      <div className="h-3.5 w-full rounded bg-aring-ink-100 mb-1.5" />
      <div className="h-3.5 w-5/6 rounded bg-aring-ink-100 mb-3" />
      <div className="flex gap-1.5">
        <div className="h-5 w-12 rounded-full bg-aring-pastel-blue" />
        <div className="h-5 w-14 rounded-full bg-aring-pastel-blue" />
        <div className="h-5 w-10 rounded-full bg-aring-pastel-blue" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// 비로그인 — 대기 카운터 문구
// ─────────────────────────────────────────────────
function WaitingCounter({ count }: { count: number | null }) {
  // 에러는 숨김
  if (count === null) return null;

  const text =
    count > 0
      ? `${count.toLocaleString('ko-KR')}개의 귀걸이가 짝을 기다리고 있어요`
      : '첫 번째 짝을 기다리고 있어요';

  return (
    <div className="px-5 lg:px-8 mt-5 text-center">
      <p className="text-[13px] lg:text-[14px] text-aring-ink-500">{text}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────
// 비로그인 — 로그인 게이트 CTA
// ─────────────────────────────────────────────────
function LoginGateCTA() {
  return (
    <div className="px-5 lg:px-8 mt-4">
      <div className="rounded-card border border-aring-green-line bg-white shadow-card px-5 py-7 text-center">
        {/* 잠금 아이콘 */}
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-aring-green/10 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-aring-green"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h2 className="text-[17px] lg:text-[18px] font-bold text-aring-ink-900">
          매칭 스토리 전체 보기
        </h2>
        <p className="mt-1 text-[13px] lg:text-[14px] text-aring-ink-500 leading-[1.6]">
          로그인하면 어떤 짝들이 기다리는지 볼 수 있어요
        </p>

        <Link
          href="/login?redirect=/cases"
          className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-aring-ink-900 py-4 text-[16px] font-bold text-white shadow-cta active:scale-95 transition"
        >
          로그인
        </Link>

        <p className="mt-3 text-[13px] text-aring-ink-500">
          아직 회원이 아니세요?{' '}
          <Link href="/signup" className="font-bold text-aring-ink-900 hover:text-aring-green transition">
            회원가입 →
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// 비로그인 — Social proof 수치 스트립
// ─────────────────────────────────────────────────
function SocialProof({ count }: { count: number | null }) {
  const countLabel = count !== null && count > 0
    ? `${count.toLocaleString('ko-KR')}개`
    : '준비 중';

  const items = [
    { value: countLabel, label: '짝을 기다리는 중' },
    { value: '₩0',       label: '수수료' },
    { value: 'AI 매칭',  label: '사진 한 장으로' },
  ];

  return (
    <div className="px-5 lg:px-8 mt-4">
      <div className="grid grid-cols-3 gap-2">
        {items.map((it) => (
          <div
            key={it.label}
            className="rounded-tile bg-aring-ink-100/60 px-3 py-3 text-center"
          >
            <p className="text-[14px] lg:text-[15px] font-bold text-aring-ink-900 truncate">{it.value}</p>
            <p className="mt-0.5 text-[11px] lg:text-[12px] text-aring-ink-500 leading-[1.4]">{it.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// 로그인 후 — Empty / Error 상태 (기존)
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
