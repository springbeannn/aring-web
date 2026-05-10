import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServer } from '@/lib/supabase/server';

// 빌드 타임 SSG 전용 anon 클라이언트 (cookies 의존 없음)
function buildTimeClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}

// ─────────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────────
type CaseRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string | null;
  thumbnail_url: string | null;
  tags: string[];
  is_featured: boolean;
  published_at: string;
};

type OtherCase = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string | null;
  published_at: string;
};

// ─────────────────────────────────────────────────
// SSG — 빌드 시 모든 published 사례 정적 생성
// (런타임에 새 사례 추가되면 dynamicParams로 fallback)
// ─────────────────────────────────────────────────
export const dynamicParams = true;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const client = buildTimeClient();
  if (!client) return [];
  try {
    const { data, error } = await client
      .from('success_cases')
      .select('slug')
      .eq('published', true);
    if (error) return [];
    return (data ?? []).map((c: { slug: string }) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────
// 페이지별 metadata + OG 태그
// ─────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const client = buildTimeClient();
  if (!client) return { title: 'aring 성공 사례' };

  type MetaRow = { title: string; summary: string; thumbnail_url: string | null };
  let data: MetaRow | null = null;
  try {
    const res = await client
      .from('success_cases')
      .select('title, summary, thumbnail_url')
      .eq('slug', params.slug)
      .eq('published', true)
      .maybeSingle();
    data = (res.data ?? null) as MetaRow | null;
  } catch {
    return { title: 'aring 성공 사례' };
  }

  if (!data) return { title: 'aring 성공 사례' };

  return {
    title: `${data.title} | aring 성공 사례`,
    description: data.summary,
    openGraph: {
      title: data.title,
      description: data.summary,
      type: 'article',
      images: data.thumbnail_url ? [data.thumbnail_url] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.summary,
      images: data.thumbnail_url ? [data.thumbnail_url] : undefined,
    },
  };
}

// ─────────────────────────────────────────────────
// 상세 페이지
// ─────────────────────────────────────────────────
export default async function CaseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createSupabaseServer();
  if (!supabase) notFound();

  const { data: caseRow, error } = await supabase
    .from('success_cases')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .maybeSingle();

  if (error || !caseRow) notFound();
  const c = caseRow as CaseRow;

  // 다른 성공 사례 3건
  const { data: othersData } = await supabase
    .from('success_cases')
    .select('id, slug, title, summary, category, published_at')
    .eq('published', true)
    .neq('slug', params.slug)
    .order('published_at', { ascending: false })
    .limit(3);
  const others = (othersData ?? []) as OtherCase[];

  // ─── JSON-LD Article 스키마 (AEO) ──────────────────────
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: c.title,
    description: c.summary,
    datePublished: c.published_at,
    ...(c.category ? { articleSection: c.category } : {}),
    ...(c.tags?.length ? { keywords: c.tags.join(', ') } : {}),
    ...(c.thumbnail_url ? { image: c.thumbnail_url } : {}),
    publisher: {
      '@type': 'Organization',
      name: 'aring',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `/cases/${c.slug}`,
    },
  };

  return (
    <main className="min-h-screen bg-aring-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-2xl mx-auto px-5 pt-10 pb-20">
        <Link
          href="/cases"
          className="inline-flex items-center text-[15px] lg:text-[15px] font-semibold text-aring-olive mb-6 hover:underline"
        >
          ← 목록으로
        </Link>

        <article>
          {c.category && (
            <p className="text-[11px] font-bold tracking-[0.15em] text-aring-olive uppercase mb-2">
              {c.category}
            </p>
          )}
          <h1 className="text-[28px] sm:text-[34px] font-bold text-aring-black leading-tight mb-3">
            {c.title}
          </h1>
          <p className="text-[16px] text-aring-gray leading-relaxed mb-4">{c.summary}</p>

          {/* 메타 + 태그 */}
          <div className="flex items-center gap-3 flex-wrap text-[12px] lg:text-[13px] text-aring-gray mb-8 pb-6 border-b border-aring-gray-light">
            <time dateTime={c.published_at}>
              {new Date(c.published_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            {c.tags?.length > 0 && (
              <>
                <span aria-hidden>·</span>
                <div className="flex flex-wrap gap-1.5">
                  {c.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center px-2 py-0.5 rounded-full bg-aring-pastel-green text-[11px] font-semibold text-aring-black"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Markdown 본문 */}
          <div className="markdown-body [&_h1]:text-[24px] [&_h1]:font-bold [&_h1]:text-aring-black [&_h1]:mt-8 [&_h1]:mb-3 [&_h2]:text-[20px] [&_h2]:font-bold [&_h2]:text-aring-black [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-[17px] [&_h3]:font-bold [&_h3]:text-aring-black [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-[15px] [&_p]:leading-relaxed [&_p]:text-aring-black/85 [&_p]:mb-4 [&_a]:text-aring-olive [&_a]:underline [&_a]:underline-offset-2 [&_strong]:text-aring-black [&_strong]:font-bold [&_em]:italic [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:text-[15px] [&_li]:text-aring-black/85 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-aring-olive [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-aring-gray [&_blockquote]:my-4 [&_code]:bg-aring-pastel-green/40 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px] [&_code]:font-mono [&_pre]:bg-aring-black [&_pre]:text-white [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:my-4 [&_img]:rounded-xl [&_img]:my-4 [&_hr]:border-aring-gray-light [&_hr]:my-8">
            <ReactMarkdown>{c.content}</ReactMarkdown>
          </div>
        </article>

        {/* 다른 성공 사례 */}
        {others.length > 0 && (
          <section className="mt-16 pt-10 border-t border-aring-gray-light">
            <h2 className="text-[20px] font-bold text-aring-black mb-4">
              다른 성공 사례 보기
            </h2>
            <div className="bg-white rounded-2xl border border-aring-gray-light overflow-hidden">
              {others.map((o) => (
                <Link
                  key={o.id}
                  href={`/cases/${o.slug}`}
                  className="group block border-b border-aring-gray-light last:border-b-0 px-5 py-4 hover:bg-aring-pastel-green/30 transition-colors"
                >
                  {o.category && (
                    <p className="text-[11px] font-bold tracking-[0.15em] text-aring-olive uppercase mb-1">
                      {o.category}
                    </p>
                  )}
                  <p className="text-[16px] font-bold text-aring-black leading-snug group-hover:text-aring-olive transition-colors">
                    {o.title}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
