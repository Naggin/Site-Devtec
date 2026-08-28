import { useEffect, useRef } from "react";
import type { DustParticle, DustSample } from "../lib/dustSample";
import { createDrawState, drawParticle, fitCanvas, getAtlas } from "../lib/dustRender";

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
    let incoming: DustParticle[] = [];
    let swapped = false;
    let raf = 0;
    // `null`, não 0: um timestamp de rAF igual a 0 é válido e reiniciaria a fase.
    let phaseStart: number | null = null;

    const resize = () => {
      ({ W, H } = fitCanvas(canvas, ctx));
    };

    const atlas = getAtlas();
    const drawState = createDrawState();
    const paint = (p: DustParticle, alpha: number, e: number) =>
      drawParticle(ctx, atlas, drawState, p, alpha, e);

    /**
     * Deslocamento em relação ao repouso, para `e` de 0 a 1. `rise` é -1 quando
     * a partícula sobe embora (saída) e +1 quando ela vem de baixo (volta).
     */
    const displace = (p: DustParticle, e: number, t: number, rise: number) => {
      p.x = p.homeX + p.vx * e * 150 + Math.sin(t * 0.0032 + p.wobble) * 26 * e;
      p.y = p.homeY + rise * p.lift * e * (140 + H * 0.18);
    };

    const draw = (ts: number) => {
      if (phaseStart === null) phaseStart = ts;
      const elapsed = ts - phaseStart;
      const current = phaseRef.current;

      ctx.clearRect(0, 0, W, H);

      if (current === "out") {
        for (const p of outgoing) {
          const local = clamp01((elapsed - p.delay * SWEEP_OUT_MS) / FLIGHT_OUT_MS);
          if (local <= 0) continue; // a peça ainda está inteira no DOM
          const e = easeOutQuad(local);
          displace(p, e, elapsed, -1);
          // Entra junto com o fade da peça, depois se dissolve devagar.
          const appear = Math.min(1, local / 0.22);
          paint(p, p.opacity * appear * (1 - local ** 2.6), e);
        }

        if (elapsed >= OUT_MS && !swapped) {
          swapped = true;
          const next = onSwapRef.current();
          if (next) {
            incoming = next.particles;
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
        for (const p of incoming) {
          const local = clamp01((elapsed - p.delay * SWEEP_IN_MS) / FLIGHT_IN_MS);
          const e = easeOutQuad(local);
          // Vem de baixo e sobe até o repouso, acompanhando o varrimento.
          displace(p, 1 - e, elapsed, 1);
          // Acende ao entrar e some ao pousar, no instante em que o texto reaparece.
          const appear = Math.min(1, local / 0.12);
          paint(p, p.opacity * appear * (1 - local ** 2.2), 1 - e);
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
