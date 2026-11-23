"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Fired on window by ArchSlogan when the slogan has finished typing. */
export const SLOGAN_DONE_EVENT = "arch-slogan:done";

// If the slogan never reports (an error, a very long slogan), show the text anyway.
const FALLBACK_MS = 10000;

// Reveals the homepage text line by line (.bio-line, see globals.css) once
// the slogan above it has finished typing; with no slogan, right away. The
// text is in the server HTML the whole time, so crawlers and screen readers
// get all of it; only its visibility is animated.
export default function BioReveal({
  waitForSlogan,
  className,
  children,
}: {
  waitForSlogan: boolean;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    ref.current?.querySelectorAll<HTMLElement>(".bio-line").forEach((el, i) => {
      el.style.setProperty("--i", String(i));
    });
    const show = () => setShown(true);
    const flags = window as Window & { __archSloganDone?: boolean };
    if (
      !waitForSlogan ||
      flags.__archSloganDone ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      show();
      return;
    }
    window.addEventListener(SLOGAN_DONE_EVENT, show);
    const fallback = window.setTimeout(show, FALLBACK_MS);
    return () => {
      window.removeEventListener(SLOGAN_DONE_EVENT, show);
      window.clearTimeout(fallback);
    };
  }, [waitForSlogan]);

  return (
    <div ref={ref} className={`bio-reveal ${shown ? "is-shown" : ""} ${className ?? ""}`}>
      {children}
    </div>
  );
}
