import type { Metadata } from "next";
import ContactFab from "@/components/ContactFab";
import ScrollToTop from "@/components/ScrollToTop";
import HomeView, { type BioAlign } from "@/components/home/HomeView";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { PortableText, type PortableTextComponents } from "@/sanity/lib/portable-text";

// `bio` used to be a plain string; documents saved before the switch to
// Portable Text still return one until they are re-entered in Studio.
type About = { name?: string; logo?: unknown; tagline?: string; bioAlign?: BioAlign; bio?: string | Parameters<typeof PortableText>[0]["value"] };
type ProjectSummary = { _id: string; title: string; slug: string; coverImage: unknown };
type Testimonial = { _id: string; clientName: string; quote: string };
type Data = { about: About | null; projects: ProjectSummary[]; testimonials: Testimonial[] };

export const revalidate = 60;

const bioComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="[&:not(:first-child)]:mt-5">{children}</p>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
  },
};

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
        _id, title, "slug": slug.current, coverImage
      },
      "testimonials": *[_type == "testimonial"] | order(order asc){_id, clientName, quote}
    }`
  );

  const bio = about?.bio;
  const bioNode = Array.isArray(bio) ? (
    bio.length > 0 ? <PortableText value={bio} components={bioComponents} /> : null
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
        // fit("max") with no height: the CDN never crops the cover to a
        // square; ProjectCover letterboxes it over a blurred copy instead.
        projects={projects.map((p) => ({
          _id: p._id,
          title: p.title,
          slug: p.slug,
          coverSrc: urlFor(p.coverImage as never).width(800).fit("max").url(),
        }))}
        testimonials={testimonials}
      />
      <ContactFab />
      <ScrollToTop variant="home" />
    </>
  );
}
