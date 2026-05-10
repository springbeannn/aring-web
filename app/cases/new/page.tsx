'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/Nav';
import { supabase } from '@/lib/supabase';

const CATEGORIES = ['패션', '뷰티', 'F&B', '라이프스타일'] as const;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

export default function NewCasePage() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState<string>('패션');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [content, setContent] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [publish, setPublish] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── admin gate ──────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!supabase) { setAuthChecking(false); return; }
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) {
        if (!cancelled) { setAllowed(false); setAuthChecking(false); }
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!cancelled) {
        setAllowed(profile?.role === 'admin');
        setAuthChecking(false);
      }
    }
    check();
    return () => { cancelled = true; };
  }, []);

  // 제목 입력 시 슬러그 자동 추천 (사용자가 직접 슬러그 수정한 후엔 유지)
  useEffect(() => {
    if (slugTouched) return;
    setSlug(slugify(title));
  }, [title, slugTouched]);

  const tags = tagsInput
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  const valid =
    title.trim().length > 0 &&
    slug.trim().length > 0 &&
    summary.trim().length > 0 &&
    content.trim().length > 0;

  async function handleSubmit() {
    if (!valid || submitting) return;
    if (!supabase) return;
    setSubmitting(true);
    setError(null);
    try {
      const { data, error: insErr } = await supabase
        .from('success_cases')
        .insert({
          slug: slug.trim(),
          title: title.trim(),
          summary: summary.trim(),
          content: content.trim(),
          category: category || null,
          thumbnail_url: thumbnailUrl.trim() || null,
          tags,
          is_featured: isFeatured,
          published: publish,
          published_at: publish ? new Date().toISOString() : null,
        })
        .select('slug')
        .single();
      if (insErr) throw insErr;
      router.push(`/cases/${data.slug}`);
    } catch (e) {
      console.error('[aring] create case', e);
      const msg = (e as { code?: string; message?: string }).code === '23505'
        ? '이미 사용 중인 슬러그입니다. 다른 값으로 입력해주세요.'
        : '등록에 실패했어요. 잠시 후 다시 시도해주세요.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // ─── render ──────────────────────────────────────
  if (authChecking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 rounded-full border-2 border-aring-ink-100 border-t-aring-ink-900 animate-spin" />
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="min-h-screen flex justify-center bg-white">
        <div className="relative w-full max-w-[440px] bg-white min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:rounded-none lg:shadow-none">
          <TopNav />
          <div className="px-5 lg:px-8 py-16 text-center">
            <p className="text-[16px] lg:text-[18px] font-bold text-aring-ink-900">접근 권한이 없어요</p>
            <p className="mt-1 text-[13px] text-aring-ink-500">사례 등록은 관리자만 가능합니다.</p>
            <Link href="/cases" className="mt-6 inline-flex rounded-pill bg-aring-ink-900 px-5 py-2.5 text-[14px] font-bold text-white">
              사례 목록으로
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
        <div className="pb-28 lg:pb-10">
          <TopNav />

          <div className="px-5 lg:px-8 pt-3 lg:pt-7 pb-3">
            <h1 className="text-[24px] lg:text-[26px] font-bold tracking-tight text-aring-ink-900">
              사례 등록
            </h1>
            <p className="mt-0.5 text-[15px] lg:text-[15px] leading-[1.5] text-aring-ink-500">
              매칭으로 연결된 브랜드 이야기를 추가합니다.
            </p>
          </div>

          <div className="px-5 lg:px-8 space-y-5 mt-3">
            {/* 제목 */}
            <Field label="제목" required>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 카페 X 디자이너 콜라보"
                maxLength={120}
                className={inputCls}
              />
            </Field>

            {/* 슬러그 */}
            <Field label="슬러그 (URL)" required hint="영문 소문자/숫자/하이픈만. 자동 추천 후 직접 수정 가능.">
              <input
                value={slug}
                onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }}
                placeholder="예: cafe-designer-collab"
                maxLength={60}
                className={inputCls}
              />
              {slug && (
                <p className="mt-1 text-[12px] text-aring-ink-400">/cases/{slug}</p>
              )}
            </Field>

            {/* 요약 */}
            <Field label="한 줄 요약" required>
              <input
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="한 줄로 사례를 요약해주세요"
                maxLength={200}
                className={inputCls}
              />
            </Field>

            {/* 카테고리 */}
            <Field label="카테고리">
              <div className="flex gap-1.5 flex-wrap">
                {CATEGORIES.map((c) => {
                  const active = category === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={[
                        'rounded-pill border px-3.5 py-2 text-[14px] font-bold transition active:scale-95',
                        active
                          ? 'border-aring-green bg-aring-green text-white'
                          : 'border-aring-ink-200 text-aring-ink-500 hover:text-aring-ink-900',
                      ].join(' ')}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </Field>

            {/* 썸네일 URL */}
            <Field label="썸네일 이미지 URL">
              <input
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://..."
                className={inputCls}
              />
              {thumbnailUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbnailUrl} alt="thumbnail preview" className="mt-2 w-full max-h-[180px] object-cover rounded-tile border border-aring-ink-200" />
              )}
            </Field>

            {/* 태그 */}
            <Field label="태그" hint="쉼표(,)로 구분. 예: 카페, 콜라보, 패션">
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="태그1, 태그2"
                className={inputCls}
              />
              {tags.length > 0 && (
                <div className="mt-2 flex gap-1 flex-wrap">
                  {tags.map((t) => (
                    <span key={t} className="inline-flex items-center px-2 py-0.5 rounded-pill bg-aring-ink-100 text-[12px] font-semibold text-aring-ink-600">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </Field>

            {/* 본문 */}
            <Field label="본문" required hint="마크다운 지원">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="사례 내용을 자유롭게 작성해주세요"
                rows={12}
                className={`${inputCls} resize-y leading-[1.6]`}
              />
            </Field>

            {/* 옵션 */}
            <div className="space-y-2">
              <CheckRow checked={isFeatured} onToggle={() => setIsFeatured(v => !v)}
                label="대표 사례로 노출 (Featured)" />
              <CheckRow checked={publish} onToggle={() => setPublish(v => !v)}
                label="즉시 공개" />
            </div>

            {error && (
              <p className="text-[13px] text-aring-accent text-center">{error}</p>
            )}

            {/* CTA */}
            <div className="pt-2 flex gap-2">
              <Link
                href="/cases"
                className="flex-1 inline-flex items-center justify-center rounded-pill border border-aring-ink-200 py-3.5 text-[15px] font-bold text-aring-ink-700"
              >
                취소
              </Link>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!valid || submitting}
                className={[
                  'flex-[2] inline-flex items-center justify-center rounded-pill py-3.5 text-[16px] font-bold transition',
                  valid && !submitting
                    ? 'bg-aring-ink-900 text-white shadow-cta active:scale-[0.99]'
                    : 'bg-aring-ink-200 text-aring-ink-400 cursor-not-allowed',
                ].join(' ')}
              >
                {submitting ? '등록 중…' : '등록하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const inputCls = 'w-full rounded-xl border border-aring-ink-200 px-4 py-3 text-[15px] text-aring-ink-900 placeholder:text-aring-ink-300 focus:border-aring-green focus:outline-none transition';

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block mb-1.5 text-[12px] font-bold tracking-[0.08em] text-aring-green uppercase">
        {label}{required && <span className="text-aring-accent ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[12px] text-aring-ink-400">{hint}</p>}
    </div>
  );
}

function CheckRow({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <button type="button" onClick={onToggle} className="w-full flex items-center gap-3 py-2 text-left">
      <span
        className={[
          'w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center shrink-0 transition',
          checked ? 'bg-aring-green border-aring-green text-white' : 'border-aring-ink-300 text-transparent',
        ].join(' ')}
      >
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      <span className="text-[15px] text-aring-ink-900">{label}</span>
    </button>
  );
}
