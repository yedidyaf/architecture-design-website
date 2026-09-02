import type { Metadata } from "next";
import { Assistant, Rubik_Spray_Paint } from "next/font/google";
import Footer from "@/components/Footer";
import "./globals.css";

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700"],
});

// Decorative display face used ONLY for the brand name "מירי פרידלנד".
// Hebrew glyphs come from the "hebrew" subset; the family ships a single 400 weight.
const rubikSprayPaint = Rubik_Spray_Paint({
  variable: "--font-spray-paint",
  subsets: ["hebrew", "latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "תיק עבודות | אדריכלות",
  description: "תיק עבודות אדריכלות — פרויקטים נבחרים",
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
      className={`${assistant.variable} ${rubikSprayPaint.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Footer />
      </body>
    </html>
  );
}
