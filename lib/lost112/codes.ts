// LOST112 카테고리 · 지역 코드 매핑
// 정확한 코드 사양서는 공공데이터포털 활용신청 후 다운로드.
// 현재 단계는 화면 노출에 필요한 최소 셋만 정의하고 나머지는 TODO.
// ─────────────────────────────────────────────────────────────

export interface CodeOption {
  code: string;
  label: string;
}

// 지역 (N_FD_LCT_CD)
// TODO: 사양서 받아서 17개 광역 시·도 전체로 확장
export const REGION_OPTIONS: CodeOption[] = [
  { code: '',       label: '전체 지역' },
  { code: 'LCA000', label: '서울' },
  { code: 'LCB000', label: '경기' },
  { code: 'LCC000', label: '인천' },
  { code: 'LCD000', label: '부산' },
  { code: 'LCE000', label: '대구' },
  { code: 'LCF000', label: '광주' },
  { code: 'LCG000', label: '대전' },
  { code: 'LCH000', label: '울산' },
  { code: 'LCI000', label: '세종' },
];

// 기간 프리셋 (UI 표시용 일수)
export const PERIOD_OPTIONS: { days: number; label: string }[] = [
  { days: 7,   label: '최근 1주' },
  { days: 30,  label: '최근 1개월' },
  { days: 90,  label: '최근 3개월' },
];

// 분류 (PRDT_CL_CD_02) — 귀금속(PRO000) 하위 중분류
export const CATEGORY_OPTIONS: CodeOption[] = [
  { code: '',       label: '전체 귀금속' },
  { code: 'PRO300', label: '귀걸이' },
  { code: 'PRO100', label: '반지' },
  { code: 'PRO200', label: '목걸이' },
  { code: 'PRO400', label: '시계' },
  { code: 'PRO500', label: '기타' },
];
