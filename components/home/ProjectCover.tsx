import Image from "next/image";

// Square cover cell that never crops: the cover is contained, and a blurred,
// cream-tinted copy of it fills the letterbox (same approach as BeforeAfter).
// `src` should be a Sanity URL built with fit("max") and no height, so the
// CDN doesn't crop it to a square either.
export default function ProjectCover({
  src,
  alt,
  sizes,
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
}) {
  return (
    <div className={`relative aspect-square w-full overflow-hidden rounded-md bg-[#FAF7F5] ${className}`}>
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
    </div>
  );
}
