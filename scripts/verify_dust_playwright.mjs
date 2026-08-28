import { chromium } from "playwright";

const URL = process.env.DUST_URL ?? "http://localhost:5173";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(500);

let overlaySeen = false;
let particlesDuringOut = 0;
let phaseDuringOut = "";
let transitionDoneMs = null;
const startMs = Date.now();

const ptToggle = page.getByRole("button", { name: /Mudar para inglês/i }).first();
await ptToggle.click();

for (let i = 0; i < 90; i++) {
  await page.waitForTimeout(50);
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
  if (state.phase === "idle" && transitionDoneMs === null) {
    transitionDoneMs = Date.now() - startMs;
  }
}

const finalLang = await page.evaluate(() => document.documentElement.lang);

await browser.close();

const results = {
  overlaySeen,
  particlesDuringOut,
  phaseDuringOut,
  finalLang,
  transitionDoneMs,
  pass:
    overlaySeen &&
    particlesDuringOut > 0 &&
    finalLang === "en" &&
    transitionDoneMs !== null &&
    transitionDoneMs >= 2300 &&
    transitionDoneMs <= 3800,
};

console.log(JSON.stringify(results, null, 2));
if (!results.pass) process.exit(1);
