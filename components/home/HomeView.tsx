import Image from "next/image";
import type { ReactNode } from "react";
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
    <main className="flex-1 min-[900px]:grid min-[900px]:grid-cols-[200px_minmax(0,1fr)_200px]">
      {/* Decorative strip. The PNG is a wide transparent canvas with the
          drawings in a narrow band at its horizontal center (x 620–793 of
          1414), so it is drawn at 980px wide — which makes that band ~120px —
          centered in a 120px window that clips the empty sides. Static. */}
      <aside aria-hidden="true" className="sticky top-0 hidden h-svh self-start overflow-hidden min-[900px]:block">
        <div className="relative mx-auto h-full w-[120px] overflow-hidden">
          <Image
            src="/illustrations.png"
            alt=""
            width={1414}
            height={2000}
            sizes="980px"
            className="absolute left-1/2 top-6 h-auto w-[980px] max-w-none -translate-x-1/2 select-none"
            draggable={false}
            priority
          />
        </div>
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

      <aside aria-label="פרויקטים" className="sticky top-0 hidden h-svh self-start min-[900px]:flex">
        <ProjectsColumn projects={projects} />
      </aside>
    </main>
  );
}
