// LOST112 API 상수
// ─────────────────────────────────────────────────────────────

export const LOST112_API_BASE =
  process.env.LOST112_API_BASE ?? 'http://apis.data.go.kr/1320000/LosfundInfoInqireService';

export const LOST112_API_KEY = process.env.LOST112_API_KEY ?? '';

// 외부 상세 페이지 URL 생성
export function buildLost112DetailUrl(atcId: string, fdSn: string | number = 1): string {
  return `https://www.lost112.go.kr/find/findDetail.do?ATC_ID=${encodeURIComponent(atcId)}&FD_SN=${fdSn}`;
}

// aring 도메인은 액세서리·귀걸이 중심.
// LOST112 대분류에서 가장 가까운 카테고리는 "귀금속(PRO000)".
// 하위: PRO100 반지 / PRO200 목걸이 / PRO300 귀걸이 / PRO400 시계 / PRO500 기타
export const ARING_RELEVANT_CL_CODES = {
  PRDT_CL_CD_01: 'PRO000',
  PRDT_CL_CD_02: ['PRO300'], // 귀걸이 (필요 시 다른 중분류 추가)
} as const;

// 캐싱
export const LOST_FOUND_REVALIDATE_SECONDS = 3600; // 1시간 ISR
