-- ════════════════════════════════════════════════════════════════════
-- 007_seed_admin_account.sql — aring 관리자 계정 시드
-- ════════════════════════════════════════════════════════════════════
-- 사용자 요청: aring.admin / password1!H
-- Supabase Auth는 이메일 형식이 필수이므로 'aring.admin@aring.app' 사용.
-- 다른 도메인(예: gmail.com) 원하면 아래 두 곳의 이메일 문자열만 수정.
--
-- 사전 조건:
--   - 006_profiles_admin.sql 먼저 실행 (role/is_banned 컬럼 + RLS 정책)
--   - pgcrypto extension 활성화 (Supabase 기본 활성)
--
-- 실행 위치:
--   Supabase Dashboard → SQL Editor → 새 query → 아래 전체 붙여넣기 → Run
-- ════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_email   TEXT := 'aring.admin@aring.app';
  v_pass    TEXT := 'password1!H';
  v_nick    TEXT := 'aring 관리자';
  v_user_id uuid;
BEGIN
  -- 0) 이미 존재하는지 확인
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email LIMIT 1;

  IF v_user_id IS NULL THEN
    -- 1) auth.users 신규 생성
    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      id, instance_id, aud, role,
      email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      v_email,
      crypt(v_pass, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(), now(),
      '', '', '', ''
    );

    RAISE NOTICE '[seed] auth.users created: % (%)', v_email, v_user_id;
  ELSE
    -- 이미 존재 → 비밀번호만 갱신 (멱등성 확보)
    UPDATE auth.users
       SET encrypted_password = crypt(v_pass, gen_salt('bf')),
           email_confirmed_at = COALESCE(email_confirmed_at, now()),
           updated_at = now()
     WHERE id = v_user_id;
    RAISE NOTICE '[seed] auth.users password updated: % (%)', v_email, v_user_id;
  END IF;

  -- 2) profiles upsert (role=admin 강제)
  INSERT INTO profiles (user_id, email, nickname, provider, role, is_banned)
  VALUES (v_user_id, v_email, v_nick, 'email', 'admin', false)
  ON CONFLICT (user_id) DO UPDATE
    SET role = 'admin',
        is_banned = false,
        nickname = COALESCE(profiles.nickname, EXCLUDED.nickname);

  RAISE NOTICE '[seed] profiles upsert OK with role=admin';
END $$;

-- ════════════════════════════════════════════════════════════════════
-- 검증 (선택)
-- ════════════════════════════════════════════════════════════════════
-- SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'aring.admin@aring.app';
-- SELECT user_id, email, nickname, role, is_banned FROM profiles WHERE email = 'aring.admin@aring.app';
-- ════════════════════════════════════════════════════════════════════
