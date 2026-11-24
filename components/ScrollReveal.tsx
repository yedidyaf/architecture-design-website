"use client";

import { useEffect } from "react";

// What reveals on scroll: anything with .reveal, and every direct child of an
// element marked data-reveal-children (e.g. the blocks of an article).
const SELECTOR = ".reveal, [data-reveal-children] > *";
// Elements that come into view together enter one after another.
const STAGGER_S = 0.35;

// Mounted once in the root layout. Elements start hidden (globals.css) and
// rise into place as the visitor scrolls to them, so the page unfolds as it
// is read instead of being all there at once. The content is in the server
// HTML throughout (crawlers, screen readers); only its visibility changes.
// Reduced motion and no JavaScript show everything at once (globals.css and
// the <noscript> in the layout).
export default function ScrollReveal() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const show = (els: Element[]) => {
      els.forEach((el, i) => {
        (el as HTMLElement).style.animationDelay = `${i * STAGGER_S}s`;
        el.classList.add("is-in");
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        const ready: Element[] = [];
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          ready.push(e.target);
        }
        show(ready);
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.1 },
    );

    const seen = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (reduce) el.classList.add("is-in");
        else io.observe(el);
      });
    };
    scan();
    // Client-side navigation swaps the page content in place.
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
