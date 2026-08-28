import { EMBER_PALETTE, TOKENS, type DustParticle } from "./dustSample";

/**
 * Desenho de partículas em canvas, compartilhado pela transição de idioma e
 * pelas revelações de seção.
 *
 * O atlas pré-renderiza cada token uma vez por tom de brasa. `fillText` era o
 * custo inteiro da animação — desenhar centenas de fragmentos por frame
 * derrubava de 58 para 45fps sozinho, enquanto a poeira e as transições de DOM
 * saíam de graça. Com o atlas o desenho vira `drawImage`, e o visual é idêntico.
 */
export type Atlas = {
  canvas: HTMLCanvasElement;
  /** Posição e largura de cada token dentro de uma linha. */
  cols: { x: number; w: number }[];
  rowH: number;
  font: number;
};

/** Renderizado grande e reduzido no desenho: nunca amplia, então não borra. */
const ATLAS_FONT = 32;
const PAD = 4;

let atlasCache: Atlas | null = null;

export function getAtlas(): Atlas | null {
  if (atlasCache) return atlasCache;

  const measure = document.createElement("canvas").getContext("2d");
  // jsdom e canvas indisponível: sem atlas, os fragmentos simplesmente não desenham.
  if (!measure || typeof measure.measureText !== "function") return null;

  const font = `500 ${ATLAS_FONT}px "GeistMono", ui-monospace, monospace`;
  measure.font = font;

  const cols: { x: number; w: number }[] = [];
  let x = 0;
  for (const token of TOKENS) {
    const w = Math.ceil(measure.measureText(token).width) + PAD * 2;
    cols.push({ x, w });
    x += w;
  }

  const rowH = Math.ceil(ATLAS_FONT * 1.4);
  const canvas = document.createElement("canvas");
  canvas.width = x;
  canvas.height = rowH * EMBER_PALETTE.length;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.font = font;
  ctx.textBaseline = "middle";
  EMBER_PALETTE.forEach((color, row) => {
    ctx.fillStyle = color;
    TOKENS.forEach((token, i) => {
      ctx.fillText(token, cols[i]!.x + PAD, row * rowH + rowH / 2);
    });
  });

  atlasCache = { canvas, cols, rowH, font: ATLAS_FONT };
  return atlasCache;
}

/**
 * Lembra o último tom pintado. Reatribuir `fillStyle` refaz o parse da cor a
 * cada chamada, e as partículas vêm ordenadas por tom justamente para esta
 * guarda quase nunca errar.
 */
export type DrawState = { lastTone: number };

export const createDrawState = (): DrawState => ({ lastTone: -1 });

/** `e` é o quanto a partícula está longe do repouso, de 0 a 1. */
export function drawParticle(
  ctx: CanvasRenderingContext2D,
  atlas: Atlas | null,
  state: DrawState,
  p: DustParticle,
  alpha: number,
  e: number,
) {
  if (alpha <= 0.012) return;
  ctx.globalAlpha = alpha;

  if (p.kind === "char") {
    if (!atlas) return;
    const col = atlas.cols[p.token]!;
    const k = (p.size * (1 - 0.25 * e)) / atlas.font;
    const w = col.w * k;
    const h = atlas.rowH * k;
    const sy = p.tone * atlas.rowH;
    const angle = p.spin * e;

    if (Math.abs(angle) < 0.02) {
      ctx.drawImage(atlas.canvas, col.x, sy, col.w, atlas.rowH, p.x - w / 2, p.y - h / 2, w, h);
      return;
    }
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(angle);
    ctx.drawImage(atlas.canvas, col.x, sy, col.w, atlas.rowH, -w / 2, -h / 2, w, h);
    ctx.restore();
    return;
  }

  if (p.tone !== state.lastTone) {
    ctx.fillStyle = EMBER_PALETTE[p.tone]!;
    state.lastTone = p.tone;
  }
  const s = Math.max(0.7, p.size * (1 - 0.25 * e));
  ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
}

/** Teto de DPR: o custo de desenhar cresce com o número de pixels do canvas. */
export function fitCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  // Telas de telefone chegam a 3x, e poeira borrada não ganha nada com isso.
  const dpr = Math.min(window.devicePixelRatio || 1, W < 768 ? 1.5 : 2);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { W, H };
}
