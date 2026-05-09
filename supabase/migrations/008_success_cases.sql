-- ════════════════════════════════════════════════════════════════════
-- 008_success_cases.sql — 매칭 성공 사례 게시판
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS success_cases (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE NOT NULL,
  title         text NOT NULL,
  summary       text NOT NULL,                -- 150자 이내 요약 (AEO 핵심)
  content       text NOT NULL,                -- Markdown 본문
  category      text,                         -- '패션' | '뷰티' | 'F&B' | '라이프스타일' 등
  thumbnail_url text,
  tags          text[] DEFAULT '{}',
  is_featured   boolean NOT NULL DEFAULT false,
  published     boolean NOT NULL DEFAULT false,
  published_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 공개된 사례 정렬용 부분 인덱스
CREATE INDEX IF NOT EXISTS idx_success_cases_published
  ON success_cases (published_at DESC)
  WHERE published = true;

-- 카테고리별 필터용 인덱스
CREATE INDEX IF NOT EXISTS idx_success_cases_category
  ON success_cases (category)
  WHERE published = true;

-- ─── RLS ───────────────────────────────────────────────────
ALTER TABLE success_cases ENABLE ROW LEVEL SECURITY;

-- 공개된 사례는 누구나 읽기 가능
DROP POLICY IF EXISTS "Public read published cases" ON success_cases;
CREATE POLICY "Public read published cases"
  ON success_cases FOR SELECT
  USING (published = true);

-- 어드민은 모든 row 쓰기/읽기 가능 (006_profiles_admin.sql 의 is_admin() 의존)
DROP POLICY IF EXISTS "admin_all_success_cases" ON success_cases;
CREATE POLICY "admin_all_success_cases"
  ON success_cases FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ────────────────────────────────────────────────────────────
-- 적용 순서
--   1. 006_profiles_admin.sql 먼저 적용
--   2. 본 파일 적용
--   3. (선택) 샘플 데이터 INSERT
-- ────────────────────────────────────────────────────────────
