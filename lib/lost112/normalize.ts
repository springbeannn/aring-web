import type { Lost112RawItem, LostItem } from './types';
import { buildLost112DetailUrl } from './constants';

// 분류 문자열 정규화: "귀금속>귀걸이" / "귀금속 > 귀걸이" → "귀금속 / 귀걸이"
function normalizeCategory(raw?: string): string {
  if (!raw) return '귀금속';
  return raw
    .split(/[>\/·]/)
    .map((seg) => seg.trim())
    .filter(Boolean)
    .join(' / ');
}

// 날짜 정규화: 20260512 → 2026-05-12, 이미 2026-05-12 형태면 그대로
function normalizeDate(ymd?: string): string {
  if (!ymd) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd;
  const s = ymd.replace(/[^0-9]/g, '');
  if (s.length !== 8) return ymd;
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

// 시각 정규화: "1840" / "18:40" → "18:40경", 빈값/이상값 → undefined
function normalizeTime(input?: string): string | undefined {
  if (!input) return undefined;
  const s = input.replace(/[^0-9]/g, '');
  if (s.length === 4) return `${s.slice(0, 2)}:${s.slice(2, 4)}경`;
  if (s.length === 3) return `0${s.slice(0, 1)}:${s.slice(1, 3)}경`;
  return undefined;
}

// 이미지 URL 검증: 빈문자/플레이스홀더 → undefined.
// LOST112 placeholder 예: https://minwon24.police.go.kr/images/sub/img02_no_img.gif
function normalizeImageUrl(input?: string): string | undefined {
  if (!input) return undefined;
  const url = input.trim();
  if (!url) return undefined;
  if (/no[_-]?img(?:age)?|noimage|default|placeholder/i.test(url)) return undefined;
  if (!/^https?:\/\//i.test(url)) return undefined;
  return url;
}

// 색상 정규화: "블랙(검정)" → "검정" (괄호 안 한글 우선)
function normalizeColor(input?: string): string | undefined {
  if (!input) return undefined;
  const s = input.trim();
  if (!s) return undefined;
  const m = s.match(/\(([^)]+)\)/);
  return (m?.[1] ?? s).trim() || undefined;
}

export function normalizeLostItem(raw: Lost112RawItem): LostItem {
  const fdSn = (raw.fdSn ?? '1').toString().trim() || '1';
  const title =
    raw.fdPrdtNm?.trim()
    || raw.fdSbjt?.trim()
    || '습득물';
  const foundPlace = raw.fdPlace?.trim() || undefined;
  return {
    id: raw.atcId,
    fdSn,
    title,
    category: normalizeCategory(raw.prdtClNm),
    color: normalizeColor(raw.clrNm),
    foundDate: normalizeDate(raw.fdYmd),
    foundTime: normalizeTime(raw.fdHor),
    foundPlace,
    storagePlace: raw.depPlace?.trim() || '보관처 미상',
    storagePhone: raw.tel?.trim() || undefined,
    status: raw.csteSteNm?.trim() || undefined,
    imageUrl: normalizeImageUrl(raw.fdFilePathImg),
    sourceUrl: buildLost112DetailUrl(raw.atcId, fdSn),
  };
}

export function normalizeLostItems(raws: Lost112RawItem[]): LostItem[] {
  return (raws ?? []).map(normalizeLostItem);
}
