import { sampleFragments, transitionDelayOf, type DustParticle } from "./dustSample";
import { createDrawState, drawParticle, fitCanvas, getAtlas } from "./dustRender";

/**
 * Sopro de fragmentos quando um bloco entra na tela.
 *
 * Mesma tinta, mesma paleta e mesmo desenho da transição de idioma — só que
 * curto, por bloco e uma vez só. O bloco em si entra por CSS; os fragmentos
 * convergem para ele e somem ao pousar, no instante em que ele fica sólido.
 */

const FLIGHT_MS = 620;
/** Espalhamento do varrimento diagonal dentro do próprio bloco. */
const SPREAD_MS = 260;
const LIFE_MS = FLIGHT_MS + SPREAD_MS;

const BUDGET_DESKTOP = 260;
const BUDGET_MOBILE = 90;

/**
 * Teto de partículas vivas ao mesmo tempo. Várias seções podem entrar juntas
 * num scroll rápido, e é melhor pular um sopro do que engasgar a rolagem.
 */
const MAX_LIVE_DESKTOP = 900;
const MAX_LIVE_MOBILE = 300;

type Burst = {
  particles: DustParticle[];
  /** Já inclui o transition-delay do bloco, para os dois entrarem juntos. */
  start: number;
  /** Rolagem no momento da amostra: as posições são ancoradas ao documento. */
  scrollY: number;
};

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let bursts: Burst[] = [];
let raf = 0;
let W = 0;
let H = 0;

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function clamp01(n: number) {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

function ensureCanvas() {
  if (canvas && ctx) return true;

  canvas = document.createElement("canvas");
  canvas.className = "reveal-dust";
  canvas.setAttribute("aria-hidden", "true");
  ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    canvas = null;
    return false;
  }
  document.body.append(canvas);
  ({ W, H } = fitCanvas(canvas, ctx));
  window.addEventListener("resize", onResize);
  return true;
}

function onResize() {
  if (canvas && ctx) ({ W, H } = fitCanvas(canvas, ctx));
}

function liveCount() {
  return bursts.reduce((n, b) => n + b.particles.length, 0);
}

function frame(now: number) {
  if (!ctx) return;
  ctx.clearRect(0, 0, W, H);

  const atlas = getAtlas();
  const state = createDrawState();
  const scrollNow = window.scrollY;

  bursts = bursts.filter((b) => now - b.start < LIFE_MS);

  for (const b of bursts) {
    const elapsed = now - b.start;
    if (elapsed < 0) continue; // ainda esperando o transition-delay do bloco
    // O bloco continua rolando enquanto os fragmentos voam; sem esta correção
    // eles ficariam parados na tela e descolariam do conteúdo.
    const dy = b.scrollY - scrollNow;

    for (const p of b.particles) {
      const local = clamp01((elapsed - p.delay * SPREAD_MS) / FLIGHT_MS);
      const e = 1 - easeOutCubic(local);

      p.x = p.homeX + p.vx * e * 95 + Math.sin(elapsed * 0.004 + p.wobble) * 16 * e;
      p.y = p.homeY + dy + p.lift * e * 95;

      // Acende ao entrar e apaga ao pousar, quando o bloco já está sólido.
      drawParticle(ctx, atlas, state, p, p.opacity * Math.min(1, local / 0.12) * (1 - local ** 2), e);
    }
  }

  if (bursts.length) {
    raf = requestAnimationFrame(frame);
  } else {
    raf = 0;
    ctx.clearRect(0, 0, W, H);
  }
}

/** Dispara o sopro de fragmentos de um bloco que acabou de ser revelado. */
export function burstReveal(el: HTMLElement) {
  if (typeof window === "undefined" || typeof requestAnimationFrame !== "function") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  // A transição de idioma já está desenhando a tela inteira; somar sopros aí
  // só tira frames de uma animação que o usuário está olhando de perto.
  if (document.body.classList.contains("language-transitioning")) return;

  const mobile = window.innerWidth < 768;
  if (liveCount() >= (mobile ? MAX_LIVE_MOBILE : MAX_LIVE_DESKTOP)) return;

  const particles = sampleFragments(el, mobile ? BUDGET_MOBILE : BUDGET_DESKTOP);
  if (!particles.length) return;
  if (!ensureCanvas()) return;

  // O bloco pode ter `data-delay`; o sopro espera junto para não chegar antes.
  bursts.push({
    particles,
    start: performance.now() + transitionDelayOf(el),
    scrollY: window.scrollY,
  });
  if (!raf) raf = requestAnimationFrame(frame);
}

/** Para o loop e remove o canvas. Usado no unmount do hook de revelação. */
export function stopRevealDust() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  bursts = [];
  window.removeEventListener("resize", onResize);
  canvas?.remove();
  canvas = null;
  ctx = null;
}
