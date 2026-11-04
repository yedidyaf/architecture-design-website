import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import Testimonials from "@/components/Testimonials";
import MobileProjects from "./MobileProjects";
import ProjectsColumn from "./ProjectsColumn";
import type { HomeProject } from "./types";

export type BioAlign = "right" | "center" | "justify";

// Text-align for the bio, chosen by the editor in Studio (`bioAlign`).
// Justified text keeps its last line flush right (the RTL start edge).
const ALIGN_CLASS: Record<BioAlign, string> = {
  right: "text-right",
  center: "text-center",
  justify: "text-justify",
};

// Right column: the illustration strip (approved, keep as is). 200px column,
// 32px inset, so the drawn band is 136px wide.
const SIDE_COLUMN_WIDTH = 200;
const SIDE_INSET = "px-8";
const SIDE_CONTENT_WIDTH = SIDE_COLUMN_WIDTH - 2 * 32;
// The band is 173px of the PNG's 1414px width; scale it to the content box.
const ILLUSTRATION_WIDTH = Math.round((SIDE_CONTENT_WIDTH * 1414) / 173);

// Center reading column on desktop: 620px of text, no side padding, so the
// left gutter starts exactly where the text ends.
const TEXT_TRACK = 620;
// Projects tile width on desktop.
const PROJECT_TILE_WIDTH = 168;
// Clearance between the testimonials and the project tiles.
const TESTIMONIALS_GAP = 24;

// Desktop grid, RTL (track 1 is on the right):
//   1 illustrations | 2 spacer (1fr) | 3 text | 4 spacer (1fr) | 5 (200px)
// The two 1fr spacers are equal, so the text stays centered on the screen.
// The projects span tracks 4–5 (the whole left gutter) and are centered in
// it. The testimonials span tracks 2–4 in their own row; their side padding
// keeps them clear of the project tiles and is mirrored on the other side so
// they stay centered.
const GRID_COLUMNS = `${SIDE_COLUMN_WIDTH}px minmax(0, 1fr) min(${TEXT_TRACK}px, calc(100% - ${2 * SIDE_COLUMN_WIDTH}px)) minmax(0, 1fr) ${SIDE_COLUMN_WIDTH}px`;
// Inside tracks 2–4 (width W = 2 * spacer + text, so spacer = (W - text) / 2)
// the tile's inner edge sits (spacer + 200 + tile) / 2 from the gutter's
// outer edge, i.e. (spacer + tile - 200) / 2 past the start of track 4; the
// gap is added to that. Never more than the spacer itself, so on narrow
// desktops the testimonials are at least as wide as the text.
const SPACER = `((100% - min(${TEXT_TRACK}px, 100%)) / 2)`;
const TESTIMONIALS_INSET = `max(0px, min(${SPACER}, calc((${SPACER} + ${PROJECT_TILE_WIDTH - SIDE_COLUMN_WIDTH}px) / 2 + ${TESTIMONIALS_GAP}px)))`;

type Testimonial = { _id: string; clientName: string; quote: string };

export type HomeViewProps = {
  name?: string;
  logoSrc?: string;
  tagline?: string;
  /** The About text, already rendered (Portable Text) on the server. */
  bio?: ReactNode;
  bioAlign?: BioAlign;
  projects: HomeProject[];
  testimonials: Testimonial[];
};

// Homepage layout, presentational only: page.tsx fetches from Sanity and
// passes the data in.
//
// >= 900px: illustrations on the right, the reading column centered, the
// projects centered in the left gutter (see GRID_COLUMNS).
// < 900px: one column (header, bio, "לפוסטים" button, testimonials); the
// projects open in a full-screen overlay and the illustrations are hidden.
export default function HomeView({ name, logoSrc, tagline, bio, bioAlign = "right", projects, testimonials }: HomeViewProps) {
  return (
    <main
      className="flex-1 min-[900px]:grid"
      style={{ gridTemplateColumns: GRID_COLUMNS, gridTemplateRows: "auto 1fr", "--testimonials-inset": TESTIMONIALS_INSET } as CSSProperties}
    >
      {/* Decorative strip. Not sticky: it stretches to the full height of
          the page and scrolls with it, so scrolling reveals more of it.
          It never moves on its own. The PNG is a wide transparent canvas
          with the drawings in a narrow band at its horizontal center
          (x 620–793 of 1414), so it is drawn at ILLUSTRATION_WIDTH, which
          makes that band 136px wide, and the box clips the empty sides.
          repeat-y tiles it down the whole page. */}
      <aside
        aria-hidden="true"
        className={`hidden pt-6 min-[900px]:block ${SIDE_INSET}`}
        style={{ gridColumn: "1", gridRow: "1 / span 2" }}
      >
        <div
          className="h-full w-full bg-repeat-y"
          style={{
            backgroundImage: "url(/illustrations.png)",
            backgroundSize: `${ILLUSTRATION_WIDTH}px auto`,
            backgroundPosition: "center top",
          }}
        />
      </aside>

      <div className="px-6 pt-16 sm:pt-14 min-[900px]:px-0" style={{ gridColumn: "3", gridRow: "1" }}>
        <div className="mx-auto max-w-[460px] min-[900px]:max-w-none">
          {logoSrc || name || tagline ? (
            <header className="text-center">
              {logoSrc ? (
                <div className="relative mx-auto mb-6 h-42 w-42 max-w-full sm:mb-5 sm:h-36 sm:w-36">
                  <Image
                    src={logoSrc}
                    alt={name ? `${name} — לוגו` : "לוגו"}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 168px, 144px"
                    priority
                  />
                </div>
              ) : null}
              {name ? (
                <h1 className="brand-name font-brand-name text-[2.625rem] text-brand sm:text-5xl">{name}</h1>
              ) : null}
              {tagline ? (
                <p className="mx-auto mt-6 max-w-xl whitespace-pre-line text-balance text-base leading-relaxed text-brand-ink/90 sm:mt-4 sm:text-lg">
                  {tagline.trim()}
                </p>
              ) : null}
            </header>
          ) : null}

          {bio ? (
            <div className={`mt-10 text-[18px] leading-[1.9] text-brand-ink [&_strong]:text-brand ${ALIGN_CLASS[bioAlign]}`}>
              {bio}
            </div>
          ) : null}

          <div className="mt-12 min-[900px]:hidden">
            <MobileProjects projects={projects} />
          </div>
        </div>
      </div>

      {/* Mobile: the same 460px column as the text above. */}
      <div
        className="px-6 min-[900px]:mt-14 min-[900px]:px-[var(--testimonials-inset)]"
        style={{ gridColumn: "2 / span 3", gridRow: "2" }}
      >
        <div className="mx-auto max-w-[460px] min-[900px]:max-w-[1000px] [&>section]:max-w-none [&>section]:px-0">
          <Testimonials testimonials={testimonials} />
        </div>
      </div>

      {/* pointer-events-none: the aside spans the whole gutter, which the
          testimonials row overlaps; only the projects column itself takes
          the pointer. */}
      <aside
        aria-label="פרויקטים"
        className="pointer-events-none sticky top-0 hidden h-svh self-start justify-center min-[900px]:flex"
        style={{ gridColumn: "4 / span 2", gridRow: "1 / span 2" }}
      >
        <ProjectsColumn projects={projects} tileWidth={PROJECT_TILE_WIDTH} />
      </aside>
    </main>
  );
}
