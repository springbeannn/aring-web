// ─────────────────────────────────────────────────────────────
// aring Match 계산 로직
// 총 100점: shape(35) + color(25) + material(15) + detail(15) + brand(5) + mood(5)
// ─────────────────────────────────────────────────────────────

export type MatchType = 'similar' | 'reference' | 'hidden';

export interface ScoreBreakdown {
  shape: number;
  color: number;
  material: number;
  detail: number;
  brand: number;
  mood: number;
}

export interface MatchResult {
  totalScore: number;
  type: MatchType;
  label: string;
  breakdown: ScoreBreakdown;
  reasons: string[];
}

// ─── 형태 유사 그룹 ───────────────────────────────────────────
const SHAPE_GROUPS: string[][] = [
  ['링', '후프', 'ring', 'hoop', '환형', '원형'],
  ['드롭', '체인', 'drop', 'chain', '매달리는', '댕글', 'dangle'],
  ['스터드', '미니', 'stud', '피어싱', 'piercing', '작은'],
  ['하트', '플라워', '리본', '꽃', '나비', '별', 'heart', 'flower', 'ribbon'],
  ['후프', '클리커', 'clicker', '세그먼트'],
  ['이어커프', '커프', 'cuff', 'ear cuff'],
];

function shapeScore(a: string, b: string): number {
  const norm = (s: string) => s.toLowerCase().replace(/\s/g, '');
  const na = norm(a); const nb = norm(b);
  if (na === nb) return 35;
  // 키워드 포함 완전 일치
  if (na.includes(nb) || nb.includes(na)) return 35;
  // 유사 카테고리
  for (const group of SHAPE_GROUPS) {
    const inA = group.some(k => na.includes(k));
    const inB = group.some(k => nb.includes(k));
    if (inA && inB) return 20;
  }
  return 0;
}

// ─── 컬러 유사 그룹 ──────────────────────────────────────────
const COLOR_GROUPS: string[][] = [
  ['gold', 'rose gold', '골드', '로즈골드', 'yellow gold'],
  ['silver', 'white silver', '실버', '화이트실버', 'platinum'],
  ['white', 'ivory', 'pearl', '화이트', '진주', '아이보리', '퍼얼'],
  ['black', 'dark', '블랙', '다크'],
  ['pink', 'rose', 'coral', '핑크', '로즈', '코랄'],
  ['blue', 'navy', '블루', '네이비'],
  ['purple', 'violet', '퍼플', '바이올렛'],
];

function colorScore(a: string, b: string): number {
  if (!a || !b) return 0;
  const norm = (s: string) => s.toLowerCase().replace(/\s/g, '');
  const na = norm(a); const nb = norm(b);
  if (na === nb) return 25;
  if (na.includes(nb) || nb.includes(na)) return 25;
  // 유사 컬러군
  for (const group of COLOR_GROUPS) {
    const inA = group.some(k => na.includes(k));
    const inB = group.some(k => nb.includes(k));
    if (inA && inB) return 15;
  }
  // 복합 컬러 중 일부 일치 — 두 값 중 하나가 "+" 또는 "·" 포함 복합컬러
  const aTokens = na.split(/[+·,\/\s]+/).filter(Boolean);
  const bTokens = nb.split(/[+·,\/\s]+/).filter(Boolean);
  const overlap = aTokens.some(t => bTokens.some(bt => bt.includes(t) || t.includes(bt)));
  if (overlap) return 8;
  return 0;
}

// ─── 소재 ────────────────────────────────────────────────────
const MATERIAL_KEYWORDS = [
  '진주', 'pearl',
  '메탈', 'metal', '스테인리스', 'stainless', '스털링', 'sterling',
  '큐빅', 'cubic', 'cz',
  '비즈', 'beads', 'bead',
  '아크릴', 'acrylic',
  '원석', 'gemstone', '수정', '크리스탈', 'crystal', 'swarovski',
  '패브릭', 'fabric',
  '플라스틱', 'plastic',
  '골드', 'gold',
  '실버', 'silver',
  '로즈골드', 'rose gold',
];

function extractMaterialTokens(s: string): string[] {
  const norm = s.toLowerCase().replace(/\s/g, '');
  return MATERIAL_KEYWORDS.filter(k => norm.includes(k.replace(/\s/g, '')));
}

function materialScore(a: string, b: string): number {
  if (!a || !b) return 0;
  const ta = extractMaterialTokens(a);
  const tb = extractMaterialTokens(b);
  const common = ta.filter(t => tb.includes(t));
  if (common.length === 0) return 0;
  // 주요 소재가 완전히 겹치는지 — ta, tb 둘 다 단일 소재고 같으면 15
  const mainA = ta[0]; const mainB = tb[0];
  if (mainA && mainB && mainA === mainB && ta.length === 1 && tb.length === 1) return 15;
  if (common.length >= 1) return 8;
  return 0;
}

// ─── 디테일 키워드 ───────────────────────────────────────────
function extractDetailTokens(detail: string): string[] {
  if (!detail) return [];
  return detail
    .toLowerCase()
    .split(/[,·\s·\/]+/)
    .map(s => s.trim())
    .filter(s => s.length >= 2);
}

function detailScore(a: string, b: string): number {
  const ta = extractDetailTokens(a);
  const tb = extractDetailTokens(b);
  if (ta.length === 0 || tb.length === 0) return 0;
  const common = ta.filter(t => tb.some(bt => bt.includes(t) || t.includes(bt)));
  if (common.length >= 2) return 15;
  if (common.length === 1) return 8;
  return 0;
}

// ─── 브랜드 ──────────────────────────────────────────────────
const UNKNOWN_BRANDS = ['브랜드 미상', '미상', '불명', '', 'unknown', null, undefined];

function brandScore(a: string | null, b: string | null): number {
  if (!a || !b) return 0;
  const na = a.toLowerCase().trim();
  const nb = b.toLowerCase().trim();
  if (UNKNOWN_BRANDS.includes(na) || UNKNOWN_BRANDS.includes(nb)) return 0;
  if (na === nb) return 5;
  return 0;
}

// ─── 무드 (theme + detail 키워드로 추론) ─────────────────────
const MOOD_GROUPS: string[][] = [
  ['미니멀', 'minimal', '심플', 'simple', '얇은', '미니'],
  ['데일리', 'daily', '캐주얼', 'casual', '일상'],
  ['러블리', 'lovely', '귀여운', 'cute', '하트', '하트형', '리본', '꽃', 'flower', 'heart', 'ribbon'],
  ['클래식', 'classic', '진주', 'pearl', '우아한', 'elegant'],
  ['빈티지', 'vintage', '골드', 'gold', '앤틱', 'antique'],
  ['볼드', 'bold', '굵은', '두꺼운', 'thick', '큰'],
  ['페미닌', 'feminine', '여성스러운', '드롭', 'drop'],
];

function inferMoodTokens(shape: string, detail: string, theme?: string | null): string[] {
  const combined = [shape, detail, theme ?? ''].join(' ').toLowerCase();
  const result: string[] = [];
  for (const group of MOOD_GROUPS) {
    if (group.some(k => combined.includes(k))) result.push(group[0]);
  }
  return result;
}

function moodScore(
  aShape: string, aDetail: string, aTheme: string | null | undefined,
  bShape: string, bDetail: string, bTheme: string | null | undefined,
): number {
  const ma = inferMoodTokens(aShape, aDetail, aTheme);
  const mb = inferMoodTokens(bShape, bDetail, bTheme);
  if (ma.length === 0 || mb.length === 0) return 0;
  const exact = ma.filter(m => mb.includes(m));
  if (exact.length > 0) return 5;
  // 유사 무드: 같은 그룹 내 인접
  const near = ma.some(m => {
    const gi = MOOD_GROUPS.findIndex(g => g[0] === m);
    return mb.some(n => {
      const gj = MOOD_GROUPS.findIndex(g => g[0] === n);
      return Math.abs(gi - gj) === 1;
    });
  });
  if (near) return 3;
  return 0;
}

// ─── 이유 문장 생성 ───────────────────────────────────────────
export function buildMatchReasons(
  src: { shape: string; color: string; material: string; detail: string; brand: string | null },
  cand: { shape: string; color: string; material: string; detail: string; brand: string | null },
  bd: ScoreBreakdown,
  type: MatchType,
): string[] {
  const reasons: string[] = [];

  if (bd.shape >= 35) reasons.push(`${src.shape} 형태가 유사해요`);
  else if (bd.shape >= 20) reasons.push('형태 계열이 비슷해요');
  else if (type === 'reference' && bd.shape === 0) reasons.push('형태는 다르지만 다른 요소가 닮았어요');

  if (bd.color >= 25) reasons.push(`${src.color} 컬러가 같아요`);
  else if (bd.color >= 15) reasons.push(`${src.color} 계열 컬러가 비슷해요`);
  else if (bd.color >= 8) reasons.push('컬러 일부가 비슷해요');
  else if (type === 'reference' && bd.color === 0 && bd.mood > 0) reasons.push('전체 분위기가 비슷해 참고할 수 있어요');

  if (bd.material >= 15) {
    const mTok = extractMaterialTokens(src.material);
    reasons.push(`${mTok[0] ?? src.material} 소재가 같아요`);
  } else if (bd.material >= 8) reasons.push('소재 일부가 비슷해요');

  if (bd.detail >= 15) reasons.push('디테일 키워드가 많이 닮았어요');
  else if (bd.detail >= 8) {
    const dTok = extractDetailTokens(src.detail);
    const dTok2 = extractDetailTokens(cand.detail);
    const common = dTok.filter(t => dTok2.some(bt => bt.includes(t) || t.includes(bt)));
    if (common[0]) reasons.push(`${common[0]} 디테일이 닮았어요`);
    else reasons.push('디테일 일부가 비슷해요');
  }

  if (bd.brand >= 5) reasons.push(`같은 ${src.brand ?? ''} 브랜드의 다른 디자인이에요`);

  if (bd.mood >= 5) reasons.push('전체적인 분위기가 비슷해요');
  else if (bd.mood >= 3) reasons.push('무드가 비슷해 참고할 수 있어요');

  // 최소 1개 보장
  if (reasons.length === 0) reasons.push('일부 요소가 비슷해요');

  return reasons.slice(0, 4);
}

// ─── 매칭 타입 라벨 ──────────────────────────────────────────
export function getMatchLabel(score: number): string {
  if (score >= 90) return '거의 같은 느낌이에요';
  if (score >= 80) return '많이 닮았어요';
  if (score >= 60) return '꽤 비슷해요';
  return '';
}

export function getReferenceLabel(score: number): string {
  if (score >= 55) return '이런 스타일도 있어요';
  if (score >= 48) return '무드는 비슷해요';
  return '참고 후보';
}

export function splitMatchCandidates<T extends { matchScore: MatchResult }>(
  candidates: T[],
): { similar: T[]; reference: T[] } {
  const similar = candidates
    .filter(c => c.matchScore.type === 'similar')
    .sort((a, b) => b.matchScore.totalScore - a.matchScore.totalScore);
  const reference = candidates
    .filter(c => c.matchScore.type === 'reference')
    .sort((a, b) => b.matchScore.totalScore - a.matchScore.totalScore);
  return { similar, reference };
}

// ─── 메인 함수 ───────────────────────────────────────────────
export interface MatchSource {
  shape: string;
  color: string;
  material: string;
  detail: string;
  brand: string | null;
  theme?: string | null;
}

export function calculateAringMatch(src: MatchSource, cand: MatchSource): MatchResult {
  const bd: ScoreBreakdown = {
    shape:    shapeScore(src.shape ?? '', cand.shape ?? ''),
    color:    colorScore(src.color ?? '', cand.color ?? ''),
    material: materialScore(src.material ?? '', cand.material ?? ''),
    detail:   detailScore(src.detail ?? '', cand.detail ?? ''),
    brand:    brandScore(src.brand, cand.brand),
    mood:     moodScore(src.shape ?? '', src.detail ?? '', src.theme,
                        cand.shape ?? '', cand.detail ?? '', cand.theme),
  };

  const total = Math.min(
    100,
    bd.shape + bd.color + bd.material + bd.detail + bd.brand + bd.mood,
  );

  const type: MatchType =
    total >= 60 ? 'similar' :
    total >= 40 ? 'reference' : 'hidden';

  const label =
    type === 'similar'   ? getMatchLabel(total) :
    type === 'reference' ? getReferenceLabel(total) : '';

  const reasons = buildMatchReasons(
    { shape: src.shape ?? '', color: src.color ?? '', material: src.material ?? '', detail: src.detail ?? '', brand: src.brand ?? null },
    { shape: cand.shape ?? '', color: cand.color ?? '', material: cand.material ?? '', detail: cand.detail ?? '', brand: cand.brand ?? null },
    bd,
    type,
  );

  return { totalScore: total, type, label, breakdown: bd, reasons };
}
