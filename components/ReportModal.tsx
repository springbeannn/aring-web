"use client";
import { useState } from "react";

const REASONS = [
  "부적절한 상품 정보",
  "허위 정보 또는 사기 의심",
  "중복 등록 상품",
  "저작권 또는 이미지 도용 의심",
  "기타",
] as const;
type Reason = typeof REASONS[number];

export function ReportModal({ itemId, reporterId, onClose, onSuccess }: {
  itemId: string; reporterId?: string | null;
  onClose: () => void; onSuccess: () => void;
}) {
  const [reason, setReason] = useState<Reason | "">("");
  const [detail, setDetail] = useState("");
  const [sub, setSub]       = useState(false);
  const [err, setErr]       = useState("");
  const MAX = 500;
  const needDetail = reason === "기타";
  const valid = reason !== "" && (!needDetail || detail.trim().length > 0);

  async function submit() {
    if (!valid || sub) return;
    if (!reporterId) { alert("신고하려면 로그인이 필요해요."); onClose(); return; }
    setSub(true); setErr("");
    try {
      const { supabase } = await import("@/lib/supabase");
      if (!supabase) throw new Error("no supabase");
      const { error } = await supabase.from("reports").insert({
        item_id: itemId, reporter_id: reporterId,
        reason_type: reason, reason_detail: detail.trim() || null, status: "pending",
      });
      if (error) throw error;
      onSuccess();
    } catch(e) {
      console.error("[aring] report", e);
      setErr("신고 접수에 실패했어요. 다시 시도해 주세요.");
    } finally { setSub(false); }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div
        className="relative z-10 w-[calc(100%-48px)] max-w-[360px] rounded-[24px] bg-white shadow-card p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-[20px] font-bold text-aring-ink-900 text-center">상품을 신고하시겠어요?</h2>
        <p className="mt-1.5 text-[15px] lg:text-[15px] text-aring-ink-500 text-center leading-relaxed">
          신고 사유를 남겨주시면 운영자가 확인할게요.
        </p>
        <div className="mt-4 space-y-2">
          {REASONS.map(r => (
            <button key={r} onClick={() => setReason(r)}
              className={[
                "w-full text-left px-4 py-2.5 rounded-2xl border text-[15px] lg:text-[15px] font-semibold transition",
                reason === r
                  ? "border-aring-ink-900 bg-aring-ink-100 text-aring-ink-900"
                  : "border-aring-green-line bg-white text-aring-ink-700 hover:bg-aring-ink-100",
              ].join(" ")}>
              {r}
            </button>
          ))}
        </div>
        <div className="mt-3 relative">
          <textarea value={detail} onChange={e => setDetail(e.target.value.slice(0,MAX))}
            placeholder="신고 사유를 조금 더 자세히 적어주세요" rows={3}
            className="w-full px-3 py-2.5 rounded-2xl border border-aring-green-line bg-aring-ink-100 text-[15px] lg:text-[15px] text-aring-ink-900 placeholder:text-aring-ink-500 outline-none resize-none" />
          <span className="absolute bottom-2 right-3 text-[15px] lg:text-[15px] text-aring-ink-500">{detail.length}/{MAX}</span>
        </div>
        {err && <p className="mt-2 text-[12px] lg:text-[13px] text-red-400 text-center">{err}</p>}
        <div className="mt-5 flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-pill border border-aring-green-line text-[15px] lg:text-[15px] font-bold text-aring-ink-700 hover:bg-aring-ink-100 transition active:scale-95">
            취소
          </button>
          <button onClick={submit} disabled={!valid || sub}
            className="flex-1 py-3 rounded-pill bg-aring-ink-900 text-white text-[15px] lg:text-[15px] font-bold hover:opacity-90 transition active:scale-95 disabled:opacity-40">
            {sub ? "접수 중…" : "신고하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
