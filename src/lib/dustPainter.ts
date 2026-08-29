/**
 * O desenho da poeira, separado de quem decide quando ela acontece.
 *
 * A troca de idioma (`DustTransition`) e a entrada das seções (`dustReveal`)
 * precisam ser o mesmo material: mesmo atlas de fragmentos, mesma paleta de
 * brasa, mesma trajetória. Enquanto cada uma tinha a sua cópia do desenho, era
 * questão de tempo até divergirem — e duas poeiras quase iguais leem pior que
 * duas coisas assumidamente diferentes.
 */
import { EMBER_PALETTE, TOKENS, type DustParticle } from "./dustSample";

/**
 * Atlas de fragmentos: cada token pré-renderizado uma vez por tom de brasa.
 *
 * `fillText` era o custo inteiro da animação — desenhar ~800 fragmentos por
 * frame derrubava de 58 para 45fps sozinho, enquanto a poeira e as transições
 * de DOM saíam de graça. Com o atlas o desenho vira `drawImage`, que a GPU
 * resolve, e o visual é idêntico.
 */
type Atlas = {
  canvas: HTMLCanvasElement;
  /** Posição e largura de cada token dentro de uma linha. */
  cols: { x: number; w: number }[];
  rowH: number;
  font: number;
};

/** Renderizado grande e reduzido no desenho: nunca amplia, então não borra. */
const ATLAS_FONT = 32;

let atlasCache: Atlas | null = null;

export function buildAtlas(): Atlas | null {
  if (atlasCache) return atlasCache;

  const measure = document.createElement("canvas").getContext("2d");
  // jsdom e canvas indisponível: sem atlas, os fragmentos simplesmente não desenham.
  if (!measure || typeof measure.measureText !== "function") return null;

  const font = `500 ${ATLAS_FONT}px "GeistMono", ui-monospace, monospace`;
  measure.font = font;

  const pad = 4;
  const cols: { x: number; w: number }[] = [];
  let x = 0;
  for (const token of TOKENS) {
    const w = Math.ceil(measure.measureText(token).width) + pad * 2;
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
      ctx.fillText(token, cols[i]!.x + pad, row * rowH + rowH / 2);
    });
  });

  atlasCache = { canvas, cols, rowH, font: ATLAS_FONT };
  return atlasCache;
}

export function easeOutQuad(t: number) {
  return 1 - (1 - t) ** 2;
}

export function clamp01(n: number) {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

export type Painter = {
  /** `e` é o quanto a partícula está longe do repouso, de 0 a 1. */
  draw: (p: DustParticle, alpha: number, e: number) => void;
};

/**
 * Pintor com estado: as partículas chegam agrupadas por tom, então guardar o
 * último tom evita reparsear a cor em milhares de chamadas por frame.
 */
export function createPainter(ctx: CanvasRenderingContext2D): Painter {
  const atlas = buildAtlas();
  let lastTone = -1;

  return {
    draw(p, alpha, e) {
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

      if (p.tone !== lastTone) {
        ctx.fillStyle = EMBER_PALETTE[p.tone]!;
        lastTone = p.tone;
      }
      const s = Math.max(0.7, p.size * (1 - 0.25 * e));
      ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
    },
  };
}

/**
 * Deslocamento em relação ao repouso, para `e` de 0 a 1. `rise` é -1 quando
 * a partícula sobe embora (saída) e +1 quando ela vem de baixo (volta).
 */
export function displace(p: DustParticle, e: number, t: number, rise: number, H: number) {
  p.x = p.homeX + p.vx * e * 150 + Math.sin(t * 0.0032 + p.wobble) * 26 * e;
  p.y = p.homeY + rise * p.lift * e * (140 + H * 0.18);
}

/**
 * Um frame da remontagem: a partícula sobe de baixo, acende ao entrar e some ao
 * pousar, no instante em que a peça de DOM correspondente reaparece.
 *
 * É o mesmo movimento na volta da troca de idioma e na entrada de uma seção —
 * mudam só as durações e, no caso das seções, o `offsetY` que compensa o scroll
 * ocorrido desde a amostragem.
 */
export function reformParticle(
  painter: Painter,
  p: DustParticle,
  elapsed: number,
  sweepMs: number,
  flightMs: number,
  H: number,
  offsetY = 0,
) {
  const local = clamp01((elapsed - p.delay * sweepMs) / flightMs);
  const e = easeOutQuad(local);
  displace(p, 1 - e, elapsed, 1, H);
  p.y += offsetY;
  const appear = Math.min(1, local / 0.12);
  painter.draw(p, p.opacity * appear * (1 - local ** 2.2), 1 - e);
  return local;
}
