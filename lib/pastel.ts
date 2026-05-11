// ─────────────────────────────────────────────────────────────
// 파스텔 컬러 로테이션 — tailwind.config.ts의 aring.pastel.* 매핑
// 카드 배경/장식에 인덱스 또는 id-hash 기반으로 일관 적용
// ─────────────────────────────────────────────────────────────

export const PASTEL_ROTATION = [
  'pink',     // #FEE8F1
  'peach',    // #FFEFD9
  'butter',   // #FFF7D6
  'mint',     // #EDF8F6
  'sky',      // #E3EFF7
  'sage',     // #F5F3EA
  'lavender', // #F4EBF8
  'cream',    // #FBF3EA
  'aqua',     // #EBF6F8
  'rose',     // #F8EAEA
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
  pink: '#FEE8F1',
  peach: '#FFEFD9',
  butter: '#FFF7D6',
  mint: '#EDF8F6',
  sky: '#E3EFF7',
  sage: '#F5F3EA',
  lavender: '#F4EBF8',
  cream: '#FBF3EA',
  aqua: '#EBF6F8',
  rose: '#F8EAEA',
};
