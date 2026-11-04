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

// Both side columns share one width and one inset from their outer edge, so
// the illustrations (right) and the projects (left) mirror each other.
// 200px column - 2 x 32px inset = 136px content: the projects tile width,
// and the drawn width of the illustration band.
const SIDE_COLUMN_WIDTH = 200;
const SIDE_INSET = "px-8";
const SIDE_CONTENT_WIDTH = SIDE_COLUMN_WIDTH - 2 * 32;
// The band is 173px of the PNG's 1414px width; scale it to the content box.
const ILLUSTRATION_WIDTH = Math.round((SIDE_CONTENT_WIDTH * 1414) / 173);

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
// >= 900px: three columns. In RTL the first grid column is on the right:
//   [illustrations 200px] [reading column 1fr] [projects 200px]
// < 900px: one column (header, bio, "לפוסטים" button, testimonials); the
// projects open in a full-screen overlay and the illustrations are hidden.
export default function HomeView({ name, logoSrc, tagline, bio, bioAlign = "right", projects, testimonials }: HomeViewProps) {
  return (
    <main
      className="flex-1 min-[900px]:grid min-[900px]:grid-cols-[var(--side)_minmax(0,1fr)_var(--side)]"
      style={{ "--side": `${SIDE_COLUMN_WIDTH}px` } as CSSProperties}
    >
      {/* Decorative strip. Not sticky: it stretches to the full height of
          the page row and scrolls with it, so scrolling reveals more of it.
          It never moves on its own. The PNG is a wide transparent canvas
          with the drawings in a narrow band at its horizontal center
          (x 620–793 of 1414), so it is drawn at ILLUSTRATION_WIDTH, which
          makes that band as wide as the projects tiles opposite, and the
          box clips the empty sides. repeat-y tiles it down the whole page. */}
      <aside aria-hidden="true" className={`hidden pt-6 min-[900px]:block ${SIDE_INSET}`}>
        <div
          className="h-full w-full bg-repeat-y"
          style={{
            backgroundImage: "url(/illustrations.png)",
            backgroundSize: `${ILLUSTRATION_WIDTH}px auto`,
            backgroundPosition: "center top",
          }}
        />
      </aside>

      <div className="px-6 pt-16 sm:pt-14">
        <div className="mx-auto max-w-[460px]">
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

        <div className="mx-auto max-w-[460px] min-[900px]:mt-14 [&>section]:px-0">
          <Testimonials testimonials={testimonials} />
        </div>
      </div>

      <aside aria-label="פרויקטים" className={`sticky top-0 hidden h-svh self-start min-[900px]:flex ${SIDE_INSET}`}>
        <ProjectsColumn projects={projects} />
      </aside>
    </main>
  );
}
