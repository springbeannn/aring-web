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

// LOST112 응답은 `_type=json` 파라미터가 무시되고 XML로만 회신됨.
// item 단일·다중 케이스를 한꺼번에 처리하고, 평탄한 leaf 태그만 다루는 단순 파서.
function parseLost112Xml(xml: string): {
  resultCode?: string;
  resultMsg?: string;
  items: Lost112RawItem[];
  totalCount?: number;
  pageNo?: number;
  numOfRows?: number;
} {
  const pick = (tag: string, scope: string): string | undefined => {
    const m = scope.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
    return m ? m[1] : undefined;
  };
  const header = pick('header', xml) ?? '';
  const body = pick('body', xml) ?? '';

  const itemBlocks = [...body.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  const items = itemBlocks.map((block) => {
    const raw: Record<string, string> = {};
    for (const m of block.matchAll(/<([a-zA-Z0-9_]+)>([\s\S]*?)<\/\1>/g)) {
      raw[m[1]] = m[2].trim();
    }
    return raw as unknown as Lost112RawItem;
  });

  const toInt = (s?: string): number | undefined => {
    if (!s) return undefined;
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  };

  return {
    resultCode: pick('resultCode', header),
    resultMsg: pick('resultMsg', header),
    items,
    totalCount: toInt(pick('totalCount', body)),
    pageNo: toInt(pick('pageNo', body)),
    numOfRows: toInt(pick('numOfRows', body)),
  };
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

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: LOST_FOUND_REVALIDATE_SECONDS },
    });
    if (!res.ok) {
      console.error('[aring][lost112] non-OK', res.status, res.statusText);
      return { items: [], totalCount: 0, pageNo, numOfRows, isMock: false };
    }
    const xml = await res.text();
    const parsed = parseLost112Xml(xml);
    if (parsed.resultCode && parsed.resultCode !== '00') {
      console.error('[aring][lost112] api error', parsed.resultCode, parsed.resultMsg);
      return { items: [], totalCount: 0, pageNo, numOfRows, isMock: false };
    }
    return {
      items: normalizeLostItems(parsed.items),
      totalCount: parsed.totalCount ?? parsed.items.length,
      pageNo: parsed.pageNo ?? pageNo,
      numOfRows: parsed.numOfRows ?? numOfRows,
      isMock: false,
    };
  } catch (e) {
    console.error('[aring][lost112] fetch failed', e);
    return { items: [], totalCount: 0, pageNo, numOfRows, isMock: false };
  }
}
