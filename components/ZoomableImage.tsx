"use client";

import { useState } from "react";
import ImageLightbox from "./ImageLightbox";
import ZoomButton from "./ZoomButton";

// An article's content image with a magnifier in its corner that opens it in
// the zoom lightbox. `zoomSrc` is a larger rendition for zooming in.
export default function ZoomableImage({ src, zoomSrc, alt }: { src: string; zoomSrc: string; alt: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="w-full rounded-md object-cover" />
      <ZoomButton onClick={() => setOpen(true)} className="bottom-1.5 right-1.5" />
      {open ? <ImageLightbox images={[{ src: zoomSrc, alt }]} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}
