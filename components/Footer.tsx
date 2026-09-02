import {
  WHATSAPP_URL,
  PHONE_PRIMARY_URL,
  PHONE_PRIMARY_DISPLAY,
  EMAIL_URL,
  EMAIL_DISPLAY,
} from "@/lib/contact";

// Plain inline text links separated by middots, conventional footer style —
// no button chrome, just muted brand-colored text that darkens on hover.
const CONTACT_LINK = "text-brand/80 transition-colors hover:text-brand";
const SEPARATOR = <span className="mx-2 text-brand-ink/30">·</span>;

export default function Footer() {
  return (
    <footer className="border-t border-brand/10 px-6 py-8 text-center">
      <p className="mb-6 text-sm">
        <a href={EMAIL_URL} dir="ltr" className={CONTACT_LINK}>
          {EMAIL_DISPLAY}
        </a>
        {SEPARATOR}
        <a href={PHONE_PRIMARY_URL} dir="ltr" className={CONTACT_LINK}>
          {PHONE_PRIMARY_DISPLAY}
        </a>
        {SEPARATOR}
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={CONTACT_LINK}>
          וואטסאפ
        </a>
      </p>
      <p className="text-xs text-brand-ink/60">
        © 2026 מירי פרידלנד · עוצב ופותח על ידי י.פ. בניית אתרים
      </p>
    </footer>
  );
}
