/** Troca de idioma disparada no meio da entrada de uma seção: nada pode sobrar. */
import { chromium } from "playwright";

const URL = process.env.DUST_URL ?? "http://localhost:5173";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(600);

await page.evaluate(() => {
  const el = document.getElementById("servicos");
  window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - 120);
});
// No meio do voo das partículas da seção.
await page.waitForTimeout(220);
await page.getByRole("button", { name: /Mudar para inglês/i }).first().click();

await page.waitForTimeout(4000);

const state = await page.evaluate(() => {
  const nodes = [...document.querySelectorAll(".reveal, .reveal-left, .reveal-right")].filter(
    (n) => {
      const r = n.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight - 80;
    },
  );
  return {
    lang: document.documentElement.lang,
    phase: document.body.dataset.langPhase,
    pieces: document.querySelectorAll(".dust-piece").length,
    revealing: document.querySelectorAll(".dust-in").length,
    minOpacity: Math.min(1, ...nodes.map((n) => Number(getComputedStyle(n).opacity))),
    checked: nodes.length,
  };
});

console.log(state, "erros:", errors.length ? errors : "nenhum");
const ok =
  !errors.length &&
  state.lang === "en" &&
  state.phase === "idle" &&
  state.pieces === 0 &&
  state.revealing === 0 &&
  state.minOpacity === 1 &&
  state.checked > 0;
console.log(ok ? "OK" : "FALHOU");
await browser.close();
process.exit(ok ? 0 : 1);
