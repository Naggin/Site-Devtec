import { useEffect, useRef } from "react";
import { EMBER_PALETTE, TOKENS, type DustParticle, type DustSample } from "../lib/dustSample";

/**
 * A frente do varrimento cruza a tela na diagonal em SWEEP_*, e cada partícula
 * voa por FLIGHT_* a partir do instante em que a frente a alcança. É a folga
 * entre os dois que dá a leitura de "varreu": num dado momento só uma faixa da
 * tela está se desfazendo, o resto ainda está inteiro ou já foi.
 */
const SWEEP_OUT_MS = 780;
const FLIGHT_OUT_MS = 620;
const OUT_MS = SWEEP_OUT_MS + FLIGHT_OUT_MS;

/** Respiro com a tela vazia enquanto o idioma é trocado e o layout assenta. */
const SWAP_MS = 120;

/** A volta é um pouco mais apertada: esperar a remontagem cansa mais que ver a saída. */
const SWEEP_IN_MS = 620;
const FLIGHT_IN_MS = 560;
const IN_MS = SWEEP_IN_MS + FLIGHT_IN_MS;

const TOTAL_MS = OUT_MS + SWAP_MS + IN_MS;

/** Fades de cada peça do DOM. Casados com o CSS de `.dust-piece`. */
const PIECE_FADE_MS = 520;
const PIECE_REFORM_MS = 460;

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

function buildAtlas(): Atlas | null {
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

export type Phase = "out" | "swap" | "in";

type Props = {
  phase: Phase;
  sample: DustSample;
  /**
   * Chamado uma única vez, no fim do "out": troca o idioma de forma síncrona e
   * devolve a amostra do novo layout, para a poeira se juntar nos lugares certos.
   */
  onSwap: () => DustSample | null;
  onPhaseChange: (phase: Phase) => void;
  onComplete: () => void;
};

function easeOutQuad(t: number) {
  return 1 - (1 - t) ** 2;
}

function clamp01(n: number) {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

export default function DustTransition({
  phase,
  sample,
  onSwap,
  onPhaseChange,
  onComplete,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(phase);
  const onSwapRef = useRef(onSwap);
  const onPhaseChangeRef = useRef(onPhaseChange);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    phaseRef.current = phase;
  });

  useEffect(() => {
    onSwapRef.current = onSwap;
    onPhaseChangeRef.current = onPhaseChange;
    onCompleteRef.current = onComplete;
  });

  // Um único efeito por transição: o loop nasce no "out" e só morre no fim.
  // As fases entram por ref, então trocar de fase não reinicia a animação.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;

    let W = sample.W || window.innerWidth;
    let H = sample.H || window.innerHeight;
    const outgoing = sample.particles;
    let range = sample.range;
    let incoming: DustParticle[] = [];
    let swapped = false;
    let raf = 0;
    // `null`, não 0: um timestamp de rAF igual a 0 é válido e reiniciaria a fase.
    let phaseStart: number | null = null;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const atlas = buildAtlas();
    // As partículas vêm ordenadas por tom, então esta guarda acerta quase sempre
    // e evita reparsear a cor a cada uma das milhares de chamadas.
    let lastTone = -1;

    const drawParticle = (p: DustParticle, alpha: number, e: number) => {
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
      const s = Math.max(0.6, p.size * (1 - 0.4 * e));
      ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
    };

    /** Deslocamento da partícula em relação ao repouso, para `e` de 0 a 1. */
    const displace = (p: DustParticle, e: number, t: number) => {
      p.x = p.homeX + p.vx * e * 150 + Math.sin(t * 0.0032 + p.wobble) * 26 * e;
      p.y = p.homeY - p.lift * e * (140 + H * 0.18);
    };

    /**
     * A borda de dissolução. `sweepAt` cresce linearmente de 0 a 1 ao longo da
     * diagonal (0,0)→(W,H), então um gradiente nesse eixo já é a faixa certa.
     */
    const drawSweepFront = (progress: number, strength: number) => {
      if (strength <= 0.02) return;
      // Volta do espaço normalizado para o geométrico, senão a faixa desenhada
      // corre num eixo e a dissolução real acontece em outro.
      const front = range.min + progress * (range.max - range.min);
      const g = ctx.createLinearGradient(0, 0, W, H);
      const stops: [number, string][] = [
        [front - 0.18, "rgba(224, 32, 32, 0)"],
        [front - 0.05, `rgba(224, 32, 32, ${(0.05 * strength).toFixed(3)})`],
        [front, `rgba(255, 96, 96, ${(0.14 * strength).toFixed(3)})`],
        [front + 0.03, "rgba(224, 32, 32, 0)"],
      ];

      // addColorStop exige offsets em 0–1; o clamp pode empatar stops, o que é
      // aceito, mas nunca podem sair fora de ordem.
      let last = 0;
      for (const [offset, color] of stops) {
        last = Math.max(last, clamp01(offset));
        g.addColorStop(last, color);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
      lastTone = -1; // o gradiente sobrescreveu fillStyle; invalida a guarda
    };

    /** Sobe e desce nas pontas, para a faixa não aparecer nem sumir de estalo. */
    const frontStrength = (progress: number) =>
      Math.min(1, progress / 0.12) * Math.min(1, (1 - progress) / 0.14);

    const draw = (ts: number) => {
      if (phaseStart === null) phaseStart = ts;
      const elapsed = ts - phaseStart;
      const current = phaseRef.current;

      ctx.clearRect(0, 0, W, H);

      if (current === "out") {
        const progress = clamp01(elapsed / SWEEP_OUT_MS);
        drawSweepFront(progress, frontStrength(progress));

        for (const p of outgoing) {
          const local = clamp01((elapsed - p.delay * SWEEP_OUT_MS) / FLIGHT_OUT_MS);
          if (local <= 0) continue; // a peça ainda está inteira no DOM
          const e = easeOutQuad(local);
          displace(p, e, elapsed);
          // Entra junto com o fade da peça, depois se dissolve devagar.
          const appear = Math.min(1, local / 0.22);
          drawParticle(p, p.opacity * appear * (1 - local ** 1.6), e);
        }

        if (elapsed >= OUT_MS && !swapped) {
          swapped = true;
          const next = onSwapRef.current();
          if (next) {
            incoming = next.particles;
            range = next.range;
            W = next.W;
            H = next.H;
          }
          phaseStart = ts;
          onPhaseChangeRef.current("swap");
        }
      } else if (current === "swap") {
        if (elapsed >= SWAP_MS) {
          phaseStart = ts;
          onPhaseChangeRef.current("in");
        }
      } else {
        const progress = clamp01(elapsed / SWEEP_IN_MS);
        drawSweepFront(progress, frontStrength(progress) * 0.7);

        for (const p of incoming) {
          const local = clamp01((elapsed - p.delay * SWEEP_IN_MS) / FLIGHT_IN_MS);
          const e = easeOutQuad(local);
          // Espelha o "out": a partícula chega ao repouso vinda de onde teria ido.
          displace(p, 1 - e, elapsed);
          // Some ao pousar, no exato momento em que o texto real reaparece.
          drawParticle(p, p.opacity * (1 - local ** 2.2), 1 - e);
        }

        if (elapsed >= IN_MS) {
          onCompleteRef.current();
          return;
        }
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
    // Só a amostra recria o loop; fases e callbacks chegam por ref.
  }, [sample]);

  return (
    <canvas
      ref={canvasRef}
      className="dust-overlay"
      data-particle-count={sample.particles.length}
      aria-hidden
      role="presentation"
    />
  );
}

export {
  TOTAL_MS,
  OUT_MS,
  SWAP_MS,
  IN_MS,
  SWEEP_OUT_MS,
  SWEEP_IN_MS,
  PIECE_FADE_MS,
  PIECE_REFORM_MS,
};
