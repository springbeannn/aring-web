-- ════════════════════════════════════════════════════════════════════
-- 007_seed_admin_account.sql — aring 관리자 계정 시드
-- ════════════════════════════════════════════════════════════════════
-- 사용자 요청: letitdigit@gmail.com / password1!H
--
-- 멱등성:
--   - 이미 가입된 계정이면 → 비밀번호 갱신 + role='admin' 강제
--   - 미가입 계정이면 → auth.users + profiles 신규 생성
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
  v_email   TEXT := 'letitdigit@gmail.com';
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
    -- 이미 존재 → 비밀번호 갱신 + 이메일 인증 보강 (멱등성)
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
-- SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'letitdigit@gmail.com';
-- SELECT user_id, email, nickname, role, is_banned FROM profiles WHERE email = 'letitdigit@gmail.com';
-- ════════════════════════════════════════════════════════════════════
