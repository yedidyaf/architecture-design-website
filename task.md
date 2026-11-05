CONTEXT
Next.js 16 (App Router, TypeScript) + Tailwind portfolio site, RTL Hebrew. The homepage is `app/page.tsx`. On DESKTOP there is a column of posts that auto-scrolls (marquee) inside a hand-drawn / imperfect burgundy frame. On MOBILE there is currently a "לפוסטים" button that opens a full posts overlay screen.

GOAL
On MOBILE, replace the "לפוסטים" button with a smaller auto-scrolling preview of the posts that looks like the desktop version (same hand-drawn frame, fast movement). Tapping anywhere on this preview — on any post — opens the existing full posts overlay screen.

REQUIREMENTS
1. Remove the "לפוסטים" button from the mobile layout.
2. In its place, render a compact version of the desktop auto-scrolling posts column:
   - Reuse the same posts data and the same card styling as desktop (cover image + title), just sized smaller to fit mobile width.
   - Auto-scroll continuously and FAST, like the desktop marquee (seamless loop with duplicated content).
   - Wrap it in the same hand-drawn / imperfect burgundy frame used around the posts on desktop.
   - Constrain its height so it reads as a small "taste" (show roughly 2–3 posts tall), not the whole list.
3. The entire preview is ONE tap target: tapping anywhere on it, regardless of which post, opens the full posts overlay screen (the same overlay the old button opened). Do NOT navigate to an individual project from the preview.
4. Keep the existing full posts overlay screen and its back-button behavior (history.pushState / popstate) exactly as it is.
5. Do NOT change the desktop layout at all.
6. Keep all Hebrew text clean and correct (no foreign/garbled characters).

CONSTRAINTS
- Do not touch the Sanity schema unless strictly necessary.
- Run `npx tsc --noEmit` and fix any type errors.
- Branch off origin/main; do NOT merge to main and do NOT open a PR.
- Test both mobile and desktop widths before finishing.
