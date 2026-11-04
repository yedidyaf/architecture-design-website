CONTEXT
Next.js 16 (App Router, TypeScript) + Tailwind + Sanity CMS portfolio site for an interior designer, RTL Hebrew, on Vercel. We are REDESIGNING the homepage layout. Brand: burgundy #9f2b35, brand-ink #4A2C30, cream #FAF7F5; Assistant font everywhere, Amatic SC for the brand name. The About `bio` is Portable Text (rich text) in Sanity (about document); there's also `name`, `logo`, and a short `tagline`. Projects are documents with coverImage, title, slug, order; testimonials are a separate type shown in a carousel. A transparent decorative illustration strip is at public/illustrations.png (1414x2000, transparent). This task touches the homepage layout and the About rendering; do NOT change Sanity schema files.

NEW HOMEPAGE LAYOUT (replace the current hero+grid homepage):

DESKTOP (>= 900px): a 3-column layout filling the viewport:
- RIGHT column (~200px, fixed): the illustration strip public/illustrations.png, STATIC (no movement), width ~120px, centered, decorative (aria-hidden). It's a sticky full-height column; overflow hidden so it reads as a side motif.
- CENTER column (1fr): the main content in a centered reading column (max-width ~460px, margin auto):
    * logo (from Sanity about.logo), brand name "מירי פרידלנד" (Amatic SC, as it is today), tagline (about.tagline) under it.
    * the About bio (about.bio Portable Text) rendered directly — NO "קצת עליי" heading above it. Body text font-size ~18px, line-height ~1.9, brand-ink, bold in burgundy, RTL.
    * below that, the testimonials section (reuse the existing testimonials carousel) with its heading "מהלקוחות".
- LEFT column (~200px): the PROJECTS as a vertical column that auto-scrolls slowly UPWARD in a seamless loop. Small tiles (cover image + title), generous vertical spacing, NO heading, NO divider line, NO tinted background (same page surface). Controls: an up-arrow and down-arrow button (understated, burgundy, instead of a scrollbar) that nudge the scroll while pressed; hovering the column pauses the auto-scroll; the mouse wheel over the column scrolls it manually (with the same seamless loop). Each tile links to /projects/[slug]. Use the existing projects query (order by `order`).

MOBILE (< 900px): a single column:
- logo, name, tagline, the About bio (same, no "קצת עליי" heading, ~18px).
- a full-width rectangular burgundy button "לפוסטים" (opens the projects screen) placed ABOVE the testimonials.
- then the testimonials section.
- Do NOT show the project grid inline on mobile. Instead, tapping "לפוסטים" opens a full-screen overlay (client component) containing the Instagram-style project grid (2 across), with ONLY a back arrow at top (no "הפרויקטים" title). Close returns to the page. Lock body scroll while open.
- The illustration strip is desktop-only (hidden on mobile).

IMPLEMENTATION NOTES
- Keep it one homepage (app/page.tsx) that fetches about (name, logo, tagline, bio), projects (coverImage, title, slug, order), and testimonials. The interactive parts (auto-scrolling posts column, wheel/arrows, mobile overlay) must be in a client component; the data fetching stays server-side and is passed in as props.
- Reuse existing pieces where possible: the testimonials carousel component, the PortableText rendering for bio, @sanity/image-url for images, the cover-image blurred-fill treatment already used for cards (so non-square covers aren't cropped).
- The auto-scroll: duplicate the posts list so the upward loop is seamless (reset at half height). Pause on hover; wheel and arrows adjust offset.
- Keep RTL, lang he, all brand colors and fonts. Hebrew singular-masculine in any UI text.

CONSTRAINTS
- Do NOT touch Sanity schema files. This is layout + rendering only.
- Run `npx tsc --noEmit` and ensure it passes.
- New branch off the latest origin/main (make sure public/illustrations.png from the other branch is included — if it's only on branch claude/sharp-wozniak-02xl1d, first merge that or cherry-pick the file so illustrations.png exists). Do NOT push/merge to main, do NOT open a PR.
- Verify in a headless browser at BOTH desktop (>=900px) and mobile (<900px) widths: desktop 3 columns (static illustrations right, centered text, auto-scrolling posts left with arrows + wheel + hover-pause), mobile single column with "לפוסטים" button above testimonials opening a grid overlay with only a back arrow. Screenshot desktop and mobile.
- Push the branch and print the branch name + compare URL.
- You can't reach Sanity from the sandbox — verify by code + tsc + mock data.
