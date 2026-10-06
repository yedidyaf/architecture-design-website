// Site-wide SEO constants shared by the root metadata, project metadata,
// sitemap and robots.
export const SITE_URL = "https://miri-friedland.vercel.app";
export const SITE_NAME = "מירי פרידלנד";
export const SITE_TITLE = "מירי פרידלנד | אדריכלית ומעצבת פנים";
export const SITE_DESCRIPTION =
  "מירי פרידלנד — אדריכלית. תכנון בתים פרטיים, שיפוצים והרחבות, לצד עיצוב פנים. תכנון מוקפד שמתחיל מהחלל עצמו.";

// Static share preview (1200x630), regenerated with scripts/generate-og-image.mjs.
export const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "מירי פרידלנד — אדריכלית ומעצבת פנים",
};

// id of the site-wide <footer> in components/Footer.tsx. Floating buttons look
// it up by id because other components (testimonial cards) render their own
// <footer> elements, so a bare "footer" selector can match the wrong one.
export const SITE_FOOTER_ID = "site-footer";
