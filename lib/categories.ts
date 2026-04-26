// 등록 폼(register)과 탐색(discover)에서 공유하는 카테고리 옵션
// DB에는 영문 key로 저장, UI에는 한글 label 표시

import type {
  ColorKey,
  ThemeKey,
  SizeKey,
  ConditionKey,
} from '@/lib/supabase';

export type ColorOption = {
  value: ColorKey;
  label: string;
  swatch?: string;
  gradient?: string;
  border?: string;
};

export type ThemeOption = {
  value: ThemeKey;
  label: string;
  icon: string;
};

export type SizeOption = { value: SizeKey; label: string };
export type ConditionOption = { value: ConditionKey; label: string };

export const COLOR_OPTIONS: ColorOption[] = [
  { value: 'white', label: '화이트', swatch: '#FFFFFF', border: '#D5D5D5' },
  { value: 'pink', label: '핑크', swatch: '#F8BBD0' },
  { value: 'yellow', label: '옐로', swatch: '#FFE082' },
  { value: 'orange', label: '오렌지', swatch: '#FFB088' },
  { value: 'red', label: '레드', swatch: '#EF5350' },
  { value: 'green', label: '그린', swatch: '#A5D6A7' },
  { value: 'blue', label: '블루', swatch: '#90CAF9' },
  { value: 'purple', label: '퍼플', swatch: '#CE93D8' },
  { value: 'gold', label: '골드', swatch: '#F5C26B' },
  { value: 'silver', label: '실버', swatch: '#D6D6D6' },
  { value: 'black', label: '블랙', swatch: '#1E1B2E' },
  {
    value: 'multi',
    label: '멀티',
    gradient: 'linear-gradient(135deg, #FBC8DC, #FFD9B8, #C8E6C9)',
  },
];

export const THEME_OPTIONS: ThemeOption[] = [
  { value: 'heart', label: '하트', icon: '♡' },
  { value: 'star', label: '별', icon: '★' },
  { value: 'flower', label: '꽃', icon: '✿' },
  { value: 'animal', label: '동물', icon: '◐' },
  { value: 'butterfly', label: '나비', icon: '✦' },
  { value: 'minimal', label: '미니멀', icon: '·' },
];

export const SIZE_OPTIONS: SizeOption[] = [
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
];

export const CONDITION_OPTIONS: ConditionOption[] = [
  { value: 'new', label: '미사용' },
  { value: 'S', label: 'S급' },
  { value: 'A', label: 'A급' },
  { value: 'B', label: 'B급' },
];

// 라벨 lookup helper
export function colorLabel(v: ColorKey | null | undefined): string {
  return COLOR_OPTIONS.find((o) => o.value === v)?.label ?? '';
}
export function themeLabel(v: ThemeKey | null | undefined): string {
  return THEME_OPTIONS.find((o) => o.value === v)?.label ?? '';
}
export function sizeLabel(v: SizeKey | null | undefined): string {
  return SIZE_OPTIONS.find((o) => o.value === v)?.label ?? '';
}
export function conditionLabel(v: ConditionKey | null | undefined): string {
  return CONDITION_OPTIONS.find((o) => o.value === v)?.label ?? '';
}
