// ─────────────────────────────────────────────────────────────
// 운영자 알림 클라이언트 헬퍼
// 사용법
//   import { notifyAdmin } from '@/lib/notifyAdmin';
//   await notifyAdmin('signup_error', '회원가입 실패', { email, error });
// ─────────────────────────────────────────────────────────────

export type NotifyKind = 'signup_error' | 'register_error' | 'custom';

export async function notifyAdmin(
  kind: NotifyKind,
  message: string,
  context?: Record<string, unknown>,
): Promise<void> {
  // 실패해도 사용자 흐름에 영향 주지 않도록 fire-and-forget + 에러 무시
  try {
    await fetch('/api/notify-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, message, context }),
      // keepalive로 페이지 이동/언로드 중에도 전송 보장
      keepalive: true,
    });
  } catch {
    /* noop — 알림 실패는 사용자에게 노출하지 않음 */
  }
}
