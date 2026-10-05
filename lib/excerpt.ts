// Builds the short homepage-card excerpt from a project's opening paragraph.

const MAX_CHARS = 110;
// Don't back off to a word boundary that would leave the excerpt shorter
// than this; hard-cut instead (e.g. one very long word).
const MIN_CHARS = 70;

// Plain text only: Portable Text marks are already dropped by pt::text, but
// authors sometimes type literal markdown, so strip the common syntax too.
function toPlainText(text: string): string {
  return text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // [label](url) / ![alt](src) → label
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+[.)])\s+/gm, "") // heading / quote / list markers
    .replace(/(\*\*|__|\*|_|~~|`)(?=\S)([\s\S]*?\S)\1/g, "$2") // **bold**, _em_, `code`…
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string): string {
  if (text.length <= MAX_CHARS) return text;
  const cut = text.slice(0, MAX_CHARS + 1);
  const lastSpace = cut.lastIndexOf(" ");
  const body = lastSpace >= MIN_CHARS ? cut.slice(0, lastSpace) : text.slice(0, MAX_CHARS);
  // Drop dangling punctuation so we don't render ",…" or " —…".
  return `${body.replace(/[\s,.;:!?\-–—"'״׳(]+$/u, "")}…`;
}

/** First non-empty paragraph → plain, truncated excerpt; null if none. */
export function buildExcerpt(paragraphs: (string | null)[] | null | undefined): string | null {
  for (const raw of paragraphs ?? []) {
    const text = raw ? toPlainText(raw) : "";
    if (text) return truncate(text);
  }
  return null;
}
