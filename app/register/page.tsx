'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  supabase,
  isSupabaseConfigured,
  buildPhotoPath,
  STORAGE_BUCKET,
} from '@/lib/supabase';
import {
  SHAPE_OPTIONS,
  MATERIAL_OPTIONS,
  shapeLabel,
  materialLabel,
  type ShapeKey,
  type MaterialKey,
} from '@/lib/categories';
import { normalizeBrand } from '@/lib/brandNormalizer';

// ─────────────────────────────────────────────────────────────
// Icons (inline)
// ─────────────────────────────────────────────────────────────
type IconProps = { className?: string; strokeWidth?: number };
const IconClose = ({ className = 'w-5 h-5', strokeWidth = 2 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const IconCamera = ({ className = 'w-5 h-5', strokeWidth = 2 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);
const IconCheck = ({ className = 'w-4 h-4', strokeWidth = 3 }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12 5 5 9-11" />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type Step = 'upload' | 'analyzing' | 'review';
type Analysis = {
  shape: string;
  material: string;
  detail: string;
};

const ANALYSIS_STEPS = [
  { key: 'shape', label: '형태 분석' },
  { key: 'material', label: '소재 추출' },
  { key: 'detail', label: '디테일 매칭' },
] as const;

const MOCK_ANALYSIS: Analysis = {
  shape: '서클 / 스터드',
  material: '스털링 실버 + 진주',
  detail: '6mm · 광택 마감 · T1 라인 추정',
};

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
type Photo = { url: string; file: File };

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('upload');
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [progress, setProgress] = useState<number>(-1);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [brand, setBrand] = useState('');
  const [shapeKey, setShapeKey] = useState<ShapeKey | null>(null);
  const [materialKey, setMaterialKey] = useState<MaterialKey | null>(null);
  const [price, setPrice] = useState('');
  const [story, setStory] = useState('');
  const [region, setRegion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto({ url: reader.result as string, file });
    reader.readAsDataURL(file);
  };

  const startAnalysis = async () => {
    if (!photo) return;
    setStep('analyzing');
    setProgress(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setProgress(i);
    }, 950);
    try {
      const base64Data = photo.url.split(',')[1];
      const mimeType = photo.url.split(';')[0].split(':')[1];
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data, mimeType }),
      });
      const data = await res.json();
      clearInterval(id);
      setProgress(ANALYSIS_STEPS.length);
      if (data.analysis) {
        setTimeout(() => {
          setAnalysis(data.analysis);
          setStep('review');
        }, 700);
      } else {
        setTimeout(() => {
          setAnalysis(MOCK_ANALYSIS);
          setStep('review');
        }, 700);
      }
    } catch (err) {
      clearInterval(id);
      console.error('[aring] startAnalysis error', err);
      setProgress(ANALYSIS_STEPS.length);
      setTimeout(() => {
        setAnalysis(MOCK_ANALYSIS);
        setStep('review');
      }, 700);
    }
  };

  const submit = async () => {
    if (!photo || !analysis || submitting) return;
    if (!isSupabaseConfigured || !supabase) {
      console.log('[aring]', 'register:submit (mock)', { analysis, brand, shapeKey, materialKey, price, story, region });
      alert('등록 완료 (mock)');
      return;
    }
    setSubmitting(true);
    try {
      const path = buildPhotoPath(photo.file.name);
      const { error: upErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, photo.file, { contentType: photo.file.type, cacheControl: '3600', upsert: false });
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      const photo_url = urlData.publicUrl;

      const priceNum = price ? parseInt(price.replace(/[^0-9]/g, ''), 10) : null;
      const brandInput = brand.trim() || '';
      const brandKey = normalizeBrand(brandInput);

      const { error: dbErr } = await supabase.from('listings').insert({
        photo_url,
        photo_path: path,
        brand: brandInput || '브랜드 미상',
        brand_input: brandInput || null,
        brand_key: brandKey || '',
        shape: shapeKey ? shapeLabel(shapeKey) : analysis.shape,
        material: materialKey ? materialLabel(materialKey) : analysis.material,
        detail: analysis.detail,
        side: 'L',
        price: Number.isFinite(priceNum) ? priceNum : null,
        story: story || null,
        region: region || null,
      });
      if (dbErr) throw dbErr;
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[aring] register:submit error', err);
      alert(`등록 실패: ${msg}`);
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone">
        <header className="relative z-20 flex items-center justify-between px-5 pt-4 pb-3">
          <Link href="/" aria-label="닫기" className="w-10 h-10 rounded-full bg-aring-ink-100 flex items-center justify-center text-aring-ink-900 active:scale-95 transition">
            <IconClose />
          </Link>
          <div className="text-[14px] font-extrabold text-aring-ink-900">한 짝 등록</div>
          <div className="w-10" />
        </header>
        <StepIndicator current={step} />
        {step === 'upload' && (
          <UploadStep photo={photo?.url ?? null} onPhoto={handlePhoto} onAnalyze={startAnalysis} />
        )}
        {step === 'review' && analysis && photo && (
          <ReviewStep
            photo={photo.url}
            analysis={analysis}
            brand={brand}
            setBrand={setBrand}
            shapeKey={shapeKey}
            setShapeKey={setShapeKey}
            materialKey={materialKey}
            setMaterialKey={setMaterialKey}
            price={price}
            setPrice={setPrice}
            story={story}
            setStory={setStory}
            region={region}
            setRegion={setRegion}
            onSubmit={submit}
            submitting={submitting}
          />
        )}
        {step === 'analyzing' && photo && (
          <AnalyzingOverlay progress={progress} photo={photo.url} />
        )}
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// Step indicator
// ─────────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: Step }) {
  const labels = [
    { key: 'upload', label: '사진' },
    { key: 'analyzing', label: 'AI 분석' },
    { key: 'review', label: '정보' },
  ];
  const order = ['upload', 'analyzing', 'review'] as Step[];
  const idx = order.indexOf(current);
  return (
    <div className="px-5 mb-5 flex items-center gap-2">
      {labels.map((l, i) => (
        <div key={l.key} className="flex-1 flex items-center gap-2">
          <span className={[
            'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold transition shrink-0',
            i < idx ? 'bg-aring-ink-900 text-white' : i === idx ? 'bg-aring-ink-900 text-white shadow-cta' : 'bg-aring-ink-100 text-aring-ink-500',
          ].join(' ')}>
            {i < idx ? <IconCheck className="w-3 h-3" /> : i + 1}
          </span>
          <span className={['text-[11.5px] font-bold whitespace-nowrap', i <= idx ? 'text-aring-ink-900' : 'text-aring-ink-500'].join(' ')}>
            {l.label}
          </span>
          {i < labels.length - 1 && (
            <span className={['flex-1 h-px ml-1', i < idx ? 'bg-aring-ink-900' : 'bg-aring-ink-100'].join(' ')} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 1 — Upload
// ─────────────────────────────────────────────────────────────
function UploadStep({ photo, onPhoto, onAnalyze }: {
  photo: string | null;
  onPhoto: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
}) {
  return (
    <div className="px-5 pb-32">
      <h1 className="text-[22px] font-extrabold tracking-tight text-aring-ink-900 leading-[1.3]">남은 한 짝의</h1>
      <h1 className="text-[22px] font-extrabold tracking-tight leading-[1.3] mb-2">
        <span className="grad-text-green">사진을 올려주세요</span>
      </h1>
      <p className="text-[12.5px] text-aring-ink-500 mb-5 leading-[1.55]">
        밝은 배경에서 정면으로 찍은 사진이 가장 정확합니다.<br />
        AI가 브랜드·형태·소재·디테일을 분석해요.
      </p>
      {!photo ? (
        <label className="relative block aspect-[4/5] rounded-card bg-aring-grad-pastel overflow-hidden cursor-pointer active:scale-[0.99] transition">
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <div className="aring-blob-a absolute -top-10 -left-10 w-[180px] h-[180px] rounded-full opacity-65" style={{ background: 'radial-gradient(circle, #FBC8DC 0%, transparent 70%)', filter: 'blur(40px)' }} />
            <div className="aring-blob-b absolute bottom-0 -right-12 w-[200px] h-[200px] rounded-full opacity-55" style={{ background: 'radial-gradient(circle, #C5DDF0 0%, transparent 70%)', filter: 'blur(48px)' }} />
            <div className="aring-blob-c absolute top-1/2 left-1/3 w-[160px] h-[160px] rounded-full opacity-50" style={{ background: 'radial-gradient(circle, #FFEFB5 0%, transparent 70%)', filter: 'blur(44px)' }} />
          </div>
          <div className="relative h-full flex flex-col items-center justify-center gap-3">
            <div className="glass rounded-2xl px-7 py-7 flex flex-col items-center gap-3 shadow-card">
              <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center">
                <IconCamera className="w-6 h-6 text-aring-ink-900" />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-extrabold text-aring-ink-900">사진 올리기</p>
                <p className="mt-1 text-[11px] text-aring-ink-500">JPG · PNG · 최대 10MB</p>
              </div>
            </div>
            <p className="text-[10.5px] text-aring-ink-700 mt-1">탭해서 갤러리 / 카메라 선택</p>
          </div>
          <input type="file" accept="image/*" onChange={onPhoto} className="hidden" />
        </label>
      ) : (
        <div className="relative aspect-[4/5] rounded-card overflow-hidden bg-aring-ink-100">
          <img src={photo} alt="업로드한 한 짝" className="w-full h-full object-cover" />
          <label className="absolute top-3 right-3 cursor-pointer">
            <span className="glass rounded-pill px-3 py-1.5 text-[11px] font-bold text-aring-ink-900 shadow-card inline-flex items-center gap-1.5">
              <IconCamera className="w-3.5 h-3.5" /> 다시 선택
            </span>
            <input type="file" accept="image/*" onChange={onPhoto} className="hidden" />
          </label>
        </div>
      )}
      <div className="mt-5 grid grid-cols-3 gap-2">
        {[{ e: '☀️', t: '밝은 배경' }, { e: '📐', t: '정면 촬영' }, { e: '🔍', t: '디테일 가깝게' }].map((tip) => (
          <div key={tip.t} className="rounded-tile bg-aring-ink-100/70 px-3 py-3 text-center">
            <div className="text-[18px] mb-1">{tip.e}</div>
            <p className="text-[10.5px] font-bold text-aring-ink-700">{tip.t}</p>
          </div>
        ))}
      </div>
      <StickyCTA onClick={onAnalyze} disabled={!photo}>
        {photo ? 'AI 분석 시작하기' : '사진을 먼저 올려주세요'}
      </StickyCTA>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AI Analyzing Overlay
// ─────────────────────────────────────────────────────────────
function AnalyzingOverlay({ progress, photo }: { progress: number; photo: string }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-5">
      <div className="absolute inset-0 bg-aring-grad-pastel" />
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="aring-blob-a absolute top-1/4 -left-12 w-[260px] h-[260px] rounded-full opacity-65" style={{ background: 'radial-gradient(circle, #FBC8DC 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="aring-blob-b absolute bottom-1/4 -right-12 w-[280px] h-[280px] rounded-full opacity-60" style={{ background: 'radial-gradient(circle, #C5DDF0 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="aring-blob-c absolute top-1/2 left-1/3 w-[220px] h-[220px] rounded-full opacity-55" style={{ background: 'radial-gradient(circle, #FFEFB5 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>
      <div className="relative glass-strong rounded-card p-6 w-full max-w-[360px] shadow-card">
        <div className="w-20 h-20 rounded-tile overflow-hidden mx-auto mb-4 ring-2 ring-white/70 shadow-card">
          <img src={photo} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="text-center mb-5">
          <p className="text-[10px] font-extrabold tracking-[0.15em] text-aring-accent uppercase">AI ANALYZING</p>
          <p className="mt-1 text-[16px] font-extrabold text-aring-ink-900">짝의 단서를 찾는 중</p>
        </div>
        <div className="space-y-3">
          {ANALYSIS_STEPS.map((s, i) => {
            const state = progress > i ? 'done' : progress === i ? 'active' : 'pending';
            return (
              <div key={s.key} className="flex items-center gap-3">
                <span className={['relative flex w-7 h-7 items-center justify-center rounded-full shrink-0', state === 'done' ? 'bg-aring-ink-900 text-white' : state === 'active' ? 'bg-white' : 'bg-white/50'].join(' ')}>
                  {state === 'active' && <span className="aring-pulse absolute inset-0 rounded-full bg-aring-accent opacity-70" />}
                  {state === 'done' && <IconCheck className="w-3.5 h-3.5" />}
                  {state === 'active' && <span className="relative w-2 h-2 rounded-full bg-aring-accent" />}
                  {state === 'pending' && <span className="text-[10px] font-bold text-aring-ink-500">{i + 1}</span>}
                </span>
                <p className={['flex-1 text-[13px] font-bold', state === 'pending' ? 'text-aring-ink-500' : 'text-aring-ink-900'].join(' ')}>{s.label}</p>
                {state === 'done' && <span className="text-[10px] font-extrabold text-aring-green">완료</span>}
                {state === 'active' && <span className="text-[10px] font-extrabold text-aring-accent">분석중</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 3 — Review
// ─────────────────────────────────────────────────────────────
const ACTIVE_BG = '#EAF7F5';
const ACTIVE_BORDER = '#8ED9CC';
const ACTIVE_TEXT = '#222222';
const INACTIVE_BORDER = '#E5E5E5';

function ReviewStep({ photo, analysis, brand, setBrand, shapeKey, setShapeKey, materialKey, setMaterialKey, price, setPrice, story, setStory, region, setRegion, onSubmit, submitting }: {
  photo: string;
  analysis: Analysis;
  brand: string;
  setBrand: (s: string) => void;
  shapeKey: ShapeKey | null;
  setShapeKey: (v: ShapeKey | null) => void;
  materialKey: MaterialKey | null;
  setMaterialKey: (v: MaterialKey | null) => void;
  price: string;
  setPrice: (s: string) => void;
  story: string;
  setStory: (s: string) => void;
  region: string;
  setRegion: (s: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  return (
    <div className="px-5 pb-32">
      <div className="relative rounded-card overflow-hidden border border-aring-green-line bg-white mb-5 shadow-card">
        <div className="relative aspect-[4/3]">
          <img src={photo} alt="" className="w-full h-full object-cover" />
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 glass rounded-pill px-2.5 py-1 shadow-card">
            <span className="w-1.5 h-1.5 rounded-full bg-aring-accent" />
            <span className="text-[10px] font-bold text-aring-ink-900">AI 분석 완료</span>
          </span>
        </div>
        <div className="p-4 grid grid-cols-3 gap-2">
          <AnalysisField label="형태" value={analysis.shape} />
          <AnalysisField label="소재" value={analysis.material} />
          <AnalysisField label="디테일" value={analysis.detail} />
        </div>
      </div>
      <h2 className="text-[16px] font-extrabold text-aring-ink-900 mb-3">정보 추가</h2>
      <FieldLabel>브랜드</FieldLabel>
      <Input value={brand} onChange={setBrand} placeholder="예: TIFFANY & CO. / SWAROVSKI / NUMBERING" maxLength={40} />
      <FieldLabel>모양</FieldLabel>
      <div className="flex gap-2 flex-wrap mb-5">
        {SHAPE_OPTIONS.map((opt) => {
          const active = shapeKey === opt.value;
          return (
            <button key={opt.value} onClick={() => setShapeKey(active ? null : opt.value)}
              className="inline-flex items-center px-3.5 py-1.5 rounded-pill text-[12px] font-bold transition active:scale-95"
              style={{ backgroundColor: active ? ACTIVE_BG : '#FFFFFF', border: `1px solid ${active ? ACTIVE_BORDER : INACTIVE_BORDER}`, color: active ? ACTIVE_TEXT : '#555555' }}>
              {opt.label}
            </button>
          );
        })}
      </div>
      <FieldLabel>소재</FieldLabel>
      <div className="no-scrollbar flex gap-3 overflow-x-auto -mx-5 px-5 pb-1 mb-5">
        {MATERIAL_OPTIONS.map((opt) => {
          const active = materialKey === opt.value;
          return (
            <button key={opt.value} onClick={() => setMaterialKey(active ? null : opt.value)}
              className="flex flex-col items-center gap-1.5 w-[64px] shrink-0 active:scale-95 transition">
              <span className="relative w-12 h-12 rounded-full overflow-hidden"
                style={{ background: opt.bg, boxShadow: active ? `0 0 0 2px ${ACTIVE_BORDER}, 0 0 0 4px #FFFFFF` : `0 0 0 1px ${INACTIVE_BORDER}` }}>
                <span aria-hidden className="absolute top-1.5 left-2 w-3 h-3 rounded-full opacity-60"
                  style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,.95) 0%, rgba(255,255,255,0) 70%)' }} />
              </span>
              <span className="text-[10.5px] font-bold" style={{ color: active ? ACTIVE_TEXT : '#555' }}>{opt.label}</span>
            </button>
          );
        })}
      </div>
      <FieldLabel>가격 <span className="text-aring-ink-500 font-medium">(선택)</span></FieldLabel>
      <Input value={price} onChange={setPrice} placeholder="예: 50,000" suffix="원" />
      <FieldLabel>등록자 한마디 <span className="text-aring-ink-500 font-medium">(선택)</span></FieldLabel>
      <div className="relative mb-1">
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value.slice(0, 1000))}
          placeholder="이 귀걸이에 담긴 이야기를 자유롭게 적어주세요."
          maxLength={1000}
          rows={4}
          className="w-full rounded-tile border border-aring-green-line bg-white px-4 py-3 text-[14px] text-aring-ink-900 placeholder:text-aring-ink-300 focus:outline-none focus:border-aring-ink-900 transition resize-none"
        />
      </div>
      <div className="flex justify-end mb-2">
        <span className={['text-[11px] font-medium tabular-nums', story.length >= 900 ? 'text-aring-accent font-bold' : 'text-aring-ink-400'].join(' ')}>
          {story.length} / 1000
        </span>
      </div>
      <div className="mb-5 rounded-tile bg-aring-ink-100/60 px-4 py-3 space-y-1.5">
        <p className="text-[11px] text-aring-ink-500 leading-[1.6]">
          따뜻한 마음을 담아 작성해 주세요. 욕설, 비하 표현, 타인의 개인정보가 포함된 내용은 작성할 수 없습니다.
        </p>
        <p className="text-[10.5px] text-aring-ink-400 leading-[1.6]">
          개인정보 노출, 타인 비방, 부적절한 표현 등 서비스 운영 기준에 맞지 않는 글은 관리자 판단에 따라 별도 안내 없이 삭제될 수 있습니다.
        </p>
      </div>
      <FieldLabel>거래 지역</FieldLabel>
      <Input value={region} onChange={setRegion} placeholder="예: 서울 · 강남구" />
      <StickyCTA onClick={onSubmit} disabled={submitting}>
        {submitting ? '등록 중…' : '한 짝 등록하기'}
      </StickyCTA>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Field helpers
// ─────────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11.5px] font-bold text-aring-ink-700 mb-1.5">{children}</label>;
}

function Input({ value, onChange, placeholder, suffix, maxLength }: {
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
  suffix?: string;
  maxLength?: number;
}) {
  return (
    <div className="relative mb-4">
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength}
        className="w-full rounded-tile border border-aring-green-line bg-white px-4 py-3 pr-10 text-[14px] text-aring-ink-900 placeholder:text-aring-ink-300 focus:outline-none focus:border-aring-ink-900 transition" />
      {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-aring-ink-500">{suffix}</span>}
    </div>
  );
}

function AnalysisField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-tile bg-aring-ink-100/60 px-3 py-2.5">
      <p className="text-[10px] font-extrabold tracking-wider text-aring-ink-500 uppercase">{label}</p>
      <p className="mt-1 text-[12.5px] font-bold text-aring-ink-900 truncate">{value}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sticky bottom CTA
// ─────────────────────────────────────────────────────────────
function StickyCTA({ onClick, disabled, children }: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="absolute left-0 right-0 bottom-0 z-30">
      <div className="mx-auto max-w-[440px] glass-strong border-t border-white/60 px-5 py-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
        <button onClick={onClick} disabled={disabled}
          className="w-full rounded-pill bg-aring-ink-900 disabled:bg-aring-ink-300 disabled:cursor-not-allowed py-3.5 text-[14px] font-extrabold text-white shadow-cta active:scale-[0.99] transition">
          {children}
        </button>
      </div>
    </div>
  );
}
