"use client";
import {useEffect, useRef, useState} from "react";
import Image from "next/image";

type Props = {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
  /** Bumps to a new value each time a peek round should fire (before-image briefly shows, then fades back). */
  peekTrigger?: number;
  /** Stagger the peek's start across multiple cards. */
  peekDelayMs?: number;
  /** Gates the auto-peek crossfade during each hint round; false hides it instantly. */
  hintActive?: boolean;
  /** Whether the pulsing "tap to reveal" label should be shown (persists until dismissed). */
  labelVisible?: boolean;
  /** Show the pulsing "tap to reveal" label on this card. */
  showHintLabel?: boolean;
  /** Fired on the very first pointer-down, so a parent can dismiss the hint site-wide. */
  onFirstInteract?: () => void;
};

const PEEK_VISIBLE_MS = 1100;

export default function BeforeAfter({
  beforeSrc,
  afterSrc,
  beforeAlt = "לפני",
  afterAlt = "אחרי",
  peekTrigger = 0,
  peekDelayMs = 0,
  hintActive = false,
  labelVisible = false,
  showHintLabel = false,
  onFirstInteract,
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const [autoPeek, setAutoPeek] = useState(false);
  const start = useRef<{x: number; y: number} | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = () => {if (timer.current) {clearTimeout(timer.current); timer.current = null;}};

  useEffect(() => {
    if (peekTrigger === 0) return;
    const showT = setTimeout(() => setAutoPeek(true), peekDelayMs);
    const hideT = setTimeout(() => setAutoPeek(false), peekDelayMs + PEEK_VISIBLE_MS);
    return () => {clearTimeout(showT); clearTimeout(hideT);};
  }, [peekTrigger, peekDelayMs]);

  const onDown = (e: React.PointerEvent) => {
    onFirstInteract?.();
    start.current = {x: e.clientX, y: e.clientY};
    clear();
    timer.current = setTimeout(() => setRevealed(true), 120);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    if (Math.abs(e.clientX - start.current.x) > 10 || Math.abs(e.clientY - start.current.y) > 10) {
      clear(); setRevealed(false); start.current = null;
    }
  };
  const end = () => {clear(); setRevealed(false); start.current = null;};

  const showBefore = revealed || (autoPeek && hintActive);

  return (
    <div
      className="group relative aspect-square w-full select-none overflow-hidden rounded-md bg-neutral-100"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={end}
      onPointerLeave={end}
      onPointerCancel={end}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Image
        src={afterSrc}
        alt={afterAlt}
        fill
        draggable={false}
        className="object-cover"
        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
      />
      <Image
        src={beforeSrc}
        alt={beforeAlt}
        fill
        draggable={false}
        className={`object-cover transition-opacity duration-300 ${showBefore ? "opacity-100" : "opacity-0"}`}
        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
      />
      <span
        className="pointer-events-none absolute right-3 top-3 rounded-full bg-brand/55 px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-sm [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]"
      >
        {showBefore ? beforeAlt : afterAlt}
      </span>
      {showHintLabel ? (
        <div
          className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
            labelVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <span
            className={`rounded-full bg-brand/90 px-4 py-1.5 text-xs font-medium text-white shadow-md ${
              labelVisible ? "animate-hint-pulse" : ""
            }`}
          >
            לחץ לגילוי
          </span>
        </div>
      ) : null}
    </div>
  );
}