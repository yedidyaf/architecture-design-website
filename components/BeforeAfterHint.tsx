"use client";
import { useEffect, useRef, useState } from "react";
import BeforeAfter from "./BeforeAfter";

type Props = {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
};

// Fires the SAME hint system BeforeAfter already supports for the homepage
// gallery (peek crossfade + pulsing "לחץ לגילוי" label) once — but only once
// this block actually scrolls into view, and only if the user hasn't already
// interacted with it. In-memory only (no localStorage), same pattern as the
// gallery's hint.
const ARM_DELAY_MS = 700;

export default function BeforeAfterHint({ beforeSrc, afterSrc, beforeAlt, afterAlt }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hintActive, setHintActive] = useState(false);
  const [labelVisible, setLabelVisible] = useState(false);
  const [peekTrigger, setPeekTrigger] = useState(0);
  const firedRef = useRef(false);
  const interactedRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let armTimer: ReturnType<typeof setTimeout> | undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (firedRef.current || interactedRef.current) return;
        if (entries[0]?.isIntersecting) {
          firedRef.current = true;
          armTimer = setTimeout(() => {
            if (interactedRef.current) return;
            setHintActive(true);
            setLabelVisible(true);
            setPeekTrigger(1);
          }, ARM_DELAY_MS);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      if (armTimer) clearTimeout(armTimer);
    };
  }, []);

  const dismiss = () => {
    if (interactedRef.current) return;
    interactedRef.current = true;
    setHintActive(false);
    setLabelVisible(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <BeforeAfter
        beforeSrc={beforeSrc}
        afterSrc={afterSrc}
        beforeAlt={beforeAlt}
        afterAlt={afterAlt}
        peekTrigger={peekTrigger}
        hintActive={hintActive}
        labelVisible={labelVisible}
        showHintLabel
        onFirstInteract={dismiss}
      />
      {/* Peeled-corner (dog-ear) cue — permanent, subtle hint that there's a
          layer underneath. Opposite corner from BeforeAfter's own state tag
          (top-right) so the two never overlap. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-7 w-7"
        style={{
          clipPath: "polygon(0 0, 100% 0, 0 100%)",
          background: "linear-gradient(135deg, var(--brand) 55%, var(--brand-hover) 100%)",
          boxShadow: "1px 1px 3px rgba(0,0,0,0.25)",
        }}
      />
    </div>
  );
}
