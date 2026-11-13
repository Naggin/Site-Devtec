"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useIntro } from "./IntroContext";
import { useStageStatus } from "./BuildStage";

interface BuildBlockProps {
  /** Label técnica exibida no modo blueprint, ex.: "<HeroSection />". */
  label: string;
  /** Ordem de montagem (stagger) dentro da etapa. */
  order?: number;
  className?: string;
  /** Aplica o glassmorphism final (bg-zinc-900/60 backdrop-blur-xl border-white/10). */
  glass?: boolean;
  children: ReactNode;
}

/** Tempos de um bloco, em segundos. Somados: BLOCK_BUILD_TIME. */
export const BLOCK_STAGGER = 0.2;
const WIRE = 0.65;
const PRINT = 1.3;
const SETTLE = 0.6;
export const BLOCK_BUILD_TIME = WIRE + PRINT + SETTLE;

/** Curva suave nas pontas, sem tranco no meio. */
const EASE = [0.45, 0.05, 0.25, 1] as const;

/**
 * Ato 2 — "Blueprint to UI", bloco a bloco.
 * Quando a etapa da seção começa, o bloco surge como planta (contorno tracejado,
 * label técnica e esqueleto) e o conteúdo final é impresso de cima para baixo
 * por uma linha de scanner. Antes da etapa fica invisível (ocupando o espaço,
 * para o scroll não pular); depois dela, renderiza direto.
 */
export function BuildBlock({ label, order = 0, className = "", glass = false, children }: BuildBlockProps) {
  const { runId } = useIntro();
  const status = useStageStatus();
  const reduce = useReducedMotion();
  const building = status === "building" && !reduce;
  const hidden = status === "hidden" && !reduce;
  const d = order * BLOCK_STAGGER;

  const glassCls = glass ? "bg-zinc-900/60 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40" : "";

  return (
    <div key={runId} className={`relative ${glassCls} ${className}`}>
      {/* Conteúdo final, impresso de cima para baixo. */}
      <motion.div
        initial={false}
        animate={
          hidden
            ? { clipPath: "inset(0% 0% 100% 0%)", opacity: 0, y: 12 }
            : building
              ? { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, y: 0 }
              : // Sem clip depois de pronto: sombras e hover 3D podem sair da caixa.
                { clipPath: "none", opacity: 1, y: 0 }
        }
        transition={
          building
            ? {
                clipPath: { duration: PRINT, delay: d + WIRE, ease: EASE },
                opacity: { duration: PRINT * 0.7, delay: d + WIRE, ease: "easeOut" },
                y: { duration: PRINT + SETTLE, delay: d + WIRE, ease: [0.22, 1, 0.36, 1] },
              }
            : { duration: 0 }
        }
        className="h-full"
      >
        {children}
      </motion.div>

      {building && (
        <>
          {/* Planta: contorno tracejado + label + esqueleto. */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 block overflow-hidden rounded-[inherit] border border-dashed border-brand-ink/50 bg-brand/[0.03]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: WIRE + PRINT + SETTLE, delay: d, times: [0, 0.2, 0.72, 1], ease: "easeInOut" }}
          >
            <span className="absolute left-2 top-1.5 font-mono text-[10px] text-brand-ink">{label}</span>
            <span className="absolute bottom-1.5 right-2 font-mono text-[10px] text-brand-ink/50">
              {`/* ${order.toString().padStart(2, "0")} */`}
            </span>
            <motion.span
              className="absolute inset-x-5 top-9 block space-y-3"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: PRINT * 0.5, delay: d + WIRE + PRINT * 0.4, ease: "easeOut" }}
            >
              <span className="block h-3 w-1/3 rounded bg-brand/15" />
              <span className="block h-2 w-4/5 rounded bg-white/[0.06]" />
              <span className="block h-2 w-3/5 rounded bg-white/[0.06]" />
            </motion.span>
          </motion.span>

          {/* Scanner: imprime o conteúdo enquanto desce. */}
          {/* `top` em vez de transform de propósito: medido, uma camada de compositor do tamanho de cada bloco custava mais. */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 z-10 block h-[2px]"
            style={{
              background: "linear-gradient(90deg, transparent, var(--brand-ink) 15%, var(--brand) 85%, transparent)",
              boxShadow: "0 0 14px 1px var(--brand-glow)",
            }}
            initial={{ top: "0%", opacity: 0 }}
            animate={{ top: ["0%", "0%", "100%", "100%"], opacity: [0, 1, 1, 0] }}
            transition={{
              duration: PRINT + 0.2,
              delay: d + WIRE - 0.1,
              times: [0, 0.08, 0.92, 1],
              ease: EASE,
            }}
          />
        </>
      )}
    </div>
  );
}
