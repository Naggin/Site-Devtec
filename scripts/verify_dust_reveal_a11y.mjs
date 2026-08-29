/** Com `prefers-reduced-motion`, a poeira sai de cena e o site aparece inteiro. */
import { chromium } from "playwright";

const URL = process.env.DUST_URL ?? "http://localhost:5173";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(URL, { waitUntil: "networkidle" });
await page.evaluate(() => {
  const el = document.getElementById("servicos");
  window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - 120);
});
await page.waitForTimeout(600);

const state = await page.evaluate(() => {
  const nodes = [...document.querySelectorAll("#servicos .reveal, #servicos .reveal-left")].filter(
    (n) => {
      const r = n.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight - 80;
    },
  );
  return {
    canvas: !!document.querySelector(".dust-reveal-overlay"),
    held: document.querySelectorAll(".dust-hold").length,
    pieces: document.querySelectorAll(".dust-piece").length,
    lit: document.querySelectorAll(".edge-lit").length,
    minOpacity: Math.min(1, ...nodes.map((n) => Number(getComputedStyle(n).opacity))),
    checked: nodes.length,
  };
});

console.log(state, "erros:", errors.length ? errors : "nenhum");
const ok =
  !errors.length &&
  !state.canvas &&
  state.held === 0 &&
  state.pieces === 0 &&
  state.lit === 0 &&
  state.minOpacity === 1 &&
  state.checked > 0;
console.log(ok ? "OK" : "FALHOU");
await browser.close();
process.exit(ok ? 0 : 1);
