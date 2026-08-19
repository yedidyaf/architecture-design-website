import Image from "next/image";
import type { Metadata } from "next";
import Gallery from "@/components/Gallery";
import ContactFab from "@/components/ContactFab";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

type About = { name?: string; logo?: unknown; bio?: string };
type Project = { _id: string; title?: string; beforeImage: unknown; afterImage: unknown };
type Data = { about: About | null; projects: Project[] };

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const about = await client.fetch<About | null>(`*[_type == "about"][0]{name, bio}`);
  return {
    title: about?.name || "תיק עבודות | אדריכלות",
    description: about?.bio || "תיק עבודות אדריכלות — פרויקטים נבחרים",
  };
}

export default async function Home() {
  const { about, projects } = await client.fetch<Data>(
    `{
      "about": *[_type == "about"][0]{name, logo, bio},
      "projects": *[_type == "project" && defined(beforeImage) && defined(afterImage)] | order(order asc){_id, title, beforeImage, afterImage}
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
            <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-neutral-600 sm:text-lg">
              {about.bio}
            </p>
          ) : null}
        </header>
      )}

      <section className="mx-auto max-w-6xl px-6 pb-24 sm:pb-32">
        {projects.length > 0 ? (
          <>
            <h2 className="mb-8 text-center text-sm font-medium uppercase tracking-[0.2em] text-neutral-400 sm:mb-12">
              הגלריה שלי
            </h2>
            <Gallery
              projects={projects.map((p) => ({
                id: p._id,
                title: p.title,
                beforeSrc: urlFor(p.beforeImage as never).width(900).height(900).url(),
                afterSrc: urlFor(p.afterImage as never).width(900).height(900).url(),
              }))}
            />
          </>
        ) : (
          <p className="text-center text-neutral-400">פרויקטים יתווספו בקרוב</p>
        )}
      </section>

      <ContactFab />
    </main>
  );
}
