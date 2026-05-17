// 경찰청 LOST112 공공 API 응답·정규화 타입
// ─────────────────────────────────────────────────────────────

// 원본 API 응답 항목 (XML/JSON, 카멜·언더스코어 혼재 가능)
export interface Lost112RawItem {
  atcId: string;          // 관리번호
  fdSbjt: string;         // 습득물명
  fdYmd: string;          // 습득일자 (YYYYMMDD)
  fdHor?: string;         // 습득시각
  fdPlace: string;        // 습득장소
  prdtClNm: string;       // 물품분류 (예: "액세서리 > 귀걸이")
  depPlace: string;       // 보관장소
  tel?: string;           // 보관장소 연락처
  csteSteNm?: string;     // 보관상태
  fdFilePathImg?: string; // 이미지 URL (없는 경우 다수)
}

// aring 내부에서 사용하는 정규화된 분실물 타입
export interface LostItem {
  id: string;             // atcId
  title: string;          // 습득물명
  category: string;       // 정규화된 분류 ("액세서리 / 귀걸이")
  foundDate: string;      // YYYY-MM-DD
  foundTime?: string;     // "HH:mm경" 형태로 가공
  foundPlace: string;     // 습득장소
  storagePlace: string;   // 보관장소
  storagePhone?: string;  // 보관처 연락처
  status?: string;        // 보관상태
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
