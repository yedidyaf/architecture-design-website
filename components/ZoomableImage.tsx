"use client";

import { useRef } from "react";
import { useLightboxEntry } from "./LightboxGallery";
import ZoomButton from "./ZoomButton";

// An article's content image with a magnifier in its corner that opens it in
// the zoom lightbox (as part of the page's LightboxGallery). `zoomSrc` is a
// larger rendition for zooming in; `caption` is shown in the lightbox.
export default function ZoomableImage({
  src,
  zoomSrc,
  alt,
  caption,
}: {
  src: string;
  zoomSrc: string;
  alt: string;
  caption?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { openLightbox, soloLightbox } = useLightboxEntry(ref, () => ({
    images: [{ src: zoomSrc, alt }],
    caption: caption || undefined,
  }));
  return (
    <div ref={ref} className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="w-full rounded-md object-cover" />
      <ZoomButton onClick={openLightbox} className="bottom-1.5 right-1.5" />
      {soloLightbox}
    </div>
  );
}
