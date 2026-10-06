import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BeforeAfterHint from "@/components/BeforeAfterHint";
import ScrollToTop from "@/components/ScrollToTop";
import { PortableText, type PortableTextComponents } from "@/sanity/lib/portable-text";
import { client } from "@/sanity/lib/client";
import type { SanityImageSource } from "@sanity/image-url";
import { urlFor } from "@/sanity/lib/image";
import { OG_IMAGE, SITE_NAME } from "@/lib/site";

type About = { name?: string; logo?: unknown };
type ProjectDetail = { title?: string; body?: unknown[] };
type ProjectNavItem = { slug: string; title: string };
type Data = { about: About | null; project: ProjectDetail | null; allProjects: ProjectNavItem[] };

export const revalidate = 60;

// Non-ASCII slugs can reach us percent-encoded; decode defensively so the
// GROQ match runs against the raw stored value. Malformed escapes fall back
// to the param as-is.
function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

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
  const decoded = decodeSlug(slug);
  const project = await client.fetch<{ title?: string; coverImage?: SanityImageSource } | null>(
    `*[_type == "project" && slug.current == $slug][0]{title, coverImage}`,
    { slug: decoded }
  );
  // The root layout's title template appends " | מירי פרידלנד".
  const title = project?.title || "פרויקט";
  // No description field on projects, so pair the title with a generic suffix.
  const description = `${title}. אדריכלות ועיצוב פנים — ${SITE_NAME}`;
  const url = `/projects/${slug}`;
  const image = project?.coverImage
    ? {
        url: urlFor(project.coverImage).width(1200).height(630).fit("crop").format("jpg").url(),
        width: 1200,
        height: 630,
        alt: title,
      }
    : OG_IMAGE;
  // Metadata merges shallowly: these openGraph/twitter objects replace the
  // root ones wholesale, so they repeat siteName/locale/type.
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      locale: "he_IL",
      type: "article",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [image],
    },
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
  const decoded = decodeSlug(slug);
  const { about, project, allProjects } = await client.fetch<Data>(
    `{
      "about": *[_type == "about"][0]{name, logo},
      "project": *[_type == "project" && slug.current == $slug][0]{title, body},
      "allProjects": *[_type == "project" && defined(coverImage) && defined(title) && defined(slug.current)] | order(order asc){title, "slug": slug.current}
    }`,
    { slug: decoded }
  );

  if (!project) notFound();

  // "Next" wraps around to the first project after the last, so there's
  // always a next article — same order as the homepage gallery.
  let nextProject: ProjectNavItem | null = null;
  if (allProjects.length > 1) {
    const currentIndex = allProjects.findIndex((p) => p.slug === decoded);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % allProjects.length;
    nextProject = allProjects[nextIndex];
  } else if (allProjects.length === 1 && allProjects[0].slug !== decoded) {
    nextProject = allProjects[0];
  }

  return (
    <main className="flex-1 px-6 pb-16 pt-10 sm:pt-14">
      {about?.logo || about?.name ? (
        <Link href="/" className="mb-10 flex items-center justify-center gap-3">
          {/* Scaled up alongside the hero mark (32px → 64px) while the header
              itself stays slim — it's still a single centered row. */}
          {about?.logo ? (
            <span className="relative h-16 w-16 shrink-0">
              <Image
                src={urlFor(about.logo as never).width(160).height(160).fit("max").url()}
                alt=""
                fill
                className="object-contain"
                sizes="64px"
              />
            </span>
          ) : null}
          {about?.name ? (
            <span className="brand-name font-brand-name whitespace-nowrap text-3xl leading-none text-brand sm:text-4xl">{about.name}</span>
          ) : null}
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
              className="inline-flex items-center gap-2 text-sm font-medium text-brand transition-colors hover:text-brand-hover hover:underline underline-offset-4"
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
