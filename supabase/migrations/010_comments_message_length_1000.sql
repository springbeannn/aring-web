-- ════════════════════════════════════════════════════════════════════
-- 010_comments_message_length_1000.sql — 댓글 message 길이 한도 1000자 확장
-- ════════════════════════════════════════════════════════════════════
-- 기존 comments_message_check: length(message) BETWEEN 1 AND 500
-- UI 카운터(1000/1000)와 불일치하여 500자 초과 입력 시 등록 실패
-- → DB 한도를 UI와 동일한 1000자로 확장
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE public.comments
  DROP CONSTRAINT IF EXISTS comments_message_check;

ALTER TABLE public.comments
  ADD CONSTRAINT comments_message_check
  CHECK (length(message) >= 1 AND length(message) <= 1000);
