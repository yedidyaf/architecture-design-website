"use client";
import {useEffect, useRef, useState} from "react";
import BeforeAfter from "./BeforeAfter";

type GalleryProject = {id: string; title?: string; beforeSrc: string; afterSrc: string};

// Three gentle reminders, then permanently quiet: first shortly after the
// gallery appears, a second reminder well into the visit, a last one further
// out still — each just a brief peek + pulse, not a running loop.
const HINT_ROUNDS_MS = [2500, 23000, 55000];
const ROUND_VISIBLE_MS = 1700;
const STAGGER_STEP_MS = 90;
const STAGGER_MAX_MS = 360;

export default function Gallery({projects}: {projects: GalleryProject[]}) {
  // hintActive is true only for the brief window of each round (gates the
  // auto-peek crossfade). labelVisible turns on with the first round and then
  // stays on — a standing reminder on card #1 — until dismissed. interactedRef
  // makes dismissal permanent-for-this-load and lets still-pending rounds bail
  // out, even mid-sequence. Everything here is plain React state — nothing
  // persisted, so a reload starts the cycle over.
  const [hintActive, setHintActive] = useState(false);
  const [labelVisible, setLabelVisible] = useState(false);
  const [peekTrigger, setPeekTrigger] = useState(0);
  const interactedRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    HINT_ROUNDS_MS.forEach((startMs) => {
      timers.push(
        setTimeout(() => {
          if (interactedRef.current) return;
          setHintActive(true);
          setLabelVisible(true);
          setPeekTrigger((n) => n + 1);
        }, startMs),
        setTimeout(() => {
          if (interactedRef.current) return;
          setHintActive(false);
        }, startMs + ROUND_VISIBLE_MS)
      );
    });
    timersRef.current = timers;
    return () => timers.forEach(clearTimeout);
  }, []);

  const dismiss = () => {
    if (interactedRef.current) return;
    interactedRef.current = true;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setHintActive(false);
    setLabelVisible(false);
  };

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p, i) => (
        <figure key={p.id}>
          <BeforeAfter
            beforeSrc={p.beforeSrc}
            afterSrc={p.afterSrc}
            peekTrigger={peekTrigger}
            peekDelayMs={Math.min(i * STAGGER_STEP_MS, STAGGER_MAX_MS)}
            hintActive={hintActive}
            labelVisible={labelVisible}
            showHintLabel={i === 0}
            onFirstInteract={dismiss}
          />
          {p.title ? (
            <figcaption className="mt-4 text-center text-lg font-medium text-brand-ink">
              {p.title}
            </figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
}
