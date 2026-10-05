"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";

type Testimonial = { _id: string; clientName: string; quote: string };

const ROTATE_MS = 5000;
const FADE_MS = 500;
// After a manual interaction (arrow, dot, swipe) auto-advance stays off until
// the visitor has left the carousel alone for this long.
const RESUME_AFTER_MS = 10000;
// A swipe must travel this far horizontally, and clearly more horizontally
// than vertically, so a normal scroll past the section never changes slides.
const SWIPE_MIN_PX = 40;

// Thin, low-contrast chevrons: no box, no border — just the stroke, brand
// colored at 40% and full strength on hover/keyboard focus. The button itself
// stays 40×48 so it's an easy tap target even though the icon is small.
const ARROW_CLASS =
  "flex h-12 w-10 shrink-0 items-center justify-center text-brand opacity-40 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/40 rounded-full sm:w-12";

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5 sm:h-6 sm:w-6"
    >
      <path d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [manualPause, setManualPause] = useState(false);
  const resumeTimer = useRef<number | undefined>(undefined);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const count = testimonials.length;

  useEffect(() => {
    if (count < 2 || hovered || manualPause) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [count, hovered, manualPause]);

  useEffect(() => () => window.clearTimeout(resumeTimer.current), []);

  // Every manual interaction pauses the rotation and restarts the 10s
  // countdown to resume it.
  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
      setManualPause(true);
      window.clearTimeout(resumeTimer.current);
      resumeTimer.current = window.setTimeout(() => setManualPause(false), RESUME_AFTER_MS);
    },
    [count]
  );

  if (count === 0) return null;

  // Derived, not stored: keeps the slide in range if the list shrinks after a
  // revalidate, without a second render pass.
  const active = index % count;
  const next = () => goTo(active + 1);
  const prev = () => goTo(active - 1);

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") return;
    swipeStart.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    // In RTL the next slide sits to the left, so dragging rightward reveals
    // it; in LTR it's the mirror image.
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    if (dx > 0 === rtl) next();
    else prev();
  };

  return (
    <section className="mx-auto max-w-4xl px-4 pb-24 sm:px-6 sm:pb-32">
      <h2 className="mb-8 text-center text-sm font-medium uppercase tracking-[0.2em] text-brand-ink sm:mb-12">
        מהלקוחות
      </h2>
      {/* Hovering anywhere on the carousel (quote, arrows, dots) pauses it.
          Mouse only: a tap fires an emulated enter with no matching leave,
          which would freeze the rotation on phones. */}
      <div
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
      >
        <div className="flex items-center gap-1 sm:gap-3">
          {/* RTL: the first flex child sits on the right, so "previous" is the
              right-hand chevron (pointing right) and "next" the left one. */}
          {count > 1 ? (
            <button type="button" onClick={prev} aria-label="ההמלצה הקודמת" className={ARROW_CLASS}>
              <Chevron direction="right" />
            </button>
          ) : null}

          {/* Every slide sits in the same 1x1 grid cell, so the box keeps the
              height of the longest quote and never jumps as it advances.
              touch-action: pan-y leaves vertical scrolling to the browser
              (which cancels the pointer), so only horizontal drags swipe. */}
          <div
            className="grid min-w-0 flex-1 touch-pan-y select-none sm:select-auto"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => {
              swipeStart.current = null;
            }}
          >
            {testimonials.map((t, i) => (
              <blockquote
                key={t._id}
                aria-hidden={i !== active}
                className="col-start-1 row-start-1 flex flex-col justify-center rounded-md bg-white/50 p-6 text-center shadow-sm transition-opacity ease-in-out motion-reduce:transition-none"
                style={{
                  transitionDuration: `${FADE_MS}ms`,
                  opacity: i === active ? 1 : 0,
                  pointerEvents: i === active ? "auto" : "none",
                }}
              >
                <p className="italic leading-relaxed text-brand/75">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-4 text-xs font-normal text-brand-ink">{t.clientName}</footer>
              </blockquote>
            ))}
          </div>

          {count > 1 ? (
            <button type="button" onClick={next} aria-label="ההמלצה הבאה" className={ARROW_CLASS}>
              <Chevron direction="left" />
            </button>
          ) : null}
        </div>

        {count > 1 ? (
          <div className="mt-5 flex justify-center">
            {testimonials.map((t, i) => (
              <button
                key={t._id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`המלצה ${i + 1} מתוך ${count}`}
                aria-current={i === active ? "true" : undefined}
                className="group flex h-6 w-6 items-center justify-center focus-visible:outline-none"
              >
                <span
                  className={`block h-1.5 w-1.5 rounded-full transition-colors group-focus-visible:ring-1 group-focus-visible:ring-brand/60 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background ${
                    i === active ? "bg-brand" : "bg-brand-ink/20 group-hover:bg-brand-ink/40"
                  }`}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
