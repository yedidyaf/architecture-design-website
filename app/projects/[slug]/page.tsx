import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BeforeAfterHint from "@/components/BeforeAfterHint";
import ScrollToTop from "@/components/ScrollToTop";
import { PortableText, type PortableTextComponents } from "@/sanity/lib/portable-text";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

type About = { name?: string; logo?: unknown };
type ProjectDetail = { title?: string; body?: unknown[] };
type ProjectNavItem = { slug: string; title: string };
type Data = { about: About | null; project: ProjectDetail | null; allProjects: ProjectNavItem[] };

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(
    `*[_type == "project" && defined(slug.current)].slug.current`
  );
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await client.fetch<{ title?: string } | null>(
    `*[_type == "project" && slug.current == $slug][0]{title}`,
    { slug }
  );
  return {
    title: project?.title ? `${project.title} | תיק עבודות` : "פרויקט",
  };
}

const portableTextComponents: PortableTextComponents = {
  types: {
    contentImage: ({ value }) => {
      if (!value?.image) return null;
      return (
        <figure className="my-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urlFor(value.image).width(1400).auto("format").url()}
            alt={value.caption || ""}
            className="w-full rounded-md object-cover"
          />
          {value.caption ? (
            <figcaption className="mt-2 text-center text-sm italic text-brand-ink">
              {value.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
    beforeAfter: ({ value }) => {
      if (!value?.beforeImage || !value?.afterImage) return null;
      return (
        <div className="my-8">
          {value.label ? (
            <p className="mb-2 text-center text-sm italic text-brand-ink">{value.label}</p>
          ) : null}
          {/* No extra max-width wrapper here — BeforeAfterHint (like
              BeforeAfter itself) is already w-full, so it fills the same
              column as contentImage's plain w-full <img> and the surrounding
              text, instead of being capped narrower. */}
          <BeforeAfterHint
            beforeSrc={urlFor(value.beforeImage).width(900).height(900).url()}
            afterSrc={urlFor(value.afterImage).width(900).height(900).url()}
          />
        </div>
      );
    },
  },
  block: {
    h2: ({ children }) => (
      <h2 className="mb-4 mt-10 text-2xl font-bold text-brand-ink">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-8 text-xl font-bold text-brand-ink">{children}</h3>
    ),
    normal: ({ children }) => <p className="mb-4 leading-relaxed text-brand-ink">{children}</p>,
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-4 list-disc space-y-1 pr-5 text-brand-ink">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mb-4 list-decimal space-y-1 pr-5 text-brand-ink">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
  },
};

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { about, project, allProjects } = await client.fetch<Data>(
    `{
      "about": *[_type == "about"][0]{name, logo},
      "project": *[_type == "project" && slug.current == $slug][0]{title, body},
      "allProjects": *[_type == "project" && defined(coverImage) && defined(title) && defined(slug.current)] | order(order asc){title, "slug": slug.current}
    }`,
    { slug }
  );

  if (!project) notFound();

  // "Next" wraps around to the first project after the last, so there's
  // always a next article — same order as the homepage gallery.
  let nextProject: ProjectNavItem | null = null;
  if (allProjects.length > 1) {
    const currentIndex = allProjects.findIndex((p) => p.slug === slug);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % allProjects.length;
    nextProject = allProjects[nextIndex];
  } else if (allProjects.length === 1 && allProjects[0].slug !== slug) {
    nextProject = allProjects[0];
  }

  return (
    <main className="flex-1 px-6 pb-16 pt-10 sm:pt-14">
      {about?.logo || about?.name ? (
        <Link href="/" className="mb-10 flex items-center justify-center gap-2">
          {about?.logo ? (
            <span className="relative h-8 w-8 shrink-0">
              <Image
                src={urlFor(about.logo as never).width(80).height(80).fit("max").url()}
                alt=""
                fill
                className="object-contain"
              />
            </span>
          ) : null}
          {about?.name ? <span className="text-sm font-bold text-brand">{about.name}</span> : null}
        </Link>
      ) : null}

      <div className="mx-auto max-w-[65ch]">
        <Link
          href="/"
          aria-label="חזרה לדף הבית"
          className="inline-flex text-brand transition-colors hover:text-brand-hover"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        </Link>
        <h1 className="mb-8 mt-6 text-3xl font-bold text-brand sm:text-4xl">{project.title}</h1>
        <PortableText value={project.body ?? []} components={portableTextComponents} />

        {nextProject ? (
          <div className="mt-16 border-t border-brand/10 pt-10 text-left">
            <Link
              href={`/projects/${nextProject.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/8 px-5 py-2.5 text-sm font-medium text-brand transition-colors hover:bg-brand/15"
            >
              <span>{nextProject.title}</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 shrink-0"
              >
                <path d="M19 12H5" />
                <path d="M12 5l-7 7 7 7" />
              </svg>
            </Link>
          </div>
        ) : null}
      </div>

      <ScrollToTop variant="article" />
    </main>
  );
}
