/**
 * Verifica a entrada em poeira das seções: ao rolar até uma seção, as peças são
 * marcadas, o canvas de reveal desenha, e no fim nada fica marcado nem invisível.
 *
 * Uso: `npm run dev` noutro terminal, depois `node scripts/verify_dust_reveal.mjs`.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const URL = process.env.DUST_URL ?? "http://localhost:5173";
const SHOTS = process.env.DUST_SHOTS ?? "./.dust-shots";
mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(700);

/** Tinta no canvas de reveal: amostra esparsa, só para saber se desenhou algo. */
const probe = () =>
  page.evaluate(() => {
    const canvas = document.querySelector(".dust-reveal-overlay");
    let ink = 0;
    if (canvas instanceof HTMLCanvasElement && canvas.width) {
      const ctx = canvas.getContext("2d");
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 3; i < data.length; i += 4 * 97) if (data[i] > 8) ink++;
    }
    return {
      hasCanvas: !!canvas,
      ink,
      pieces: document.querySelectorAll(".dust-piece").length,
      revealing: document.querySelectorAll(".dust-in").length,
      held: document.querySelectorAll(".dust-hold").length,
      lit: document.querySelectorAll(".section-border.edge-lit").length,
    };
  });

const report = [];

for (const id of ["sobre", "servicos", "projetos", "processo", "contato"]) {
  await page.evaluate((target) => {
    const el = document.getElementById(target);
    window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - 120);
  }, id);

  let peakPieces = 0;
  let peakInk = 0;
  let shot = false;
  for (let i = 0; i < 34; i++) {
    const s = await probe();
    peakPieces = Math.max(peakPieces, s.pieces);
    peakInk = Math.max(peakInk, s.ink);
    if (!shot && s.ink > 0 && s.pieces > 0) {
      await page.screenshot({ path: `${SHOTS}/${id}-meio.png` });
      shot = true;
    }
    await page.waitForTimeout(45);
  }

  await page.waitForTimeout(900);
  const done = await probe();
  const opacity = await page.evaluate((target) => {
    const el = document.getElementById(target);
    // Só o que está na vista: o resto da seção ainda espera a sua vez, e é
    // suposto continuar invisível.
    const nodes = [...el.querySelectorAll(".reveal, .reveal-left, .reveal-right")].filter(
      (n) => {
        const r = n.getBoundingClientRect();
        // A folga de 80px espelha o rootMargin do observer: o que ainda
        // está encostado na borda de baixo não foi disparado.
        return r.bottom > 0 && r.top < window.innerHeight - 80;
      },
    );
    return Math.min(1, ...nodes.map((n) => Number(getComputedStyle(n).opacity)));
  }, id);
  await page.screenshot({ path: `${SHOTS}/${id}-fim.png` });

  report.push({ id, peakPieces, peakInk, restPieces: done.pieces, restHeld: done.held, lit: done.lit, opacity });
}

const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
);

console.table(report);
console.log("overflow horizontal:", overflow, "px");
console.log("erros de página:", errors.length ? errors : "nenhum");

const ok =
  errors.length === 0 &&
  overflow <= 0 &&
  report.every((r) => r.peakPieces > 0 && r.peakInk > 0 && r.restPieces === 0 && r.opacity === 1);

console.log(ok ? "OK" : "FALHOU");
await browser.close();
process.exit(ok ? 0 : 1);
