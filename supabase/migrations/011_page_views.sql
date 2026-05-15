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

DROP FUNCTION IF EXISTS public.page_views_daily(timestamptz, timestamptz);
CREATE FUNCTION public.page_views_daily(
  range_start TIMESTAMPTZ,
  range_end   TIMESTAMPTZ
)
RETURNS TABLE (
  day TIMESTAMPTZ,
  pv  BIGINT,
  uv  BIGINT
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT
    date_trunc('day', created_at AT TIME ZONE 'Asia/Seoul') AT TIME ZONE 'Asia/Seoul' AS day,
    COUNT(*)::BIGINT                     AS pv,
    COUNT(DISTINCT session_id)::BIGINT   AS uv
  FROM public.page_views
  WHERE created_at >= range_start
    AND created_at <  range_end
    AND is_admin()
  GROUP BY 1
  ORDER BY 1;
$$;

-- ════════════════════════════════════════════════════════════════════
-- 적용 순서
-- ════════════════════════════════════════════════════════════════════
-- 1. Supabase 대시보드 SQL Editor에서 위 스크립트 실행
-- 2. /api/track 이 동작하면 자동으로 row 누적
-- ════════════════════════════════════════════════════════════════════
