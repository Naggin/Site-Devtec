import { chromium } from "playwright";

const URL = process.env.DUST_URL ?? "http://localhost:5173";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(500);

const ptToggle = page.getByRole("button", { name: /Mudar para inglês/i }).first();
await ptToggle.click();

let overlaySeen = false;
let particlesDuringOut = 0;
let phaseDuringOut = "";

for (let i = 0; i < 30; i++) {
  await page.waitForTimeout(80);
  const state = await page.evaluate(() => {
    const canvas = document.querySelector(".dust-overlay");
    const phase = document.body.dataset.langPhase ?? "";
    const count = Number(canvas?.getAttribute("data-particle-count") ?? "0");
    const visible = canvas ? getComputedStyle(canvas).opacity !== "0" : false;
    return { phase, count, visible, hasOverlay: !!canvas };
  });

  if (state.hasOverlay && state.visible) overlaySeen = true;
  if (state.phase === "out" && state.count > 0) {
    particlesDuringOut = Math.max(particlesDuringOut, state.count);
    phaseDuringOut = "out";
  }
}

const finalLang = await page.evaluate(() => document.documentElement.lang);

await browser.close();

const results = {
  overlaySeen,
  particlesDuringOut,
  phaseDuringOut,
  finalLang,
  pass: overlaySeen && particlesDuringOut > 0 && finalLang === "en",
};

console.log(JSON.stringify(results, null, 2));
if (!results.pass) process.exit(1);
