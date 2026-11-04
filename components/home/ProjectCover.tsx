import Image from "next/image";
import type { CoverFit } from "./types";

// Square cover cell, in one of two modes (chosen per project in Studio):
//   crop    — object-cover fills the square. `src` is already a square crop
//             from the Sanity CDN, centered on the hotspot; `position` (from
//             the same hotspot) keeps the focal point centered if the source
//             isn't square after all.
//   contain — never crops: the cover is contained, and a blurred, cream-
//             tinted copy of it fills the letterbox (same approach as
//             BeforeAfter). `src` is built with fit("max") and no height.
export default function ProjectCover({
  src,
  alt,
  sizes,
  fit = "crop",
  position,
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  fit?: CoverFit;
  position?: string;
  className?: string;
}) {
  return (
    <div className={`relative aspect-square w-full overflow-hidden rounded-md bg-[#FAF7F5] ${className}`}>
      {fit === "contain" ? (
        <>
          <Image
            src={src}
            alt=""
            aria-hidden="true"
            fill
            quality={40}
            className="scale-125 object-cover blur-[24px]"
            sizes={sizes}
          />
          <div className="absolute inset-0 bg-[#FAF7F5]/55" />
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            sizes={sizes}
          />
        </>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          style={position ? { objectPosition: position } : undefined}
          sizes={sizes}
        />
      )}
    </div>
  );
}
