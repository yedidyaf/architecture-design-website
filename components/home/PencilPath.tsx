"use client";

import { useEffect, useRef } from "react";

/** Fired on window when the pencil has finished the slogan arch. */
export const ARCH_DRAWN_EVENT = "arch-slogan:drawn";
/** The slogan arch, in its svg's 340 x 240 viewBox (ArchSlogan). */
export const ARCH_PATH = "M334,60 L122,60 A60,60 0 0 0 122,180 L334,180";
export type ArchDrawnFlag = Window & { __archDrawn?: boolean };

type Pt = { x: number; y: number };

const DESKTOP_QUERY = "(min-width: 900px)";
// The line is drawn down to this far down the viewport: the bottom of the screen.
const PEN_AT = 0.97;
// Spacing of the precomputed samples along the line, in px.
const STEP = 6;
// Room between the text and the frame drawn round it.
const FRAME_PAD = 28;
// The pencil's pace, in px per second, whatever the scrolling: the arch's
// pace for most of the line, quicker over the last stretch and the signature.
const DRAW_SPEED = 400;
const FINISH_SPEED = 700;
const FINISH_STRETCH = 600;
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

// A smooth curve through the points: centripetal Catmull-Rom, as cubic
// Béziers. Every turn is rounded and, unlike the plain variant, unevenly
// spaced points can't make it loop or come to a point.
function smooth(pts: Pt[]): string {
  const f = (n: number) => n.toFixed(1);
  const dist = (a: Pt, b: Pt) => Math.sqrt(Math.hypot(b.x - a.x, b.y - a.y));
  let d = `M${f(pts[0].x)},${f(pts[0].y)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p0 = pts[i - 1];
    const p3 = pts[i + 2];
    const d2 = dist(p1, p2);
    let c1: Pt = { x: p1.x + (p2.x - p1.x) / 3, y: p1.y + (p2.y - p1.y) / 3 };
    let c2: Pt = { x: p2.x - (p2.x - p1.x) / 3, y: p2.y - (p2.y - p1.y) / 3 };
    if (p0) {
      const d1 = dist(p0, p1);
      if (d1 > 1e-3) {
        const den = 3 * d1 * (d1 + d2);
        const w = 2 * d1 * d1 + 3 * d1 * d2 + d2 * d2;
        c1 = {
          x: (d1 * d1 * p2.x - d2 * d2 * p0.x + w * p1.x) / den,
          y: (d1 * d1 * p2.y - d2 * d2 * p0.y + w * p1.y) / den,
        };
      }
    }
    if (p3) {
      const d3 = dist(p2, p3);
      if (d3 > 1e-3) {
        const den = 3 * d3 * (d3 + d2);
        const w = 2 * d3 * d3 + 3 * d3 * d2 + d2 * d2;
        c2 = {
          x: (d3 * d3 * p1.x - d2 * d2 * p3.x + w * p2.x) / den,
          y: (d3 * d3 * p1.y - d2 * d2 * p3.y + w * p2.y) / den,
        };
      }
    }
    d += ` C${f(c1.x)},${f(c1.y)} ${f(c2.x)},${f(c2.y)} ${f(p2.x)},${f(p2.y)}`;
  }
  return d;
}

// The route, in coordinates relative to `box`: the slogan arch itself (drawn
// over the arch's own svg, [data-pencil-arch], viewBox 0 0 340 240), then
// from its end (334,180, heading right) snaking down in uneven sweeps to each
// [data-pencil-frame] and running round it in a soft loop that stays open on
// one side, then on to the signature ([data-pencil-sig]). Returns the main
// line and the signature strokes, or null when the parts aren't there.
function buildRoute(
  box: HTMLElement,
  vertical: boolean,
): { arch: string; main: Pt[]; signature: Pt[][]; scale: number } | null {
  const arch = box.querySelector<SVGSVGElement>("[data-pencil-arch]");
  const sigEl = box.querySelector<HTMLElement>("[data-pencil-sig]");
  if (!arch || !sigEl) return null;
  const R = rng(11);
  const between = (a: number, b: number) => a + R() * (b - a);
  const b0 = box.getBoundingClientRect();
  const W = box.clientWidth;
  const rel = (x: number, y: number): Pt => ({ x: x - b0.left, y: y - b0.top });

  const ar = arch.getBoundingClientRect();
  const k = ar.width / ARCH_VIEWBOX_W;
  const o = rel(ar.left, ar.top);
  const X = (x: number) => (o.x + x * k).toFixed(1);
  const Y = (y: number) => (o.y + y * k).toFixed(1);
  // The arch itself, where the arch's own svg has it: the line starts here.
  const archD = `M${X(334)},${Y(60)} L${X(122)},${Y(60)} A${(60 * k).toFixed(1)},${(60 * k).toFixed(1)} 0 0 0 ${X(122)},${Y(180)} L${X(334)},${Y(180)}`;
  const start = { x: o.x + 334 * k, y: o.y + 180 * k };
  // Phones (vertical): the line bends straight down out of the arch.
  const pts: Pt[] = vertical
    ? [start, { x: start.x + 18, y: start.y + 3 }, { x: start.x + 32, y: start.y + 20 }, { x: start.x + 38, y: start.y + 48 }]
    : [start, { x: start.x + 18, y: start.y + 2 }];
  let heading = 1; // +1 moving right, -1 moving left
  let first = true;

  // Phones: almost straight down to `to`, easing across sideways on the way,
  // with a gentle wobble.
  const descend = (to: Pt) => {
    const fr = pts[pts.length - 1];
    const n = Math.max(1, Math.floor((to.y - fr.y) / 80));
    let side = R() < 0.5 ? 1 : -1;
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const e = t * t * (3 - 2 * t);
      // The wobble fades out towards both ends, so turns are met calmly.
      const taper = Math.sin(Math.PI * t);
      pts.push({ x: fr.x + (to.x - fr.x) * e + side * between(6, 16) * taper, y: fr.y + (to.y - fr.y) * t });
      side = -side;
    }
    pts.push(to);
  };

  // Sweeps from the current point down to `to`, arriving there moving in
  // direction `arrive`. Turns alternate sides; how many, how wide and how
  // tall vary, so no two stretches look alike.
  const sweepTo = (to: Pt, arrive: number) => {
    let from = pts[pts.length - 1];
    let gap = to.y - from.y;
    // Now and then the line just drops, mostly straight down with a gentle
    // wobble, instead of sweeping from side to side. It drops in a column on
    // the side it is heading towards; heading away, it turns once first.
    const column = to.x - arrive * between(70, 160);
    if (gap > 150 && R() < 0.6) {
      if (Math.sign(column - from.x) !== heading && gap > 260) {
        const r = between(34, 54);
        let tx = heading > 0 ? W * between(0.7, 0.98) : W * between(0.02, 0.3);
        tx = heading > 0 ? Math.max(tx, from.x + r + 60) : Math.min(tx, from.x - r - 60);
        tx = Math.min(W + 50, Math.max(-60, tx));
        pts.push({ x: tx - heading * r * 0.75, y: from.y });
        pts.push({ x: tx, y: from.y + r });
        pts.push({ x: tx - heading * r * 0.75, y: from.y + 2 * r });
        heading = -heading;
        from = pts[pts.length - 1];
        gap = to.y - from.y;
      }
      if (Math.sign(column - from.x) === heading && Math.abs(column - from.x) > 80) {
        dropTo(to, arrive, column);
        return;
      }
    }
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

  // The vertical stretch: bend down into a column at x = `column`, wobble
  // down it, then curve into `to` moving in direction `arrive`.
  function dropTo(to: Pt, arrive: number, column: number) {
    const from = pts[pts.length - 1];
    let y = from.y;
    // Bend down without passing the column (it may be close).
    pts.push({ x: from.x + heading * Math.min(between(30, 50), Math.abs(column - from.x) * 0.5), y: y + between(16, 26) });
    if (Math.abs(column - from.x) > 80) pts.push({ x: from.x + (column - from.x) * 0.6, y: y + between(30, 44) });
    y += 60;
    pts.push({ x: column, y });
    let side = R() < 0.5 ? 1 : -1;
    // Each wobble keeps well clear of the bend at the bottom.
    while (y + 95 < to.y - 44 - 60) {
      y += between(60, 95);
      pts.push({ x: column + side * between(10, 38), y });
      side = -side;
    }
    pts.push({ x: column, y: to.y - 44 });
    pts.push({ x: to.x - arrive * 34, y: to.y - 3 });
    pts.push(to);
  }

  // A soft, slightly squared loop round the text (a superellipse), entered
  // at the top and left open on one side.
  const frames = [...box.querySelectorAll<HTMLElement>("[data-pencil-frame]")];
  let clockwise = R() < 0.5;
  for (const el of frames) {
    const r = el.getBoundingClientRect();
    const tl = rel(r.left, r.top);
    const cx = tl.x + r.width / 2;
    const cy = tl.y + r.height / 2;
    // Phones have less room: a closer frame.
    const pad = vertical ? 16 : FRAME_PAD;
    const a = r.width / 2 + pad + between(-6, 10);
    // Even a one-line part gets a real loop round it.
    const b = Math.max(vertical ? 48 : 58, r.height / 2 + pad) + between(-4, 8);
    // Phones: wide, low frames around short text stay rounder at the ends.
    const p = vertical ? between(2.2, 2.8) : between(2.6, 3.6);
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
    if (vertical) {
      const e = at(from);
      descend({ x: e.x - dir * 20, y: e.y - 26 });
      pts.push(e);
    } else {
      sweepTo(at(from), dir);
    }
    for (let d = 12; d <= span; d += 12) pts.push(at(from + dir * d));
    if (vertical) {
      const end = pts[pts.length - 1];
      pts.push({ x: end.x - dir * 16, y: end.y + 12 });
    }
    heading = -dir;
    clockwise = R() < 0.7 ? !clockwise : clockwise;
  }

  // The signature, centred on its placeholder; the line runs in just short
  // of where the pencil starts the M.
  const sr = sigEl.getBoundingClientRect();
  const so = rel(sr.left, sr.top);
  const ox = so.x + (sr.width - SIG_BOX.w * SIG_SCALE) / 2;
  const oy = so.y + (sr.height - SIG_BOX.h * SIG_SCALE) / 2;
  const signature = SIGNATURE.map((s) => s.map((q) => ({ x: ox + q.x * SIG_SCALE, y: oy + q.y * SIG_SCALE })));
  const m0 = signature[0][0];
  if (vertical) descend({ x: m0.x - 18, y: m0.y - 12 });
  else sweepTo({ x: m0.x - 26, y: m0.y - 8 }, 1);
  // Points too close together make the curve kink; keep them apart. And no
  // point may send the line back the way it came: drop any where it would
  // turn by more than 110 degrees.
  let main = pts.filter((q, i) => i === 0 || Math.hypot(q.x - pts[i - 1].x, q.y - pts[i - 1].y) > 14);
  for (let changed = true; changed; ) {
    changed = false;
    for (let i = 1; i < main.length - 1; i++) {
      const a = main[i - 1];
      const b = main[i];
      const c = main[i + 1];
      const t1 = Math.atan2(b.y - a.y, b.x - a.x);
      const t2 = Math.atan2(c.y - b.y, c.x - b.x);
      let turn = Math.abs(t2 - t1);
      if (turn > Math.PI) turn = 2 * Math.PI - turn;
      if (turn > (110 * Math.PI) / 180) {
        main = main.filter((_, j) => j !== i);
        changed = true;
        break;
      }
    }
  }
  return { arch: archD, main, signature, scale: k };
}

// Homepage: the gray pencil draws the slogan arch and carries on drawing as
// the visitor scrolls. On desktop its line snakes down; on phones (screen by
// screen) it runs almost straight down. Either way it loops round each part
// of the text and ends in Miri's signature, and scrolling back up rubs it out
// with the eraser.
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
    let archLen = Infinity;
    let raf = 0;
    let last = 0;

    const build = () => {
      const route = buildRoute(box, !desktop.matches);
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
      // One line: the arch, then the route on from its end.
      const d = `${route.arch} ${smooth(route.main).replace(/^M[^ ]+/, "")}`;
      main.setAttribute("d", d);
      ghost.setAttribute("d", d);
      len = main.getTotalLength();
      archLen = 612.5 * k;
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
      let tip: DOMPoint | null = m > 0.5 && cur <= len ? main.getPointAtLength(m) : null;
      for (const st of strokes) {
        const drawn = Math.max(0, Math.min(st.len, rest));
        st.el.style.strokeDasharray = String(st.len);
        st.el.style.strokeDashoffset = String(st.len - drawn);
        if (rest > 0 && rest < st.len) tip = st.el.getPointAtLength(drawn);
        rest -= st.len;
      }
      // The slogan is typed once the pencil has been round the arch.
      if (cur >= archLen && !flags.__archDrawn) {
        flags.__archDrawn = true;
        window.dispatchEvent(new Event(ARCH_DRAWN_EVENT));
      }
      if (cur >= len + sigLen - 0.5 && strokes.length) {
        const lastStroke = strokes[strokes.length - 1];
        tip = lastStroke.el.getPointAtLength(lastStroke.len);
      }
      // The pencil is there only while it moves: it fades away when it has
      // caught up with the scrolling (the bottom of the screen) or finished
      // the signature, and comes back as soon as it moves on. While rubbing
      // out it is an eraser instead.
      const show = tip !== null && cur > 0.5 && !reduce && dir !== 0;
      const erasing = show && dir < 0;
      pen.style.opacity = show && !erasing ? "1" : "0";
      eraser.style.opacity = erasing ? "1" : "0";
      if (!show || !tip) return;
      if (!erasing) {
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
      // Drawing keeps the pencil's own pace; rubbing out follows the
      // scrolling closely, at whatever speed the visitor scrolls back up.
      const speed = cur >= len - FINISH_STRETCH ? FINISH_SPEED : DRAW_SPEED;
      const step =
        delta < 0
          ? Math.min(-0.5, delta * 0.35)
          : Math.min(delta, speed * dt);
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
      data-pencil-path=""
      className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
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
