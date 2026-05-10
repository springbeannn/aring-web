// ────────────────────────────────────────────────────────────
// remove.bg 클라이언트 헬퍼
// ────────────────────────────────────────────────────────────

/**
 * 이미지를 maxSize(긴 변 기준) 이하로 캔버스 리사이즈.
 * remove.bg 무료 플랜이 25MP 이하만 처리하고, 업로드/다운로드 트래픽도
 * 줄이기 위해 1500px 정도로 사전 축소.
 *
 * - 이미 더 작으면 원본 그대로 반환
 * - JPEG 0.92 품질로 인코딩 (PNG 대비 사이즈 ↓, remove.bg 결과는 PNG로 받음)
 */
export async function resizeImage(file: File, maxSize = 1500): Promise<File> {
  if (typeof window === 'undefined') return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file; // 비-이미지면 그대로
  }

  const longSide = Math.max(bitmap.width, bitmap.height);
  if (longSide <= maxSize) {
    bitmap.close?.();
    return file;
  }

  const scale = maxSize / longSide;
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close?.();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  const blob: Blob | null = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92);
  });
  if (!blob) return file;

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';
  return new File([blob], `${baseName}-resized.jpg`, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}

/**
 * /api/remove-bg 호출 → 배경 제거된 PNG File 반환.
 * 실패 시 null 반환 (호출자가 원본 fallback).
 */
export async function removeBackground(file: File): Promise<File | null> {
  try {
    // 1) 사전 리사이즈 — 업로드/처리 시간 단축
    const resized = await resizeImage(file, 1500);

    // 2) /api/remove-bg 호출
    const fd = new FormData();
    fd.append('image_file', resized, resized.name);

    const res = await fetch('/api/remove-bg', { method: 'POST', body: fd });
    if (!res.ok) {
      // 402(결제), 429(rate limit), 4xx/5xx 모두 null → 원본 fallback
      // eslint-disable-next-line no-console
      console.warn('[remove-bg] failed', res.status, await res.text().catch(() => ''));
      return null;
    }

    const blob = await res.blob();
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';
    return new File([blob], `${baseName}-bg-removed.png`, {
      type: 'image/png',
      lastModified: Date.now(),
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[remove-bg] exception', e);
    return null;
  }
}
