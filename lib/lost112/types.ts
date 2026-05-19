// 경찰청 LOST112 공공 API 응답·정규화 타입
// ─────────────────────────────────────────────────────────────

// 원본 API 응답 항목.
// 실 API(getLosfundInfoAccToClAreaPd, 목록)에서는 fdPlace/fdHor/tel/csteSteNm 등 상세 필드가
// 내려오지 않음. 모두 optional로 둠.
export interface Lost112RawItem {
  atcId: string;          // 관리번호
  fdSn?: string;          // 일련번호
  prdtClNm?: string;      // 물품분류 (예: "귀금속 > 귀걸이")
  clrNm?: string;         // 색상 (예: "블랙(검정)")
  fdPrdtNm?: string;      // 짧은 습득물명 (예: "삼성휴대폰")
  fdSbjt?: string;        // 긴 설명 (예: "...을 습득하여 보관하고 있습니다.")
  fdYmd?: string;         // 습득일자 (실 API는 YYYY-MM-DD, 일부 엔드포인트는 YYYYMMDD)
  fdHor?: string;         // 습득시각 (목록 API에는 부재)
  fdPlace?: string;       // 습득장소 (목록 API에는 부재)
  depPlace?: string;      // 보관장소
  tel?: string;           // 보관처 연락처 (목록 API에는 부재)
  csteSteNm?: string;     // 보관상태 (목록 API에는 부재)
  fdFilePathImg?: string; // 이미지 URL (대부분 placeholder)
}

// aring 내부에서 사용하는 정규화된 분실물 타입
export interface LostItem {
  id: string;             // atcId
  fdSn: string;           // LOST112 상세 URL의 FD_SN 파라미터 (기본 1)
  title: string;          // 짧은 제품명
  category: string;       // 정규화된 분류 ("귀금속 / 귀걸이")
  color?: string;         // 색상 (있을 때만)
  foundDate: string;      // YYYY-MM-DD
  foundTime?: string;     // "HH:mm경" — 목록에서는 비어 있음
  foundPlace?: string;    // 습득장소 — 목록에서는 비어 있음
  storagePlace: string;   // 보관장소 (예: "호원지구대")
  storagePhone?: string;  // 보관처 연락처 — 목록에서는 비어 있음
  status?: string;        // 보관상태 — 목록에서는 비어 있음
  imageUrl?: string;      // 이미지 URL (있을 때만)
  sourceUrl: string;      // LOST112 원본 상세 페이지 URL
}

export interface LostFoundListParams {
  startDate?: string;     // YYYYMMDD
  endDate?: string;       // YYYYMMDD
  regionCode?: string;    // N_FD_LCT_CD
  categoryCode1?: string; // PRDT_CL_CD_01 (대분류)
  categoryCode2?: string; // PRDT_CL_CD_02 (중분류)
  pageNo?: number;
  numOfRows?: number;
}

export interface LostFoundListResult {
  items: LostItem[];
  totalCount: number;
  pageNo: number;
  numOfRows: number;
  isMock: boolean;        // mock 응답 여부 (디버깅·표시용)
}
