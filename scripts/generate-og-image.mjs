// Renders public/og.png — the 1200x630 Open Graph / Twitter share image.
//
// Rendered with real Chromium (not next/og's ImageResponse) because Satori
// has no bidi support and no bundled Hebrew font, so Hebrew would come out
// reversed or as boxes.
//
// Run (needs network for the Assistant font and a Playwright Chromium):
//   npm i --no-save playwright-core && npx playwright-core install chromium
//   node scripts/generate-og-image.mjs
import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";

const out = fileURLToPath(new URL("../public/og.png", import.meta.url));

const html = `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;700&display=block" rel="stylesheet">
<style>
  html, body { margin: 0; }
  body {
    width: 1200px;
    height: 630px;
    background: #FAF7F5;
    font-family: "Assistant", sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    border: 18px solid #FAF7F5;
    outline: 1px solid rgba(159, 43, 53, 0.18);
    outline-offset: -40px;
  }
  h1 {
    margin: 0;
    color: #9f2b35;
    font-size: 132px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.01em;
  }
  .rule {
    width: 72px;
    height: 2px;
    background: #9f2b35;
    opacity: 0.45;
    margin: 44px 0 36px;
  }
  p {
    margin: 0;
    color: #4A2C30;
    font-size: 46px;
    font-weight: 400;
    letter-spacing: 0.04em;
  }
</style>
</head>
<body>
  <h1>מירי פרידלנד</h1>
  <div class="rule"></div>
  <p>אדריכלית ומעצבת פנים</p>
</body>
</html>`;

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
const ok = await page.evaluate(() => document.fonts.check('700 132px "Assistant"', "מירי"));
if (!ok) throw new Error("Assistant font did not load; refusing to write a fallback-font image.");
await page.screenshot({ path: out, type: "png" });
await browser.close();
console.log(`wrote ${out}`);
