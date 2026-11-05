// How a cover fills its square tile (Sanity `project.coverFit`).
//   crop    — fills the square; the CDN crops around the image's hotspot.
//   contain — the whole image, over a blurred, cream-tinted copy of itself.
export type CoverFit = "crop" | "contain";

// A project as the homepage's client components receive it: the cover URL is
// already built on the server, so no Sanity code ships to the browser.
export type HomeProject = {
  _id: string;
  title: string;
  slug: string;
  coverSrc: string;
  coverFit: CoverFit;
  /** CSS object-position from the hotspot, for crop mode. */
  coverPosition?: string;
};

/**
 * Hash for a link to the homepage with the mobile posts overlay open (e.g.
 * the back arrow on an article). Here, not in the client component, so
 * server components can import it as a plain string.
 */
export const POSTS_HASH = "#posts";
