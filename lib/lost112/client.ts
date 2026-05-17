import type {
  Lost112RawItem,
  LostFoundListParams,
  LostFoundListResult,
} from './types';
import {
  ARING_RELEVANT_CL_CODES,
  LOST112_API_BASE,
  LOST112_API_KEY,
  LOST_FOUND_REVALIDATE_SECONDS,
} from './constants';
import { normalizeLostItems } from './normalize';
import { MOCK_LOST_ITEMS } from './mock';

// YYYYMMDD 포맷
function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function defaultDateRange(days = 30): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return { startDate: toYmd(start), endDate: toYmd(end) };
}

interface Lost112JsonResponse {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: {
      items?: { item?: Lost112RawItem | Lost112RawItem[] } | Lost112RawItem[];
      totalCount?: number | string;
      pageNo?: number | string;
      numOfRows?: number | string;
    };
  };
}

function extractItems(json: Lost112JsonResponse): Lost112RawItem[] {
  const body = json?.response?.body;
  if (!body?.items) return [];
  const items = (body.items as { item?: Lost112RawItem | Lost112RawItem[] }).item
    ?? (body.items as Lost112RawItem[]);
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
}

function asNumber(v: number | string | undefined, fallback: number): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

// 분실물 목록 조회.
// 환경 변수 LOST112_API_KEY가 없으면 mock 데이터 반환.
export async function fetchLostFoundList(
  params: LostFoundListParams = {},
): Promise<LostFoundListResult> {
  const { startDate, endDate } = params.startDate && params.endDate
    ? { startDate: params.startDate, endDate: params.endDate }
    : defaultDateRange(30);

  const pageNo = params.pageNo ?? 1;
  const numOfRows = params.numOfRows ?? 20;

  // 키가 없으면 mock fallback
  if (!LOST112_API_KEY) {
    return {
      items: MOCK_LOST_ITEMS,
      totalCount: MOCK_LOST_ITEMS.length,
      pageNo,
      numOfRows,
      isMock: true,
    };
  }

  const url = new URL(`${LOST112_API_BASE}/getLosfundInfoAccToClAreaPd`);
  url.searchParams.set('serviceKey', LOST112_API_KEY);
  url.searchParams.set('START_YMD', startDate);
  url.searchParams.set('END_YMD', endDate);
  url.searchParams.set('PRDT_CL_CD_01', params.categoryCode1 ?? ARING_RELEVANT_CL_CODES.PRDT_CL_CD_01);
  if (params.categoryCode2) url.searchParams.set('PRDT_CL_CD_02', params.categoryCode2);
  if (params.regionCode) url.searchParams.set('N_FD_LCT_CD', params.regionCode);
  url.searchParams.set('pageNo', String(pageNo));
  url.searchParams.set('numOfRows', String(numOfRows));
  url.searchParams.set('_type', 'json');

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: LOST_FOUND_REVALIDATE_SECONDS },
    });
    if (!res.ok) {
      console.error('[aring][lost112] non-OK', res.status, res.statusText);
      return { items: [], totalCount: 0, pageNo, numOfRows, isMock: false };
    }
    const json = (await res.json()) as Lost112JsonResponse;
    const code = json?.response?.header?.resultCode;
    if (code && code !== '00') {
      console.error('[aring][lost112] api error', code, json?.response?.header?.resultMsg);
      return { items: [], totalCount: 0, pageNo, numOfRows, isMock: false };
    }
    const raws = extractItems(json);
    return {
      items: normalizeLostItems(raws),
      totalCount: asNumber(json?.response?.body?.totalCount, raws.length),
      pageNo: asNumber(json?.response?.body?.pageNo, pageNo),
      numOfRows: asNumber(json?.response?.body?.numOfRows, numOfRows),
      isMock: false,
    };
  } catch (e) {
    console.error('[aring][lost112] fetch failed', e);
    return { items: [], totalCount: 0, pageNo, numOfRows, isMock: false };
  }
}
