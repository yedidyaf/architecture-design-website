CONTEXT
Next.js 16 (App Router, TypeScript) + Tailwind portfolio site, RTL Hebrew. Brand burgundy #9f2b35. On the homepage (`app/page.tsx`), under the logo and the name "מירי פרידלנד", there is a short slogan shown as two lines:
  בואו איתי להגשים חלומות!
  "אם תרצו אין זו אגדה..."
We want to frame this slogan with hand-drawn architectural arches and animate it.

GOAL
Three nested arches LYING ON THEIR SIDE, open toward the RIGHT (flat open ends at the right, rounded side at the left), with the slogan sitting inside the opening. On page load: the arches slide in from the right like a drawer opening, then the slogan types itself letter by letter, line by line, with a blinking caret.

IMPLEMENTATION (match this closely)
1. Create a client component (e.g. `components/ArchSlogan.tsx`) that receives the slogan lines as props. Use the SAME data source that renders the slogan today. Each line break in the slogan (newline or soft line break from the editor) becomes its own line inside the arches. If the source is a single plain string with no line breaks, keep it as one line and mention it in the report.
2. Arches SVG, viewBox="0 0 340 240", container width min(440px, 94vw), aspect-ratio 340/240, centered:
   <g filter="url(#archWobble)">
     <path d="M334,78 L120,78 A42,42 0 0 0 120,162 L334,162"/>
     <path d="M334,58 L120,58 A62,62 0 0 0 120,182 L334,182"/>
     <path d="M334,38 L120,38 A82,82 0 0 0 120,202 L334,202"/>
   </g>
   paths: fill none; stroke #9f2b35; stroke-width 1.8.
   Hand-drawn wobble filter (unique id):
   <filter id="archWobble"><feTurbulence type="turbulence" baseFrequency="0.016" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4"/></filter>
3. Slogan text: absolutely positioned inside the arches: top 50% with translateY(-50%), right 6%, left 27%, centered text, lines stacked with a small gap, white-space nowrap, burgundy color, site body font (Assistant). First line about clamp(17px, 4.9vw, 23px) regular weight; second line about clamp(13px, 3.6vw, 16px), weight 600, opacity .88. Make sure every line fits INSIDE the innermost arch on both a 390px phone and on desktop; if a line is too long, reduce its font size rather than letting it overflow the arches.
4. Drawer animation: the whole arches+slogan block starts at translateX(120%), opacity 0, and animates to translateX(0), opacity 1 over 1s with cubic-bezier(.2,.8,.25,1). Prevent horizontal page scroll during the slide (overflow-x hidden on the wrapping section only).
5. Typing animation: starts ~1.1s after load (after the drawer). Line 1 types at ~70ms per character, short pause, then line 2 at ~60ms per character. Show a thin blinking burgundy caret at the end of the line being typed; remove it from line 1 when line 2 starts; leave it blinking at the end. Use Array.from() on the strings so Hebrew characters and punctuation are handled correctly. Run once per page load only, and clear all timers on unmount.
6. No layout shift: reserve the final size of each line from the start (render the full text invisibly as a placeholder and overlay the typed text on top), so content below doesn't jump while typing.
7. SEO and accessibility: the full slogan text must exist in the HTML from the server render; the typing is visual only. The SVG gets aria-hidden="true".
8. Reduced motion: under prefers-reduced-motion: reduce, show the arches and full text immediately with no slide, no typing and no caret.
9. Keep the existing spacing between the name and the slogan area balanced; do not change the logo, the rings animation, the name, or the long bio text below.

REQUIREMENTS
- Keep all Hebrew text clean and correct.
- Test on both mobile (390px wide) and desktop.

CONSTRAINTS
- Do not touch the Sanity schema.
- Run `npx tsc --noEmit` and fix any type errors before committing.
- Branch off origin/main, commit, and open a PR.
- If type-check/build passes and there are NO merge conflicts with main, merge the PR into main. If there are conflicts or a failure, do NOT merge, stop and report what blocked it.
