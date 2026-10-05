import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { client } from "@/sanity/lib/client";

// Regenerate hourly so newly published projects show up without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await client.fetch<{ slug: string; _updatedAt: string }[]>(
    `*[_type == "project" && defined(slug.current)]{"slug": slug.current, _updatedAt}`
  );

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...projects.map((p) => ({
      // Older projects may still carry Hebrew slugs; encode them for the URL.
      url: `${SITE_URL}/projects/${encodeURIComponent(p.slug)}`,
      lastModified: new Date(p._updatedAt),
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
