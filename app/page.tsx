import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import ContactFab from "@/components/ContactFab";
import Testimonials from "@/components/Testimonials";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

type About = { name?: string; logo?: unknown; bio?: string };
type ProjectSummary = { _id: string; title: string; slug: string; coverImage: unknown };
type Testimonial = { _id: string; clientName: string; quote: string };
type Data = { about: About | null; projects: ProjectSummary[]; testimonials: Testimonial[] };

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const about = await client.fetch<About | null>(`*[_type == "about"][0]{name, bio}`);
  return {
    title: about?.name || "תיק עבודות | אדריכלות",
    description: about?.bio || "תיק עבודות אדריכלות — פרויקטים נבחרים",
  };
}

export default async function Home() {
  const { about, projects, testimonials } = await client.fetch<Data>(
    `{
      "about": *[_type == "about"][0]{name, logo, bio},
      "projects": *[_type == "project" && defined(coverImage) && defined(title) && defined(slug.current)] | order(order asc){_id, title, "slug": slug.current, coverImage},
      "testimonials": *[_type == "testimonial"] | order(order asc){_id, clientName, quote}
    }`
  );

  return (
    <main className="flex-1">
      {(about?.logo || about?.name || about?.bio) && (
        <header className="mx-auto max-w-3xl px-6 pb-16 pt-20 text-center sm:pb-20 sm:pt-28">
          {about?.logo ? (
            <div className="relative mx-auto mb-8 h-24 w-24 sm:h-28 sm:w-28">
              <Image
                src={urlFor(about.logo as never).width(400).height(400).fit("max").url()}
                alt={about?.name ? `${about.name} — לוגו` : "לוגו"}
                fill
                className="object-contain"
                sizes="150px"
                priority
              />
            </div>
          ) : null}
          {about?.name ? (
            <h1 className="text-3xl font-bold tracking-tight text-brand sm:text-4xl">
              {about.name}
            </h1>
          ) : null}
          {about?.bio ? (
            <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-brand-ink sm:text-lg">
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
              {projects.map((p) => (
                <Link key={p._id} href={`/projects/${p.slug}`} className="group block">
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
                </Link>
              ))}
            </div>
          </>
        ) : (
          <p className="text-center text-brand-ink/70">פרויקטים יתווספו בקרוב</p>
        )}
      </section>

      <Testimonials testimonials={testimonials} />

      <ContactFab />
    </main>
  );
}
