import {
  WHATSAPP_URL,
  PHONE_PRIMARY_URL,
  PHONE_PRIMARY_DISPLAY,
  EMAIL_URL,
  EMAIL_DISPLAY,
} from "@/lib/contact";

// grid-cols-3 gives all three buttons identical width regardless of label
// length; flex + justify-center keeps each label centered inside its own
// button. Soft translucent fill (not solid brand) with solid brand text,
// per spec — readable without being the loud, opaque button style used
// elsewhere (e.g. ContactFab).
const CONTACT_PILL =
  "flex min-h-10 items-center justify-center rounded-full border border-brand/20 bg-brand/12 px-2 py-2 text-center text-xs font-medium text-brand transition-colors hover:bg-brand/20";

export default function Footer() {
  return (
    <footer className="border-t border-brand/10 px-6 py-8 text-center">
      <div className="mx-auto mb-6 grid max-w-sm grid-cols-3 gap-3">
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={CONTACT_PILL}>
          וואטסאפ
        </a>
        <a href={PHONE_PRIMARY_URL} dir="ltr" className={CONTACT_PILL}>
          {PHONE_PRIMARY_DISPLAY}
        </a>
        <a href={EMAIL_URL} dir="ltr" className={CONTACT_PILL}>
          {EMAIL_DISPLAY}
        </a>
      </div>
      <p className="text-xs text-brand-ink/60">
        © 2026 מירי פרידלנד · עוצב ופותח על ידי ידידיה פרידלנד
      </p>
    </footer>
  );
}
