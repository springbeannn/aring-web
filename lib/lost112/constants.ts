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
// 정확한 코드는 공공데이터포털 활용신청 후 사양서에서 확정 필요.
// TODO: 사양서 확인 후 실제 코드로 교체
export const ARING_RELEVANT_CL_CODES = {
  PRDT_CL_CD_01: 'PRA000',           // 대분류: 액세서리 (확인 필요)
  PRDT_CL_CD_02: ['PRA200', 'PRA210'], // 중분류: 귀걸이 등 (확인 필요)
} as const;

// 캐싱
export const LOST_FOUND_REVALIDATE_SECONDS = 3600; // 1시간 ISR
