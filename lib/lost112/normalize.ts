import type { Lost112RawItem, LostItem } from './types';
import { buildLost112DetailUrl } from './constants';

// 분류 문자열 정규화: "액세서리>귀걸이" / "액세서리 > 귀걸이" → "액세서리 / 귀걸이"
function normalizeCategory(raw: string): string {
  if (!raw) return '액세서리';
  return raw
    .split(/[>\/·]/)
    .map((seg) => seg.trim())
    .filter(Boolean)
    .join(' / ');
}

// 날짜 정규화: 20260512 → 2026-05-12
function normalizeDate(ymd: string): string {
  const s = (ymd ?? '').replace(/[^0-9]/g, '');
  if (s.length !== 8) return ymd ?? '';
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

// 이미지 URL 검증: 빈문자/플레이스홀더 → undefined
function normalizeImageUrl(input?: string): string | undefined {
  if (!input) return undefined;
  const url = input.trim();
  if (!url) return undefined;
  if (/no[_-]?image|noimg|default|placeholder/i.test(url)) return undefined;
  if (!/^https?:\/\//i.test(url)) return undefined;
  return url;
}

export function normalizeLostItem(raw: Lost112RawItem): LostItem {
  return {
    id: raw.atcId,
    title: raw.fdSbjt?.trim() || '습득물',
    category: normalizeCategory(raw.prdtClNm),
    foundDate: normalizeDate(raw.fdYmd),
    foundTime: normalizeTime(raw.fdHor),
    foundPlace: raw.fdPlace?.trim() || '습득 장소 미상',
    storagePlace: raw.depPlace?.trim() || '보관처 미상',
    storagePhone: raw.tel?.trim() || undefined,
    status: raw.csteSteNm?.trim() || undefined,
    imageUrl: normalizeImageUrl(raw.fdFilePathImg),
    sourceUrl: buildLost112DetailUrl(raw.atcId),
  };
}

export function normalizeLostItems(raws: Lost112RawItem[]): LostItem[] {
  return (raws ?? []).map(normalizeLostItem);
}
