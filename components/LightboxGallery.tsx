"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import ImageLightbox, { type LightboxItem } from "./ImageLightbox";

// One zoomable block on the page. `get` is read when the lightbox opens or
// navigates to it, so a before/after block reports the side it shows *now*.
type Entry = { ref: RefObject<HTMLElement | null>; get: () => LightboxItem };

type Gallery = {
  register: (entry: Entry) => () => void;
  open: (entry: Entry) => void;
};

const GalleryContext = createContext<Gallery | null>(null);

/**
 * Groups every zoomable image inside it (ZoomableImage, BeforeAfterHint) into
 * one lightbox, so the visitor can step through the article's images in
 * document order without closing it.
 */
export default function LightboxGallery({ children }: { children: ReactNode }) {
  const entries = useRef(new Set<Entry>());
  const [session, setSession] = useState<{ items: LightboxItem[]; start: number } | null>(null);

  const register = useCallback((entry: Entry) => {
    entries.current.add(entry);
    return () => {
      entries.current.delete(entry);
    };
  }, []);

  const open = useCallback((entry: Entry) => {
    // Registration order follows mount order, which isn't guaranteed to be
    // document order; sort by position in the page instead.
    const ordered = [...entries.current]
      .filter((e) => e.ref.current)
      .sort((a, b) =>
        a.ref.current!.compareDocumentPosition(b.ref.current!) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
      );
    const start = Math.max(0, ordered.indexOf(entry));
    setSession({ items: ordered.map((e) => e.get()), start });
  }, []);

  const value = useMemo(() => ({ register, open }), [register, open]);

  return (
    <GalleryContext.Provider value={value}>
      {children}
      {session ? (
        <ImageLightbox items={session.items} startIndex={session.start} onClose={() => setSession(null)} />
      ) : null}
    </GalleryContext.Provider>
  );
}

/**
 * Registers a zoomable block with the surrounding LightboxGallery and returns
 * a function that opens the lightbox on it. Outside a gallery, the block gets
 * a lightbox of its own (just its own image).
 */
export function useLightboxEntry(ref: RefObject<HTMLElement | null>, get: () => LightboxItem) {
  const gallery = useContext(GalleryContext);
  // Latest `get` without re-registering on every render.
  const getRef = useRef(get);
  useEffect(() => {
    getRef.current = get;
  });
  const entry = useMemo<Entry>(() => ({ ref, get: () => getRef.current() }), [ref]);

  useEffect(() => (gallery ? gallery.register(entry) : undefined), [gallery, entry]);

  const [solo, setSolo] = useState<LightboxItem | null>(null);
  const openLightbox = useCallback(() => {
    if (gallery) gallery.open(entry);
    else setSolo(entry.get());
  }, [gallery, entry]);

  const soloLightbox = solo ? (
    <ImageLightbox items={[solo]} startIndex={0} onClose={() => setSolo(null)} />
  ) : null;

  return { openLightbox, soloLightbox };
}
