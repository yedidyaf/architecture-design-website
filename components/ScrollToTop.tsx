"use client";
import { useEffect, useState } from "react";

const SHOW_AFTER_PX = 400;

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    // Bottom-LEFT, physical offsets only (left/bottom — no inset-x, no
    // logical CSS), deliberately the opposite corner from ContactFab
    // (bottom-right) so the two never collide, including while the FAB's
    // menu is expanded (which opens upward from its own corner, not
    // sideways toward this one).
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="חזרה לראש העמוד"
      className={`fixed bottom-6 left-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-all duration-300 hover:bg-brand-hover sm:bottom-8 sm:left-8 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
