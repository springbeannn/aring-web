// ─────────────────────────────────────────────────────────────
// Q&A 도메인 — 타입, 카테고리, 상태 헬퍼, 스토리지 경로
// ─────────────────────────────────────────────────────────────

export type QnaCategory =
  | 'service'    // 서비스 이용
  | 'register'   // 귀걸이 등록
  | 'ai_match'   // AI 매칭
  | 'deal'       // 거래/댓글
  | 'auth'       // 회원/로그인
  | 'bug'        // 결함 등록
  | 'etc';       // 기타

export const QNA_CATEGORIES: Array<{ value: QnaCategory; label: string }> = [
  { value: 'service',   label: '서비스 이용' },
  { value: 'register',  label: '귀걸이 등록' },
  { value: 'ai_match',  label: 'AI 매칭' },
  { value: 'deal',      label: '거래/댓글' },
  { value: 'auth',      label: '회원/로그인' },
  { value: 'bug',       label: '결함 등록' },
  { value: 'etc',       label: '기타' },
];

export const QNA_CATEGORY_LABEL: Record<QnaCategory, string> = QNA_CATEGORIES.reduce(
  (acc, c) => { acc[c.value] = c.label; return acc; },
  {} as Record<QnaCategory, string>,
);

export type QnaRow = {
  id: string;
  user_id: string | null;
  nickname: string | null;
  category: QnaCategory;
  title: string;
  content: string;
  image_url: string | null;
  is_private: boolean;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
};

export type AnswerStatus = 'pending' | 'answered';

export function getAnswerStatus(row: { answer: string | null }): AnswerStatus {
  return row.answer && row.answer.trim().length > 0 ? 'answered' : 'pending';
}

export const ANSWER_STATUS_LABEL: Record<AnswerStatus, string> = {
  pending: '답변대기',
  answered: '답변완료',
};

// 'listing-photos' 버킷 재사용, 'qna/' prefix 로 격리
export const QNA_IMAGE_PREFIX = 'qna';

export function buildQnaImagePath(filename: string): string {
  const ext = (filename.split('.').pop() || 'jpg').toLowerCase();
  const rnd = Math.random().toString(36).slice(2, 10);
  return `${QNA_IMAGE_PREFIX}/${Date.now()}-${rnd}.${ext}`;
}

// TODO(admin): 관리자 권한 판별 로직 — 현재는 false 고정.
// 향후 profiles.role === 'admin' 또는 별도 admin 테이블 매핑으로 교체
export function isAdminUser(_userId: string | null | undefined): boolean {
  return false;
}

export function formatQnaDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
