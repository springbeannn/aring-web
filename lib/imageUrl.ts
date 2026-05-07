/**
 * Supabase Storage Image Transformation 유틸
 *
 * 공개 객체 URL(/storage/v1/object/public/...)을 렌더 엔드포인트
 * (/storage/v1/render/image/public/...)로 바꿔주고 width 파라미터를 붙여
 * 원본 대신 압축된 이미지를 받게 함.
 *
 * Supabase 프로젝트에서 Image Transformation 기능이 활성화돼 있어야 동작.
 * 비-Supabase URL이나 빈 값은 그대로 반환.
 */
export function optimizeImage(url: string | null | undefined, width = 1000): string {
  if (!url) return '';
  const transformed = url.replace('/object/public/', '/render/image/public/');
  if (transformed === url) return url; // Supabase public storage URL이 아님 → 변환 없이 반환
  const sep = transformed.includes('?') ? '&' : '?';
  return `${transformed}${sep}width=${width}`;
}
