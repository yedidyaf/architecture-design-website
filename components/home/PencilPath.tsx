"use client";

import { useEffect, useRef } from "react";

/** Fired on window by ArchSlogan when the pencil has finished the arch. */
export const ARCH_DRAWN_EVENT = "arch-slogan:drawn";
export type ArchDrawnFlag = Window & { __archDrawn?: boolean };

const DESKTOP_QUERY = "(min-width: 900px)";
// The pencil sits this far down the viewport: the line is drawn up to there.
const PEN_AT = 0.62;
// Spacing of the precomputed samples along the line, in px.
const STEP = 6;
// How far each frame's line runs outside the text it surrounds.
const FRAME_PAD = 30;
// Height of one sweep of the snake between two parts.
const SWEEP = 85;

// Small deterministic random, so the line keeps its shape between visits.
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Builds the line inside `box`: from the end of the slogan arch
// ([data-pencil-arch], an svg with viewBox 0 0 340 240 ending at 334,180),
// snaking down to each [data-pencil-frame] and running round it (in at the
// top, round the right side, along the bottom, out to the left), and on to
// the signature ([data-pencil-sig]). Coordinates are relative to `box`.
function buildPath(box: HTMLElement): string | null {
  const arch = box.querySelector<SVGSVGElement>("[data-pencil-arch]");
  const sig = box.querySelector<HTMLElement>("[data-pencil-sig]");
  if (!arch || !sig) return null;
  const R = rng(7);
  const b = box.getBoundingClientRect();
  const W = box.clientWidth;
  const ar = arch.getBoundingClientRect();
  let x = ar.left - b.left + (ar.width * 334) / 340;
  let y = ar.top - b.top + (ar.height * 180) / 240;
  const f = (n: number) => n.toFixed(1);
  let d = `M${f(x)},${f(y)}`;

  const meander = (tx: number, ty: number, startLeft: boolean) => {
    const gap = ty - y - 50;
    const n = Math.max(0, Math.floor(gap / SWEEP));
    if (n > 0) {
      const s = gap / n;
      const r = s / 2;
      let left = startLeft;
      for (let k = 0; k < n; k++) {
        let ex = left ? r + 12 + R() * W * 0.14 : W - r - 12 - R() * W * 0.14;
        if (k === n - 1) ex = left ? Math.min(ex, tx - 40) : Math.max(ex, tx + 40);
        const mid = y + (R() - 0.5) * 14;
        d += ` C${f((x + ex) / 2)},${f(mid)} ${f((x + ex) / 2)},${f(y)} ${f(ex)},${f(y)}`;
        d += ` A${f(r)},${f(r)} 0 0 ${left ? 0 : 1} ${f(ex)},${f(y + s)}`;
        x = ex;
        y += s;
        left = !left;
      }
    }
    d += ` C${f(tx)},${f(y)} ${f(tx)},${f(y)} ${f(tx)},${f(ty)}`;
    x = tx;
    y = ty;
  };

  let startLeft = true;
  box.querySelectorAll<HTMLElement>("[data-pencil-frame]").forEach((el) => {
    const r = el.getBoundingClientRect();
    const L = r.left - b.left - FRAME_PAD;
    const Rt = r.right - b.left + FRAME_PAD;
    const T = r.top - b.top - FRAME_PAD;
    const B = r.bottom - b.top + FRAME_PAD;
    const rad = Math.min(70, (B - T) / 2);
    const ex = L + (Rt - L) * (0.3 + R() * 0.2);
    meander(ex, T - 24, startLeft);
    d += ` C${f(ex)},${f(T)} ${f(ex + 10)},${f(T)} ${f(ex + 30)},${f(T)} L${f(Rt - rad)},${f(T)}`;
    d += ` C${f(Rt - rad * 0.45)},${f(T)} ${f(Rt)},${f(T + rad * 0.45)} ${f(Rt)},${f(T + rad)} L${f(Rt)},${f(B - rad)}`;
    d += ` C${f(Rt)},${f(B - rad * 0.45)} ${f(Rt - rad * 0.45)},${f(B)} ${f(Rt - rad)},${f(B)} L${f(L - 40)},${f(B + 6)}`;
    x = L - 40;
    y = B + 6;
    startLeft = false;
  });

  const s = sig.getBoundingClientRect();
  meander(s.left - b.left + 10, s.top - b.top + 30, false);
  return d;
}

// Desktop homepage: one continuous pencil line that the visitor draws by
// scrolling. It leaves the slogan arch, frames each part of the text and ends
// at the signature, which then writes itself. Scrolling back up erases it.
// Phones (the screen-by-screen layout) don't get it.
export default function PencilPath() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const penRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const path = pathRef.current;
    const pen = penRef.current;
    const box = svg?.parentElement;
    if (!svg || !path || !pen || !box) return;
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const flags = window as ArchDrawnFlag;

    let len = 0;
    let ys: number[] = [];
    let cur = 0;
    let raf = 0;
    let signed = false;

    const sign = (on: boolean) => {
      if (on === signed) return;
      signed = on;
      box.querySelector("[data-pencil-sig]")?.classList.toggle("is-signed", on);
    };

    const build = () => {
      if (!desktop.matches) return;
      const d = buildPath(box);
      if (!d) return;
      path.setAttribute("d", d);
      len = path.getTotalLength();
      path.style.strokeDasharray = String(len);
      ys = [];
      for (let l = 0; l <= len; l += STEP) ys.push(path.getPointAtLength(l).y);
      cur = Math.min(cur, len);
      if (reduce) {
        cur = len;
        path.style.strokeDashoffset = "0";
        sign(true);
      } else {
        schedule();
      }
    };

    const target = () => {
      if (!flags.__archDrawn) return 0;
      const edge = window.innerHeight * PEN_AT - box.getBoundingClientRect().top;
      let i = 0;
      while (i < ys.length && ys[i] < edge) i++;
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) return len;
      return Math.min(len, i * STEP);
    };

    const frame = () => {
      raf = 0;
      const t = target();
      cur += (t - cur) * 0.09;
      if (Math.abs(t - cur) < 0.5) cur = t;
      path.style.strokeDashoffset = String(len - cur);
      if (cur > 2 && cur < len - 2) {
        const p = path.getPointAtLength(cur);
        pen.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(-50)`);
        pen.style.opacity = "1";
      } else {
        pen.style.opacity = "0";
      }
      sign(len > 0 && cur >= len - 2);
      if (cur !== t) schedule();
    };
    function schedule() {
      if (!raf && !reduce && len > 0) raf = requestAnimationFrame(frame);
    }

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const rebuild = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 150);
    };
    const ro = new ResizeObserver(rebuild);
    ro.observe(box);
    document.fonts?.ready.then(build);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener(ARCH_DRAWN_EVENT, schedule);
    desktop.addEventListener("change", rebuild);
    build();

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener(ARCH_DRAWN_EVENT, schedule);
      desktop.removeEventListener("change", rebuild);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full overflow-visible min-[900px]:block"
      aria-hidden="true"
      focusable="false"
    >
      <path
        ref={pathRef}
        fill="none"
        stroke="#9f2b35"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ strokeDashoffset: "100000", strokeDasharray: "100000" }}
      />
      <g ref={penRef} style={{ opacity: 0, transition: "opacity .4s" }}>
        <polygon points="0,0 13,-4 13,4" fill="#e8c9a0" />
        <polygon points="0,0 4.5,-1.4 4.5,1.4" fill="#9f2b35" />
        <rect x="13" y="-4" width="52" height="8" fill="#9f2b35" />
        <rect x="13" y="-4" width="52" height="2.6" fill="#b8434d" />
        <rect x="65" y="-4.3" width="5" height="8.6" fill="#c9c2bf" />
        <rect x="70" y="-4" width="8" height="8" rx="2" fill="#e6a6a6" />
      </g>
    </svg>
  );
}
