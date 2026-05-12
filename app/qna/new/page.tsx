'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { TopNav, BottomNav } from '@/components/Nav';
import { Toast } from '@/components/Toast';
import { supabase, STORAGE_BUCKET } from '@/lib/supabase';
import { getCurrentProfile } from '@/lib/auth';
import {
  QNA_CATEGORIES,
  buildQnaImagePath,
  type QnaCategory,
} from '@/lib/qna';
import { resizeImageFile } from '@/lib/resizeImage';

// ─────────────────────────────────────────────────────────────
// /qna/new — 문의 작성
// ─────────────────────────────────────────────────────────────

const TITLE_MAX = 80;
const CONTENT_MAX = 2000;
const IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5MB

export default function QnaNewPage() {
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [nickname, setNickname] = useState<string>('');

  const [category, setCategory] = useState<QnaCategory>('service');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    async function check() {
      if (!supabase) { setAuthChecked(true); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login?redirect=/qna/new');
        return;
      }
      const p = await getCurrentProfile();
      setNickname(p?.nickname ?? '');
      setAuthChecked(true);
    }
    check();
  }, [router]);

  async function handlePickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.files?.[0];
    if (!raw) return;
    // 모바일 카메라 원본은 5MB 초과가 잦음 → 클라이언트에서 리사이즈
    const f = await resizeImageFile(raw);
    if (f.size > IMAGE_MAX_BYTES) {
      setErrorMsg('이미지 크기를 줄이지 못했어요. 다른 사진으로 시도해 주세요.');
      e.target.value = '';
      return;
    }
    setErrorMsg('');
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setErrorMsg('');

    const t = title.trim();
    const c = content.trim();
    if (!t) { setErrorMsg('제목을 입력해주세요.'); return; }
    if (t.length > TITLE_MAX) { setErrorMsg(`제목은 ${TITLE_MAX}자 이하로 입력해주세요.`); return; }
    if (!c) { setErrorMsg('문의 내용을 입력해주세요.'); return; }
    if (c.length > CONTENT_MAX) { setErrorMsg(`문의 내용은 ${CONTENT_MAX}자 이하로 입력해주세요.`); return; }
    if (!supabase) { setErrorMsg('서버 연결이 확인되지 않았어요.'); return; }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) { router.replace('/login?redirect=/qna/new'); return; }

      let imageUrl: string | null = null;
      if (imageFile) {
        const path = buildQnaImagePath(imageFile.name);
        const { error: upErr } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(path, imageFile, { contentType: imageFile.type, cacheControl: '3600', upsert: false });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { error: insErr } = await supabase.from('qna').insert({
        user_id: userId,
        nickname: nickname || null,
        category,
        title: t,
        content: c,
        image_url: imageUrl,
        is_private: isPrivate,
      });
      if (insErr) throw insErr;

      setShowToast(true);
      setTimeout(() => router.push('/qna'), 900);
    } catch (err) {
      console.error('[aring] qna submit error', err);
      setErrorMsg('문의 등록에 실패했어요. 잠시 후 다시 시도해주세요.');
      setSubmitting(false);
    }
  }

  if (!authChecked) {
    return (
      <main className="min-h-screen flex justify-center bg-white">
        <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen lg:max-w-[1200px]">
          <TopNav />
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 rounded-full border-2 border-aring-ink-100 border-t-aring-ink-900 animate-spin" />
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

          {/* 헤더 */}
          <div className="px-5 lg:px-8 pt-3 lg:pt-7 pb-3 flex items-center gap-3">
            <Link
              href="/qna"
              aria-label="목록으로"
              className="lg:hidden w-9 h-9 rounded-full bg-aring-ink-100 flex items-center justify-center text-aring-ink-900 active:scale-95 transition shrink-0"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-[24px] lg:text-[26px] font-bold tracking-tight text-aring-ink-900">문의하기</h1>
              <p className="mt-0.5 text-[15px] lg:text-[15px] leading-[1.5] text-aring-ink-500">유형을 골라 짧고 명확하게 적어주세요.</p>
            </div>
          </div>

          {/* 폼 — 사이트 표준 폭 (1200px) */}
          <form onSubmit={handleSubmit} className="px-5 lg:px-8 space-y-4">
              {/* 문의 유형 */}
              <div>
                <label className="block text-[15px] lg:text-[15px] font-bold text-aring-ink-700 mb-2">문의 유형<span className="text-aring-accent ml-0.5">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {QNA_CATEGORIES.map((c) => {
                    const active = category === c.value;
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setCategory(c.value)}
                        className={[
                          'rounded-pill px-3 py-1.5 text-[13px] font-bold transition active:scale-95',
                          active
                            ? 'bg-aring-ink-900 text-white border border-aring-ink-900'
                            : 'bg-white text-aring-ink-700 border border-aring-green-line hover:border-aring-ink-300',
                        ].join(' ')}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 제목 */}
              <div>
                <label htmlFor="qna-title" className="block text-[15px] lg:text-[15px] font-bold text-aring-ink-700 mb-2">제목<span className="text-aring-accent ml-0.5">*</span></label>
                <input
                  id="qna-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={TITLE_MAX}
                  placeholder="제목을 입력해주세요"
                  className="w-full px-4 py-3 rounded-tile border border-aring-ink-200 text-[15px] lg:text-[15px] bg-transparent outline-none focus:border-aring-green placeholder:text-aring-ink-400"
                />
                <p className="mt-1 text-[12px] text-aring-ink-400 text-right">{title.length}/{TITLE_MAX}</p>
              </div>

              {/* 내용 */}
              <div>
                <label htmlFor="qna-content" className="block text-[15px] lg:text-[15px] font-bold text-aring-ink-700 mb-2">문의 내용<span className="text-aring-accent ml-0.5">*</span></label>
                <textarea
                  id="qna-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={CONTENT_MAX}
                  rows={8}
                  placeholder="구체적으로 적어주시면 빠른 답변에 도움이 돼요"
                  className="w-full px-4 py-3 rounded-tile border border-aring-ink-200 text-[15px] lg:text-[15px] bg-transparent outline-none focus:border-aring-green placeholder:text-aring-ink-400 resize-y leading-relaxed"
                />
                <p className="mt-1 text-[12px] text-aring-ink-400 text-right">{content.length}/{CONTENT_MAX}</p>
              </div>

              {/* 이미지 첨부 */}
              <div>
                <label className="block text-[15px] lg:text-[15px] font-bold text-aring-ink-700 mb-2">
                  이미지 첨부 <span className="text-aring-ink-400 font-normal">(선택)</span>
                </label>
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
                <p className="mt-1 text-[12px] text-aring-ink-400">JPG/PNG, 최대 5MB</p>
              </div>

              {/* 비공개 여부 */}
              <div className="flex items-start gap-3 rounded-tile border border-aring-green-line bg-white p-4">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isPrivate}
                  onClick={() => setIsPrivate((v) => !v)}
                  className={[
                    'relative shrink-0 w-11 h-6 rounded-full transition',
                    isPrivate ? 'bg-aring-ink-900' : 'bg-aring-ink-100',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-card transition-transform',
                      isPrivate ? 'translate-x-5' : 'translate-x-0',
                    ].join(' ')}
                  />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-aring-ink-900">비공개로 문의</p>
                  <p className="mt-0.5 text-[13px] leading-[1.5] text-aring-ink-500">
                    작성자 본인과 관리자만 내용을 볼 수 있어요.
                  </p>
                </div>
              </div>

              {errorMsg && (
                <p className="text-[14px] font-semibold text-amber-600">{errorMsg}</p>
              )}

              {/* 하단 액션 */}
              <div className="pt-2 lg:flex lg:justify-end lg:gap-3">
                <Link
                  href="/qna"
                  className="hidden lg:inline-flex items-center justify-center w-[140px] py-4 rounded-2xl font-bold text-[16px] border border-aring-ink-200 text-aring-ink-700 transition active:scale-95"
                >
                  취소
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full lg:w-[200px] py-4 rounded-2xl font-bold text-[16px] transition active:scale-95 ${
                    submitting
                      ? 'bg-aring-ink-100 text-aring-ink-400 cursor-not-allowed'
                      : 'bg-aring-ink-900 text-white shadow-cta'
                  }`}
                >
                  {submitting ? '등록 중…' : '등록하기'}
                </button>
              </div>
            </form>
        </div>
        <BottomNav />
      </div>

      {showToast && (
        <Toast message="문의가 등록되었어요" duration={900} onClose={() => setShowToast(false)} />
      )}
    </main>
  );
}
