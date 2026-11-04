"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ARROW_LEFT } from "@/components/home/layout";
import { SITE_FOOTER_ID } from "@/lib/site";

const SHOW_AFTER_PX = 400;
// Clear space kept between the button and the footer's top edge when lifted.
const FOOTER_GAP_PX = 16;

type Props = {
  /**
   * "article" raises the button toward the viewport's vertical middle and,
   * on desktop (lg+), anchors it just outside the article's own centered
   * 65ch content column instead of the far viewport edge. Below lg (and
   * always for "default") it's the same subtle bottom-left corner position.
   */
  /**
   * "home" (desktop, >= 900px) moves the button inboard to the homepage's
   * left gutter: vertically centered, in the gap between the projects column
   * and the text (HomeView keeps that gap free). Mobile is unchanged.
   */
  variant?: "default" | "article" | "home";
};

// Tailwind sorts these px-based min-[...] variants before the rem-based sm,
// so on the homepage sm is capped below 900px or it would win.
const POSITION_CLASS = {
  default: "left-6 bottom-6 sm:left-8 sm:bottom-8",
  article:
    "left-6 bottom-6 sm:left-8 sm:bottom-8 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:left-[calc(50%_-_min(65ch,100vw_-_3rem)/2_-_4rem)]",
  home:
    "left-6 bottom-6 sm:max-[900px]:left-8 sm:max-[900px]:bottom-8 min-[900px]:bottom-auto min-[900px]:top-1/2 min-[900px]:-translate-y-1/2 min-[900px]:left-[var(--home-left)]",
};

export default function ScrollToTop({ variant = "default" }: Props) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Unlike ContactFab (which hides over the footer), this button stays
    // usable at the bottom of the page: it is lifted by exactly as much as
    // the footer would otherwise cover it, so it rests just above the footer.
    // The lift is a pure function of scroll position, so it tracks the footer
    // 1:1 while scrolling (no lag, no jump) and eases back down on its own.
    // Written straight to the element's style to avoid a re-render per frame.
    let lift = 0;
    let frame = 0;
    const update = () => {
      frame = 0;
      setVisible(window.scrollY > SHOW_AFTER_PX);
      const el = ref.current;
      const footer = document.getElementById(SITE_FOOTER_ID);
      if (!el || !footer) return;
      // Button bottom edge with no lift applied.
      const restBottom = el.getBoundingClientRect().bottom + lift;
      const footerTop = footer.getBoundingClientRect().top;
      lift = Math.max(0, restBottom - (footerTop - FOOTER_GAP_PX));
      el.style.transform = lift ? `translateY(${-lift}px)` : "";
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
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
      ref={ref}
      inert={!visible}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="חזרה לראש העמוד"
      style={
        variant === "home"
          ? ({ "--home-left": ARROW_LEFT } as CSSProperties)
          : undefined
      }
      className={`fixed z-40 flex h-11 w-11 items-center justify-center text-brand/45 transition-[opacity,scale,color] duration-300 hover:text-brand focus-visible:text-brand focus-visible:outline-none ${POSITION_CLASS[variant]} ${
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
        className="h-6 w-6"
      >
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
