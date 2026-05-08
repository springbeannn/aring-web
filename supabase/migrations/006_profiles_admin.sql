-- ════════════════════════════════════════════════════════════════════
-- 006_profiles_admin.sql — 어드민 페이지 지원
-- ════════════════════════════════════════════════════════════════════
-- profiles 테이블에 role / is_banned 컬럼을 추가하고,
-- 어드민이 모든 row를 조회/수정할 수 있도록 RLS policy를 정의합니다.
-- ════════════════════════════════════════════════════════════════════

-- 1) 컬럼 추가
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
    CHECK (role IN ('user', 'admin')),
  ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT false;

-- 2) 특정 이메일 admin 부여 (예시 — 실제 이메일로 교체 후 실행)
-- UPDATE profiles SET role = 'admin' WHERE email = 'letitdigit@gmail.com';

-- 3) RLS — admin role 검사 헬퍼 함수
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- 4) profiles RLS — 어드민은 모든 row 조회/수정 가능
DROP POLICY IF EXISTS "admin_read_all_profiles" ON profiles;
CREATE POLICY "admin_read_all_profiles"
  ON profiles FOR SELECT
  USING (is_admin() OR user_id = auth.uid());

DROP POLICY IF EXISTS "admin_update_profiles" ON profiles;
CREATE POLICY "admin_update_profiles"
  ON profiles FOR UPDATE
  USING (is_admin() OR user_id = auth.uid())
  WITH CHECK (is_admin() OR user_id = auth.uid());

-- 5) listings RLS — 어드민은 모든 row 조회/수정/삭제 가능
DROP POLICY IF EXISTS "admin_all_listings" ON listings;
CREATE POLICY "admin_all_listings"
  ON listings FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- 6) comments RLS — 어드민은 모든 row 조회/삭제 가능
DROP POLICY IF EXISTS "admin_all_comments" ON comments;
CREATE POLICY "admin_all_comments"
  ON comments FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ════════════════════════════════════════════════════════════════════
-- 적용 순서
-- ════════════════════════════════════════════════════════════════════
-- 1. Supabase 대시보드 SQL Editor에서 위 스크립트 실행
-- 2. 본인 이메일로 admin 부여 (2번 UPDATE 문 주석 해제 후 실행)
-- 3. /admin/login 으로 로그인 → /admin 진입 가능
-- ════════════════════════════════════════════════════════════════════
