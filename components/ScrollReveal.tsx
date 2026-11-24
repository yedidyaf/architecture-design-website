"use client";

import { useEffect } from "react";

/** Fired on window by ArchSlogan when the slogan has finished typing. */
export const SLOGAN_DONE_EVENT = "arch-slogan:done";

type Flags = Window & { __archSloganDone?: boolean };

// What reveals on scroll: anything with .reveal, and every direct child of an
// element marked data-reveal-children (e.g. the blocks of an article).
const SELECTOR = ".reveal, [data-reveal-children] > *";
// Elements inside [data-reveal-after-slogan] also wait for the homepage
// slogan to finish typing. If it never reports, they stop waiting after this.
const SLOGAN_FALLBACK_MS = 10000;
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
    const flags = window as Flags;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const waiting = new Set<Element>(); // in view, held back for the slogan

    const show = (els: Element[]) => {
      els.forEach((el, i) => {
        (el as HTMLElement).style.animationDelay = `${i * STAGGER_S}s`;
        el.classList.add("is-in");
      });
    };
    const sloganDone = () => Boolean(flags.__archSloganDone);
    const gated = (el: Element) => !sloganDone() && el.closest("[data-reveal-after-slogan]") !== null;

    const io = new IntersectionObserver(
      (entries) => {
        const ready: Element[] = [];
        for (const e of entries) {
          if (!e.isIntersecting) {
            waiting.delete(e.target);
            continue;
          }
          io.unobserve(e.target);
          if (gated(e.target)) waiting.add(e.target);
          else ready.push(e.target);
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

    const release = () => {
      flags.__archSloganDone = true;
      show([...waiting]);
      waiting.clear();
    };
    window.addEventListener(SLOGAN_DONE_EVENT, release);
    const fallback = window.setTimeout(release, SLOGAN_FALLBACK_MS);

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener(SLOGAN_DONE_EVENT, release);
      window.clearTimeout(fallback);
    };
  }, []);

  return null;
}
