"use client";
import { useEffect, useState } from "react";

// Height of the band at the bottom of the viewport the floating buttons occupy
// (button size + bottom offset + a little breathing room). The footer counts as
// "in view" only once it reaches this band, so on short pages where the footer
// is visible but still clear of the buttons, they stay put.
const BUTTON_ZONE_PX = 112;

/**
 * True while the site footer overlaps the bottom band where the floating
 * buttons sit. Both buttons use this so they fade out together instead of
 * covering the footer's contact links and copyright line.
 */
export default function useFooterInView(): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: `0px 0px -${BUTTON_ZONE_PX}px 0px` }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return inView;
}
