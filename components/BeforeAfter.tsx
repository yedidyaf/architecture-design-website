"use client";
import {useEffect, useRef, useState} from "react";
import Image from "next/image";

type Props = {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
  /** Arms a one-shot auto-peek demo (before-image briefly shows, then fades back). */
  peek?: boolean;
  /** Stagger the peek's start across multiple cards. */
  peekDelayMs?: number;
  /** Whether the hint phase (peek + label) is still active; false hides both instantly. */
  hintActive?: boolean;
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
  peek = false,
  peekDelayMs = 0,
  hintActive = false,
  showHintLabel = false,
  onFirstInteract,
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const [autoPeek, setAutoPeek] = useState(false);
  const start = useRef<{x: number; y: number} | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = () => {if (timer.current) {clearTimeout(timer.current); timer.current = null;}};

  useEffect(() => {
    if (!peek) return;
    const showT = setTimeout(() => setAutoPeek(true), peekDelayMs);
    const hideT = setTimeout(() => setAutoPeek(false), peekDelayMs + PEEK_VISIBLE_MS);
    return () => {clearTimeout(showT); clearTimeout(hideT);};
  }, [peek, peekDelayMs]);

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
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
        {showBefore ? beforeAlt : afterAlt}
      </span>
      <span
        className={`pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/45 px-2 py-0.5 text-[11px] text-white/90 backdrop-blur-sm transition-opacity duration-300 ${showBefore ? "opacity-0" : "opacity-100"}`}
      >
        החזק לפני
      </span>
      {showHintLabel ? (
        <div
          className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
            hintActive ? "opacity-100" : "opacity-0"
          }`}
        >
          <span
            className={`rounded-full bg-[#5C4442]/90 px-4 py-1.5 text-xs font-medium text-white shadow-md ${
              hintActive ? "animate-hint-pulse" : ""
            }`}
          >
            לחצו לגילוי
          </span>
        </div>
      ) : null}
    </div>
  );
}