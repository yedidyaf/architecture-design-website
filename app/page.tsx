import type { Metadata } from "next";
import ContactFab from "@/components/ContactFab";
import HomeView, { type BioAlign } from "@/components/home/HomeView";
import type { HomeProject } from "@/components/home/types";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { PortableText, type PortableTextComponents } from "@/sanity/lib/portable-text";

// `bio` used to be a plain string; documents saved before the switch to
// Portable Text still return one until they are re-entered in Studio.
type About = { name?: string; logo?: unknown; tagline?: string; bioAlign?: BioAlign; bio?: string | Parameters<typeof PortableText>[0]["value"] };
type ProjectSummary = {
  _id: string;
  title: string;
  slug: string;
  coverImage: { hotspot?: { x?: number; y?: number } } | null;
  coverFit?: string | null;
};
type Testimonial = { _id: string; clientName: string; quote: string };
type Data = { about: About | null; projects: ProjectSummary[]; testimonials: Testimonial[] };

export const revalidate = 60;

// Shift+Enter in Studio stores a soft break as "\n" inside a span's text.
// @portabletext/react only treats a span that is exactly "\n" as a hard
// break, so split spans on "\n" and let `hardBreak` render them as <br/>.
type BioValue = Parameters<typeof PortableText>[0]["value"];
function splitSoftBreaks(value: BioValue): BioValue {
  const blocks = (Array.isArray(value) ? value : [value]) as unknown as Record<string, unknown>[];
  return blocks.map((block) => {
    if (block._type !== "block" || !Array.isArray(block.children)) return block;
    const children = (block.children as Record<string, unknown>[]).flatMap((child) => {
      if (child._type !== "span" || typeof child.text !== "string" || !child.text.includes("\n")) return [child];
      return child.text.split("\n").flatMap((part, i) => [
        ...(i > 0 ? [{ ...child, _key: `${child._key}-br${i}`, text: "\n", marks: [] }] : []),
        ...(part ? [{ ...child, _key: i === 0 ? child._key : `${child._key}-${i}`, text: part }] : []),
      ]);
    });
    return { ...block, children };
  }) as unknown as BioValue;
}

const bioComponents: PortableTextComponents = {
  hardBreak: () => <br />,
  block: {
    normal: ({ children }) => <p className="[&:not(:first-child)]:mt-5">{children}</p>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
  },
};

// Cover URL for a square tile, per the project's `coverFit` (missing or
// unknown values mean "crop"):
//   crop    — an 800×800 crop from the CDN; the builder reads the image's
//             crop + hotspot, so the focal point stays centered. The same
//             hotspot also becomes an object-position, as a fallback.
//   contain — fit("max") with no height, so the CDN never crops it;
//             ProjectCover letterboxes it over a blurred copy instead.
function cover(p: ProjectSummary): Pick<HomeProject, "coverSrc" | "coverFit" | "coverPosition"> {
  const image = urlFor(p.coverImage as never);
  if (p.coverFit === "contain") {
    return { coverFit: "contain", coverSrc: image.width(800).fit("max").url() };
  }
  const h = p.coverImage?.hotspot;
  return {
    coverFit: "crop",
    coverSrc: image.width(800).height(800).fit("crop").url(),
    coverPosition:
      typeof h?.x === "number" && typeof h?.y === "number" ? `${h.x * 100}% ${h.y * 100}%` : undefined,
  };
}

// Title, description and share tags come from the root layout. The canonical
// lives here, not in the layout, so other pages don't inherit "/" as theirs.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const { about, projects, testimonials } = await client.fetch<Data>(
    `{
      "about": *[_type == "about"][0]{name, logo, tagline, bio, bioAlign},
      "projects": *[_type == "project" && defined(coverImage) && defined(title) && defined(slug.current)] | order(order asc){
        _id, title, "slug": slug.current, coverImage, coverFit
      },
      "testimonials": *[_type == "testimonial"] | order(order asc){_id, clientName, quote}
    }`
  );

  const bio = about?.bio;
  const bioNode = Array.isArray(bio) ? (
    bio.length > 0 ? <PortableText value={splitSoftBreaks(bio)} components={bioComponents} /> : null
  ) : typeof bio === "string" && bio.trim() ? (
    <p className="whitespace-pre-line">{bio}</p>
  ) : null;

  return (
    <>
      <HomeView
        name={about?.name}
        logoSrc={about?.logo ? urlFor(about.logo as never).width(800).height(800).fit("max").url() : undefined}
        tagline={about?.tagline}
        bio={bioNode}
        bioAlign={about?.bioAlign}
        projects={projects.map((p) => ({
          _id: p._id,
          title: p.title,
          slug: p.slug,
          ...cover(p),
        }))}
        testimonials={testimonials}
      />
      <ContactFab />
    </>
  );
}
