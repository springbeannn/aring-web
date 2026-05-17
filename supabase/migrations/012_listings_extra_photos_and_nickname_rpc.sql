-- ════════════════════════════════════════════════════════════════════
-- 012_listings_extra_photos_and_nickname_rpc.sql
--   1) listings.extra_photos — 등록자 한마디 본문에 함께 노출되는
--      추가 사진 URL 배열 (1~3장)
--   2) get_nickname(uid) — 익명/일반 사용자도 다른 사용자의 닉네임만
--      조회 가능하게 하는 RPC. profiles RLS는 본인/admin만 row 노출이라
--      상세 페이지에서 등록자 닉네임을 가져올 방법이 필요.
-- ════════════════════════════════════════════════════════════════════

-- 1) 추가 사진 컬럼
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS extra_photos TEXT[] NOT NULL DEFAULT '{}'::TEXT[];

-- 2) 닉네임만 노출하는 SECURITY DEFINER RPC
--    profiles의 다른 컬럼(email, role, is_banned 등)은 그대로 보호되고
--    nickname 한 컬럼만 누구나 조회 가능.
DROP FUNCTION IF EXISTS public.get_nickname(uuid);

CREATE FUNCTION public.get_nickname(uid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $func$
  SELECT nickname FROM public.profiles WHERE user_id = uid;
$func$;

GRANT EXECUTE ON FUNCTION public.get_nickname(uuid) TO anon, authenticated;

-- ════════════════════════════════════════════════════════════════════
-- 적용 순서
-- ════════════════════════════════════════════════════════════════════
-- 1. Supabase SQL Editor에서 위 스크립트 실행
-- 2. 기존 listings row의 extra_photos는 기본값 '{}' 으로 자동 채워짐
-- 3. 신규 등록부터 1~3장 추가 사진 첨부 가능
-- ════════════════════════════════════════════════════════════════════
