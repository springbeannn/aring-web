'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/Nav';
import { supabase, STORAGE_BUCKET } from '@/lib/supabase';

const CATEGORIES = ['패션', '뷰티', '라이프스타일'] as const;
const IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5MB

function buildCaseImagePath(filename: string): string {
  const ext = (filename.split('.').pop() || 'jpg').toLowerCase();
  const rnd = Math.random().toString(36).slice(2, 10);
  return `cases/${Date.now()}-${rnd}.${ext}`;
}

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [tagsInput, setTagsInput] = useState('');
  const [content, setContent] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [publish, setPublish] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── 로그인 게이트 — admin role 검사 제거, 비로그인만 차단 ───
  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!supabase) { setAuthChecking(false); return; }
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!cancelled) {
        setAllowed(!!user);
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

  function handlePickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > IMAGE_MAX_BYTES) {
      setError('이미지 크기는 5MB 이하만 첨부할 수 있어요.');
      e.target.value = '';
      return;
    }
    setError(null);
    setImageFile(f);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(f);
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit() {
    if (!valid || submitting) return;
    if (!supabase) return;
    setSubmitting(true);
    setError(null);
    try {
      let thumbnailUrl: string | null = null;
      if (imageFile) {
        const path = buildCaseImagePath(imageFile.name);
        const { error: upErr } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(path, imageFile, { contentType: imageFile.type, cacheControl: '3600', upsert: false });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        thumbnailUrl = urlData.publicUrl;
      }

      const { data, error: insErr } = await supabase
        .from('success_cases')
        .insert({
          slug: slug.trim(),
          title: title.trim(),
          summary: summary.trim(),
          content: content.trim(),
          category: category || null,
          thumbnail_url: thumbnailUrl,
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
            <p className="text-[16px] lg:text-[18px] font-bold text-aring-ink-900">로그인이 필요해요</p>
            <p className="mt-1 text-[13px] text-aring-ink-500">사례 등록은 로그인 후 이용할 수 있어요.</p>
            <Link href="/login?redirect=/cases/new" className="mt-6 inline-flex rounded-pill bg-aring-ink-900 px-5 py-2.5 text-[14px] font-bold text-white">
              로그인하러 가기
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

          <div className="px-5 lg:px-8 pt-3 lg:pt-7 pb-3 flex items-center gap-3">
            <Link
              href="/cases"
              aria-label="목록으로"
              className="lg:hidden w-9 h-9 rounded-full bg-aring-ink-100 flex items-center justify-center text-aring-ink-900 active:scale-95 transition shrink-0"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-[24px] lg:text-[26px] font-bold tracking-tight text-aring-ink-900">
                사례 등록
              </h1>
              <p className="mt-0.5 text-[15px] lg:text-[15px] leading-[1.5] text-aring-ink-500">
                매칭으로 연결된 브랜드 이야기를 추가합니다.
              </p>
            </div>
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

            {/* 카테고리 — /qna/new 칩 스타일과 통일 */}
            <Field label="카테고리">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => {
                  const active = category === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={[
                        'rounded-pill px-3 py-1.5 text-[13px] font-bold transition active:scale-95',
                        active
                          ? 'bg-aring-ink-900 text-white border border-aring-ink-900'
                          : 'bg-white text-aring-ink-700 border border-aring-green-line hover:border-aring-ink-300',
                      ].join(' ')}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </Field>

            {/* 이미지 첨부 (선택) — /qna/new 동일 패턴 */}
            <Field label="이미지 첨부" hint="JPG/PNG, 최대 5MB">
              {imagePreview ? (
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="첨부 이미지 미리보기" className="max-w-[240px] max-h-[240px] rounded-tile border border-aring-ink-200" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    aria-label="이미지 삭제"
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-aring-ink-900 text-white text-[13px] flex items-center justify-center shadow-card"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-pill border border-aring-ink-200 bg-white text-[14px] font-bold text-aring-ink-700 cursor-pointer hover:border-aring-ink-300 transition">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  이미지 선택
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePickImage} className="hidden" />
                </label>
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

            {/* CTA — /qna/new와 동일 패턴 */}
            <div className="pt-2 lg:flex lg:justify-end lg:gap-3">
              <Link
                href="/cases"
                className="hidden lg:inline-flex items-center justify-center w-[140px] py-4 rounded-2xl font-bold text-[16px] border border-aring-ink-200 text-aring-ink-700 transition active:scale-95"
              >
                취소
              </Link>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!valid || submitting}
                className={`w-full lg:w-[200px] py-4 rounded-2xl font-bold text-[16px] transition active:scale-95 ${
                  valid && !submitting
                    ? 'bg-aring-ink-900 text-white shadow-cta'
                    : 'bg-aring-ink-100 text-aring-ink-400 cursor-not-allowed'
                }`}
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

const inputCls = 'w-full rounded-tile border border-aring-ink-200 px-4 py-3 text-[15px] lg:text-[15px] text-aring-ink-900 bg-transparent placeholder:text-aring-ink-400 outline-none focus:border-aring-green transition';

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
      <label className="block mb-2 text-[15px] lg:text-[15px] font-bold text-aring-ink-700">
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
          'w-5 h-5 rounded-[5px] border-2 flex items-center justify-center shrink-0 transition',
          checked ? 'bg-aring-ink-900 border-aring-ink-900 text-white' : 'border-aring-ink-300 bg-white text-transparent',
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
