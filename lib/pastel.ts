// ─────────────────────────────────────────────────────────────
// 파스텔 컬러 로테이션 — tailwind.config.ts의 aring.pastel.* 매핑
// 카드 배경/장식에 인덱스 또는 id-hash 기반으로 일관 적용
// ─────────────────────────────────────────────────────────────

export const PASTEL_ROTATION = [
  'pink',     // 웜
  'mint',     // 쿨
  'peach',    // 웜
  'sky',      // 쿨
  'butter',   // 웜
  'aqua',     // 쿨
  'rose',     // 웜
  'lavender', // 쿨
  'cream',    // 웜
  'sage',     // 뉴트럴
] as const;

export type PastelColor = (typeof PASTEL_ROTATION)[number];

export const getPastelByIndex = (index: number): PastelColor =>
  PASTEL_ROTATION[index % PASTEL_ROTATION.length];

// 동일 id → 항상 같은 파스텔 (페이지 위치 무관)
export const getPastelById = (id: string): PastelColor => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return PASTEL_ROTATION[Math.abs(h) % PASTEL_ROTATION.length];
};

// 별칭 — 기존 hash 헬퍼와 동일, 명시적 이름
export const getPastelByIdHash = getPastelById;

// index → Tailwind 클래스 (목록 카드용)
export const getPastelClass = (index: number): string =>
  `bg-aring-pastel-${getPastelByIndex(index)}`;

// id → Tailwind 클래스 (상세 페이지, 목록 외 단일 카드용)
export const getPastelClassById = (id: string): string =>
  `bg-aring-pastel-${getPastelById(id)}`;

// hex 직접 필요할 때 (inline style용)
export const PASTEL_HEX: Record<PastelColor, string> = {
  pink: '#FBD2E1',
  peach: '#FFDFAF',
  butter: '#FFEFA8',
  mint: '#C8E8DD',
  sky: '#BDD8EC',
  sage: '#DDD9C5',
  lavender: '#E0CCED',
  cream: '#F0E0C9',
  aqua: '#BFE0E8',
  rose: '#F0CCCC',
};
