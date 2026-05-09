"use client";
export function DeleteConfirmModal({ onCancel, onConfirm, isDeleting = false }: {
  onCancel: () => void; onConfirm: () => void; isDeleting?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div
        className="relative z-10 w-[calc(100%-48px)] max-w-[320px] rounded-[24px] bg-white shadow-card p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-[17px] font-bold text-aring-ink-900 text-center">정말 삭제하시겠어요?</h2>
        <p className="mt-2 text-[13px] lg:text-[15px] leading-[1.5] text-aring-ink-500 text-center leading-relaxed">
          삭제한 상품은 다시 복구할 수 없어요.
        </p>
        <div className="mt-6 flex gap-2">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-pill border border-aring-green-line text-[13px] lg:text-[15px] font-bold text-aring-ink-700 hover:bg-aring-ink-100 transition active:scale-95">
            취소
          </button>
          <button onClick={onConfirm} disabled={isDeleting}
            className="flex-1 py-3 rounded-pill bg-red-400 text-white text-[13px] lg:text-[15px] font-bold hover:bg-red-500 transition active:scale-95 disabled:opacity-50">
            {isDeleting ? "삭제 중…" : "삭제하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
