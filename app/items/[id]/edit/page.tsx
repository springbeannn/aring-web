'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TopNav } from '@/components/Nav';
import { supabase } from '@/lib/supabase';

export default function EditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notOwner, setNotOwner] = useState(false);

  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [story, setStory] = useState('');
  const [region, setRegion] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    async function load() {
      if (!supabase) { setLoading(false); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/login'); return; }

      const { data: row } = await supabase
        .from('listings')
        .select('*')
        .eq('id', params.id)
        .maybeSingle();

      if (!row) { router.replace('/'); return; }
      if (row.user_id !== session.user.id) { setNotOwner(true); setLoading(false); return; }

      setBrand(row.brand ?? '');
      setPrice(row.price ? String(row.price) : '');
      setStory(row.story ?? '');
      setRegion(row.region ?? '');
      setPhotoUrl(row.photo_url ?? '');
      setLoading(false);
    }
    load();
  }, [params.id, router]);

  async function handleSave() {
    if (!supabase || saving) return;
    setSaving(true);
    const priceNum = price ? parseInt(price.replace(/[^0-9]/g, ''), 10) : null;
    const { error } = await supabase
      .from('listings')
      .update({
        brand: brand.trim() || '브랜드 미상',
        price: Number.isFinite(priceNum) ? priceNum : null,
        story: story.trim() || null,
        region: region.trim() || null,
      })
      .eq('id', params.id);
    setSaving(false);
    if (error) { alert('저장에 실패했어요. 다시 시도해 주세요.'); return; }
    router.push(`/items/${params.id}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!supabase) return;
    const confirmed = window.confirm('정말 삭제할까요? 삭제된 상품은 복구할 수 없어요.');
    if (!confirmed) return;
    const { error } = await supabase.from('listings').delete().eq('id', params.id);
    if (error) { alert('삭제에 실패했어요. 다시 시도해 주세요.'); return; }
    router.push('/my');
    router.refresh();
  }

  if (loading) return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="w-full max-w-[440px] min-h-screen">
        <TopNav />
        <div className="flex justify-center py-32">
          <div className="w-8 h-8 rounded-full border-2 border-aring-ink-100 border-t-aring-ink-900 animate-spin" />
        </div>
      </div>
    </main>
  );

  if (notOwner) return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="w-full max-w-[440px] min-h-screen px-5 pt-20 text-center">
        <p className="text-[14px] font-bold text-aring-ink-900">수정 권한이 없어요</p>
        <Link href="/" className="mt-4 inline-flex px-5 py-2.5 rounded-pill bg-aring-ink-900 text-white text-[13px] font-extrabold">홈으로</Link>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen sm:my-6 sm:rounded-[36px] sm:shadow-phone lg:max-w-[600px]">
        <TopNav />

        <div className="px-5 pt-2 pb-32">
          {/* 헤더 */}
          <div className="flex items-center gap-3 mb-6">
            <Link href={`/items/${params.id}`} className="w-9 h-9 rounded-full bg-aring-ink-100 flex items-center justify-center active:scale-95 transition">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
              </svg>
            </Link>
            <h1 className="text-[18px] font-extrabold text-aring-ink-900">상품 수정</h1>
          </div>

          {/* 현재 사진 */}
          {photoUrl && (
            <div className="mb-5 rounded-2xl overflow-hidden bg-aring-ink-100 aspect-square max-w-[200px] mx-auto">
              <img src={photoUrl} alt="상품 사진" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="space-y-4">
            {/* 브랜드 */}
            <div>
              <label className="block text-[13px] font-bold text-aring-ink-400 tracking-wider uppercase mb-1.5">브랜드</label>
              <input
                type="text" value={brand} onChange={e => setBrand(e.target.value)}
                placeholder="브랜드명 입력"
                className="w-full px-4 py-3 rounded-2xl border border-aring-ink-200 text-[14px] text-aring-ink-900 placeholder:text-aring-ink-400 outline-none focus:border-aring-ink-500 transition"
              />
            </div>

            {/* 가격 */}
            <div>
              <label className="block text-[13px] font-bold text-aring-ink-400 tracking-wider uppercase mb-1.5">희망 가격</label>
              <input
                type="text" value={price} onChange={e => setPrice(e.target.value)}
                placeholder="예: 35000"
                className="w-full px-4 py-3 rounded-2xl border border-aring-ink-200 text-[14px] text-aring-ink-900 placeholder:text-aring-ink-400 outline-none focus:border-aring-ink-500 transition"
              />
            </div>

            {/* 등록자 한마디 */}
            <div>
              <label className="block text-[13px] font-bold text-aring-ink-400 tracking-wider uppercase mb-1.5">등록자 한마디</label>
              <textarea
                value={story} onChange={e => setStory(e.target.value)}
                placeholder="이 귀걸이에 대해 한마디 남겨주세요"
                rows={4} maxLength={1000}
                className="w-full px-4 py-3 rounded-2xl border border-aring-ink-200 text-[14px] text-aring-ink-900 placeholder:text-aring-ink-400 outline-none focus:border-aring-ink-500 transition resize-none"
              />
              <p className="mt-1 text-right text-[13px] text-aring-ink-400">{story.length}/1000</p>
            </div>

            {/* 지역 */}
            <div>
              <label className="block text-[13px] font-bold text-aring-ink-400 tracking-wider uppercase mb-1.5">지역</label>
              <input
                type="text" value={region} onChange={e => setRegion(e.target.value)}
                placeholder="예: 서울 · 강남구"
                className="w-full px-4 py-3 rounded-2xl border border-aring-ink-200 text-[14px] text-aring-ink-900 placeholder:text-aring-ink-400 outline-none focus:border-aring-ink-500 transition"
              />
            </div>
          </div>

          {/* 저장 버튼 */}
          <button
            onClick={handleSave} disabled={saving}
            className={`mt-8 w-full py-4 rounded-2xl font-extrabold text-[14px] transition active:scale-95 ${saving ? 'bg-aring-ink-100 text-aring-ink-400' : 'bg-aring-ink-900 text-white shadow-cta'}`}
          >
            {saving ? '저장 중...' : '저장하기'}
          </button>

          {/* 삭제 버튼 */}
          <button
            onClick={handleDelete}
            className="mt-3 w-full py-3.5 rounded-2xl font-bold text-[14px] border border-aring-ink-200 text-aring-ink-500 hover:border-red-200 hover:text-red-400 transition active:scale-95"
          >
            이 상품 삭제하기
          </button>
        </div>
      </div>
    </main>
  );
}
