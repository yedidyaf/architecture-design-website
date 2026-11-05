"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import ProjectCover from "./ProjectCover";
import { POSTS_HASH, type HomeProject } from "./types";

// Marks the history entry pushed while the overlay is open. The overlay's
// open state is read from the current history entry, so:
//   - back while it's open pops that entry and closes it (instead of leaving
//     the page);
//   - back from a project opened from it lands on that entry again, and the
//     homepage (remounted by the router) comes back with the overlay open;
//   - a further back closes it.
const HISTORY_KEY = "postsOverlay";
// How the flagged entry came about: pushed by the "לפוסטים" button (closing
// pops it), or arrived at through a link to POSTS_HASH, e.g. the back arrow
// on an article (closing just clears the flag, since popping would leave the
// homepage).
const PUSHED = true;
const LINKED = "linked";

// Fired after our own pushState, which (unlike back / forward) doesn't
// emit popstate.
const CHANGE_EVENT = "postsoverlaychange";
// Below this width the overlay exists; on desktop the flag is ignored so a
// flagged entry can never scroll-lock the desktop page.
const MOBILE_QUERY = "(max-width: 899.98px)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(MOBILE_QUERY);
  window.addEventListener("popstate", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  mq.addEventListener("change", onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
    mq.removeEventListener("change", onChange);
  };
}
const isOpenInHistory = () =>
  Boolean(window.history.state?.[HISTORY_KEY]) && window.matchMedia(MOBILE_QUERY).matches;
// Server render (and hydration): closed.
const closedOnServer = () => false;

// Where the overlay was scrolled when a project was tapped, restored when
// back brings the overlay back. Module scope survives client navigation.
let savedScroll = 0;

// Sits above the global "under construction" notice (z-100) so the back
// arrow is the only thing at the top.
//
// Mobile-only: a full-width "לפוסטים" button that opens a full-screen grid of
// the projects (2 across). The only chrome is a back arrow at the top.
export default function MobileProjects({ projects }: { projects: HomeProject[] }) {
  const open = useSyncExternalStore(subscribe, isOpenInHistory, closedOnServer);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const openOverlay = () => {
    savedScroll = 0;
    // Keep the router's own keys in the entry; only add ours.
    window.history.pushState({ ...window.history.state, [HISTORY_KEY]: PUSHED }, "");
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  // Closing goes back through history, consuming the entry pushed on open;
  // popstate then re-reads the (now unflagged) entry. An entry reached via
  // POSTS_HASH has no homepage entry under it, so its flag is cleared in place.
  const close = useCallback(() => {
    const flag = window.history.state?.[HISTORY_KEY];
    if (flag === LINKED) {
      const rest = { ...window.history.state };
      delete rest[HISTORY_KEY];
      window.history.replaceState(rest, "");
      window.dispatchEvent(new Event(CHANGE_EVENT));
    } else if (flag) {
      window.history.back();
    }
  }, []);

  // Arriving at /#posts: turn the hash into the history flag (and drop it
  // from the URL), so the overlay opens on mobile. On desktop the flag is
  // ignored and the projects column is on the page anyway.
  useEffect(() => {
    if (window.location.hash !== POSTS_HASH) return;
    savedScroll = 0;
    const url = window.location.pathname + window.location.search;
    window.history.replaceState({ ...window.history.state, [HISTORY_KEY]: LINKED }, "", url);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (dialogRef.current) dialogRef.current.scrollTop = savedScroll;
    backRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      trigger?.focus({ preventScroll: true });
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openOverlay}
        aria-haspopup="dialog"
        className="mb-14 block w-full cursor-pointer bg-brand py-3.5 text-center text-lg font-medium text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        לפוסטים
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="פוסטים"
          dir="rtl"
          lang="he"
          ref={dialogRef}
          className="animate-about-fade-in fixed inset-0 z-[110] overflow-y-auto overscroll-contain bg-background"
        >
          <div className="sticky top-0 z-10 flex h-14 items-center bg-background/90 px-2 backdrop-blur-sm">
            {/* RTL: "back" points to the right, the reading-start edge. */}
            <button
              ref={backRef}
              type="button"
              onClick={close}
              aria-label="חזור"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-brand transition-colors hover:text-brand-hover focus-visible:outline-2 focus-visible:outline-brand"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 px-3 pb-12 pt-2">
              {projects.map((p) => (
                <Link
                  key={p._id}
                  href={`/projects/${p.slug}`}
                  onClick={() => {
                    savedScroll = dialogRef.current?.scrollTop ?? 0;
                  }}
                  className="group block"
                >
                  <ProjectCover src={p.coverSrc} fit={p.coverFit} position={p.coverPosition} alt={p.title} sizes="50vw" />
                  <p className="mt-2 text-center text-sm font-medium text-brand-ink">{p.title}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="px-6 pt-10 text-center text-brand-ink/70">פרויקטים יתווספו בקרוב</p>
          )}
        </div>
      ) : null}
    </>
  );
}
