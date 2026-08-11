import BeforeAfter from "@/components/BeforeAfter";
import {client} from "@/sanity/lib/client";
import imageUrlBuilder from "@sanity/image-url";

const builder = imageUrlBuilder(client);
const urlFor = (source: unknown) => builder.image(source as never);

type Project = {_id: string; title: string; beforeImage: unknown; afterImage: unknown};
export const revalidate = 60;

export default async function Home() {
  const projects = await client.fetch<Project[]>(
    `*[_type == "project" && defined(beforeImage) && defined(afterImage)] | order(order asc){_id, title, beforeImage, afterImage}`
  );

  return (
    <main dir="rtl" className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <figure key={p._id} className="space-y-2">
            <BeforeAfter
              beforeSrc={urlFor(p.beforeImage).width(800).height(800).url()}
              afterSrc={urlFor(p.afterImage).width(800).height(800).url()}
            />
            <figcaption className="text-sm text-neutral-600">{p.title}</figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}