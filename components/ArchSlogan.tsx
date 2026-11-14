"use client";

import { useEffect, useState } from "react";

const START_DELAY = 1100; // after the 1s drawer slide
const LINE_PAUSE = 350;
const SPEEDS = [70, 60]; // ms per character, per line

// Three nested arches lying on their side (open to the right) with the
// slogan inside. The drawer slide and the reduced-motion fallbacks live in
// globals.css (.arch-*); the full text is always in the markup (invisible
// placeholder) so crawlers and screen readers get it, and the typed overlay
// is purely visual.
export default function ArchSlogan({ lines }: { lines: string[] }) {
  const [typed, setTyped] = useState<number[]>(() => lines.map(() => 0));
  const [active, setActive] = useState(-1); // line that currently holds the caret

  const key = lines.join("\n");
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const chars = key.split("\n").map((l) => Array.from(l).length);
    const timers: ReturnType<typeof setTimeout>[] = [];
    let t = START_DELAY;
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
  }, [key]);

  return (
    <section className="arch-section -mx-6 overflow-x-hidden min-[900px]:mx-0">
      <div className="arch-drawer relative mx-auto aspect-[340/240] w-[min(440px,94vw)]">
        <svg
          className="absolute inset-0 h-full w-full overflow-visible"
          viewBox="0 0 340 240"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <filter id="archWobble">
              <feTurbulence type="turbulence" baseFrequency="0.016" numOctaves="2" seed="7" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="4" />
            </filter>
          </defs>
          <g filter="url(#archWobble)" fill="none" stroke="#9f2b35" strokeWidth="1.8">
            <path d="M334,78 L120,78 A42,42 0 0 0 120,162 L334,162" />
            <path d="M334,58 L120,58 A62,62 0 0 0 120,182 L334,182" />
            <path d="M334,38 L120,38 A82,82 0 0 0 120,202 L334,202" />
          </g>
        </svg>
        <p className="absolute right-[6%] left-[27%] top-1/2 flex -translate-y-1/2 flex-col items-center gap-1 whitespace-nowrap text-center text-brand">
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
