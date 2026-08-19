/**
 * Seeds the Sanity dataset with demo content (3 projects + 2 testimonials,
 * all in Hebrew) so the new Instagram-style grid and project detail pages
 * can be tested right away.
 *
 * HOW TO RUN
 * ----------
 * 1. Log in once (if you haven't already):
 *      npx sanity login
 * 2. Run the seed script from the repo root, with --with-user-token so it
 *    can write to the dataset:
 *      npx sanity exec scripts/seed.ts --with-user-token
 *
 * This uses getCliClient() from 'sanity/cli', which resolves projectId/
 * dataset from sanity.cli.ts and the auth token from your logged-in CLI
 * session automatically — no manual token creation or .env editing needed.
 *
 * Safe to re-run: documents use fixed ids and createIfNotExists, so running
 * this more than once won't create duplicates.
 *
 * Images: downloaded from Lorem Picsum (https://picsum.photos) as generic
 * high-quality placeholder photography — not architecture-specific, but
 * reliable/always-valid, unlike hardcoding specific external photo URLs
 * that can disappear. Replace them with real project photos in Sanity
 * Studio whenever you're ready; nothing about the seeded documents is
 * special beyond their ids.
 */
import { getCliClient } from "sanity/cli";

type ImageRef = { _type: "image"; asset: { _type: "reference"; _ref: string } };

const client = getCliClient({ apiVersion: "2026-08-11" });

async function uploadPlaceholderImage(seed: number, filename: string): Promise<ImageRef | undefined> {
  const url = `https://picsum.photos/seed/mf-portfolio-${seed}/1400/1400`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const asset = await client.assets.upload("image", buffer, { filename });
    return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
  } catch (err) {
    console.warn(`  ⚠ Could not upload placeholder image "${filename}": ${(err as Error).message}`);
    return undefined;
  }
}

let keyCounter = 0;
const key = () => `k${(keyCounter++).toString(36)}`;

function textBlock(text: string, style: "normal" | "h2" | "h3" = "normal") {
  return {
    _type: "block",
    _key: key(),
    style,
    markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  };
}

function contentImageBlock(image: ImageRef | undefined, caption: string) {
  if (!image) return null;
  return { _type: "contentImage", _key: key(), image, caption };
}

function beforeAfterBlock(beforeImage: ImageRef | undefined, afterImage: ImageRef | undefined, label: string) {
  if (!beforeImage || !afterImage) return null;
  return { _type: "beforeAfter", _key: key(), beforeImage, afterImage, label };
}

async function main() {
  const token = client.config().token;
  if (!token) {
    console.error(`
Missing auth token — no documents were created.

Run this script with --with-user-token so it can authenticate as you:

  npx sanity login                                    (once, if not already)
  npx sanity exec scripts/seed.ts --with-user-token
`);
    process.exit(1);
  }

  console.log("Uploading placeholder images (this can take a moment)...");

  const projectsSeed = [
    {
      id: "seed-project-villa-hasharon",
      title: "וילה פרטית בשרון",
      slug: "villa-hasharon",
      order: 1,
      caption: "החזית הראשית לאחר השיפוץ",
      beforeAfterLabel: "סלון",
      body: "וילה פרטית בת שלוש קומות שתוכננה מחדש כדי לשלב פתיחות, אור טבעי וזרימה בין החללים הפנימיים לגינה. הדגש היה על חומרים טבעיים וקווים נקיים, תוך שמירה על אופי חם ומזמין.",
    },
    {
      id: "seed-project-kitchen-renovation",
      title: "שיפוץ מטבח מודרני",
      slug: "modern-kitchen-renovation",
      order: 2,
      caption: "המטבח החדש, מבט מהכניסה",
      beforeAfterLabel: "מטבח",
      body: "שיפוץ מטבח מלא בדירה משפחתית, כולל אי מרכזי, פתרונות אחסון חכמים ותאורה שכבתית. התהליך כלל תכנון מדוקדק כדי למצות כל מטר בחלל קומפקטי יחסית.",
    },
    {
      id: "seed-project-boutique-office",
      title: "עיצוב משרד בוטיק",
      slug: "boutique-office-design",
      order: 3,
      caption: "אזור הישיבה המשותף",
      beforeAfterLabel: "כניסה",
      body: "עיצוב משרד קטן ואינטימי לסטודיו יצירתי, המשלב פינות עבודה שקטות עם מרחב מפגש פתוח. פלטת הצבעים החמה והריהוט המותאם אישית יוצרים אווירה ביתית בסביבה מקצועית.",
    },
  ];

  const projectDocs = [];
  let seedCounter = 1;

  for (const p of projectsSeed) {
    console.log(`  Preparing "${p.title}"...`);
    const coverImage = await uploadPlaceholderImage(seedCounter++, `${p.slug}-cover.jpg`);
    const contentImage = await uploadPlaceholderImage(seedCounter++, `${p.slug}-content.jpg`);
    const beforeImage = await uploadPlaceholderImage(seedCounter++, `${p.slug}-before.jpg`);
    const afterImage = await uploadPlaceholderImage(seedCounter++, `${p.slug}-after.jpg`);

    projectDocs.push({
      _id: p.id,
      _type: "project",
      title: p.title,
      slug: { _type: "slug", current: p.slug },
      order: p.order,
      ...(coverImage ? { coverImage } : {}),
      body: [
        textBlock(p.body),
        contentImageBlock(contentImage, p.caption),
        beforeAfterBlock(beforeImage, afterImage, p.beforeAfterLabel),
      ].filter((block): block is NonNullable<typeof block> => block !== null),
    });
  }

  const testimonialDocs = [
    {
      _id: "seed-testimonial-cohen-family",
      _type: "testimonial",
      clientName: "משפחת כהן",
      quote:
        "מירי הבינה בדיוק את החזון שלנו והפכה אותו למציאות. תהליך מקצועי, אישי ומהנה מתחילה ועד סוף.",
      order: 1,
    },
    {
      _id: "seed-testimonial-dana-levi",
      _type: "testimonial",
      clientName: "דנה לוי",
      quote:
        "השיפוץ עלה על כל הציפיות שלנו. תשומת הלב לפרטים והיצירתיות של מירי ניכרות בכל פינה בבית.",
      order: 2,
    },
  ];

  console.log("Creating documents...");
  for (const doc of projectDocs) {
    await client.createIfNotExists(doc);
    console.log(`  ✓ ${doc._type}: ${doc._id}`);
  }
  for (const doc of testimonialDocs) {
    await client.createIfNotExists(doc);
    console.log(`  ✓ ${doc._type}: ${doc._id}`);
  }

  const missingCovers = projectDocs.filter((d) => !("coverImage" in d)).map((d) => d.title);
  if (missingCovers.length > 0) {
    console.warn(
      `\n⚠ These projects have no coverImage (image upload failed) and won't appear in the homepage grid until you add one in Studio: ${missingCovers.join(", ")}`
    );
  }

  console.log("\nDone. Open /studio to review, or visit the homepage to see the grid.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
