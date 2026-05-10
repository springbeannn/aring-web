"use client";
import { useEffect, useState } from "react";

export function Toast({ message, duration = 2000, onClose }: {
  message: string; duration?: number; onClose: () => void;
}) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onClose, 300); }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);
  return (
    <div className={[
      "fixed bottom-24 left-1/2 -translate-x-1/2 z-[200]",
      "px-4 py-2.5 rounded-pill bg-aring-ink-900 text-white text-[15px] lg:text-[15px] font-semibold",
      "shadow-card pointer-events-none transition-all duration-300",
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
    ].join(" ")}>
      {message}
    </div>
  );
}
