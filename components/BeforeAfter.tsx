"use client";
import {useEffect, useState} from "react";
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
  /** Whether the pulsing "tap to toggle" icon should be shown (persists until dismissed). */
  labelVisible?: boolean;
  /** Show the pulsing "tap to toggle" icon on this card. */
  showHintLabel?: boolean;
  /** Width / height of the image pair; the box matches it so nothing is cropped. Defaults to square. */
  aspectRatio?: number;
  /** Fired on the very first tap/click, so a parent can dismiss the hint site-wide. */
  onFirstInteract?: () => void;
};

const PEEK_VISIBLE_MS = 1100;

function SwapIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M7 4L3 8l4 4" />
      <path d="M3 8h14" />
      <path d="M17 12l4 4-4 4" />
      <path d="M21 16H7" />
    </svg>
  );
}

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
  aspectRatio = 1,
  onFirstInteract,
}: Props) {
  const [toggled, setToggled] = useState(false);
  const [autoPeek, setAutoPeek] = useState(false);

  useEffect(() => {
    if (peekTrigger === 0) return;
    const showT = setTimeout(() => setAutoPeek(true), peekDelayMs);
    const hideT = setTimeout(() => setAutoPeek(false), peekDelayMs + PEEK_VISIBLE_MS);
    return () => {clearTimeout(showT); clearTimeout(hideT);};
  }, [peekTrigger, peekDelayMs]);

  const handleClick = () => {
    onFirstInteract?.();
    setToggled((v) => !v);
  };

  const showBefore = toggled || (autoPeek && hintActive);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={toggled}
      aria-label="לחץ להחלפה בין לפני לאחרי"
      style={{ aspectRatio }}
      className="group relative w-full cursor-pointer select-none overflow-hidden rounded-md bg-neutral-100"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Image
        src={afterSrc}
        alt={afterAlt}
        fill
        draggable={false}
        className="object-contain"
        sizes="(max-width:768px) 100vw, 65ch"
      />
      <Image
        src={beforeSrc}
        alt={beforeAlt}
        fill
        draggable={false}
        className={`object-contain transition-opacity duration-300 ${showBefore ? "opacity-100" : "opacity-0"}`}
        sizes="(max-width:768px) 100vw, 65ch"
      />
      <span
        className="pointer-events-none absolute right-3 top-3 rounded-full bg-brand/55 px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-sm [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]"
      >
        {showBefore ? beforeAlt : afterAlt}
      </span>
      {/* Subtle "tap to swap" affordance — icon only, no text. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-brand/80 shadow-sm backdrop-blur-sm"
      >
        <SwapIcon className="h-4 w-4" />
      </span>
      {showHintLabel ? (
        <div
          className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
            labelVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <span
            aria-hidden="true"
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-brand/80 text-white shadow-md ${
              labelVisible ? "animate-hint-pulse" : ""
            }`}
          >
            <SwapIcon className="h-6 w-6" />
          </span>
        </div>
      ) : null}
    </div>
  );
}