"use client";
import {useEffect, useRef, useState} from "react";
import BeforeAfter from "./BeforeAfter";

type GalleryProject = {id: string; title?: string; beforeSrc: string; afterSrc: string};

const HINT_DELAY_MS = 2500;
const STAGGER_STEP_MS = 90;
const STAGGER_MAX_MS = 360;

export default function Gallery({projects}: {projects: GalleryProject[]}) {
  // "armed" flips true once, ~2.5s after mount, and arms every card's one-shot
  // peek timer. "dismissed" flips true forever on the first press anywhere and
  // instantly hides the peek + label, even mid-animation. Both live only in
  // React state for this page load — nothing is persisted.
  const [armed, setArmed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const interactedRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (interactedRef.current) return;
      setArmed(true);
    }, HINT_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    if (interactedRef.current) return;
    interactedRef.current = true;
    setDismissed(true);
  };

  const hintActive = armed && !dismissed;

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p, i) => (
        <figure key={p.id}>
          <BeforeAfter
            beforeSrc={p.beforeSrc}
            afterSrc={p.afterSrc}
            peek={armed}
            peekDelayMs={Math.min(i * STAGGER_STEP_MS, STAGGER_MAX_MS)}
            hintActive={hintActive}
            showHintLabel={i === 0}
            onFirstInteract={dismiss}
          />
          {p.title ? (
            <figcaption className="mt-4 text-center text-lg font-medium text-neutral-800">
              {p.title}
            </figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
}
