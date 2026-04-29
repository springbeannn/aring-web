// 한글 → 영문 브랜드 매핑 dictionary (확장 가능)
const BRAND_DICTIONARY: Record<string, string> = {
  // 샤넬
  '샤넬': 'chanel',
  'chanel': 'chanel',
  // 디올
  '디올': 'dior',
  'dior': 'dior',
  // 티파니
  '티파니': 'tiffany',
  'tiffany & co': 'tiffany',
  'tiffany&co': 'tiffany',
  'tiffany': 'tiffany',
  // 비비안웨스트우드
  '비비안웨스트우드': 'viviennewestwood',
  '비비안 웨스트우드': 'viviennewestwood',
  'vivienne westwood': 'viviennewestwood',
  'viviennewestwood': 'viviennewestwood',
  // 셀린느
  '셀린느': 'celine',
  '셀린': 'celine',
  'celine': 'celine',
  // 스와로브스키
  '스와로브스키': 'swarovski',
  'swarovski': 'swarovski',
  // 미우미우
  '미우미우': 'miumiu',
  'miu miu': 'miumiu',
  'miumiu': 'miumiu',
  // 아지메
  '아지메': 'agme',
  'agme': 'agme',
  // 넘버링
  '넘버링': 'numbering',
  'numbering': 'numbering',
};

/**
 * 브랜드 입력값을 정규화된 brand_key로 변환합니다.
 * - 소문자 변환 + 앞뒤 공백 제거
 * - dictionary 기반 한글/영문 매핑
 * - dictionary에 없으면 소문자+trim 그대로 반환
 */
export function normalizeBrand(input: string): string {
  if (!input || input.trim() === '') return '';

  // 1. 소문자 변환 + 앞뒤 공백 제거
  const normalized = input.toLowerCase().trim();

  // 2. 공백 제거 버전 (검색용)
  const noSpaceKey = normalized.replace(/\s+/g, '');

  // 3. dictionary 검색 (원본 → 공백제거 순서로)
  if (BRAND_DICTIONARY[normalized]) return BRAND_DICTIONARY[normalized];
  if (BRAND_DICTIONARY[noSpaceKey]) return BRAND_DICTIONARY[noSpaceKey];

  // 4. dictionary에 없으면 기본 정규화값 반환
  return normalized;
}
