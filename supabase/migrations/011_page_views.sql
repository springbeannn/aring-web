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
-- 시그니처: (caller_id uuid, range_start timestamptz, range_end timestamptz)
--
-- PostgREST가 publishable key(sb_publishable_*) 환경에서 RPC 컨텍스트의
-- request.jwt.claim.* GUC를 빈 값으로 두는 케이스가 있어 함수 내부에서
-- auth.uid()를 신뢰할 수 없다. 그래서 caller_id를 인자로 받아 검증한다.
--
-- 보안: 서버 라우트(/api/admin/traffic)가 supabase.auth.getUser()로 검증한
-- user.id만을 caller_id로 넘긴다. 함수 내부에서도 다시 profiles.role을
-- 확인하므로 임의의 user_id로 호출해도 admin이 아니면 차단된다.
-- ════════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS public.page_views_daily(timestamptz, timestamptz);
DROP FUNCTION IF EXISTS public.page_views_daily(uuid, timestamptz, timestamptz);

CREATE FUNCTION public.page_views_daily(
  caller_id   uuid,
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
  caller_role text;
BEGIN
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'caller_id is required';
  END IF;

  SELECT p.role INTO caller_role FROM public.profiles p WHERE p.user_id = caller_id;
  IF caller_role IS NULL OR caller_role <> 'admin' THEN
    RAISE EXCEPTION 'unauthorized: not admin (caller_id=%, role=%)', caller_id, caller_role;
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

GRANT EXECUTE ON FUNCTION public.page_views_daily(uuid, timestamptz, timestamptz) TO authenticated;

-- ════════════════════════════════════════════════════════════════════
-- 적용 순서
-- ════════════════════════════════════════════════════════════════════
-- 1. Supabase 대시보드 SQL Editor에서 위 스크립트 실행
-- 2. /api/track 이 동작하면 자동으로 row 누적
-- ════════════════════════════════════════════════════════════════════
