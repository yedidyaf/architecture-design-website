CONTEXT
Next.js 16 + Tailwind homepage, RTL Hebrew, on Vercel. The 3-column desktop homepage is live: RIGHT = static illustration strip (APPROVED — do not change its size/position), CENTER = text (about + testimonials carousel), LEFT = auto-scrolling projects column. There is a floating contact FAB (ContactFab.tsx). Desktop layout refinements. Do NOT touch Sanity schema files — frontend only. Symmetry between sides is NOT required.

TASK — desktop (>=900px) refinements:

1. WIDER CENTER TEXT
The center reading column is too narrow/cramped. Increase its max-width noticeably (e.g. ~460px → ~620px) so the about text has more room. Keep it centered.

2. REPOSITION + ENLARGE THE PROJECTS (left column)
The projects currently hug the far-left edge. Instead, center the projects column within the space between the end of the center text and the left screen edge (centered in the left gutter, not glued to the outer edge). Make the project tiles a bit LARGER. Keep their behavior (auto-scroll up, arrows, wheel, hover-pause). It does NOT need to mirror the right column.

3. CONTACT FAB NOT ON TOP OF THE ILLUSTRATIONS
The floating contact button currently overlaps the right-side illustration strip. Reposition it so it does NOT sit on the illustrations — move it inboard (toward the center, just clear of the illustration column) so it never overlaps the drawings at any scroll position on desktop. Leave its mobile position as is.

4. MUCH WIDER TESTIMONIALS
Make the "מהלקוחות" testimonials section MUCH wider — the card/carousel container should be significantly wider than the about text block (span most of the center area). Keep it centered, keep the carousel behavior and the italic softened-burgundy quote styling.

DO NOT CHANGE the right-side illustration column (size, width, position) — it is approved as-is.

CONSTRAINTS
- Keep RTL, brand colors, fonts, mobile layout unchanged.
- Do NOT touch Sanity schema files. Frontend only.
- Run `npx tsc --noEmit` and ensure it passes.
- New branch off latest origin/main. Do NOT push/merge to main, do NOT open a PR.
- Verify on desktop in a headless browser: wider centered text; projects centered in the left gutter and larger; contact button clear of the illustrations; much wider testimonials; right illustration column unchanged. Screenshot it.
- Push the branch and print the branch name + compare URL.

---

UPDATE (after merge of the above):

5. SCROLL-TO-TOP ARROW — MOVE INBOARD (left, desktop)
The floating "scroll to top" up-arrow on the LEFT is glued to the far-left screen edge. Move it inboard so it sits just beside/after the projects column (where the projects sit in the left gutter), not on the outer edge — mirroring how the contact button was moved inboard on the right. Must not overlap the projects or get cut off. Keep show-on-scroll and the footer-clearance behavior. Mobile unchanged.

6. SINGLE HAND-DRAWN FRAME AROUND EACH PROJECT TILE (desktop only)
Around each project tile in the left column, add ONE thin frame in the brand burgundy that "floats" around the image — i.e. offset a few px OUTSIDE the tile (not flush to the image edge), with a small gap between the frame and the image. The frame should feel HAND-DRAWN / sketch-like and imperfect, not a crisp geometric border: use a slightly irregular rounded-rectangle look (e.g. uneven border-radius on each corner so it reads as hand-sketched), thin (~1px), in a semi-transparent burgundy (e.g. rgba(159,43,53,0.5)). Just ONE frame (not double). Keep it subtle and on-brand. DESKTOP ONLY (>=900px) — do NOT apply on mobile for now.

---

UPDATE: PER-PROJECT COVER DISPLAY MODE

CONTEXT
Next.js 16 + Sanity CMS portfolio site, RTL Hebrew, on Vercel. Project documents (sanity/schemaTypes/project.ts) have a coverImage (image, hotspot:true) shown in square tiles in the homepage projects column and in the mobile posts grid. Currently all covers use the contain+blurred-fill treatment. We want Miri to choose, PER PROJECT, how each cover is displayed. This task IS allowed to modify Sanity schema files.

TASK:

1. ADD A DISPLAY-MODE FIELD (project.ts)
Add a field to the project schema named `coverFit` (string) with a radio/dropdown list of two options, Hebrew titles:
   - { title: 'חיתוך למילוי הריבוע', value: 'crop' }
   - { title: 'תמונה מלאה עם רקע מטושטש', value: 'contain' }
   initialValue: 'crop'. Hebrew field title e.g. "אופן הצגת תמונת השער" with a short Hebrew description explaining: crop = fills the square (use the image's hotspot to choose what stays centered); contain = shows the whole image with a blurred fill around it.

2. RESPECT THE FIELD WHEN RENDERING COVER IMAGES
Everywhere the coverImage is shown as a square (homepage projects column AND mobile posts grid):
   - If coverFit === 'crop' (default): render the image with object-cover so it fills the square, and USE THE SANITY HOTSPOT so the chosen focal point stays centered when cropping (use urlFor(...).fit('crop') with the hotspot, or object-position derived from the asset hotspot — whichever your @sanity/image-url setup supports so the hotspot is honored). No blurred backdrop in this mode.
   - If coverFit === 'contain': keep the current contain + blurred-fill treatment (whole image visible, blurred cream-tinted fill around it).
   - Fetch `coverFit` in the GROQ queries that load projects (homepage + mobile grid + anywhere covers render). Default missing values to 'crop'.

3. Do not change layout, the scroll behavior, the illustration column, or the tile frame — only how the cover image fills its square and the new schema field.

CONSTRAINTS
- Keep RTL, brand colors, fonts.
- Hebrew singular-masculine in UI text; field title/description/options in Hebrew.
- Run `npx tsc --noEmit` and ensure it passes.
- New branch off latest origin/main. Do NOT push/merge to main, do NOT open a PR.
- Verify in a headless browser with mock data: a 'crop' cover fills the square respecting a hotspot, a 'contain' cover shows the blurred fill. Screenshot both.
- Push the branch and print the branch name + compare URL.
- You can't reach Sanity from the sandbox — verify by code + tsc + mock data.

---

UPDATE: PROJECTS COLUMN — FIRST CLICK MUST OPEN THE PROJECT

CONTEXT
Next.js 16 + Tailwind homepage, RTL Hebrew desktop. The LEFT projects column auto-scrolls upward (JS updates translateY each frame); hovering pauses it; wheel/arrows scroll it; each tile links to /projects/[slug]. Do NOT touch Sanity schema files — frontend only. Do NOT change the right illustration column.

BUG
When the user clicks a moving project tile, the FIRST click doesn't open the project — instead the posts "jump"/snap into place, and only a SECOND click opens the project. This is because the first click interrupts the animation and the column resets/snaps, swallowing the click.

FIX
Make clicking a project work on the FIRST click, with no jump:
1. When the pointer enters the projects column (hover), pausing the auto-scroll must FREEZE the column exactly where it currently is — do NOT reset or snap the offset to a rounded/base value. The current translateY offset must be preserved precisely so nothing moves when hovering.
2. Ensure the click/navigation on a tile is not being cancelled by the animation logic. The first click on a tile must navigate to its /projects/[slug] immediately. Check that: pointer/hover pausing happens before the click resolves; the offset isn't reset on mouseenter/click; and there's no pointer-events or re-render on hover that drops the click.
3. Keep everything else working: auto-scroll resumes on mouse leave (continuing smoothly from where it is, no jump), wheel scrolling, arrows, seamless loop.

So: hover = freeze in place (no snap), first click opens the project, leave = resume smoothly.

CONSTRAINTS
- Keep RTL, brand colors, fonts, the tile frame, mobile unchanged.
- Do NOT touch Sanity schema files. Frontend only.
- Run `npx tsc --noEmit` and ensure it passes.
- New branch off latest origin/main. Do NOT push/merge to main, do NOT open a PR.
- Verify on desktop in a headless browser: hovering the column does NOT make the posts jump; a single click on a tile navigates to the project; leaving resumes the scroll without a jump.
- Push the branch and print the branch name + compare URL.
