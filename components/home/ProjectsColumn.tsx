"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type FocusEvent, type MouseEvent, type PointerEvent } from "react";
import ProjectCover from "./ProjectCover";
import { FRAME_ROOM, PROJECT_TILE_WIDTH, tileWidth } from "./layout";
import type { HomeProject } from "./types";

// Upward drift of the column, in px per second.
const AUTO_SPEED = 18;
// Speed while an arrow button is held down, in px per second.
const NUDGE_SPEED = 320;
// One keyboard press (Enter / Space) on an arrow moves this far.
const NUDGE_STEP = 160;

function Arrow({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path d={direction === "up" ? "M5 15l7-7 7 7" : "M5 9l7 7 7-7"} />
    </svg>
  );
}

const ARROW_CLASS =
  "flex h-10 w-12 shrink-0 cursor-pointer items-center justify-center self-center rounded-full text-brand opacity-50 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/40 select-none touch-none";

// Desktop-only column of project tiles that drifts slowly upward in an
// endless loop. The list is rendered several times back to back and the
// offset wraps at the height of one copy, so the seam is never visible.
// Hover pauses the drift; the wheel and the arrow buttons move it by hand.
export default function ProjectsColumn({ projects }: { projects: HomeProject[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const period = useRef(0);
  const paused = useRef(false);
  const nudge = useRef(0);
  // Enough copies that the visible area is always covered, plus one so a
  // full period can scroll by. Two is the minimum (the original + a twin).
  const [copies, setCopies] = useState(2);

  const apply = () => {
    const p = period.current;
    if (p > 0) offset.current = ((offset.current % p) + p) % p;
    if (trackRef.current) trackRef.current.style.transform = `translate3d(0, ${-offset.current}px, 0)`;
  };

  // Measure one copy of the list and the visible area; recount the copies.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const copy = copyRef.current;
    if (!viewport || !copy) return;
    const measure = () => {
      period.current = copy.offsetHeight;
      if (period.current > 0) {
        setCopies(Math.max(2, Math.ceil(viewport.clientHeight / period.current) + 1));
      }
      apply();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    ro.observe(copy);
    return () => ro.disconnect();
  }, [projects]);

  // Animation loop: auto drift (unless paused or reduced motion) + arrow nudge.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      // Clamp the step so a backgrounded tab doesn't jump on return.
      const dt = Math.min(now - last, 64) / 1000;
      last = now;
      let delta = nudge.current * NUDGE_SPEED * dt;
      if (!paused.current && !reduce.matches && nudge.current === 0) delta += AUTO_SPEED * dt;
      if (delta !== 0) {
        offset.current += delta;
        apply();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Wheel scrolls the column by hand. Non-passive so the page itself doesn't
  // scroll while the pointer is over the column.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const scale = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? viewport.clientHeight : 1;
      offset.current += e.deltaY * scale;
      apply();
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, []);

  if (projects.length === 0) {
    return <p className="m-auto px-4 text-center text-sm text-brand-ink/70">פרויקטים יתווספו בקרוב</p>;
  }

  // Keyboard focus on a tile: stop drifting and bring that tile into view.
  // The browser would otherwise scroll the clipped viewport itself, which
  // fights the transform-based offset.
  const onFocus = (e: FocusEvent<HTMLDivElement>) => {
    paused.current = true;
    const viewport = viewportRef.current;
    const target = e.target as HTMLElement;
    if (!viewport || !target.matches("a")) return;
    viewport.scrollTop = 0;
    offset.current = target.offsetTop - 24;
    apply();
  };

  // Arrow buttons carry their direction in data-dir. Up = back toward
  // earlier tiles (content moves down); down = onward.
  const dirOf = (e: { currentTarget: HTMLElement }) => Number(e.currentTarget.dataset.dir);
  const startNudge = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    nudge.current = dirOf(e);
  };
  const stopNudge = () => {
    nudge.current = 0;
  };
  // Keyboard activation (detail 0) moves one step; pointer presses are
  // handled by the hold above.
  const stepNudge = (e: MouseEvent<HTMLButtonElement>) => {
    if (e.detail !== 0) return;
    offset.current += dirOf(e) * NUDGE_STEP;
    apply();
  };
  const arrowProps = {
    onPointerDown: startNudge,
    onPointerUp: stopNudge,
    onPointerCancel: stopNudge,
    onLostPointerCapture: stopNudge,
    onClick: stepNudge,
  };

  return (
    <div
      className="pointer-events-auto flex h-full flex-col py-3"
      // 100% = the projects region of the gutter (the aside's content box).
      style={{ width: `calc(${tileWidth("100%")} + ${2 * FRAME_ROOM}px)` }}
      onPointerEnter={(e) => e.pointerType === "mouse" && (paused.current = true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && (paused.current = false)}
      onFocus={onFocus}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) paused.current = false;
      }}
    >
      <button type="button" aria-label="גלול למעלה" className={ARROW_CLASS} data-dir="-1" {...arrowProps}>
        <Arrow direction="up" />
      </button>

      <div
        ref={viewportRef}
        className="relative min-h-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]"
      >
        <div ref={trackRef} className="will-change-transform">
          {Array.from({ length: copies }, (_, c) => (
            <div
              key={c}
              ref={c === 0 ? copyRef : undefined}
              aria-hidden={c > 0 || undefined}
              style={{ paddingInline: FRAME_ROOM }}
            >
              {projects.map((p) => (
                <Link
                  key={p._id}
                  href={`/projects/${p.slug}`}
                  tabIndex={c > 0 ? -1 : undefined}
                  className="group block w-full py-7 focus-visible:outline-none"
                >
                  {/* Double sketched frame: ::before / ::after (globals.css). */}
                  <div className="sketch-frame relative">
                    <ProjectCover
                      src={p.coverSrc}
                      fit={p.coverFit}
                      position={p.coverPosition}
                      alt={c > 0 ? "" : p.title}
                      sizes={`${PROJECT_TILE_WIDTH}px`}
                      className="group-focus-visible:ring-2 group-focus-visible:ring-brand/50"
                    />
                  </div>
                  <p className="mt-2.5 text-center text-sm font-medium leading-snug text-brand-ink transition-colors group-hover:text-brand">
                    {p.title}
                  </p>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <button type="button" aria-label="גלול למטה" className={ARROW_CLASS} data-dir="1" {...arrowProps}>
        <Arrow direction="down" />
      </button>
    </div>
  );
}
