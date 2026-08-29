/**
 * Entrada das seções: cada bloco se junta a partir da mesma poeira em que o
 * site se desfaz na troca de idioma.
 *
 * É deliberadamente a fase "in" do `DustTransition`, com as durações apertadas:
 * ali a transição é o assunto e pode demorar, aqui ela acompanha o scroll e não
 * pode atrasar a leitura. O desenho vem todo de `dustPainter`, então as duas não
 * têm como divergir.
 *
 * Um único canvas e um único rAF servem todas as entradas simultâneas — num
 * scroll rápido é comum meia dúzia de blocos entrarem juntos.
 */
import { createPainter, reformParticle, type Painter } from "./dustPainter";
import { clearPieces, markPieces, sampleElement, type DustParticle } from "./dustSample";

/** Varrimento e voo, na metade do tempo da troca de idioma. */
export const REVEAL_SWEEP_MS = 420;
export const REVEAL_FLIGHT_MS = 520;
export const REVEAL_TOTAL_MS = REVEAL_SWEEP_MS + REVEAL_FLIGHT_MS;

/** Duração do fade de cada peça. Casada com `@keyframes dust-reform` no CSS. */
export const REVEAL_PIECE_MS = 420;

/** Cascata entre blocos irmãos, lida do `data-delay` que o markup já usava. */
export const REVEAL_LEAD_STEP_MS = 90;

/** Abaixo disto não há tinta suficiente no bloco para a poeira convencer. */
const MIN_PARTICLES = 40;

/** Teto de partículas simultâneas: num scroll rápido várias entradas coincidem. */
const MAX_ACTIVE_PARTICLES = 2000;

type Reveal = {
  el: HTMLElement;
  particles: DustParticle[];
  pieces: HTMLElement[];
  /** Atraso de cascata do bloco, em ms. */
  lead: number;
  /** Scroll no instante da amostragem, para compensar o que rolar durante o voo. */
  scrollY: number;
  start: number | null;
};

let active: Reveal[] = [];
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let painter: Painter | null = null;
let raf = 0;
let W = 0;
let H = 0;

function resize() {
  if (!canvas || !ctx) return;
  W = window.innerWidth;
  H = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/**
 * As posições de repouso foram medidas no layout antigo: depois de um resize
 * elas apontam para lugares que não existem mais. Encerrar é mais honesto do
 * que animar poeira fora do lugar.
 */
function onResize() {
  cancelReveals();
  resize();
}

function ensureCanvas(): boolean {
  if (ctx) return true;
  if (typeof document === "undefined") return false;

  const el = document.createElement("canvas");
  const context = el.getContext("2d", { alpha: true });
  // jsdom, canvas desligado por política: quem chama cai no reveal simples.
  if (!context) return false;

  el.className = "dust-reveal-overlay";
  el.setAttribute("aria-hidden", "true");
  el.setAttribute("role", "presentation");
  document.body.append(el);

  canvas = el;
  ctx = context;
  painter = createPainter(context);
  resize();
  window.addEventListener("resize", onResize);
  return true;
}

export function supportsDustReveal(): boolean {
  return ensureCanvas();
}

/** Devolve o bloco ao estado normal: peças sem marca, opacidade natural. */
function finish(reveal: Reveal) {
  clearPieces(reveal.pieces);
  reveal.el.classList.remove("dust-in");
  reveal.el.style.removeProperty("--dust-lead");
}

function loop(ts: number) {
  raf = 0;
  if (!ctx || !painter) return;

  ctx.clearRect(0, 0, W, H);
  const scrollY = window.scrollY;
  const remaining: Reveal[] = [];

  for (const reveal of active) {
    if (reveal.start === null) reveal.start = ts;
    const elapsed = ts - reveal.start - reveal.lead;

    if (elapsed >= REVEAL_TOTAL_MS) {
      finish(reveal);
      continue;
    }
    remaining.push(reveal);
    if (elapsed <= 0) continue; // ainda na cascata: o bloco nem começou

    // O que rolou desde a amostragem: o canvas é fixo, o conteúdo não.
    const offsetY = reveal.scrollY - scrollY;
    for (const p of reveal.particles) {
      reformParticle(painter, p, elapsed, REVEAL_SWEEP_MS, REVEAL_FLIGHT_MS, H, offsetY);
    }
  }

  active = remaining;
  if (active.length) raf = requestAnimationFrame(loop);
  else ctx.clearRect(0, 0, W, H);
}

/** Corta o excesso das entradas mais antigas quando muitas coincidem. */
function trimBudget() {
  let total = 0;
  for (const reveal of active) total += reveal.particles.length;
  if (total <= MAX_ACTIVE_PARTICLES) return;

  for (const reveal of active) {
    if (total <= MAX_ACTIVE_PARTICLES) break;
    const keep = Math.max(MIN_PARTICLES, reveal.particles.length - (total - MAX_ACTIVE_PARTICLES));
    total -= reveal.particles.length - keep;
    reveal.particles.length = keep;
  }
}

/**
 * Põe o bloco no estado de repouso, amostra, e devolve a poeira ao ar.
 *
 * Nada é pintado no meio desta função — o browser só desenha no fim da tarefa —
 * então tirar o bloco do `dust-hold` antes de marcar as peças não pisca.
 *
 * `false` significa "não deu": o bloco fica visível pelo caminho normal.
 */
export function startDustReveal(el: HTMLElement): boolean {
  if (!ensureCanvas()) return false;

  const lead = (Number(el.dataset.delay) || 0) * REVEAL_LEAD_STEP_MS;
  el.classList.remove("dust-hold");
  el.classList.add("visible", "dust-in");

  const sample = sampleElement(el, "up");
  if (sample.particles.length < MIN_PARTICLES) {
    el.classList.remove("dust-in");
    clearPieces(sample.pieces);
    return false;
  }

  markPieces(sample.pieces, REVEAL_SWEEP_MS, sample.W, sample.H, sample.range, "up");
  if (lead) el.style.setProperty("--dust-lead", `${lead}ms`);

  active.push({
    el,
    particles: sample.particles,
    pieces: sample.pieces,
    lead,
    scrollY: window.scrollY,
    start: null,
  });
  trimBudget();

  if (!raf) raf = requestAnimationFrame(loop);
  return true;
}

/**
 * Encerra tudo que está em voo, deixando os blocos no estado final. Usado no
 * resize e antes da troca de idioma, que reamostra a tela inteira e não pode
 * encontrar peça marcada por outra transição.
 */
export function cancelReveals() {
  for (const reveal of active) finish(reveal);
  active = [];
  if (raf) {
    cancelAnimationFrame(raf);
    raf = 0;
  }
  if (ctx) ctx.clearRect(0, 0, W, H);
}

/** Só para os testes: derruba canvas e listeners entre casos. */
export function resetDustReveal() {
  cancelReveals();
  if (canvas) {
    window.removeEventListener("resize", onResize);
    canvas.remove();
  }
  canvas = null;
  ctx = null;
  painter = null;
}
