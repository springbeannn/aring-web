'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface AnalysisResult {
  style: string[];
  material: string[];
  shape: string[];
  detail: string[];
  mood: string[];
  summary: string;
}

interface MatchItem {
  id: string;
  title: string;
  brand: string | null;
  price: number;
  status: string;
  imageUrl: string | null;
  location: string | null;
  description: string | null;
  tags: string[];
  createdAt: string;
  similarity: number;
  reasons: string[];
  matchType: 'similar' | 'reference';
}

function IconCamera() {
  return (
    <svg width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
      <path d='M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z'/>
      <circle cx='12' cy='13' r='4'/>
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
      <path d='M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z'/>
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
      <polyline points='1 4 1 10 7 10'/>
      <path d='M3.51 15a9 9 0 1 0 .49-4.95'/>
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
      <polyline points='9 18 15 12 9 6'/>
    </svg>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
}

function scoreLabel(score: number) {
  if (score >= 80) return '매우 비슷해요';
  if (score >= 60) return '꽤 비슷해요';
  if (score >= 40) return '무드가 비슷해요';
  return '참고 후보';
}

function MatchBadge({ score }: { score: number }) {
  return (
    <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200'>
      <IconSparkle />
      aring Match {score}%
    </span>
  );
}

function ReasonBox({ reasons }: { reasons: string[] }) {
  if (!reasons.length) return null;
  return (
    <ul className='mt-2 space-y-1'>
      {reasons.map((r, i) => (
        <li key={i} className='flex items-start gap-1.5 text-xs text-gray-500'>
          <span className='mt-0.5 w-1 h-1 rounded-full bg-gray-400 flex-shrink-0' />
          {r}
        </li>
      ))}
    </ul>
  );
}

function SimilarCard({ item, onClick }: { item: MatchItem; onClick: () => void }) {
  return (
    <div onClick={onClick} className='cursor-pointer border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white'>
      <div className='relative w-full aspect-square bg-gray-50'>
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.title} fill className='object-cover' />
        ) : (
          <div className='w-full h-full flex items-center justify-center text-gray-300'><IconCamera /></div>
        )}
        <div className='absolute top-2 left-2'><MatchBadge score={item.similarity} /></div>
      </div>
      <div className='p-3'>
        <p className='text-xs text-gray-400 mb-0.5'>{item.brand ?? scoreLabel(item.similarity)}</p>
        <p className='text-sm font-medium text-gray-900 line-clamp-2 leading-snug'>{item.title}</p>
        <p className='mt-1 text-sm font-semibold text-gray-900'>{formatPrice(item.price)}</p>
        <ReasonBox reasons={item.reasons.slice(0, 2)} />
      </div>
    </div>
  );
}

function ReferenceCard({ item, onClick }: { item: MatchItem; onClick: () => void }) {
  return (
    <div onClick={onClick} className='cursor-pointer flex gap-3 p-3 border border-gray-100 rounded-2xl bg-white hover:bg-gray-50 transition-colors'>
      <div className='relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50'>
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.title} fill className='object-cover' />
        ) : (
          <div className='w-full h-full flex items-center justify-center text-gray-300'><IconCamera /></div>
        )}
      </div>
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2 mb-0.5'><MatchBadge score={item.similarity} /></div>
        <p className='text-sm font-medium text-gray-900 line-clamp-1'>{item.title}</p>
        <p className='text-xs text-gray-400'>{item.brand ?? ''}</p>
        <p className='text-sm font-semibold text-gray-900 mt-0.5'>{formatPrice(item.price)}</p>
      </div>
      <div className='flex-shrink-0 self-center text-gray-300'><IconChevronRight /></div>
    </div>
  );
}

function SingleMatchHighlight({ item, onClick }: { item: MatchItem; onClick: () => void }) {
  return (
    <div className='mx-4 mt-6'>
      <div className='text-center mb-4'>
        <span className='inline-flex items-center gap-1.5 text-amber-600 text-sm font-semibold'>
          <IconSparkle />
          딱 맞는 짝을 찾았어요
        </span>
        <p className='text-xs text-gray-400 mt-1'>aring Match {item.similarity}% · {scoreLabel(item.similarity)}</p>
      </div>
      <div onClick={onClick} className='cursor-pointer border-2 border-amber-200 rounded-3xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow'>
        <div className='relative w-full aspect-square bg-gray-50'>
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.title} fill className='object-cover' />
          ) : (
            <div className='w-full h-full flex items-center justify-center text-gray-200'><IconCamera /></div>
          )}
        </div>
        <div className='p-4'>
          <p className='text-xs text-gray-400 mb-1'>{item.brand ?? scoreLabel(item.similarity)}</p>
          <p className='text-base font-semibold text-gray-900 leading-snug'>{item.title}</p>
          <p className='mt-2 text-lg font-bold text-gray-900'>{formatPrice(item.price)}</p>
          {item.reasons.length > 0 && (
            <div className='mt-3 p-3 bg-amber-50 rounded-xl'>
              <p className='text-xs font-medium text-amber-700 mb-1.5'>매칭 이유</p>
              <ReasonBox reasons={item.reasons} />
            </div>
          )}
        </div>
        <div className='px-4 pb-4'>
          <button className='w-full py-3 bg-gray-900 text-white rounded-2xl text-sm font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2'>
            상세 보기
            <IconChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyResult({ onRetry }: { onRetry: () => void }) {
  return (
    <div className='flex flex-col items-center justify-center py-20 px-6 text-center'>
      <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-300'>
        <IconCamera />
      </div>
      <p className='text-base font-semibold text-gray-700 mb-1'>비슷한 짝을 찾지 못했어요</p>
      <p className='text-sm text-gray-400 mb-6 leading-relaxed'>아직 등록된 귀걸이가 많지 않아요.<br />다른 사진으로 다시 시도해보세요.</p>
      <button onClick={onRetry} className='inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-700 transition-colors'>
        <IconRefresh />
        다른 사진으로 다시 찾기
      </button>
    </div>
  );
}

function UploadStep({ onAnalyze }: { onAnalyze: (file: File, base64: string, mimeType: string) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  return (
    <div className='px-4 py-6 max-w-lg mx-auto'>
      <div className='mb-6'>
        <p className='text-xs font-semibold text-amber-600 flex items-center gap-1 mb-1'>
          <IconSparkle />
          AI PHOTO MATCHING
        </p>
        <h1 className='text-2xl font-bold text-gray-900 leading-snug'>귀걸이 사진으로<br />비슷한 짝을 찾아요</h1>
        <p className='mt-2 text-sm text-gray-400'>분실한 한 짝의 귀걸이 사진을 올려주세요.<br />AI가 비슷한 짝을 찾아드려요.</p>
      </div>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={[
          'relative w-full aspect-square max-w-sm mx-auto rounded-3xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-colors',
          dragging ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300',
        ].join(' ')}
      >
        {preview ? (
          <Image src={preview} alt='preview' fill className='object-contain p-2' />
        ) : (
          <div className='flex flex-col items-center gap-3 text-gray-400'>
            <IconCamera />
            <p className='text-sm font-medium'>사진을 올려주세요</p>
            <p className='text-xs'>클릭하거나 드래그해서 업로드</p>
          </div>
        )}
        <input ref={inputRef} type='file' accept='image/*' className='hidden'
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>
      <div className='mt-6 flex flex-col gap-3'>
        <button
          onClick={() => { if (file && preview) onAnalyze(file, preview.split(',')[1], file.type); }}
          disabled={!file}
          className='w-full py-4 rounded-2xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed bg-gray-900 text-white hover:bg-gray-700'
        >
          <IconSparkle />
          AI로 찾아보기
        </button>
        {preview && (
          <button onClick={() => { setPreview(null); setFile(null); }}
            className='w-full py-3 rounded-2xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2'>
            <IconRefresh />
            다시 선택
          </button>
        )}
      </div>
    </div>
  );
}

function LoadingStep({ imageUrl }: { imageUrl: string }) {
  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh] px-6 text-center'>
      <div className='relative w-32 h-32 rounded-2xl overflow-hidden mb-6 border border-gray-100 shadow-sm'>
        <Image src={imageUrl} alt='analyzing' fill className='object-cover' />
        <div className='absolute inset-0 bg-black/30 flex items-center justify-center'>
          <div className='w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin' />
        </div>
      </div>
      <p className='text-base font-semibold text-gray-800 mb-1'>AI가 귀걸이를 분석 중이에요</p>
      <p className='text-sm text-gray-400'>형태, 소재, 디자인을 파악하고 있어요</p>
    </div>
  );
}

function ResultStep({
  imageUrl, similar, reference, analysis, onRetry, onItemClick,
}: {
  imageUrl: string; similar: MatchItem[]; reference: MatchItem[];
  analysis: AnalysisResult | null; onRetry: () => void; onItemClick: (id: string) => void;
}) {
  const total = similar.length + reference.length;
  const MyEarring = () => (
    <div className='mx-4 mt-6 p-4 bg-gray-50 rounded-2xl flex gap-3 items-center'>
      <div className='relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100'>
        <Image src={imageUrl} alt='my earring' fill className='object-cover' />
      </div>
      <div>
        <p className='text-xs text-gray-400 mb-0.5'>내 귀걸이</p>
        {analysis && <p className='text-sm text-gray-700 line-clamp-2'>{analysis.summary}</p>}
      </div>
    </div>
  );
  if (total === 0) return <div><MyEarring /><EmptyResult onRetry={onRetry} /></div>;
  if (similar.length === 1 && reference.length === 0) {
    return (
      <div>
        <MyEarring />
        <SingleMatchHighlight item={similar[0]} onClick={() => onItemClick(similar[0].id)} />
        <div className='mx-4 mt-6'>
          <button onClick={onRetry} className='w-full py-3 rounded-2xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2'>
            <IconRefresh />다른 사진으로 다시 찾기
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className='pb-10'>
      <MyEarring />
      <div className='mx-4 mt-4 mb-2'>
        <p className='text-base font-semibold text-gray-900'>유사한 후보 {similar.length}개 · 참고 후보 {reference.length}개를 찾았어요</p>
        <p className='text-xs text-gray-400 mt-0.5'>매칭률이 높을수록 더 비슷한 귀걸이에요</p>
      </div>
      {similar.length > 0 && (
        <div className='mx-4 mt-4'>
          <div className='flex items-center gap-2 mb-3'>
            <div className='w-2 h-2 rounded-full bg-amber-400' />
            <p className='text-sm font-semibold text-gray-700'>가장 비슷한 짝 · 유사 후보 {similar.length}개</p>
            <span className='text-xs text-gray-400'>aring Match 60% 이상</span>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            {similar.map((item) => <SimilarCard key={item.id} item={item} onClick={() => onItemClick(item.id)} />)}
          </div>
        </div>
      )}
      {reference.length > 0 && (
        <div className='mx-4 mt-6'>
          <div className='flex items-center gap-2 mb-3'>
            <div className='w-2 h-2 rounded-full bg-gray-300' />
            <p className='text-sm font-semibold text-gray-700'>완전히 같진 않지만, 이런 후보도 있어요 · 참고 후보 {reference.length}개</p>
          </div>
          <div className='flex flex-col gap-2'>
            {reference.map((item) => <ReferenceCard key={item.id} item={item} onClick={() => onItemClick(item.id)} />)}
          </div>
        </div>
      )}
      <div className='mx-4 mt-6'>
        <button onClick={onRetry} className='w-full py-3 rounded-2xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2'>
          <IconRefresh />다른 사진으로 다시 찾기
        </button>
      </div>
    </div>
  );
}

export default function SearchPhotoPage() {
  const router = useRouter();
  const [step, setStep] = useState<'upload' | 'loading' | 'result'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [similar, setSimilar] = useState<MatchItem[]>([]);
  const [reference, setReference] = useState<MatchItem[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (file: File, base64: string, mimeType: string) => {
    const dataUrl = 'data:' + mimeType + ';base64,' + base64;
    setPreviewUrl(dataUrl);
    setStep('loading');
    try {
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      if (!analyzeRes.ok) throw new Error('analyze failed');
      const analyzeData = await analyzeRes.json();
      const analysisResult: AnalysisResult = analyzeData.analysis ?? analyzeData;
      setAnalysis(analysisResult);

      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: listings, error } = await supabase
        .from('listings')
        .select('id, title, brand, price, status, image_urls, location, description, tags, created_at')
        .eq('status', 'open')
        .limit(200);
      if (error) throw error;

      const { calculateAringMatch } = await import('@/lib/aringMatch');
      const matchSource = {
        style: analysisResult.style ?? [],
        material: analysisResult.material ?? [],
        shape: analysisResult.shape ?? [],
        detail: analysisResult.detail ?? [],
        mood: analysisResult.mood ?? [],
        keywords: [...(analysisResult.style ?? []), ...(analysisResult.material ?? []), ...(analysisResult.shape ?? [])],
      };
      const scored: MatchItem[] = (listings ?? [])
        .map((item: any) => {
          const target = {
            style: item.tags ?? [], material: item.tags ?? [], shape: item.tags ?? [],
            detail: item.tags ?? [], mood: item.tags ?? [], keywords: item.tags ?? [],
            description: item.description ?? '', title: item.title ?? '',
          };
          const result = calculateAringMatch(matchSource, target);
          return {
            id: item.id, title: item.title ?? '', brand: item.brand ?? null,
            price: item.price ?? 0, status: item.status,
            imageUrl: Array.isArray(item.image_urls) && item.image_urls.length > 0 ? item.image_urls[0] : null,
            location: item.location ?? null, description: item.description ?? null,
            tags: item.tags ?? [], createdAt: item.created_at,
            similarity: result.score, reasons: result.reasons ?? [],
            matchType: result.score >= 60 ? 'similar' : 'reference',
          } as MatchItem;
        })
        .filter((item: MatchItem) => item.similarity >= 40)
        .sort((a: MatchItem, b: MatchItem) => b.similarity - a.similarity);
      setSimilar(scored.filter((i: MatchItem) => i.matchType === 'similar'));
      setReference(scored.filter((i: MatchItem) => i.matchType === 'reference'));
      setStep('result');
    } catch (err) {
      console.error('analyze error:', err);
      setSimilar([]);
      setReference([]);
      setStep('result');
    }
  };

  const handleRetry = () => {
    setStep('upload');
    setPreviewUrl('');
    setSimilar([]);
    setReference([]);
    setAnalysis(null);
  };

  return (
    <div className='min-h-screen bg-white'>
      <header className='sticky top-0 z-10 bg-white border-b border-gray-100'>
        <div className='flex items-center gap-3 px-4 h-14 max-w-lg mx-auto'>
          <button
            onClick={() => step === 'upload' ? router.back() : handleRetry()}
            className='p-1 -ml-1 text-gray-600 hover:text-gray-900'
            aria-label='뒤로'
          >
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <polyline points='15 18 9 12 15 6'/>
            </svg>
          </button>
          <h1 className='text-base font-semibold text-gray-900'>사진으로 짝 찾기</h1>
        </div>
      </header>
      {step === 'upload' && <UploadStep onAnalyze={handleAnalyze} />}
      {step === 'loading' && <LoadingStep imageUrl={previewUrl} />}
      {step === 'result' && (
        <ResultStep
          imageUrl={previewUrl}
          similar={similar}
          reference={reference}
          analysis={analysis}
          onRetry={handleRetry}
          onItemClick={(id) => router.push('/match/' + id)}
        />
      )}
    </div>
  );
}