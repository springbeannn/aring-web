'use client';

import { useEffect, useState } from 'react';
import { supabase, type Comment, type CommentRole } from '@/lib/supabase';

// ─────────────────────────────────────────────────────────────
// CommentSection — 거래 전 공개 문의 (채팅 아님)
// - 익명 user_id를 localStorage에 저장하여 본인 식별
// - 상품 등록자 = seller / 그 외 = buyer 자동 판정
// - 1단 답글 (parent_id), inline 수정, 삭제 미지원
// ─────────────────────────────────────────────────────────────

const ANON_ID_KEY = 'aring_anon_user_id';
const ANON_NICK_KEY = 'aring_anon_nickname';

function getOrCreateAnonId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(ANON_ID_KEY);
  if (!id) {
    id = (crypto.randomUUID && crypto.randomUUID()) || fallbackUuid();
    localStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}

function fallbackUuid(): string {
  // crypto.randomUUID 미지원 환경 폴백
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function relativeTime(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 0) return '방금 전';
    const min = Math.floor(diff / 60000);
    if (min < 1) return '방금 전';
    if (min < 60) return min + '분 전';
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr + '시간 전';
    const day = Math.floor(hr / 24);
    if (day < 7) return day + '일 전';
    const week = Math.floor(day / 7);
    if (day < 30) return week + '주 전';
    const month = Math.floor(day / 30);
    if (day < 365) return month + '개월 전';
    return Math.floor(day / 365) + '년 전';
  } catch {
    return '방금 전';
  }
}

// ─────────────────────────────────────────────────────────────
export function CommentSection({
  productId,
  ownerId,
}: {
  productId: string;
  ownerId: string | null;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentUserId, setCurrentUserId] = useState('');
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState('');

  // 익명 user_id + 닉네임 캐시
  useEffect(() => {
    setCurrentUserId(getOrCreateAnonId());
    const cached = localStorage.getItem(ANON_NICK_KEY);
    setNickname(cached && cached.trim() ? cached.trim() : 'aring 사용자');
  }, []);

  // 댓글 fetch
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: true });
      if (cancelled) return;
      if (error) {
        console.error('[aring] comments load error', error);
        setError('댓글을 불러오지 못했습니다');
        setLoading(false);
        return;
      }
      setComments((data ?? []) as Comment[]);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function submit() {
    if (!supabase) {
      alert('Supabase 연결이 필요합니다');
      return;
    }
    const trimmedNick = nickname.trim() || 'aring 사용자';
    const trimmedMsg = message.trim();
    if (!trimmedNick || !trimmedMsg || submitting) return;

    setSubmitting(true);
    const role: CommentRole =
      ownerId && currentUserId === ownerId ? 'seller' : 'buyer';

    const { data, error } = await supabase
      .from('comments')
      .insert({
        product_id: productId,
        user_id: currentUserId,
        user_name: trimmedNick,
        role,
        message: trimmedMsg,
        parent_id: replyTo,
      })
      .select()
      .single();

    setSubmitting(false);
    if (error || !data) {
      console.error('[aring] comment insert error', error);
      alert('등록에 실패했습니다');
      return;
    }
    setComments((prev) => [...prev, data as Comment]);
    setMessage('');
    setReplyTo(null);
    localStorage.setItem(ANON_NICK_KEY, trimmedNick);
  }

  async function saveEdit(id: string) {
    if (!supabase) return;
    const trimmed = editingMessage.trim();
    if (!trimmed) return;

    const { error } = await supabase
      .from('comments')
      .update({ message: trimmed })
      .eq('id', id)
      .eq('user_id', currentUserId); // 본인 댓글만

    if (error) {
      console.error('[aring] comment update error', error);
      alert('수정에 실패했습니다');
      return;
    }
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, message: trimmed, updated_at: new Date().toISOString() }
          : c
      )
    );
    setEditingId(null);
    setEditingMessage('');
  }

  // 트리 분리 — root + replies(parent_id별)
  const roots = comments.filter((c) => !c.parent_id);
  const repliesByParent: Record<string, Comment[]> = {};
  for (const c of comments) {
    if (c.parent_id) {
      (repliesByParent[c.parent_id] ||= []).push(c);
    }
  }

  return (
    <section className="mt-7">
      {/* 헤더 */}
      <div className="px-5 lg:px-8 mb-3">
        <h2 className="text-[16px] lg:text-[18px] font-extrabold tracking-tight text-aring-ink-900">
          문의 댓글
        </h2>
        <p className="mt-0.5 text-[11.5px] text-aring-ink-500">
          이 상품에 대해 궁금한 점을 남겨보세요
        </p>
      </div>

      {/* 입력 폼 */}
      <div className="mx-5 lg:mx-8 rounded-tile border border-aring-green-line bg-white p-3 mb-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            replyTo
              ? '답글을 입력하세요'
              : '거래·상태·매칭 관련 문의를 남겨보세요'
          }
          rows={3}
          maxLength={500}
          className="w-full px-3 py-2 rounded-tile bg-aring-ink-100 text-[13px] text-aring-ink-900 placeholder:text-aring-ink-500 outline-none resize-none"
        />
        <div className="mt-2 flex items-center gap-2">
          {replyTo && (
            <button
              onClick={() => setReplyTo(null)}
              className="text-[11px] font-semibold text-aring-ink-500 hover:text-aring-ink-900"
            >
              답글 취소
            </button>
          )}
          <span className="text-[10.5px] text-aring-ink-500 ml-auto">
            {message.length}/500
          </span>
          <button
            onClick={submit}
            disabled={!nickname.trim() || !message.trim() || submitting}
            className="inline-flex items-center justify-center px-4 py-2 rounded-pill bg-aring-ink-900 text-white text-[12px] font-extrabold disabled:opacity-40 active:scale-95 transition"
          >
            {submitting ? '등록 중…' : replyTo ? '답글 등록' : '문의 등록'}
          </button>
        </div>
      </div>

      {/* 리스트 */}
      <div className="px-5 lg:px-8">
        {loading ? (
          <p className="text-center py-6 text-[12px] text-aring-ink-500">
            불러오는 중…
          </p>
        ) : error ? (
          <p className="text-center py-6 text-[12px] text-aring-ink-500">
            {error}
          </p>
        ) : roots.length === 0 ? (
          <p className="text-center py-6 text-[12px] text-aring-ink-500">
            아직 문의가 없어요. 첫 문의를 남겨보세요.
          </p>
        ) : (
          <div className="space-y-3">
            {roots.map((c) => (
              <CommentItem
                key={c.id}
                comment={c}
                replies={repliesByParent[c.id] ?? []}
                currentUserId={currentUserId}
                editingId={editingId}
                editingMessage={editingMessage}
                replyTo={replyTo}
                onStartEdit={(id, msg) => {
                  setEditingId(id);
                  setEditingMessage(msg);
                }}
                onCancelEdit={() => {
                  setEditingId(null);
                  setEditingMessage('');
                }}
                onSaveEdit={saveEdit}
                onChangeEdit={setEditingMessage}
                onReply={(id) => setReplyTo(id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// CommentItem — 댓글 1개 + 답글들
// ─────────────────────────────────────────────────────────────
function CommentItem({
  comment,
  replies,
  currentUserId,
  editingId,
  editingMessage,
  replyTo,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onChangeEdit,
  onReply,
  isReply = false,
}: {
  comment: Comment;
  replies: Comment[];
  currentUserId: string;
  editingId: string | null;
  editingMessage: string;
  replyTo: string | null;
  onStartEdit: (id: string, msg: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string) => void;
  onChangeEdit: (v: string) => void;
  onReply: (id: string) => void;
  isReply?: boolean;
}) {
  const isMine = !!currentUserId && comment.user_id === currentUserId;
  const isEditing = editingId === comment.id;
  const wasEdited =
    new Date(comment.updated_at).getTime() -
      new Date(comment.created_at).getTime() >
    1000;

  const isSeller = comment.role === 'seller';

  return (
    <div>
      <div
        className={[
          'rounded-tile border p-3',
          isSeller
            ? 'border-aring-ink-900/15 bg-aring-pastel-pink/20'
            : 'border-aring-green-line bg-white',
        ].join(' ')}
      >
        {/* 헤더: 닉네임 + 판매자 뱃지 + 시각 */}
        <div className="flex items-center gap-1.5">
          <p className="text-[12.5px] font-bold text-aring-ink-900 truncate">
            {comment.user_name}
          </p>
          {isSeller && (
            <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-pill bg-aring-ink-900 text-white text-[9.5px] font-extrabold tracking-wider">
              {isReply ? '판매자 답글' : '판매자'}
            </span>
          )}
          <span className="ml-auto shrink-0 text-[10.5px] text-aring-ink-500">
            {relativeTime(comment.created_at)}
            {wasEdited && ' · 수정됨'}
          </span>
        </div>

        {/* 본문 또는 inline edit */}
        {isEditing ? (
          <div className="mt-2">
            <textarea
              value={editingMessage}
              onChange={(e) => onChangeEdit(e.target.value)}
              rows={2}
              maxLength={500}
              autoFocus
              className="w-full px-3 py-2 rounded-tile bg-aring-ink-100 text-[13px] text-aring-ink-900 outline-none resize-none"
            />
            <div className="mt-1.5 flex items-center justify-end gap-2">
              <button
                onClick={onCancelEdit}
                className="text-[11px] font-semibold text-aring-ink-500 px-2 py-1"
              >
                취소
              </button>
              <button
                onClick={() => onSaveEdit(comment.id)}
                disabled={!editingMessage.trim()}
                className="text-[11px] font-extrabold text-white bg-aring-ink-900 px-3 py-1 rounded-pill disabled:opacity-40"
              >
                저장
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1.5 text-[13px] leading-relaxed text-aring-ink-900 whitespace-pre-wrap break-words">
            {comment.message}
          </p>
        )}

        {/* 액션 — 답글 / 수정 */}
        {!isEditing && (
          <div className="mt-2 flex items-center gap-3">
            {!isReply && (
              <button
                onClick={() => onReply(comment.id)}
                className="text-[11px] font-semibold text-aring-ink-500 hover:text-aring-ink-900 transition"
              >
                {replyTo === comment.id ? '답글 작성 중…' : '답글'}
              </button>
            )}
            {isMine && (
              <button
                onClick={() => onStartEdit(comment.id, comment.message)}
                className="text-[11px] font-semibold text-aring-ink-500 hover:text-aring-ink-900 transition"
              >
                수정
              </button>
            )}
          </div>
        )}
      </div>

      {/* 답글들 — 들여쓰기 */}
      {replies.length > 0 && (
        <div className="mt-2 ml-4 lg:ml-6 space-y-2 border-l-2 border-aring-ink-100 pl-3">
          {replies.map((r) => (
            <CommentItem
              key={r.id}
              comment={r}
              replies={[]} // 1단 답글까지만
              currentUserId={currentUserId}
              editingId={editingId}
              editingMessage={editingMessage}
              replyTo={replyTo}
              onStartEdit={onStartEdit}
              onCancelEdit={onCancelEdit}
              onSaveEdit={onSaveEdit}
              onChangeEdit={onChangeEdit}
              onReply={onReply}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}
