"use client";
import {useState} from "react";

// Floating notice pinned above all page content (including the contact FAB).
// Can be dismissed for the current page view; it returns on the next visit.
export default function UnderConstructionBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex justify-center px-3"
    >
      <div className="pointer-events-auto flex max-w-xl items-center gap-3 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-lg">
        <span aria-hidden="true">🚧</span>
        <p>האתר בהקמה · תוכן נוסף יעלה בקרוב…</p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="סגירת ההודעה"
          className="-me-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/20 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
