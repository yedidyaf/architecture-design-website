import type { Ref } from "react";
import ProjectCover from "./ProjectCover";
import type { HomeProject } from "./types";

// Mobile twin of the desktop projects column: a small, fast, endlessly
// looping drift of the posts inside the same sketched frames. It is ONE tap
// target (a single button): no tile links anywhere, a tap on any post just
// opens the full posts overlay.
const TILE_WIDTH = 124;
// Rough height of one tile (frame room + square cover + title), only used to
// turn SPEED into a loop duration.
const TILE_HEIGHT = 190;
// Upward drift, px per second (desktop is 18; this is meant to be quick).
const SPEED = 70;
// A copy needs at least this many tiles so it is taller than the viewport
// and the loop never shows a gap, however few posts there are.
const MIN_TILES = 4;
const VIEWPORT_HEIGHT = 380;

export default function MobilePostsPreview({
  projects,
  onOpen,
  buttonRef,
}: {
  projects: HomeProject[];
  onOpen: () => void;
  buttonRef?: Ref<HTMLButtonElement>;
}) {
  if (projects.length === 0) return null;

  const repeat = Math.ceil(MIN_TILES / projects.length);
  const tiles = Array.from({ length: repeat }, () => projects).flat();
  const seconds = (tiles.length * TILE_HEIGHT) / SPEED;

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label="פוסטים"
      className="mb-14 block w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <div
        className="relative mx-auto overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]"
        style={{ width: TILE_WIDTH + 36, height: VIEWPORT_HEIGHT }}
      >
        <div
          className="mobile-posts-drift will-change-transform"
          style={{ animationDuration: `${seconds}s` }}
        >
          {[0, 1].map((c) => (
            <div key={c} aria-hidden="true" className="px-[18px]">
              {tiles.map((p, i) => (
                <div key={`${p._id}-${i}`} className="sketch-tile py-5">
                  <div className="sketch-frame relative">
                    <ProjectCover
                      src={p.coverSrc}
                      fit={p.coverFit}
                      position={p.coverPosition}
                      alt=""
                      sizes={`${TILE_WIDTH}px`}
                    />
                  </div>
                  <p className="mt-2.5 text-center text-sm font-medium leading-snug text-brand-ink">{p.title}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}
