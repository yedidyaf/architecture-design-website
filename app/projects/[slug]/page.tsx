import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BeforeAfter from "@/components/BeforeAfter";
import { PortableText, type PortableTextComponents } from "@/sanity/lib/portable-text";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

type About = { name?: string; logo?: unknown };
type ProjectDetail = { title?: string; body?: unknown[] };
type Data = { about: About | null; project: ProjectDetail | null };

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
          {/* No extra max-width wrapper here — BeforeAfter is already w-full,
              so it fills the same column as contentImage's plain w-full <img>
              and the surrounding text, instead of being capped narrower. */}
          <BeforeAfter
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
  const { about, project } = await client.fetch<Data>(
    `{
      "about": *[_type == "about"][0]{name, logo},
      "project": *[_type == "project" && slug.current == $slug][0]{title, body}
    }`,
    { slug }
  );

  if (!project) notFound();

  return (
    <main className="flex-1 px-6 pb-16 pt-10 sm:pt-14">
      {about?.logo || about?.name ? (
        <Link
          href="/"
          className="mb-10 flex items-center justify-center gap-2 text-brand-ink"
        >
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
          {about?.name ? <span className="text-sm font-bold">{about.name}</span> : null}
        </Link>
      ) : null}

      <div className="mx-auto max-w-[65ch]">
        <Link href="/" className="text-sm font-medium text-brand hover:text-brand-hover">
          ← חזרה לדף הבית
        </Link>
        <h1 className="mb-8 mt-6 text-3xl font-bold text-brand sm:text-4xl">{project.title}</h1>
        <PortableText value={project.body ?? []} components={portableTextComponents} />
      </div>
    </main>
  );
}
