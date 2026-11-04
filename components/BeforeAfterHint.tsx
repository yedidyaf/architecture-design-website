"use client";
import { useEffect, useRef, useState } from "react";
import BeforeAfter from "./BeforeAfter";
import ImageLightbox from "./ImageLightbox";
import ZoomButton from "./ZoomButton";

type Props = {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
  aspectRatio?: number;
  /** Larger renditions for the zoom lightbox; default to the inline ones. */
  beforeZoomSrc?: string;
  afterZoomSrc?: string;
};

// Fires the SAME hint system BeforeAfter already supports for the homepage
// gallery (peek crossfade + pulsing swap icon) once — but only once
// this block actually scrolls into view, and only if the user hasn't already
// interacted with it. In-memory only (no localStorage), same pattern as the
// gallery's hint.
const ARM_DELAY_MS = 700;

export default function BeforeAfterHint({
  beforeSrc,
  afterSrc,
  beforeAlt = "לפני",
  afterAlt = "אחרי",
  aspectRatio,
  beforeZoomSrc = beforeSrc,
  afterZoomSrc = afterSrc,
}: Props) {
  // Mirrors BeforeAfter's tap-to-toggle state, so the magnifier opens the
  // image that is currently shown.
  const [showingBefore, setShowingBefore] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
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
        aspectRatio={aspectRatio}
        peekTrigger={peekTrigger}
        hintActive={hintActive}
        labelVisible={labelVisible}
        showHintLabel
        onFirstInteract={dismiss}
        onToggle={setShowingBefore}
      />
      {/* A sibling of the tap-to-toggle block (not inside it), in the one
          free corner: the state tag is top-right, the dog-ear top-left and
          the swap icon bottom-left. */}
      <ZoomButton onClick={() => setZoomOpen(true)} className="bottom-1.5 right-1.5" />
      {zoomOpen ? (
        <ImageLightbox
          images={[
            { src: afterZoomSrc, alt: afterAlt, label: afterAlt },
            { src: beforeZoomSrc, alt: beforeAlt, label: beforeAlt },
          ]}
          initialIndex={showingBefore ? 1 : 0}
          onClose={() => setZoomOpen(false)}
        />
      ) : null}
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
