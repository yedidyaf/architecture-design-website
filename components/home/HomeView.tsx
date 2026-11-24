import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import ArchSlogan from "@/components/ArchSlogan";
import ScrollHint from "@/components/ScrollHint";
import Testimonials from "@/components/Testimonials";
import MobileProjects from "./MobileProjects";
import PencilPath from "./PencilPath";
import { ARROW_SLOT, SIDE_COLUMN_WIDTH, TESTIMONIALS_INSET, TEXT_TRACK } from "./layout";
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
const SIDE_INSET = "px-8";
const SIDE_CONTENT_WIDTH = SIDE_COLUMN_WIDTH - 2 * 32;
// The band is 173px of the PNG's 1414px width; scale it to the content box.
const ILLUSTRATION_WIDTH = Math.round((SIDE_CONTENT_WIDTH * 1414) / 173);
// The strip is shifted up so the top of the page cuts through the middle of
// the first house, as if the page were a window onto a continuous band. The
// house spans y 44–178 of the PNG's 2000px height (middle ≈ 111), scaled to
// the drawn width. repeat-y keeps tiling above and below, so no gap appears.
const HOUSE_MIDDLE_Y = 111;
const STRIP_OFFSET_Y = Math.round((HOUSE_MIDDLE_Y * ILLUSTRATION_WIDTH) / 1414);

// Desktop grid, RTL (track 1 is on the right):
//   1 illustrations | 2 spacer (1fr) | 3 text | 4 spacer (1fr) | 5 (200px)
// The two 1fr spacers are equal, so the text stays centered on the screen.
// The projects span tracks 4–5 (the whole left gutter), centered in it minus
// the arrow slot on its inner side (see layout.ts). The testimonials span
// tracks 2–4 in their own row, padded clear of the arrow.
const GRID_COLUMNS = `${SIDE_COLUMN_WIDTH}px minmax(0, 1fr) min(${TEXT_TRACK}px, calc(100% - ${2 * SIDE_COLUMN_WIDTH}px)) minmax(0, 1fr) ${SIDE_COLUMN_WIDTH}px`;

type Testimonial = { _id: string; clientName: string; quote: string };

// One full-screen step of the homepage, its content centered.
const SCREEN = "flex min-h-svh snap-start flex-col items-center justify-center py-16";
// On desktop the steps after the first stand closer together, joined by the
// pencil line (PencilPath) that runs between and around them.
const STEP = `${SCREEN} min-[900px]:min-h-0 min-[900px]:py-0 min-[900px]:mt-[230px]`;


export type HomeViewProps = {
  name?: string;
  logoSrc?: string;
  tagline?: string;
  /** The About text, already rendered on the server, one entry per screen. */
  bioScreens: ReactNode[];
  bioAlign?: BioAlign;
  projects: HomeProject[];
  testimonials: Testimonial[];
};

// Homepage layout, presentational only: page.tsx fetches from Sanity and
// passes the data in.
//
// >= 900px: illustrations on the right, the reading column centered, the
// projects centered in the left gutter (see GRID_COLUMNS).
// < 900px: one column of screens (logo, slogan, text, posts, testimonials); the
// projects open in a full-screen overlay and the illustrations are hidden.
export default function HomeView({ name, logoSrc, tagline, bioScreens, bioAlign = "right", projects, testimonials }: HomeViewProps) {
  return (
    <main
      className="flex-1 overflow-x-clip min-[900px]:grid"
      style={{ gridTemplateColumns: GRID_COLUMNS, gridTemplateRows: "auto 1fr", "--testimonials-inset": TESTIMONIALS_INSET } as CSSProperties}
    >
      {/* Decorative strip. Not sticky: it stretches to the full height of
          the page and scrolls with it, so scrolling reveals more of it.
          It never moves on its own. The PNG is a wide transparent canvas
          with the drawings in a narrow band at its horizontal center
          (x 620–793 of 1414), so it is drawn at ILLUSTRATION_WIDTH, which
          makes that band 136px wide, and the box clips the empty sides.
          repeat-y tiles it down the whole page, and STRIP_OFFSET_Y starts it
          mid-house at the very top of the page. */}
      <aside
        aria-hidden="true"
        className={`hidden min-[900px]:block ${SIDE_INSET}`}
        style={{ gridColumn: "1", gridRow: "1 / span 2" }}
      >
        <div
          className="h-full w-full bg-repeat-y"
          style={{
            backgroundImage: "url(/illustrations.png)",
            backgroundSize: `${ILLUSTRATION_WIDTH}px auto`,
            backgroundPosition: `center -${STRIP_OFFSET_Y}px`,
          }}
        />
      </aside>

      {/* The reading column is a stack of full-screen "screens" with one
          thing on each: logo and name, the slogan arch, each part of the
          text, the posts (mobile), then the testimonials. The page snaps
          from screen to screen (globals.css, .home-screens). */}
      <div className="home-screens relative px-6 min-[900px]:px-0" style={{ gridColumn: "3", gridRow: "1" }}>
        {tagline?.trim() && bioScreens.length > 0 ? <PencilPath /> : null}
        <div className="relative z-10 mx-auto max-w-[460px] min-[900px]:max-w-none">
          {logoSrc || name ? (
            <header className={`${SCREEN} relative text-center`}>
              {logoSrc ? (
                <div className="logo-glow relative mx-auto mb-[8.25rem] h-42 w-42 max-w-full rounded-full sm:mb-[8.125rem] sm:h-36 sm:w-36">
                  {/* Hand-drawn ripples behind the logo; absolutely positioned, so no layout shift. */}
                  <svg
                    className="logo-rings pointer-events-none absolute left-1/2 top-1/2 z-0 h-[220%] w-[220%] -translate-x-1/2 -translate-y-1/2 overflow-visible"
                    viewBox="0 0 220 220"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <defs>
                      <filter id="logoWobble">
                        <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="2" seed="9" result="n" />
                        <feDisplacementMap in="SourceGraphic" in2="n" scale="5" />
                      </filter>
                    </defs>
                    <g filter="url(#logoWobble)">
                      <circle className="logo-ring logo-ring-1" cx="110" cy="110" r="100" />
                      <circle className="logo-ring logo-ring-2" cx="110" cy="110" r="100" />
                      <circle className="logo-ring logo-ring-3" cx="110" cy="110" r="100" />
                    </g>
                  </svg>
                  <Image
                    src={logoSrc}
                    alt={name ? `${name} — לוגו` : "לוגו"}
                    fill
                    className="z-10 object-contain"
                    sizes="(max-width: 640px) 168px, 144px"
                    priority
                  />
                </div>
              ) : null}
              {name ? (
                <h1 className="brand-name font-brand-name text-[2.625rem] text-brand sm:text-5xl">{name}</h1>
              ) : null}
              <ScrollHint />
            </header>
          ) : null}

          {tagline?.trim() ? (
            <section className={`${STEP} min-[900px]:!mt-0`}>
              <ArchSlogan lines={tagline.trim().split(/\r?\n/).map((l) => l.trim()).filter(Boolean)} />
            </section>
          ) : null}

          {bioScreens.map((screen, i) => (
            <section key={i} className={STEP}>
              <div
                data-pencil-frame=""
                className={`w-full min-[900px]:w-fit min-[900px]:max-w-[78%] text-[18px] leading-[1.9] text-brand-ink [&_strong]:text-brand ${ALIGN_CLASS[bioAlign]}`}
              >
                {screen}
              </div>
            </section>
          ))}

          {tagline?.trim() && bioScreens.length > 0 ? (
            // Room for Miri's signature, which PencilPath writes here.
            <div
              data-pencil-sig=""
              className="mx-auto mt-[200px] hidden h-[198px] w-[126px] min-[900px]:block"
              aria-hidden="true"
            />
          ) : null}

          {projects.length > 0 ? (
            <section className={`${SCREEN} min-[900px]:hidden`}>
              <div className="reveal w-full">
                <MobileProjects projects={projects} />
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {/* Mobile: the same 460px column as the text above. */}
      <div
        className={`${SCREEN} px-6 min-[900px]:mt-[200px] min-[900px]:min-h-0 min-[900px]:px-[var(--testimonials-inset)]`}
        style={{ gridColumn: "2 / span 3", gridRow: "2" }}
      >
        <div className="reveal mx-auto w-full max-w-[460px] min-[900px]:max-w-[1000px] [&>section]:max-w-none [&>section]:px-0">
          <Testimonials testimonials={testimonials} />
        </div>
      </div>

      {/* The arrow slot (padding on the inner, right side) keeps the gap
          between the tiles and the text as breathing room (see layout.ts).
          pointer-events-none: the aside spans the whole gutter, which the
          testimonials row overlaps; only the projects column itself takes
          the pointer. */}
      <aside
        aria-label="פרויקטים"
        className="pointer-events-none sticky top-0 hidden h-svh self-start justify-center min-[900px]:flex"
        style={{ gridColumn: "4 / span 2", gridRow: "1 / span 2", paddingRight: ARROW_SLOT }}
      >
        <ProjectsColumn projects={projects} />
      </aside>
    </main>
  );
}
