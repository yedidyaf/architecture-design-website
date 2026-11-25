"use client";

import { useEffect, useState, type MouseEvent } from "react";

// A bobbing arrow at the bottom of the homepage's first screen, inviting the
// visitor to scroll. It fades away for good as soon as they do. Tapping it
// moves to the next screen (the section after the one it sits in).
export default function ScrollHint() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 10) setGone(true);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const next = (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.closest("header, section")?.nextElementSibling?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <button
      type="button"
      onClick={next}
      aria-label="גלול למטה"
      aria-hidden={gone}
      tabIndex={gone ? -1 : 0}
      className={`absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full p-3 text-brand-ink/60 transition-[color,opacity] duration-500 hover:text-brand focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/40 ${
        gone ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="scroll-hint-arrow h-6 w-6">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );
}
