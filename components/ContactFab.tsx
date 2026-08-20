"use client";
import {useEffect, useRef, useState} from "react";
import {
  WHATSAPP_URL,
  PHONE_PRIMARY_URL,
  PHONE_PRIMARY_DISPLAY,
  PHONE_SECONDARY_URL,
  PHONE_SECONDARY_DISPLAY,
  EMAIL_URL,
} from "@/lib/contact";

// Single brand tone used for every option — the icon distinguishes them, not the color.
const BRAND_BG = "bg-brand";
const BRAND_HOVER = "hover:bg-brand-hover";

const ROW_CLASS = `flex h-11 w-56 items-center gap-3 rounded-full ${BRAND_BG} px-4 text-sm font-medium text-white shadow-md transition-transform ${BRAND_HOVER} hover:scale-[1.02]`;
const ICON_WRAP = "flex h-6 w-6 shrink-0 items-center justify-center";

const whatsappIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.87 9.87 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.14.82.84-3.06-.2-.31a8.22 8.22 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.26-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.23.25-.85.83-.85 2.03s.87 2.36.99 2.52c.12.16 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29Z" />
  </svg>
);

const phoneIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z" />
  </svg>
);

const emailIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 10 6 10-6" />
  </svg>
);

const ATTENTION_DELAY_MS = 30000;

export default function ContactFab() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // One-shot "notice me" cue for users who haven't discovered the button yet.
  // Purely in-memory (React state) — resets on every reload, same as the
  // gallery hint. interactedRef makes the dismissal permanent-for-this-load
  // and lets the pending timers below bail out even mid-sequence.
  const [attentionOn, setAttentionOn] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const interactedRef = useRef(false);
  const cueTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const armTimer = setTimeout(() => {
      if (interactedRef.current) return;
      setAttentionOn(true);
      cueTimers.current.push(
        setTimeout(() => setExpanded(true), 300),
        setTimeout(() => setExpanded(false), 1900),
        setTimeout(() => setExpanded(true), 2600),
        setTimeout(() => setExpanded(false), 4200),
        setTimeout(() => setAttentionOn(false), 5000)
      );
    }, ATTENTION_DELAY_MS);
    return () => {
      clearTimeout(armTimer);
      cueTimers.current.forEach(clearTimeout);
    };
  }, []);

  const dismissAttention = () => {
    if (interactedRef.current) return;
    interactedRef.current = true;
    cueTimers.current.forEach(clearTimeout);
    cueTimers.current = [];
    setAttentionOn(false);
    setExpanded(false);
  };

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    // Plain physical offsets only (right/bottom) — no inset-x, no logical
    // CSS properties (Tailwind's inset-x-* compiles to the "inset-inline"
    // logical property, which some browsers/webviews don't support; an
    // unsupported shorthand is silently dropped rather than falling back,
    // leaving a fixed element unconstrained and positioned unpredictably).
    // The box has only `right`+`bottom` set, so its width is the standard
    // CSS2.1 shrink-to-fit value sized by its one child (the 56px button
    // anchor) — universally supported, zero ambiguity.
    <div ref={ref} className="fixed bottom-6 right-6 z-50 sm:bottom-8 sm:right-8">
      <div className="relative h-14 w-14">
        <div
          className={`absolute bottom-full right-0 mb-3 flex w-56 max-w-[calc(100vw-3rem)] origin-bottom-right flex-col gap-2 transition-all duration-200 ${
            open ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-2 scale-95 opacity-0"
          }`}
        >
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={ROW_CLASS}>
            <span className={ICON_WRAP}>{whatsappIcon}</span>
            <span>וואטסאפ</span>
          </a>

          <a
            href={PHONE_PRIMARY_URL}
            className={`${ROW_CLASS} sm:pointer-events-none sm:cursor-default sm:hover:scale-100`}
          >
            <span className={ICON_WRAP}>{phoneIcon}</span>
            <span dir="ltr" className="tabular-nums">{PHONE_PRIMARY_DISPLAY}</span>
          </a>

          <a
            href={PHONE_SECONDARY_URL}
            className={`${ROW_CLASS} sm:pointer-events-none sm:cursor-default sm:hover:scale-100`}
          >
            <span className={ICON_WRAP}>{phoneIcon}</span>
            <span dir="ltr" className="tabular-nums">{PHONE_SECONDARY_DISPLAY}</span>
          </a>

          <a href={EMAIL_URL} className={ROW_CLASS}>
            <span className={ICON_WRAP}>{emailIcon}</span>
            <span>מייל</span>
          </a>
        </div>

        {attentionOn ? (
          <>
            <span className="pointer-events-none absolute bottom-0 right-0 h-14 w-14 animate-fab-ripple rounded-full border-2 border-brand/60" />
            <span
              className="pointer-events-none absolute bottom-0 right-0 h-14 w-14 animate-fab-ripple rounded-full border-2 border-brand/60"
              style={{animationDelay: "0.55s"}}
            />
          </>
        ) : null}

        <button
          type="button"
          onClick={() => {
            dismissAttention();
            setOpen((v) => !v);
          }}
          aria-expanded={open}
          aria-label={open ? "סגור אפשרויות יצירת קשר" : "יצירת קשר"}
          className={`absolute bottom-0 right-0 flex h-14 items-center justify-center rounded-full ${BRAND_BG} text-white shadow-lg backdrop-blur transition-all duration-500 ${BRAND_HOVER} hover:scale-105 active:scale-95 ${
            expanded ? "w-auto gap-2 px-5" : "w-14"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-6 w-6 shrink-0 leading-none transition-transform duration-200 ${open ? "rotate-45" : "-translate-y-px"}`}
          >
            {open ? (
              <path d="M18 6 6 18M6 6l12 12" />
            ) : (
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            )}
          </svg>
          <span
            className={`overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 ${
              expanded ? "max-w-[6rem] opacity-100" : "max-w-0 opacity-0"
            }`}
          >
            צור קשר
          </span>
        </button>
      </div>
    </div>
  );
}
