"use client";

import type { MouseEvent } from "react";

// "Scroll" cue at the bottom of the homepage's first screen. Tapping it moves
// to the next screen (the section after the one it sits in).
export default function ScrollHint() {
  const next = (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.closest("header, section")?.nextElementSibling?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <button
      type="button"
      onClick={next}
      className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 rounded-full px-4 py-2 text-sm text-brand-ink/60 transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/40"
    >
      גלול
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="scroll-hint-arrow h-5 w-5">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );
}
