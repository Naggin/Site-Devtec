/** Sequência de frames da entrada de uma seção, para inspeção visual. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const URL = process.env.DUST_URL ?? "http://localhost:5173";
const ID = process.env.DUST_SECTION ?? "sobre";
const OUT = process.env.DUST_SHOTS ?? "./.dust-shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(700);

await page.evaluate((target) => {
  const el = document.getElementById(target);
  window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - 120);
}, ID);

const marks = [80, 200, 350, 500, 700, 950, 1300];
let prev = 0;
for (const ms of marks) {
  await page.waitForTimeout(ms - prev);
  prev = ms;
  await page.screenshot({ path: `${OUT}/seq-${ID}-${String(ms).padStart(4, "0")}.png` });
}

await browser.close();
console.log("frames em", OUT);
