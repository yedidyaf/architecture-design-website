"use client";
import {useEffect, useRef, useState} from "react";

// Edit these to update the contact details shown in the floating button.
const WHATSAPP_URL = "https://wa.me/972546563464";
const PHONE_PRIMARY_URL = "tel:+972546563464";
const PHONE_PRIMARY_DISPLAY = "054-656-3464";
const PHONE_SECONDARY_URL = "tel:+972527132117";
const PHONE_SECONDARY_DISPLAY = "052-713-2117";
const EMAIL_URL = "mailto:mirivlin@gmail.com";

// Single brand tone used for every option — the icon distinguishes them, not the color.
const BRAND_BG = "bg-[#5C4442]";
const BRAND_HOVER = "hover:bg-[#4a3736]";

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

export default function ContactFab() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
    <div ref={ref}>
      {/*
        Bounded on both sides (inset-x) so its containing block can never
        extend past the viewport, regardless of RTL flex/shrink-to-fit
        quirks — the menu can only open inward from the corner, never off-screen.
      */}
      <div
        className={`fixed inset-x-4 bottom-[5.25rem] z-50 origin-bottom-right transition-all duration-200 sm:inset-x-8 sm:bottom-[6.25rem] ${
          open ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-2 scale-95 opacity-0"
        }`}
      >
        <div className="absolute bottom-0 right-0 flex w-56 max-w-[calc(100vw-2rem)] flex-col gap-2">
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
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "סגור אפשרויות יצירת קשר" : "יצירת קשר"}
        className={`fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full ${BRAND_BG} text-white shadow-lg backdrop-blur transition-transform sm:bottom-8 sm:right-8 ${BRAND_HOVER} hover:scale-105 active:scale-95`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-6 w-6 transition-transform duration-200 ${open ? "rotate-45" : ""}`}
        >
          {open ? (
            <path d="M18 6 6 18M6 6l12 12" />
          ) : (
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          )}
        </svg>
      </button>
    </div>
  );
}
