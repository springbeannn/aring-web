"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { ReportModal } from "@/components/ReportModal";
import { Toast } from "@/components/Toast";

const BackIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
  </svg>
);
const ShareIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <polyline points="16 6 12 2 8 6"/>
    <line x1="12" y1="2" x2="12" y2="15"/>
  </svg>
);
const MoreIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1.6"/>
    <circle cx="12" cy="12" r="1.6"/>
    <circle cx="12" cy="19" r="1.6"/>
  </svg>
);

export function ItemActionBar({ onBack, isOwner, itemId, itemTitle }: {
  onBack: () => void; isOwner: boolean; itemId: string; itemTitle?: string;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import("@/lib/supabase").then(({ supabase }) => {
      if (!supabase) return;
      supabase.auth.getSession().then(({ data }) =>
        setCurrentUserId(data.session?.user?.id ?? null)
      );
    });
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    window.addEventListener("mousedown", h);
    return () => window.removeEventListener("mousedown", h);
  }, [menuOpen]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false); setShowDelete(false); setShowReport(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = (showDelete || showReport) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showDelete, showReport]);

  async function handleShare() {
    const url = window.location.href;
    const shareData = {
      title: itemTitle ?? "aring - 한 짝의 짝을 찾다",
      text: "aring에서 한 짝을 찾고 있어요!",
      url,
    };
    try {
      if (typeof navigator.share === "function" && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(url);
      setToast("링크가 복사되었어요");
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setToast("링크가 복사되었어요");
      } catch {
        setToast("링크 복사에 실패했어요. 다시 시도해주세요");
      }
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      if (!supabase) throw new Error("no supabase");
      const { error } = await supabase.from("listings").delete().eq("id", itemId);
      if (error) throw error;
      setShowDelete(false);
      router.push("/my");
      router.refresh();
    } catch {
      setToast("삭제에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <button
          onClick={onBack}
          aria-label="뒤로"
          className="pointer-events-auto w-10 h-10 rounded-full glass-strong flex items-center justify-center text-aring-ink-900 active:scale-95 hover:bg-white/70 transition"
        >
          <BackIcon />
        </button>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={handleShare}
            aria-label="공유"
            className="w-10 h-10 rounded-full glass-strong flex items-center justify-center text-aring-ink-900 active:scale-95 hover:bg-white/70 transition"
          >
            <ShareIcon />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-label="더보기"
              aria-expanded={menuOpen}
              className="w-10 h-10 rounded-full glass-strong flex items-center justify-center text-aring-ink-900 active:scale-95 hover:bg-white/70 transition"
            >
              <MoreIcon />
            </button>

            {menuOpen && (
              <div className="absolute top-full right-0 mt-1.5 z-50 min-w-[156px] rounded-2xl bg-white border border-aring-green-line shadow-card overflow-hidden">
                {isOwner && (
                  <button
                    onClick={() => { setMenuOpen(false); router.push(`/items/${itemId}/edit`); }}
                    className="w-full text-left px-4 py-3 text-[13px] font-semibold text-aring-ink-900 hover:bg-aring-ink-100 transition flex items-center gap-2"
                  >
                    ✏️ 수정하기
                  </button>
                )}
                {isOwner && (
                  <button
                    onClick={() => { setMenuOpen(false); setShowDelete(true); }}
                    className="w-full text-left px-4 py-3 text-[13px] font-semibold text-red-400 hover:bg-red-50 transition flex items-center gap-2 border-t border-aring-ink-100"
                  >
                    🗑️ 삭제하기
                  </button>
                )}
                <button
                  onClick={() => { setMenuOpen(false); setShowReport(true); }}
                  className={[
                    "w-full text-left px-4 py-3 text-[13px] lg:text-[14px] font-semibold text-aring-ink-500 hover:bg-aring-ink-100 transition flex items-center gap-2",
                    isOwner ? "border-t border-aring-ink-100" : "",
                  ].join(" ")}
                >
                  🚨 신고하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDelete && (
        <DeleteConfirmModal
          onCancel={() => setShowDelete(false)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
      {showReport && (
        <ReportModal
          itemId={itemId}
          reporterId={currentUserId}
          onClose={() => setShowReport(false)}
          onSuccess={() => {
            setShowReport(false);
            setToast("신고가 접수되었어요. 운영자가 확인할게요.");
          }}
        />
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}