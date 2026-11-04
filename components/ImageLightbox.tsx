"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";

export type LightboxImage = { src: string; alt: string; label?: string };
/**
 * One entry in the lightbox: a single image, or a before/after pair that the
 * visitor can swap between (`side` = the one to start on).
 */
export type LightboxItem = { images: LightboxImage[]; side?: number; caption?: string };

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const BUTTON_STEP = 1.5;
// Pointer travel (px) under which a press on the backdrop counts as a click.
const CLICK_SLOP = 6;
// A touch swipe (at 1x) this long, and clearly more horizontal than
// vertical, moves to the previous / next image.
const SWIPE_MIN_PX = 50;

// White controls with no background: a drop-shadow keeps them readable on
// both the dark backdrop and a bright photo behind it.
const WHITE_ICON =
  "flex h-11 w-11 cursor-pointer items-center justify-center text-white opacity-90 [filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.7))] transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-white/70 rounded-sm disabled:cursor-default disabled:opacity-35";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

type View = { scale: number; x: number; y: number };
const RESET: View = { scale: 1, x: 0, y: 0 };

/**
 * Full-screen zoom viewer. Wheel, pinch, double-click and the + / − buttons
 * zoom (1x–4x, around the pointer / pinch center); dragging pans while
 * zoomed. Closes on ✕, Escape, or a click on the backdrop.
 *
 * With several items, prev / next arrows, the arrow keys and a horizontal
 * swipe step through them (looping; RTL, so "next" is to the left), and
 * moving resets the zoom. A before/after item gets a text button that swaps
 * its two images, keeping the zoom. The item's caption shows at the bottom.
 */
export default function ImageLightbox({
  items,
  startIndex = 0,
  onClose,
}: {
  items: LightboxItem[];
  startIndex?: number;
  onClose: () => void;
}) {
  const [itemIndex, setItemIndex] = useState(startIndex);
  const [index, setIndex] = useState(items[startIndex]?.side ?? 0);
  const [view, setViewState] = useState<View>(RESET);
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // The latest view, readable synchronously inside one gesture event (pinch
  // pans and zooms in the same move). Always updated together with state.
  const viewRef = useRef<View>(RESET);
  const setView = useCallback((v: View) => {
    viewRef.current = v;
    setViewState(v);
  }, []);

  // Active pointers on the stage, for drag and pinch.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ dist: number; mid: { x: number; y: number } } | null>(null);
  // The current press: where it started, and whether it can still be a
  // click (not moved) or a swipe (one finger only, at 1x).
  const press = useRef<{
    x: number;
    y: number;
    onImage: boolean;
    moved: boolean;
    touch: boolean;
    atRest: boolean;
    multi: boolean;
  } | null>(null);

  // Keep the image covering the stage center: pan is limited to how far the
  // zoomed image overhangs the stage on each axis.
  const clampView = useCallback((v: View): View => {
    const img = imgRef.current;
    const stage = stageRef.current;
    if (!img || !stage) return v;
    const scale = clamp(v.scale, MIN_SCALE, MAX_SCALE);
    const maxX = Math.max(0, (img.offsetWidth * scale - stage.clientWidth) / 2);
    const maxY = Math.max(0, (img.offsetHeight * scale - stage.clientHeight) / 2);
    return { scale, x: clamp(v.x, -maxX, maxX), y: clamp(v.y, -maxY, maxY) };
  }, []);

  // Zoom to `next`, keeping the image point under (clientX, clientY) fixed.
  // Without a point, zoom around the stage center.
  const zoomTo = useCallback(
    (next: number, clientX?: number, clientY?: number) => {
      const stage = stageRef.current;
      const v = viewRef.current;
      const scale = clamp(next, MIN_SCALE, MAX_SCALE);
      if (!stage || scale === v.scale) return;
      const r = stage.getBoundingClientRect();
      const px = clientX === undefined ? 0 : clientX - (r.left + r.width / 2);
      const py = clientY === undefined ? 0 : clientY - (r.top + r.height / 2);
      const k = scale / v.scale;
      setView(clampView({ scale, x: px - (px - v.x) * k, y: py - (py - v.y) * k }));
    },
    [clampView, setView]
  );

  // Callers pass a fresh arrow each render; keep the latest in a ref so the
  // effects below run once per open, not on every zoom re-render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  const close = useCallback(() => onCloseRef.current(), []);

  const count = items.length;
  // Step to another item (looping), on its starting side, at 1x.
  const go = useCallback(
    (delta: number) => {
      if (count < 2) return;
      setItemIndex((i) => {
        const next = (((i + delta) % count) + count) % count;
        setIndex(items[next]?.side ?? 0);
        return next;
      });
      setView(RESET);
    },
    [count, items, setView]
  );
  const goRef = useRef(go);
  useEffect(() => {
    goRef.current = go;
  }, [go]);

  // Body scroll lock, Escape, focus in and back out.
  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      // RTL: the next image is to the left.
      else if (e.key === "ArrowLeft") goRef.current(1);
      else if (e.key === "ArrowRight") goRef.current(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus({ preventScroll: true });
    };
  }, [close]);

  // Wheel zoom. Non-passive so the page behind never scrolls.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
      zoomTo(viewRef.current.scale * Math.exp(-delta * 0.0025), e.clientX, e.clientY);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [zoomTo]);

  // Re-clamp when the window (and so the stage) changes size.
  useEffect(() => {
    const onResize = () => setView(clampView(viewRef.current));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampView, setView]);

  const pinchState = () => {
    const [a, b] = [...pointers.current.values()];
    return { dist: Math.hypot(a.x - b.x, a.y - b.y), mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      press.current = {
        x: e.clientX,
        y: e.clientY,
        onImage: e.target === imgRef.current,
        moved: false,
        touch: e.pointerType !== "mouse",
        atRest: viewRef.current.scale === 1,
        multi: false,
      };
    } else if (pointers.current.size === 2) {
      gesture.current = pinchState();
      if (press.current) {
        press.current.moved = true;
        press.current.multi = true;
      }
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const p = press.current;
    if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > CLICK_SLOP) p.moved = true;

    if (pointers.current.size === 2 && gesture.current) {
      const now = pinchState();
      const before = gesture.current;
      gesture.current = now;
      const v = viewRef.current;
      // Pan with the pinch midpoint, then zoom around it.
      setView(clampView({ ...v, x: v.x + now.mid.x - before.mid.x, y: v.y + now.mid.y - before.mid.y }));
      zoomTo(viewRef.current.scale * (now.dist / before.dist), now.mid.x, now.mid.y);
    } else if (pointers.current.size === 1 && viewRef.current.scale > 1) {
      const v = viewRef.current;
      setView(clampView({ ...v, x: v.x + e.clientX - prev.x, y: v.y + e.clientY - prev.y }));
    }
  };

  const onPointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.delete(e.pointerId)) return;
    if (pointers.current.size < 2) gesture.current = null;
    if (pointers.current.size === 0) {
      const p = press.current;
      press.current = null;
      if (e.type !== "pointerup" || !p) return;
      // A plain click on the dark area around the image closes.
      if (!p.moved && !p.onImage) close();
      // A horizontal touch swipe at 1x steps. RTL: the next image comes in
      // from the left, so dragging rightward reveals it.
      const dx = e.clientX - p.x;
      const dy = e.clientY - p.y;
      // Never after a pinch (a second finger joined) or once zoomed.
      if (
        p.touch &&
        !p.multi &&
        p.atRest &&
        viewRef.current.scale === 1 &&
        Math.abs(dx) >= SWIPE_MIN_PX &&
        Math.abs(dx) > Math.abs(dy) * 1.5
      ) {
        go(dx > 0 ? 1 : -1);
      }
    }
  };

  const item = items[itemIndex] ?? items[0];
  const images = item.images;
  const current = images[index] ?? images[0];
  const canSwap = images.length > 1;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="תמונה מוגדלת"
      dir="rtl"
      lang="he"
      className="animate-about-fade-in fixed inset-0 z-[120] bg-black/85"
    >
      <div
        ref={stageRef}
        className="absolute inset-0 flex touch-none select-none items-center justify-center overflow-hidden p-4 sm:p-10"
        style={{ cursor: view.scale > 1 ? "grab" : "zoom-in" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onDoubleClick={(e) => zoomTo(viewRef.current.scale > 1 ? 1 : 2.5, e.clientX, e.clientY)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={current.src}
          alt={current.alt}
          draggable={false}
          className="max-h-full max-w-full object-contain will-change-transform"
          style={{ transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})` }}
        />
      </div>

      {/* Top-left close; zoom controls stacked under it. */}
      <div className="absolute left-2 top-2 flex flex-col items-center sm:left-4 sm:top-4">
        <button ref={closeRef} type="button" onClick={close} aria-label="סגירה" className={WHITE_ICON}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-7 w-7" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {/* Prev / next. RTL: "previous" sits on the right pointing right,
          "next" on the left pointing left. */}
      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="התמונה הקודמת"
            className={`${WHITE_ICON} absolute right-1 top-1/2 -translate-y-1/2 sm:right-4`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="התמונה הבאה"
            className={`${WHITE_ICON} absolute left-1 top-1/2 -translate-y-1/2 sm:left-4`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
        </>
      ) : null}

      {/* Bottom: the caption (if any) over a soft dark gradient, then the
          zoom / swap controls. Only the controls take the pointer. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 bg-gradient-to-t from-black/70 via-black/35 to-transparent px-6 pb-4 pt-14 sm:pb-6">
        {item.caption ? (
          <p
            aria-live="polite"
            className="max-w-[65ch] text-balance text-center text-sm leading-relaxed text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.8)] sm:text-base"
          >
            {item.caption}
          </p>
        ) : null}
        <div className="pointer-events-auto flex items-center gap-6">
        <button
          type="button"
          onClick={() => zoomTo(viewRef.current.scale * BUTTON_STEP)}
          disabled={view.scale >= MAX_SCALE}
          aria-label="הגדלה"
          className={WHITE_ICON}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-7 w-7" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        {/* Burgundy on the dark backdrop needs a light halo to read. */}
        {canSwap ? (
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            className="cursor-pointer whitespace-nowrap px-1 py-2 text-base font-medium text-brand underline decoration-1 underline-offset-4 [filter:drop-shadow(0_0_1px_rgba(255,255,255,0.95))_drop-shadow(0_0_3px_rgba(255,255,255,0.8))_drop-shadow(0_1px_2px_rgba(0,0,0,0.4))] transition-[filter] hover:brightness-125 focus-visible:outline-2 focus-visible:outline-white/70 rounded-sm"
          >
            החלף לפני/אחרי
            {current.label ? <span className="sr-only">{`, מוצג: ${current.label}`}</span> : null}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => zoomTo(viewRef.current.scale / BUTTON_STEP)}
          disabled={view.scale <= MIN_SCALE}
          aria-label="הקטנה"
          className={WHITE_ICON}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-7 w-7" aria-hidden="true">
            <path d="M5 12h14" />
          </svg>
        </button>
        </div>
      </div>

      {canSwap && current.label ? (
        <p
          aria-live="polite"
          className="pointer-events-none absolute right-4 top-4 text-sm font-medium text-white [filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.7))] sm:right-6 sm:top-6"
        >
          {current.label}
        </p>
      ) : null}
    </div>,
    document.body
  );
}
