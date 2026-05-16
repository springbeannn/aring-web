-- ════════════════════════════════════════════════════════════════════
-- 011_page_views.sql — PV/UV 추적 테이블
-- ════════════════════════════════════════════════════════════════════
-- 클라이언트 PageViewTracker가 라우트 변경 시마다 /api/track 으로
-- 페이지뷰를 기록한다.
--   PV = page_views row 개수
--   UV = distinct session_id 개수 (cookie `aring_sid` 기준, 365일)
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.page_views (
  id          BIGSERIAL PRIMARY KEY,
  path        TEXT NOT NULL,
  session_id  TEXT NOT NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referrer    TEXT,
  ua          TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS page_views_created_at_idx
  ON public.page_views (created_at DESC);

CREATE INDEX IF NOT EXISTS page_views_session_id_idx
  ON public.page_views (session_id);

CREATE INDEX IF NOT EXISTS page_views_created_session_idx
  ON public.page_views (created_at, session_id);

-- RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- 누구나 INSERT 가능 (anon 포함) — 트래커가 동작하려면 필수
DROP POLICY IF EXISTS "anyone_insert_page_views" ON public.page_views;
CREATE POLICY "anyone_insert_page_views"
  ON public.page_views FOR INSERT
  WITH CHECK (true);

-- SELECT는 admin만
DROP POLICY IF EXISTS "admin_read_page_views" ON public.page_views;
CREATE POLICY "admin_read_page_views"
  ON public.page_views FOR SELECT
  USING (is_admin());

-- ════════════════════════════════════════════════════════════════════
-- 일별 PV/UV 집계 함수 — 대시보드에서 단일 RPC 호출로 사용
-- ════════════════════════════════════════════════════════════════════
-- SECURITY DEFINER + JWT claim 직접 파싱:
--   - is_admin() helper는 PostgREST RPC 컨텍스트에서 auth.uid()가 NULL로
--     떨어지는 케이스가 있어 함수 내부에서 직접 JWT sub claim을 파싱하여
--     profiles.role을 검증한다.
--   - search_path를 명시적으로 고정해 SECURITY DEFINER 함수의 안전성 확보.
--   - 비-admin이 호출 → RAISE EXCEPTION → 클라이언트에 명시적 에러로 노출.
-- ════════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS public.page_views_daily(timestamptz, timestamptz);

CREATE FUNCTION public.page_views_daily(
  range_start timestamptz,
  range_end   timestamptz
)
RETURNS TABLE (
  day timestamptz,
  pv  bigint,
  uv  bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, auth, pg_temp
AS $func$
DECLARE
  uid uuid;
  caller_role text;
BEGIN
  uid := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  IF uid IS NULL THEN
    RAISE EXCEPTION 'unauthorized: no jwt sub claim';
  END IF;

  SELECT p.role INTO caller_role FROM public.profiles p WHERE p.user_id = uid;
  IF caller_role IS NULL OR caller_role <> 'admin' THEN
    RAISE EXCEPTION 'unauthorized: not admin (uid=%, role=%)', uid, caller_role;
  END IF;

  RETURN QUERY
    SELECT
      (date_trunc('day', v.created_at AT TIME ZONE 'Asia/Seoul') AT TIME ZONE 'Asia/Seoul'),
      COUNT(*)::bigint,
      COUNT(DISTINCT v.session_id)::bigint
    FROM public.page_views v
    WHERE v.created_at >= range_start
      AND v.created_at <  range_end
    GROUP BY 1
    ORDER BY 1;
END;
$func$;

GRANT EXECUTE ON FUNCTION public.page_views_daily(timestamptz, timestamptz) TO authenticated;

-- ════════════════════════════════════════════════════════════════════
-- 적용 순서
-- ════════════════════════════════════════════════════════════════════
-- 1. Supabase 대시보드 SQL Editor에서 위 스크립트 실행
-- 2. /api/track 이 동작하면 자동으로 row 누적
-- ════════════════════════════════════════════════════════════════════
