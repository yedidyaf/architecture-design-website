"use client";

import { useEffect, useRef } from "react";

/** Fired on window by ArchSlogan when the pencil has finished the arch. */
export const ARCH_DRAWN_EVENT = "arch-slogan:drawn";
export type ArchDrawnFlag = Window & { __archDrawn?: boolean };

type Pt = { x: number; y: number };

const DESKTOP_QUERY = "(min-width: 900px)";
// The pencil sits this far down the viewport: the line is drawn up to there.
const PEN_AT = 0.62;
// Spacing of the precomputed samples along the line, in px.
const STEP = 6;
// Room between the text and the frame drawn round it.
const FRAME_PAD = 28;
// The pencil's pace, in px per second, whatever the scrolling: the arch is
// drawn at about this speed, the signature is written a little slower.
const DRAW_SPEED = 400;
const WRITE_SPEED = 260;
// The arch is an svg drawn at its own scale (viewBox 340 wide); the pencil,
// its line width and its paper grain here are multiplied by that scale so
// they are the very same as the arch's.
const ARCH_VIEWBOX_W = 340;

// Miri's signature, traced from her handwriting (units of the 420 x 660
// photo crop), in writing order: the M, its dot, the f with its loop and
// tail, the last dot. SIG_SCALE sizes it on the page.
const SIG_BOX = { w: 420, h: 660 };
const SIG_SCALE = 0.3;
const SIGNATURE: Pt[][] = [
  [
    [31, 517], [37, 560], [41, 470], [42, 380], [46, 310], [52, 301], [62, 318], [80, 370], [100, 440],
    [113, 495], [121, 511], [128, 495], [135, 430], [139, 350], [141, 342], [146, 380], [152, 430], [158, 475],
  ],
  [[205, 466], [206, 475]],
  [
    [249, 557], [241, 580], [238, 520], [240, 440], [245, 370], [252, 300], [263, 220], [282, 145], [310, 80],
    [340, 38], [362, 28], [376, 45], [383, 110], [378, 200], [362, 290], [335, 380], [300, 450], [262, 505],
    [215, 550], [160, 590], [110, 618], [86, 633], [100, 630], [150, 605], [205, 570], [255, 535], [300, 516],
    [325, 512], [336, 516], [338, 526],
  ],
  [[379, 517], [383, 519]],
].map((stroke) => stroke.map(([x, y]) => ({ x, y })));

// Small deterministic random, so the line keeps its shape between visits.
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A smooth curve through the points (Catmull-Rom as cubic Béziers): every
// turn is rounded, nothing comes to a point.
function smooth(pts: Pt[]): string {
  const f = (n: number) => n.toFixed(1);
  let d = `M${f(pts[0].x)},${f(pts[0].y)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    d += ` C${f(p1.x + (p2.x - p0.x) / 6)},${f(p1.y + (p2.y - p0.y) / 6)} ${f(p2.x - (p3.x - p1.x) / 6)},${f(
      p2.y - (p3.y - p1.y) / 6,
    )} ${f(p2.x)},${f(p2.y)}`;
  }
  return d;
}

// The route, in coordinates relative to `box`: from the end of the slogan
// arch ([data-pencil-arch], an svg with viewBox 0 0 340 240 whose line ends
// at 334,180 heading right), snaking down in uneven sweeps to each
// [data-pencil-frame] and running round it in a soft loop that stays open on
// one side, then on to the signature ([data-pencil-sig]). Returns the main
// line and the signature strokes, or null when the parts aren't there.
function buildRoute(box: HTMLElement): { main: Pt[]; signature: Pt[][]; scale: number } | null {
  const arch = box.querySelector<SVGSVGElement>("[data-pencil-arch]");
  const sigEl = box.querySelector<HTMLElement>("[data-pencil-sig]");
  if (!arch || !sigEl) return null;
  const R = rng(11);
  const between = (a: number, b: number) => a + R() * (b - a);
  const b0 = box.getBoundingClientRect();
  const W = box.clientWidth;
  const rel = (x: number, y: number): Pt => ({ x: x - b0.left, y: y - b0.top });

  const ar = arch.getBoundingClientRect();
  const start = rel(ar.left + (ar.width * 334) / 340, ar.top + (ar.height * 180) / 240);
  const pts: Pt[] = [start, { x: start.x + 18, y: start.y + 2 }];
  let heading = 1; // +1 moving right, -1 moving left
  let first = true;

  // Sweeps from the current point down to `to`, arriving there moving in
  // direction `arrive`. Turns alternate sides; how many, how wide and how
  // tall vary, so no two stretches look alike.
  const sweepTo = (to: Pt, arrive: number) => {
    const from = pts[pts.length - 1];
    const gap = to.y - from.y;
    const firstSide = heading;
    const lastSide = -arrive;
    let n = Math.max(1, Math.round(gap / 150));
    if ((n % 2 === 1) !== (firstSide === lastSide)) n += 1;
    const weights = Array.from({ length: n }, () => between(0.45, 1.7));
    const sum = weights.reduce((a, w) => a + w, 0);
    // Turn radii: shares of the gap, so the last run lands exactly at the
    // target's height. Leaving the arch, the first turn is a roomy one and
    // the others share what is left.
    const radii = weights.map((w) => (gap * w) / sum / 2);
    if (first && radii[0] < 36) {
      const rest = sum - weights[0];
      radii[0] = n === 1 ? gap / 2 : Math.min(36, gap / 4);
      if (n > 1) for (let k = 1; k < n; k++) radii[k] = ((gap / 2 - radii[0]) * weights[k]) / rest;
    }
    let y = from.y;
    let x = from.x;
    let side = firstSide;
    radii.forEach((r, k) => {
      // A turn now and then stays short, like a little hook.
      const short = R() < 0.35;
      let tx =
        side > 0
          ? short
            ? W * between(0.5, 0.64)
            : W * between(0.66, 1.02)
          : short
            ? W * between(0.36, 0.5)
            : W * between(-0.04, 0.34);
      // Room for a full, easy bend after the last run.
      const room = r * 0.75 + 60;
      tx = side > 0 ? Math.max(tx, x + room) : Math.min(tx, x - room);
      // The last turn sits beyond the target, so the line comes back to it
      // in one easy run instead of doubling back.
      if (k === n - 1) tx = side > 0 ? Math.max(tx, to.x + 80) : Math.min(tx, to.x - 80);
      tx = Math.min(W + 50, Math.max(-60, tx));
      const dx = tx - x;
      if (Math.abs(dx) > 140) pts.push({ x: x + dx * between(0.4, 0.6), y: y + between(-5, 5) });
      pts.push({ x: tx - side * r * 0.75, y });
      pts.push({ x: tx + side * between(0, 6), y: y + r });
      y += 2 * r;
      x = tx - side * r * 0.75;
      pts.push({ x, y });
      side = -side;
    });
    const dx = to.x - x;
    if (Math.abs(dx) > 140) pts.push({ x: x + dx * between(0.4, 0.6), y: (y + to.y) / 2 + between(-4, 4) });
    pts.push(to);
    first = false;
  };

  // A soft, slightly squared loop round the text (a superellipse), entered
  // at the top and left open on one side.
  const frames = [...box.querySelectorAll<HTMLElement>("[data-pencil-frame]")];
  let clockwise = R() < 0.5;
  for (const el of frames) {
    const r = el.getBoundingClientRect();
    const tl = rel(r.left, r.top);
    const cx = tl.x + r.width / 2;
    const cy = tl.y + r.height / 2;
    const a = r.width / 2 + FRAME_PAD + between(-6, 10);
    // Even a one-line part gets a real loop round it.
    const b = Math.max(58, r.height / 2 + FRAME_PAD) + between(-4, 8);
    const p = between(2.6, 3.6);
    const wob = between(0, Math.PI * 2);
    const at = (deg: number): Pt => {
      const t = (deg * Math.PI) / 180;
      const c = Math.cos(t);
      const s = Math.sin(t);
      const k = 1 + 0.015 * Math.sin(3 * t + wob);
      return {
        x: cx + a * k * Math.sign(c) * Math.abs(c) ** (2 / p),
        y: cy + b * k * Math.sign(s) * Math.abs(s) ** (2 / p),
      };
    };
    // Clockwise: in at the top moving right, round the right side, out
    // along the bottom to the left. Counter-clockwise is the mirror image.
    const dir = clockwise ? 1 : -1;
    const from = clockwise ? 255 : 285;
    const span = between(214, 226);
    sweepTo(at(from), dir);
    for (let d = 12; d <= span; d += 12) pts.push(at(from + dir * d));
    heading = -dir;
    clockwise = R() < 0.7 ? !clockwise : clockwise;
  }

  // The signature, centred on its placeholder; the line runs in just short
  // of where the pencil starts the M.
  const sr = sigEl.getBoundingClientRect();
  const o = rel(sr.left, sr.top);
  const ox = o.x + (sr.width - SIG_BOX.w * SIG_SCALE) / 2;
  const oy = o.y + (sr.height - SIG_BOX.h * SIG_SCALE) / 2;
  const signature = SIGNATURE.map((s) => s.map((q) => ({ x: ox + q.x * SIG_SCALE, y: oy + q.y * SIG_SCALE })));
  const m0 = signature[0][0];
  sweepTo({ x: m0.x - 26, y: m0.y - 8 }, 1);
  // Points too close together make the curve kink; keep them apart.
  const main = pts.filter((q, i) => i === 0 || Math.hypot(q.x - pts[i - 1].x, q.y - pts[i - 1].y) > 14);
  return { main, signature, scale: ar.width / ARCH_VIEWBOX_W };
}

// Desktop homepage: the gray pencil that drew the slogan arch carries on
// drawing as the visitor scrolls. Its line snakes down, loops round each part
// of the text and ends in Miri's signature. Scrolling back up turns the pencil
// round and its eraser rubs the line out. Phones (the screen-by-screen
// layout) don't get it.
export default function PencilPath() {
  const svgRef = useRef<SVGSVGElement>(null);
  const filterRef = useRef<SVGFilterElement>(null);
  const lineRef = useRef<SVGGElement>(null);
  const mainRef = useRef<SVGPathElement>(null);
  const ghostRef = useRef<SVGPathElement>(null);
  const sigRef = useRef<SVGGElement>(null);
  const penRef = useRef<SVGGElement>(null);
  const eraserRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const filter = filterRef.current;
    const lineG = lineRef.current;
    const main = mainRef.current;
    const ghost = ghostRef.current;
    const sigG = sigRef.current;
    const pen = penRef.current;
    const eraser = eraserRef.current;
    const box = svg?.parentElement;
    if (!svg || !filter || !lineG || !main || !ghost || !sigG || !pen || !eraser || !box) return;
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const flags = window as ArchDrawnFlag;
    const [warp, , grain] = [...filter.children] as SVGElement[];
    const displace = filter.children[1] as SVGElement;

    let len = 0;
    let strokes: { el: SVGPathElement; len: number }[] = [];
    let sigLen = 0;
    let ymax: number[] = [];
    let cur = 0;
    let k = 1;
    let raf = 0;
    let last = 0;

    const build = () => {
      if (!desktop.matches) return;
      const route = buildRoute(box);
      if (!route) return;
      k = route.scale;
      // The arch's pencil, at the arch's scale (see ArchSlogan).
      filter.setAttribute("width", String(box.clientWidth + 400));
      filter.setAttribute("height", String(box.clientHeight + 400));
      warp.setAttribute("baseFrequency", String(0.03 / k));
      displace.setAttribute("scale", String(2.5 * k));
      grain.setAttribute("baseFrequency", String(1.4 / k));
      lineG.setAttribute("stroke-width", String(2.3 * k));
      ghost.setAttribute("stroke-width", String(1.2 * k));
      ghost.setAttribute("transform", `translate(${0.9 * k} ${0.7 * k})`);
      const d = smooth(route.main);
      main.setAttribute("d", d);
      ghost.setAttribute("d", d);
      len = main.getTotalLength();
      sigG.replaceChildren();
      strokes = route.signature.map((st) => {
        const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
        el.setAttribute("d", smooth(st));
        sigG.appendChild(el);
        return { el, len: el.getTotalLength() };
      });
      sigLen = strokes.reduce((a, st) => a + st.len, 0);
      ymax = [];
      let m = -Infinity;
      for (let l = 0; l <= len; l += STEP) {
        m = Math.max(m, main.getPointAtLength(l).y);
        ymax.push(m);
      }
      if (reduce) cur = len + sigLen;
      cur = Math.min(cur, len + sigLen);
      paint(0);
      schedule();
    };

    const target = () => {
      if (reduce) return len + sigLen;
      if (!flags.__archDrawn) return 0;
      const total = len + sigLen;
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) return total;
      const edge = window.innerHeight * PEN_AT - box.getBoundingClientRect().top;
      let i = 0;
      while (i < ymax.length && ymax[i] < edge) i++;
      return i >= ymax.length ? total : Math.min(len, i * STEP);
    };

    // Draws everything up to `cur`. Drawing (dir > 0) shows the pencil at
    // the end of the line, rubbing out (dir < 0) shows only an eraser, which
    // trembles a little as it works.
    const paint = (dir: number) => {
      const m = Math.min(cur, len);
      main.style.strokeDasharray = ghost.style.strokeDasharray = String(len);
      main.style.strokeDashoffset = String(len - m);
      ghost.style.strokeDashoffset = String(len - Math.max(0, m - 6));
      let rest = cur - len;
      let tip: DOMPoint | null = m > 1 && cur < len ? main.getPointAtLength(m) : null;
      for (const st of strokes) {
        const drawn = Math.max(0, Math.min(st.len, rest));
        st.el.style.strokeDasharray = String(st.len);
        st.el.style.strokeDashoffset = String(st.len - drawn);
        if (rest > 0 && rest < st.len) tip = st.el.getPointAtLength(drawn);
        rest -= st.len;
      }
      const moving = tip !== null && dir !== 0 && !reduce;
      pen.style.opacity = moving && dir > 0 ? "1" : "0";
      eraser.style.opacity = moving && dir < 0 ? "1" : "0";
      if (!moving || !tip) return;
      if (dir > 0) {
        // Same pose and the same slight hand tremor as the arch's pencil.
        pen.setAttribute(
          "transform",
          `translate(${tip.x} ${tip.y + Math.sin(cur * 0.35) * 0.6 * k}) rotate(-50) scale(${k})`,
        );
      } else {
        const jx = Math.sin(cur * 0.9) * 1.2 * k;
        const jy = Math.cos(cur * 1.3) * 1.2 * k;
        const ja = Math.sin(cur * 0.7) * 6;
        eraser.setAttribute(
          "transform",
          `translate(${tip.x + jx} ${tip.y + jy}) rotate(${-30 + ja}) scale(${k})`,
        );
      }
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
      last = now;
      const t = target();
      const delta = t - cur;
      if (Math.abs(delta) < 0.5) {
        cur = t;
        last = 0;
        paint(0);
        return;
      }
      // Steady pace, never a leap: fast scrolling just leaves the pencil
      // a little behind, and it catches up at its own speed.
      const speed = cur >= len ? WRITE_SPEED : DRAW_SPEED;
      const step = Math.sign(delta) * Math.min(Math.abs(delta), speed * dt);
      cur += step;
      paint(Math.sign(step));
      schedule();
    };
    function schedule() {
      if (!raf && len > 0) raf = requestAnimationFrame(frame);
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

  // Same pencil as the arch (ArchSlogan): graphite stroke with paper grain
  // and a faint second line beside it. Sizes are set from the arch's scale.
  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full overflow-visible min-[900px]:block"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter ref={filterRef} id="pencilPathTex" filterUnits="userSpaceOnUse" x="-200" y="-200" width="2000" height="6000">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="3" result="w" />
          <feDisplacementMap in="SourceGraphic" in2="w" scale="2.5" result="d" />
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="5" result="g" />
          <feColorMatrix
            in="g"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.9"
            result="ga"
          />
          <feComposite in="d" in2="ga" operator="in" />
        </filter>
      </defs>
      <g ref={lineRef} filter="url(#pencilPathTex)" fill="none" stroke="#4a4546" strokeLinecap="round" strokeLinejoin="round">
        <path ref={ghostRef} opacity="0.35" style={{ strokeDasharray: "100000", strokeDashoffset: "100000" }} />
        <path ref={mainRef} style={{ strokeDasharray: "100000", strokeDashoffset: "100000" }} />
        <g ref={sigRef} />
      </g>
      <g ref={penRef} style={{ opacity: 0, transition: "opacity .3s" }}>
        <polygon points="0,0 13,-4 13,4" fill="#e8c9a0" />
        <polygon points="0,0 4.5,-1.4 4.5,1.4" fill="#3b3536" />
        <rect x="13" y="-4" width="52" height="8" fill="#9f2b35" />
        <rect x="13" y="-4" width="52" height="2.6" fill="#b8434d" />
        <rect x="65" y="-4.3" width="5" height="8.6" fill="#c9c2bf" />
        <rect x="70" y="-4" width="8" height="8" rx="2" fill="#e6a6a6" />
      </g>
      {/* A pink eraser, its rubbing edge centred on the end of the line. */}
      <g ref={eraserRef} style={{ opacity: 0, transition: "opacity .3s" }}>
        <rect x="-9" y="-22" width="18" height="24" rx="3" fill="#e6a6a6" />
        <rect x="-9" y="-22" width="18" height="7" rx="3" fill="#cf8a8f" />
        <rect x="-9" y="-4" width="18" height="6" rx="2.5" fill="#d99599" />
      </g>
    </svg>
  );
}
