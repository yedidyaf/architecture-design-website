"use client";

import type { MouseEvent } from "react";

// Magnifier that opens the zoom lightbox. No circle or background: just the
// burgundy drawing, with a faint light halo plus a soft dark shadow so it
// stays readable on bright and dark photos alike. The button itself is a
// 44px tap target in a corner of the image.
export default function ZoomButton({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-label="הגדלת תמונה"
      aria-haspopup="dialog"
      onClick={(e: MouseEvent) => {
        // Never reaches the before/after block's tap-to-toggle.
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={(e) => e.stopPropagation()}
      className={`absolute flex h-11 w-11 cursor-pointer items-center justify-center text-brand [filter:drop-shadow(0_0_1.5px_rgba(255,255,255,0.9))_drop-shadow(0_1px_2px_rgba(0,0,0,0.35))] transition-[filter] hover:brightness-125 focus-visible:outline-2 focus-visible:outline-brand rounded-sm ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="M15.5 15.5L21 21" />
        <path d="M10.5 7.5v6M7.5 10.5h6" />
      </svg>
    </button>
  );
}
