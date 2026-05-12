// ─────────────────────────────────────────────────────────────
// 클라이언트 이미지 리사이즈/압축
// 모바일 카메라 원본(3~10MB)을 업로드 전 축소해 5MB 한도 회피
// ─────────────────────────────────────────────────────────────

export type ResizeOptions = {
  maxDimension?: number;  // 가로/세로 중 긴 변 최대 px (기본 1600)
  maxBytes?: number;       // 결과 파일 최대 byte (기본 4MB — 5MB 한도 여유)
  quality?: number;        // 초기 JPEG quality (0~1, 기본 0.85)
  minQuality?: number;     // 압축 반복 시 하한 (기본 0.6)
  mimeType?: 'image/jpeg' | 'image/webp'; // 출력 포맷 (기본 jpeg)
};

const DEFAULTS: Required<ResizeOptions> = {
  maxDimension: 1600,
  maxBytes: 4 * 1024 * 1024,
  quality: 0.85,
  minQuality: 0.6,
  mimeType: 'image/jpeg',
};

/**
 * 이미지 파일을 maxDimension/maxBytes 조건에 맞춰 축소/압축.
 * 이미 작으면 원본 그대로 반환.
 * SSR 환경(window 없음)이거나 이미지가 아닐 경우 원본 그대로 반환.
 */
export async function resizeImageFile(
  file: File,
  options: ResizeOptions = {},
): Promise<File> {
  if (typeof window === 'undefined') return file;
  if (!file.type.startsWith('image/')) return file;

  const opt = { ...DEFAULTS, ...options };

  // 이미 충분히 작으면 원본 유지 (불필요한 디코딩/재인코딩 방지)
  if (file.size <= opt.maxBytes) {
    // 단 — 가로 픽셀이 매우 클 수 있으니 maxDimension만 확인
    try {
      const dims = await readImageDimensions(file);
      if (dims.width <= opt.maxDimension && dims.height <= opt.maxDimension) {
        return file;
      }
    } catch {
      return file;
    }
  }

  let blob: Blob;
  try {
    blob = await drawAndEncode(file, opt.maxDimension, opt.quality, opt.mimeType);
  } catch (e) {
    console.warn('[resizeImage] encode failed, returning original', e);
    return file;
  }

  // 결과가 여전히 maxBytes 초과면 quality 단계 낮춰 재시도
  let currentQuality = opt.quality;
  while (blob.size > opt.maxBytes && currentQuality > opt.minQuality) {
    currentQuality = Math.max(opt.minQuality, currentQuality - 0.1);
    try {
      blob = await drawAndEncode(file, opt.maxDimension, currentQuality, opt.mimeType);
    } catch {
      break;
    }
  }

  // 그래도 maxBytes 초과면 dim을 더 줄여 한 번 더 시도
  if (blob.size > opt.maxBytes) {
    const smallerDim = Math.floor(opt.maxDimension * 0.75);
    try {
      blob = await drawAndEncode(file, smallerDim, opt.minQuality, opt.mimeType);
    } catch {
      /* noop */
    }
  }

  const ext = opt.mimeType === 'image/webp' ? 'webp' : 'jpg';
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
  return new File([blob], `${baseName}.${ext}`, {
    type: opt.mimeType,
    lastModified: Date.now(),
  });
}

// ── helpers ────────────────────────────────────────────────────

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('image load failed'));
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.src = typeof reader.result === 'string' ? reader.result : '';
    };
    reader.readAsDataURL(file);
  });
}

async function drawAndEncode(
  file: File,
  maxDim: number,
  quality: number,
  mimeType: string,
): Promise<Blob> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(r.error);
    r.onload = () => resolve(typeof r.result === 'string' ? r.result : '');
    r.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onerror = () => reject(new Error('image decode failed'));
    el.onload = () => resolve(el);
    el.src = dataUrl;
  });

  const ratio = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * ratio);
  const h = Math.round(img.naturalHeight * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d context unavailable');
  ctx.drawImage(img, 0, 0, w, h);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('canvas.toBlob returned null'))),
      mimeType,
      quality,
    );
  });
}
