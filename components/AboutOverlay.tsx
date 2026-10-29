"use client";
import {useEffect, useRef, useState, type ReactNode} from "react";

const TITLE = "קצת עליי";

export type BioAlign = "right" | "center" | "justify";

// Text-align for the bio, chosen by the editor in Studio (`bioAlign`).
// Justified text keeps its last line flush right (the RTL start edge).
const ALIGN_CLASS: Record<BioAlign, string> = {
  right: "text-right",
  center: "text-center",
  justify: "text-justify",
};

// Handwritten "reflection" trigger + full-screen overlay for the long About
// text, shown as a centered card over a dimmed backdrop. The rich text is rendered on the server and passed in as children.
export default function AboutOverlay({
  children,
  align = "right",
}: {
  children: ReactNode;
  align?: BioAlign;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="פתח את הטקסט המלא: קצת עליי"
        aria-haspopup="dialog"
        className="group mx-auto mt-5 block cursor-pointer bg-transparent p-0 font-brand-name text-2xl text-brand sm:mt-4 sm:text-[1.7rem]"
      >
        <span className="border-b border-brand/30 pb-0.5 transition-colors duration-300 group-hover:border-brand/70 group-focus-visible:border-brand/70">
          {TITLE} ←
        </span>
      </button>

      {open ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={TITLE}
          tabIndex={-1}
          dir="rtl"
          lang="he"
          onClick={() => setOpen(false)}
          className="animate-about-fade-in fixed inset-0 z-[60] flex items-center justify-center bg-brand-ink/45 p-4 outline-none backdrop-blur-[2px] sm:p-8"
        >
          {/* The card scrolls on its own; clicks on it don't reach the
              backdrop handler, so only the dimmed area around it closes. */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-about-pop-in relative flex max-h-full w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-background shadow-2xl shadow-brand-ink/30"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="סגור"
              className="absolute left-2 top-2 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-brand transition-colors hover:text-brand-hover focus-visible:outline-2 focus-visible:outline-brand"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-6 w-6" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <div className="overflow-y-auto px-7 pb-10 pt-10 sm:px-10">
              <svg viewBox="0 0 60 60" fill="none" stroke="#9f2b35" strokeWidth="1.5" className="mx-auto h-14 w-14 opacity-60" aria-hidden="true">
                <path d="M6 56V30a24 24 0 0 1 48 0v26" />
                <path d="M16 56V31a14 14 0 0 1 28 0v25" opacity="0.8" />
                <path d="M25 56V32a5 5 0 0 1 10 0v24" opacity="0.6" />
              </svg>
              <h2 className="mt-4 text-center font-brand-name text-4xl font-bold text-brand">{TITLE}</h2>
              <div className={`mx-auto mt-8 max-w-[440px] text-base leading-[1.85] text-brand-ink [&_strong]:text-brand ${ALIGN_CLASS[align]}`}>
                {children}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
