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
