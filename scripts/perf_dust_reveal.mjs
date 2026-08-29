/** Custo da entrada em poeira num scroll contínuo pela página inteira. */
import { chromium } from "playwright";

const URL = process.env.DUST_URL ?? "http://localhost:5173";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(600);

await page.evaluate(() => {
  window.__frames = [];
  // Conta quantas entradas realmente rodaram, para a medição não passar num
  // cenário em que a poeira nem chegou a disparar.
  window.__reveals = 0;
  const seen = new WeakSet();
  const watch = () => {
    for (const el of document.querySelectorAll(".dust-in")) {
      if (!seen.has(el)) {
        seen.add(el);
        window.__reveals++;
      }
    }
    setTimeout(watch, 30);
  };
  watch();
  let last = performance.now();
  const tick = (ts) => {
    window.__frames.push(ts - last);
    last = ts;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

// Scroll contínuo, ~60 passos de 140px: cobre a página toda disparando entradas.
for (let i = 0; i < 60; i++) {
  await page.mouse.wheel(0, 140);
  await page.waitForTimeout(60);
}
await page.waitForTimeout(1200);

const stats = await page.evaluate(() => {
  const f = window.__frames.slice(5);
  const sorted = [...f].sort((a, b) => a - b);
  const at = (q) => sorted[Math.floor(sorted.length * q)];
  return {
    frames: f.length,
    media: +(f.reduce((s, n) => s + n, 0) / f.length).toFixed(1),
    p50: +at(0.5).toFixed(1),
    p95: +at(0.95).toFixed(1),
    max: +Math.max(...f).toFixed(1),
    acima32ms: f.filter((n) => n > 32).length,
    entradas: window.__reveals,
  };
});

console.log(stats);
await browser.close();
