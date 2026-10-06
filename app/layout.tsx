import type { Metadata } from "next";
import { Amatic_SC, Assistant } from "next/font/google";
import Footer from "@/components/Footer";
import { OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import "./globals.css";

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700"],
});

// Decorative display face used ONLY for the brand name "מירי פרידלנד".
// Hebrew glyphs come from the "hebrew" subset; bold (700) is the weight used.
const amaticSC = Amatic_SC({
  variable: "--font-amatic",
  subsets: ["hebrew", "latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    // Child pages (e.g. projects) read "<project> | מירי פרידלנד".
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "מירי פרידלנד",
    "אדריכלית",
    "תכנון בתים פרטיים",
    "תכנון אדריכלי",
    "שיפוצים",
    "הרחבת בית",
    "עיצוב פנים",
    "מעצבת פנים",
  ],
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: "he_IL",
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${assistant.variable} ${amaticSC.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Footer />
      </body>
    </html>
  );
}
