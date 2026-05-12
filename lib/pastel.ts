// ─────────────────────────────────────────────────────────────
// 파스텔 컬러 로테이션 — tailwind.config.ts의 aring.pastel.* 매핑
// 카드 배경/장식에 인덱스 또는 id-hash 기반으로 일관 적용
// ─────────────────────────────────────────────────────────────

export const PASTEL_ROTATION = [
  'sage',     // 뉴트럴 (이전 맨 뒤 → 맨 앞)
  'cream',    // 웜
  'lavender', // 쿨
  'rose',     // 웜
  'aqua',     // 쿨
  'butter',   // 웜
  'sky',      // 쿨
  'peach',    // 웜
  'mint',     // 쿨
  'pink',     // 웜 (이전 맨 앞 → 맨 뒤)
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

// 하이브리드 — 목록에서 id 해시 기본 사용 + 직전 2개와 충돌 시 시프트
// 2열 그리드의 가로(직전 1개)·세로(직전 2개) 인접 카드 색 겹침 회피
export function getPastelClassesForList(ids: string[]): string[] {
  const colors: PastelColor[] = [];
  const out: string[] = [];
  for (const id of ids) {
    const base = getPastelById(id);
    let color = base;
    const avoid = new Set<PastelColor>();
    if (colors.length >= 1) avoid.add(colors[colors.length - 1]);
    if (colors.length >= 2) avoid.add(colors[colors.length - 2]);
    if (avoid.has(color)) {
      const startIdx = PASTEL_ROTATION.indexOf(base);
      for (let step = 1; step < PASTEL_ROTATION.length; step++) {
        const candidate = PASTEL_ROTATION[(startIdx + step) % PASTEL_ROTATION.length];
        if (!avoid.has(candidate)) {
          color = candidate;
          break;
        }
      }
    }
    colors.push(color);
    out.push(`bg-aring-pastel-${color}`);
  }
  return out;
}

// hex 직접 필요할 때 (inline style용)
export const PASTEL_HEX: Record<PastelColor, string> = {
  pink: '#FCE1EB',
  peach: '#FFEBD0',
  butter: '#FFF4CB',
  mint: '#D9F0E9',
  sky: '#D3E5F2',
  sage: '#E6E4D9',
  lavender: '#E9DBF2',
  cream: '#F4E9D9',
  aqua: '#D3EBF1',
  rose: '#F1DCDC',
};
