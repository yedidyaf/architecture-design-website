"use client";
import { useEffect, useState } from "react";

const SHOW_AFTER_PX = 400;

type Props = {
  /**
   * "article" raises the button toward the viewport's vertical middle and,
   * on desktop (lg+), anchors it just outside the article's own centered
   * 65ch content column instead of the far viewport edge. Below lg (and
   * always for "default") it's the same subtle bottom-left corner position.
   */
  variant?: "default" | "article";
};

export default function ScrollToTop({ variant = "default" }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    // Bottom-LEFT, physical offsets only (left/bottom — no inset-x, no
    // logical CSS), the opposite corner from ContactFab (bottom-right) so
    // the two never collide. On the article page at lg+, `left` is instead
    // computed from the content column's own edge (min(65ch, 100vw-3rem) is
    // exactly how that column's width resolves), so the button sits near
    // the article rather than pinned to the far viewport edge on wide
    // screens; `top`/`translate-y` replace `bottom` there to float it
    // toward the vertical middle instead of the very bottom.
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="חזרה לראש העמוד"
      className={`fixed z-40 flex h-11 w-11 items-center justify-center rounded-full bg-brand/55 text-white shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-brand/75 left-6 bottom-6 sm:left-8 sm:bottom-8 ${
        variant === "article"
          ? "lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:left-[calc(50%_-_min(65ch,100vw_-_3rem)/2_-_4rem)]"
          : ""
      } ${
        visible
          ? "pointer-events-auto scale-100 opacity-100"
          : "pointer-events-none scale-90 opacity-0"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 drop-shadow-sm"
      >
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
