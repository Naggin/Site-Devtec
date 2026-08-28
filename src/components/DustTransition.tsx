import { useEffect, useRef } from "react";
import type { DustParticle, DustSample } from "../lib/dustSample";

/** Quanto tempo a frente do varrimento leva para cruzar a tela na diagonal. */
const SWEEP_MS = 300;
/** Voo de cada partícula, contado a partir do momento em que ela entra. */
const FLIGHT_MS = 340;

const OUT_MS = SWEEP_MS + FLIGHT_MS;
/** Respiro com a tela vazia enquanto o idioma é trocado e o layout assenta. */
const SWAP_MS = 60;
const IN_MS = 480;
const TOTAL_MS = OUT_MS + SWAP_MS + IN_MS;

/** Fade de cada peça do DOM. Casado com o CSS de `.dust-piece`. */
const PIECE_FADE_MS = 300;

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

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function easeInQuad(t: number) {
  return t * t;
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
      W = window.innerWidth;
      H = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawParticle = (p: DustParticle, alpha: number, scale: number) => {
      if (alpha <= 0.012) return;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      if (p.kind === "char") {
        ctx.font = `600 ${Math.max(6, p.size * scale)}px "GeistMono", ui-monospace, monospace`;
        ctx.fillText(p.char, p.x - p.size * 0.5, p.y + p.size * 0.35);
        return;
      }
      const s = Math.max(0.6, p.size * scale);
      ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
    };

    /** Deslocamento da partícula em relação ao repouso, para `e` de 0 a 1. */
    const displace = (p: DustParticle, e: number, t: number) => {
      p.x = p.homeX + p.vx * e * 90 + Math.sin(t * 0.006 + p.wobble) * 18 * e;
      p.y = p.homeY - p.lift * e * (110 + H * 0.12);
    };

    const draw = (ts: number) => {
      if (phaseStart === null) phaseStart = ts;
      const elapsed = ts - phaseStart;
      const current = phaseRef.current;

      ctx.clearRect(0, 0, W, H);

      if (current === "out") {
        for (const p of outgoing) {
          const local = clamp01((elapsed - p.delay * SWEEP_MS) / FLIGHT_MS);
          if (local <= 0) continue; // a peça ainda está inteira no DOM
          const e = easeOutCubic(local);
          displace(p, e, elapsed);
          // Entra rápido enquanto a peça some, depois se dissolve.
          const appear = Math.min(1, local / 0.18);
          drawParticle(p, p.opacity * appear * (1 - easeInQuad(local)), 1 - 0.4 * e);
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
          const local = clamp01((elapsed - p.delay * SWEEP_MS) / FLIGHT_MS);
          const e = easeOutCubic(local);
          // Espelha o "out": a partícula chega ao repouso vinda de onde teria ido.
          displace(p, 1 - e, elapsed);
          // Some ao pousar, no exato momento em que o texto real reaparece.
          drawParticle(p, p.opacity * (1 - local ** 2.2), 0.6 + 0.4 * e);
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

export { TOTAL_MS, OUT_MS, SWAP_MS, IN_MS, SWEEP_MS, PIECE_FADE_MS };
