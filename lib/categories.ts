// 등록 폼(register)과 탐색(discover)에서 공유하는 카테고리 옵션
// 데이터 구조 동일하게 — 사용자가 등록 시 선택한 한국어 라벨을
// listings.shape / listings.material 에 그대로 저장 → 탐색에서 정확 매칭

// ─────────────────────────────────────────────────────────────
// 모양 (Shape)
// ─────────────────────────────────────────────────────────────
export type ShapeKey =
  | 'stud'
  | 'drop'
  | 'hoop'
  | 'chandelier'
  | 'cuff'
  | 'etc';

export const SHAPE_OPTIONS: { value: ShapeKey; label: string }[] = [
  { value: 'stud', label: '스터드' },
  { value: 'drop', label: '드롭' },
  { value: 'hoop', label: '후프' },
  { value: 'chandelier', label: '샹들리에' },
  { value: 'cuff', label: '이어커프' },
  { value: 'etc', label: '기타' },
];

// 라벨 ↔ key 양방향 매핑 (DB freetext 호환)
export const SHAPE_LABEL_TO_KEY: Record<string, ShapeKey> = SHAPE_OPTIONS.reduce(
  (acc, o) => ({ ...acc, [o.label]: o.value }),
  {} as Record<string, ShapeKey>
);

// 탐색 매칭용 — DB freetext에 들어 있을 수 있는 변형 키워드까지 포괄
export const SHAPE_KEYWORDS: Record<ShapeKey, string[]> = {
  stud: ['스터드', 'stud'],
  drop: ['드롭', 'drop'],
  hoop: ['후프', 'hoop'],
  chandelier: ['샹들리에', 'chandelier'],
  cuff: ['이어커프', '커프', 'cuff'],
  etc: [], // '기타'는 위 5개에 매칭 안 되는 것
};

// ─────────────────────────────────────────────────────────────
// 소재 (Material)
// ─────────────────────────────────────────────────────────────
export type MaterialKey =
  | 'gold'
  | 'silver'
  | 'rose_gold'
  | 'pearl'
  | 'crystal'
  | 'stone'
  | 'acrylic';

export type MaterialOption = {
  value: MaterialKey;
  label: string;
  bg: string; // 실사 느낌 그라데이션
};

export const MATERIAL_OPTIONS: MaterialOption[] = [
  { value: 'gold', label: '골드', bg: 'linear-gradient(135deg,#F5D78A,#C9A055 70%,#9C7A38)' },
  { value: 'silver', label: '실버', bg: 'linear-gradient(135deg,#F0F0F0,#C0C0C0 60%,#9A9A9A)' },
  { value: 'rose_gold', label: '로즈골드', bg: 'linear-gradient(135deg,#F4D5C8,#D89F90 65%,#B47865)' },
  { value: 'pearl', label: '진주', bg: 'linear-gradient(135deg,#FFFFFF,#F5EBDA 60%,#E0CFB1)' },
  { value: 'crystal', label: '크리스탈', bg: 'linear-gradient(135deg,#F0F8FF,#CDE3F5 60%,#A4C8E5)' },
  { value: 'stone', label: '원석', bg: 'linear-gradient(135deg,#C5CEDB,#7B8B9F 60%,#4D5C6E)' },
  { value: 'acrylic', label: '아크릴', bg: 'linear-gradient(135deg,#FBC8DC,#FFD9B8,#C8E6C9)' },
];

export const MATERIAL_LABEL_TO_KEY: Record<string, MaterialKey> =
  MATERIAL_OPTIONS.reduce(
    (acc, o) => ({ ...acc, [o.label]: o.value }),
    {} as Record<string, MaterialKey>
  );

export const MATERIAL_KEYWORDS: Record<MaterialKey, string[]> = {
  gold: ['골드', 'gold', '14k', '18k', '금'],
  silver: ['실버', 'silver', '925', '은'],
  rose_gold: ['로즈골드', '로즈 골드', 'rose gold', 'rose'],
  pearl: ['진주', '펄', 'pearl'],
  crystal: ['크리스탈', '크리스털', 'crystal'],
  stone: ['원석', '보석', 'stone', 'gem'],
  acrylic: ['아크릴', 'acrylic', '플라스틱'],
};

// ─────────────────────────────────────────────────────────────
// 헬퍼
// ─────────────────────────────────────────────────────────────
export function shapeLabel(key: ShapeKey | null | undefined): string {
  return SHAPE_OPTIONS.find((o) => o.value === key)?.label ?? '';
}

export function materialLabel(key: MaterialKey | null | undefined): string {
  return MATERIAL_OPTIONS.find((o) => o.value === key)?.label ?? '';
}

/** DB의 freetext (listings.shape 등)에서 ShapeKey 추론 — 정확 매칭이 우선, 없으면 keyword contains */
export function inferShapeKey(text: string | null | undefined): ShapeKey | null {
  if (!text) return null;
  // 1) 정확 라벨 매칭 (등록 폼에서 저장한 한국어 라벨)
  if (SHAPE_LABEL_TO_KEY[text.trim()]) return SHAPE_LABEL_TO_KEY[text.trim()];
  // 2) 키워드 contains (legacy freetext)
  const lc = text.toLowerCase();
  for (const opt of SHAPE_OPTIONS) {
    if (opt.value === 'etc') continue;
    const kws = SHAPE_KEYWORDS[opt.value];
    if (kws.some((k) => lc.includes(k.toLowerCase()))) return opt.value;
  }
  return null;
}

export function inferMaterialKey(text: string | null | undefined): MaterialKey | null {
  if (!text) return null;
  if (MATERIAL_LABEL_TO_KEY[text.trim()]) return MATERIAL_LABEL_TO_KEY[text.trim()];
  const lc = text.toLowerCase();
  for (const opt of MATERIAL_OPTIONS) {
    const kws = MATERIAL_KEYWORDS[opt.value];
    if (kws.some((k) => lc.includes(k.toLowerCase()))) return opt.value;
  }
  return null;
}
