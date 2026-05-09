-- ════════════════════════════════════════════════════════════════════
-- 009_profiles_marketing_agreed.sql — 마케팅 수신 동의 컬럼
-- ════════════════════════════════════════════════════════════════════
-- 회원가입 시 마케팅 정보 수신 동의 여부 + 동의 시각 저장
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS marketing_agreed    boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_agreed_at timestamptz;

-- 동의 철회 시 NULL 처리, 동의 시 now() 기록 (애플리케이션 측에서 set)
COMMENT ON COLUMN profiles.marketing_agreed    IS '마케팅 정보 수신 동의 여부';
COMMENT ON COLUMN profiles.marketing_agreed_at IS '마케팅 동의 시각 (철회 시 NULL)';
