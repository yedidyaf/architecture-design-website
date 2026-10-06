import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ContactFab from "@/components/ContactFab";
import ScrollToTop from "@/components/ScrollToTop";
import Testimonials from "@/components/Testimonials";
import { buildExcerpt } from "@/lib/excerpt";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

type About = { name?: string; logo?: unknown; bio?: string };
type ProjectSummary = {
  _id: string;
  title: string;
  slug: string;
  coverImage: unknown;
  // Plain text of the first few paragraph blocks; the excerpt uses the first
  // non-empty one.
  paragraphs: (string | null)[] | null;
};
type Testimonial = { _id: string; clientName: string; quote: string };
type Data = { about: About | null; projects: ProjectSummary[]; testimonials: Testimonial[] };

export const revalidate = 60;

// Title, description and share tags come from the root layout. The canonical
// lives here, not in the layout, so other pages don't inherit "/" as theirs.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const { about, projects, testimonials } = await client.fetch<Data>(
    `{
      "about": *[_type == "about"][0]{name, logo, bio},
      "projects": *[_type == "project" && defined(coverImage) && defined(title) && defined(slug.current)] | order(order asc){
        _id, title, "slug": slug.current, coverImage,
        "paragraphs": body[_type == "block" && style == "normal" && !defined(listItem)][0...3]{"text": pt::text(@)}.text
      },
      "testimonials": *[_type == "testimonial"] | order(order asc){_id, clientName, quote}
    }`
  );

  return (
    <main className="flex-1">
      {(about?.logo || about?.name || about?.bio) && (
        <header className="mx-auto max-w-3xl px-6 pb-14 pt-16 text-center sm:pb-12 sm:pt-14">
          {/* Mobile: 168px mark, a light trim that keeps it clearly the hero.
              Wider screens: a compact 144px mark and tighter padding so the
              top of the gallery peeks above the fold as a cue to scroll.
              max-w-full keeps it inside the px-6 gutters on narrow phones, and
              object-contain keeps it uncropped. */}
          {about?.logo ? (
            <div className="relative mx-auto mb-6 h-42 w-42 max-w-full sm:mb-5 sm:h-36 sm:w-36">
              <Image
                src={urlFor(about.logo as never).width(800).height(800).fit("max").url()}
                alt={about?.name ? `${about.name} — לוגו` : "לוגו"}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 168px, 144px"
                priority
              />
            </div>
          ) : null}
          {about?.name ? (
            <h1 className="brand-name font-brand-name text-[2.625rem] text-brand sm:text-5xl">
              {about.name}
            </h1>
          ) : null}
          {about?.bio ? (
            <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-brand-ink sm:mt-4 sm:text-lg">
              {about.bio}
            </p>
          ) : null}
        </header>
      )}

      <section className="mx-auto max-w-6xl px-6 pb-24 sm:pb-32">
        {projects.length > 0 ? (
          <>
            <h2 className="mb-8 text-center text-sm font-medium uppercase tracking-[0.2em] text-brand-ink sm:mb-12">
              הגלריה שלי
            </h2>
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4">
              {projects.map((p) => {
                const excerpt = buildExcerpt(p.paragraphs);
                return (
                  <Link
                    key={p._id}
                    href={`/projects/${p.slug}`}
                    className="group block rounded-lg border border-brand/35 p-2 transition-colors duration-300 hover:border-brand/50"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-md bg-neutral-100">
                      <Image
                        src={urlFor(p.coverImage as never).width(600).height(600).url()}
                        alt={p.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                      />
                    </div>
                    <p className="mt-3 text-center text-sm font-medium text-brand-ink">
                      {p.title}
                    </p>
                    {/* Omitted entirely when there's no paragraph. Grid items
                        stretch to the tallest card in the row, so rows stay
                        even either way. */}
                    {excerpt ? (
                      <p className="mt-1 line-clamp-2 text-center text-xs leading-relaxed text-brand-ink/70">
                        {excerpt}
                      </p>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-center text-brand-ink/70">פרויקטים יתווספו בקרוב</p>
        )}
      </section>

      <Testimonials testimonials={testimonials} />

      <ContactFab />
      <ScrollToTop />
    </main>
  );
}
