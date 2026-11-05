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

---

UPDATE: ZOOM LIGHTBOX FOR ARTICLE IMAGES

CONTEXT
Next.js 16 + Sanity CMS portfolio site, RTL Hebrew, on Vercel. On a project/article page (app/projects/[slug]/page.tsx), the body (Portable Text) renders two image block types: `contentImage` (a single image + caption) and `beforeAfter` (tap-to-toggle reveal between a "before" and "after" image, via components/BeforeAfterHint.tsx). Visitors asked for the ability to ZOOM into images. Brand burgundy #9f2b35. Do NOT touch Sanity schema files — frontend only. Do NOT change the homepage.

TASK — add a zoom lightbox for article images:

1. MAGNIFIER ICON ON EACH IMAGE
On every content image AND every before/after block, add a small magnifier (zoom) icon in a corner. Style: NO circle/background behind it — just the drawn magnifier SVG icon itself, in brand burgundy #9f2b35, with a subtle drop-shadow so it stays visible on any image. On hover it may brighten slightly. It must be a real <button> with a Hebrew aria-label (e.g. "הגדלת תמונה").

2. CLICKING THE ICON OPENS A FULLSCREEN LIGHTBOX (client component)
- Dark translucent backdrop covering the viewport.
- The image centered, zoomable: mouse wheel zooms, pinch-to-zoom on touch, and a + / − control (plain icons, white, drop-shadow, NO circles/backgrounds). Zoom range ~1x–4x. Allow panning/dragging when zoomed in.
- A close control: a plain white "✕" (no circle/background, drop-shadow) top-left; also close on Escape and on backdrop click. Lock body scroll while open.

3. BEFORE/AFTER IN THE LIGHTBOX
- For a beforeAfter block, the magnifier opens the lightbox showing the CURRENTLY displayed image (after by default). Inside the lightbox add a "החלף לפני/אחרי" text button (plain text, brand burgundy #9f2b35, underlined, drop-shadow, NO background) that swaps between the before and after images while zoomed.
- The normal tap-to-toggle behavior on the inline before/after block stays exactly as it is now; the magnifier icon's click must NOT trigger the toggle (stop propagation).

4. ICON CONTRAST
Burgundy icon with a drop-shadow should read on most photos. If it would get lost on a dark image, add a very subtle light halo/shadow so it stays visible — but keep it minimal and on-brand (no solid button background).

CONSTRAINTS
- Keep RTL, brand colors, fonts. Mobile + desktop both. Do NOT touch the homepage or Sanity schema.
- Run `npx tsc --noEmit` and ensure it passes.
- New branch off latest origin/main. Do NOT push/merge to main, do NOT open a PR.
- Verify in a headless browser (mobile + desktop): magnifier icon on content images and before/after; clicking opens the lightbox; wheel/pinch/buttons zoom; before/after has a working "החלף" in the lightbox; close via ✕/Escape/backdrop. Screenshot an open lightbox for a content image and for a before/after.
- Push the branch and print the branch name + compare URL.
- You can't reach Sanity from the sandbox — verify by code + tsc + mock images.

---

UPDATE: REMOVE THE SCROLL-TO-TOP BUTTON

CONTEXT
Next.js 16 + Tailwind homepage, RTL Hebrew, on Vercel. There is a floating "scroll to top" up-arrow button (component ScrollToTop.tsx, used on the homepage and possibly the article page). The client decided it's not needed — the site is tidy and it can be removed. Do NOT touch Sanity schema files — frontend only.

TASK — remove the scroll-to-top button entirely:
- Remove the scroll-to-top up-arrow button from everywhere it's rendered (homepage left column / anywhere else it appears), and remove the ScrollToTop component usage and the component file if it's no longer referenced.
- Clean up any now-unused imports, state, or scroll-position listeners that existed only for it.
- Do NOT change anything else: the projects auto-scroll, arrows for the posts, the illustration column, the contact button, testimonials — all stay as they are.

CONSTRAINTS
- Keep RTL, brand colors, fonts, mobile + desktop layouts otherwise unchanged.
- Do NOT touch Sanity schema files. Frontend only.
- Run `npx tsc --noEmit` and ensure it passes (no leftover references to the removed component).
- New branch off latest origin/main. Do NOT push/merge to main, do NOT open a PR.
- Verify in a headless browser (mobile + desktop): the scroll-to-top button is gone, and nothing else broke.
- Push the branch and print the branch name + compare URL.

---

UPDATE: LIGHTBOX PREV / NEXT + CAPTIONS

CONTEXT
Next.js 16 portfolio site, RTL Hebrew. The article page (app/projects/[slug]/page.tsx) has a working zoom lightbox opened by a magnifier icon on content images and before/after blocks. Brand burgundy #9f2b35. Improve the lightbox. Do NOT touch Sanity schema files — frontend only. Do NOT change the homepage.

TASK — two lightbox improvements:

1. PREV / NEXT NAVIGATION WITH ARROWS
In the lightbox, let the visitor move between the images of the CURRENT article without closing it. Collect all the article's lightbox-able images in document order (each contentImage; for a beforeAfter block, treat its currently-shown side as that entry) into an ordered list. In the lightbox show a previous and a next arrow (plain icons, white, drop-shadow, NO circle/background — matching the existing ✕ and +/− style), and support left/right arrow keys and horizontal swipe on touch. Moving resets zoom to 1x. At the ends, either loop or disable the arrow (pick looping for simplicity). Keep RTL arrow direction correct.

2. SHOW THE CAPTION IN THE LIGHTBOX
When an image has a caption (contentImage.caption, or the beforeAfter label), show that caption text inside the lightbox too — e.g. centered near the bottom, white text with a subtle drop-shadow / slight dark gradient behind it for legibility, so it's readable over the photo. Update the caption as the visitor navigates prev/next. If an image has no caption, show nothing.

Keep everything that already works: wheel/pinch/+/− zoom, pan when zoomed, ✕/Escape/backdrop close, the "החלף לפני/אחרי" button for before/after blocks, and the burgundy magnifier icons.

CONSTRAINTS
- Keep RTL, brand colors, fonts, mobile + desktop. Do NOT touch the homepage or Sanity schema.
- Run `npx tsc --noEmit` and ensure it passes.
- New branch off latest origin/main. Do NOT push/merge to main, do NOT open a PR.
- Verify in a headless browser (mobile + desktop): prev/next arrows + keys + swipe move between images, zoom resets on move, captions show and update, before/after swap still works.
- Push the branch and print the branch name + compare URL.
- You can't reach Sanity from the sandbox — verify by code + tsc + mock images with captions.

---

UPDATE: LIGHTBOX — CAPTION WAITS FOR ITS IMAGE, PRELOADING, LOADING INDICATOR

CONTEXT
Next.js 16 portfolio site, RTL Hebrew. The article page has a zoom lightbox with prev/next navigation and captions. BUG: when navigating to another image, the CAPTION updates immediately but the IMAGE itself takes time to load from the network, so the caption (and UI) appear before the image arrives — sometimes with a significant delay. Brand burgundy #9f2b35. Do NOT touch Sanity schema files — frontend only. Do NOT change the homepage.

TASK — make the image and its caption appear together, and speed up navigation:

1. SYNC CAPTION TO IMAGE LOAD
When the visitor moves to another lightbox image (prev/next/swipe/arrow key) or opens the lightbox, do NOT show the new caption until the new image has finished loading. Track the image's load event (onLoad) and only reveal the caption (and fade the image in) once it's ready, so the caption never appears before its image. Keep it smooth (a short fade-in of image+caption together).

2. PRELOAD NEIGHBORS
Preload the NEXT and PREVIOUS images in the lightbox list in the background (e.g. new Image() / <link rel=prefetch> / hidden preloading) so that moving to them is usually instant. When possible also use a reasonably sized image URL via @sanity/image-url (not the full-resolution original) so lightbox images load fast — but still large enough to look good when zoomed (e.g. width ~1600).

3. LOADING INDICATOR
While an image is still loading (first open, or a neighbor not yet preloaded), show a subtle loading indicator (a small spinner or a soft shimmer) centered where the image will be, in a restrained on-brand style — so the visitor never sees just a caption on an empty background. Hide it as soon as the image is ready.

Keep everything working: zoom (wheel/pinch/+/−), pan, prev/next arrows + keys + swipe, before/after swap, ✕/Escape/backdrop close, burgundy magnifier icons, captions.

CONSTRAINTS
- Keep RTL, brand colors, fonts, mobile + desktop. Do NOT touch the homepage or Sanity schema.
- Run `npx tsc --noEmit` and ensure it passes.
- New branch off latest origin/main. Do NOT push/merge to main, do NOT open a PR.
- Verify in a headless browser: caption appears together with its image (not before), neighbors preload so navigation feels fast, a loading indicator shows while an image loads.
- Push the branch and print the branch name + compare URL.
- You can't reach Sanity from the sandbox — verify by code + tsc + mock images (simulate slow load).

---

UPDATE: MOBILE POSTS OVERLAY — RESPECT THE BACK BUTTON

CONTEXT
Next.js 16 (App Router) portfolio site, RTL Hebrew, on Vercel. On MOBILE, the homepage hides the projects inline; instead a "לפוסטים" button opens a full-screen posts overlay (a client component with open/close state, not a separate route). From that overlay the visitor taps a project and navigates to /projects/[slug]. Do NOT touch Sanity schema files — frontend only.

BUG
On mobile: open the posts overlay ("לפוסטים") → tap a project → you're on the project page. Press "back" (browser/phone back button) → you land on the plain homepage with the overlay CLOSED, instead of back on the open posts overlay. The overlay's open/closed state isn't part of history, so "back" skips it.

FIX — make the posts overlay respect browser history / back button:
- When the posts overlay opens, push a history entry (e.g. history.pushState, or sync the open state to a URL hash like #posts) so the overlay being open is a distinct history state.
- Pressing back from a project should return to the homepage with the posts overlay OPEN (and scrolled to where it was if easy), not the plain closed homepage. Then a further back from the open overlay closes it (back to the plain homepage).
- Also: pressing the phone/browser back while the overlay is open (without entering a project) should simply CLOSE the overlay, not leave the site.
- Use popstate handling so the overlay's open/closed state stays in sync with history. Clean up listeners properly. Make sure this doesn't break normal navigation on desktop (where there's no overlay).

CONSTRAINTS
- Keep RTL, brand colors, fonts; desktop layout and behavior unchanged.
- Do NOT touch Sanity schema files. Frontend only.
- Run `npx tsc --noEmit` and ensure it passes.
- New branch off latest origin/main. Do NOT push/merge to main, do NOT open a PR.
- Verify in a headless browser at mobile width: open posts → tap project → back returns to the OPEN posts overlay; back again closes it to the homepage; back while overlay open (no project entered) closes the overlay. Desktop unaffected.
- Push the branch and print the branch name + compare URL.

---

UPDATE: ARTICLE BACK ARROW GOES TO THE POSTS

כשמישהו בתוך כתבה ולוחץ על החץ הפנימי בצד שמאל למעלה הוא אמור להגיע לעמוד הפוסטים ולא לדף הבית
