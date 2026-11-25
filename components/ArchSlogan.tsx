"use client";

import { useEffect, useRef, useState } from "react";
import { ARCH_DRAWN_EVENT, ARCH_PATH, type ArchDrawnFlag } from "@/components/home/PencilPath";

const DRAW_START = 400;
const DRAW_MS = 2000;
const TYPE_AFTER_DRAW = 300; // typing starts this long after the arch is done
const LINE_PAUSE = 350;
const SPEEDS = [70, 60]; // ms per character, per line

// Homepage: the arch is the start of the pencil line (PencilPath), which
// draws it over this svg and carries straight on.
const sharedLine = () => document.querySelector("[data-pencil-path]") !== null;

// One arch lying on its side (open to the right), drawn live by a pencil,
// with the slogan typed inside once it is done. On the homepage the shared
// pencil line draws it; anywhere else it draws itself once and the pencil
// rests at the end. The reduced-motion fallbacks live in globals.css (.arch-*); the
// full text is always in the markup (invisible placeholder) so crawlers and
// screen readers get it, and the typed overlay is purely visual.
export default function ArchSlogan({ lines }: { lines: string[] }) {
  const [typed, setTyped] = useState<number[]>(() => lines.map(() => 0));
  const [active, setActive] = useState(-1); // line that currently holds the caret
  const [drawn, setDrawn] = useState(false); // pencil finished; typing may start
  const mainRef = useRef<SVGPathElement>(null);
  const ghostRef = useRef<SVGPathElement>(null);
  const pencilRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let typeTimer: ReturnType<typeof setTimeout> | undefined;
    const startTyping = () => {
      typeTimer = setTimeout(() => setDrawn(true), TYPE_AFTER_DRAW);
    };

    if (sharedLine()) {
      if ((window as ArchDrawnFlag).__archDrawn) {
        startTyping();
        return () => clearTimeout(typeTimer);
      }
      window.addEventListener(ARCH_DRAWN_EVENT, startTyping, { once: true });
      return () => {
        window.removeEventListener(ARCH_DRAWN_EVENT, startTyping);
        clearTimeout(typeTimer);
      };
    }

    const main = mainRef.current;
    const ghost = ghostRef.current;
    const pencil = pencilRef.current;
    if (!main || !ghost || !pencil) return;
    const len = main.getTotalLength();
    for (const el of [main, ghost]) {
      el.style.strokeDasharray = String(len);
      el.style.strokeDashoffset = String(len);
    }
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const place = (d: number) => {
      const pt = main.getPointAtLength(d);
      pencil.setAttribute(
        "transform",
        `translate(${pt.x} ${pt.y + Math.sin(d * 0.35) * 0.6}) rotate(-50)`,
      );
    };
    const draw = () => {
      const t0 = performance.now();
      place(0);
      pencil.style.opacity = "1";
      const frame = (now: number) => {
        const k = Math.min(1, (now - t0) / DRAW_MS);
        const eased = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const d = len * eased;
        main.style.strokeDashoffset = String(len - d);
        ghost.style.strokeDashoffset = String(len - Math.max(0, d - 6));
        place(d);
        if (k < 1) {
          raf = requestAnimationFrame(frame);
          return;
        }
        // Done: the pencil stays where it finished.
        ghost.style.strokeDashoffset = "0";
        startTyping();
      };
      raf = requestAnimationFrame(frame);
    };
    // Drawn once, when the arch's screen comes into view.
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        timer = setTimeout(draw, DRAW_START);
      },
      { threshold: 0.5 },
    );
    io.observe(main);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      clearTimeout(typeTimer);
      io.disconnect();
    };
  }, []);

  const key = lines.join("\n");
  useEffect(() => {
    if (!drawn || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const chars = key.split("\n").map((l) => Array.from(l).length);
    const timers: ReturnType<typeof setTimeout>[] = [];
    let t = 0;
    chars.forEach((n, line) => {
      const speed = SPEEDS[line] ?? SPEEDS[SPEEDS.length - 1];
      timers.push(setTimeout(() => setActive(line), t));
      for (let c = 1; c <= n; c++) {
        t += speed;
        timers.push(
          setTimeout(
            () => setTyped((prev) => prev.map((v, i) => (i === line ? c : v))),
            t,
          ),
        );
      }
      t += LINE_PAUSE;
    });
    return () => {
      timers.forEach(clearTimeout);
      setTyped(chars.map(() => 0));
      setActive(-1);
    };
  }, [key, drawn]);

  return (
    <section className="arch-section -mx-6 overflow-x-hidden min-[900px]:mx-0">
      {/* Phones: nudged left (the svg has room on that side) so the line
          has room to bend down past the arch's end. */}
      <div className="relative mx-auto aspect-[340/240] w-[min(440px,94vw)] max-[899px]:-translate-x-[12vw]">
        <svg
          data-pencil-arch=""
          className="absolute inset-0 h-full w-full overflow-visible"
          viewBox="0 0 340 240"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <filter id="pencilTex" filterUnits="userSpaceOnUse" x="-20" y="-20" width="380" height="280">
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
          <g
            filter="url(#pencilTex)"
            fill="none" stroke="#4a4546" strokeLinecap="round" strokeLinejoin="round">
            <path
              ref={ghostRef}
              className="arch-line"
              d={ARCH_PATH}
              strokeWidth="1.2"
              opacity=".35"
              transform="translate(0.9,0.7)"
            />
            <path ref={mainRef} className="arch-line" d={ARCH_PATH} strokeWidth="2.3" />
          </g>
          <g ref={pencilRef} className="arch-pencil">
            <polygon points="0,0 13,-4 13,4" fill="#e8c9a0" />
            <polygon points="0,0 4.5,-1.4 4.5,1.4" fill="#3b3536" />
            <rect x="13" y="-4" width="52" height="8" fill="#9f2b35" />
            <rect x="13" y="-4" width="52" height="2.6" fill="#b8434d" />
            <rect x="65" y="-4.3" width="5" height="8.6" fill="#c9c2bf" />
            <rect x="70" y="-4" width="8" height="8" rx="2" fill="#e6a6a6" />
          </g>
        </svg>
        <p className="absolute right-[6%] left-[30%] top-1/2 flex -translate-y-1/2 flex-col items-center gap-1 whitespace-nowrap text-center text-brand">
          {lines.map((line, i) => (
            <span
              key={i}
              className={`relative block w-max max-w-full leading-snug ${
                i === 0
                  ? "text-[clamp(16px,4.6vw,23px)]"
                  : "text-[clamp(12px,3.4vw,16px)] font-semibold opacity-[.88]"
              }`}
            >
              <span className="arch-full">{line}</span>
              <span className="arch-typed absolute inset-0 text-start" aria-hidden="true">
                {Array.from(line).slice(0, typed[i] ?? 0).join("")}
                {active === i ? <span className="arch-caret" /> : null}
              </span>
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
