"use client";

import { animate, useReducedMotion } from "framer-motion";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useIntro } from "./IntroContext";
import { useStageId, useStageStatus, type StageStatus } from "./BuildStage";
import { strikeGeometry } from "./squad/lightning/anchors";
import { STRIKE_GROW } from "./squad/lightning/Strike";
import { STAGE_OWNER } from "./squad/script";

interface BuildBlockProps {
  /** Label técnica exibida no modo blueprint, ex.: "<HeroSection />". */
  label: string;
  /** Ordem do bloco dentro da seção (entrada da planta em cascata). */
  order?: number;
  className?: string;
  /** Aplica o glassmorphism final (bg-zinc-900/60 backdrop-blur-xl border-white/10). */
  glass?: boolean;
  children: ReactNode;
}

/** Entrada da planta, em cascata pela ordem do bloco (s). */
const PLAN_STAGGER = 0.08;
const PLAN_IN = 0.5;
/** Onda de invocação: velocidade na tela (px/s), teto do atraso e duração da revelação (s). */
const WAVE_SPEED = 1500;
const WAVE_MAX_DELAY = 1.1;
const REVEAL = 0.8;
const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Ato 2 — o raio invoca a seção.
 * Enquanto o agente trabalha (etapa "building") o bloco é só planta: contorno
 * tracejado, label técnica e esqueleto, sem conteúdo. Quando o raio do agente
 * atinge a seção (etapa vira "built"), o conteúdo é revelado por um círculo que
 * cresce a partir do ponto de impacto; blocos mais longe do impacto entram depois,
 * como uma onda. Fora da intro (ou com reduced motion) renderiza direto.
 *
 * Tudo imperativo num layout effect: o estado inicial de cada transição é escrito
 * antes do paint, então o conteúdo nunca pisca visível antes do raio.
 */
export function BuildBlock({ label, order = 0, className = "", glass = false, children }: BuildBlockProps) {
  const { phase, runId } = useIntro();
  const stage = useStageId();
  const status = useStageStatus();
  const reduce = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);
  const planRef = useRef<HTMLSpanElement>(null);
  const prev = useRef<StageStatus>("hidden");

  const intro = phase === "building" && !reduce;
  const showPlan = intro && status !== "hidden";

  useLayoutEffect(() => {
    const el = contentRef.current;
    const plan = planRef.current;
    const from = prev.current;
    prev.current = status;
    if (!el) return;
    const running: { stop: () => void }[] = [];

    if (reduce || phase === "done" || (status === "built" && from !== "building")) {
      // Fora da intro, intro pulada ou seção já pronta: direto, sem clip (sombras e hover 3D saem da caixa).
      el.style.opacity = "1";
      el.style.clipPath = "none";
    } else if (status === "hidden") {
      el.style.opacity = "0";
    } else if (status === "building") {
      el.style.opacity = "0";
      if (plan) running.push(animate(plan, { opacity: [0, 1] }, { duration: PLAN_IN, delay: order * PLAN_STAGGER }));
    } else {
      // building → built durante a intro: o raio acabou de cair. Medição única (não é por frame).
      const rect = el.getBoundingClientRect();
      const scale = el.offsetWidth ? rect.width / el.offsetWidth : 1;
      const hit = (stage && strikeGeometry(STAGE_OWNER[stage], stage)?.to) || {
        x: rect.left + rect.width / 2,
        y: rect.top,
      };
      // Centro do círculo em coordenadas locais (o site está escalado pela câmera).
      const cx = (hit.x - rect.left) / scale;
      const cy = (hit.y - rect.top) / scale;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const radius = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) + 4;
      // Distância (na tela) do impacto até o bloco: define quando a onda chega nele.
      const dx = Math.max(rect.left - hit.x, 0, hit.x - rect.right);
      const dy = Math.max(rect.top - hit.y, 0, hit.y - rect.bottom);
      const delay = STRIKE_GROW / 1000 + Math.min(WAVE_MAX_DELAY, Math.hypot(dx, dy) / WAVE_SPEED);

      // Cresce a partir do ponto de impacto só com opacity + scale (compositor). Medido: um
      // clip-path circle animado repintava blocos grandes a cada frame e derrubava o fps.
      el.style.transformOrigin = `${cx.toFixed(1)}px ${cy.toFixed(1)}px`;
      el.style.clipPath = "none";
      const reveal = animate(
        el,
        { opacity: [0, 1], scale: [Math.max(0.6, 1 - 120 / radius), 1] },
        { duration: REVEAL, delay, ease: REVEAL_EASE },
      );
      reveal.then(() => {
        el.style.transform = "";
        el.style.transformOrigin = "";
      });
      running.push(reveal);
      if (plan) {
        // A planta acende quando a onda chega e se apaga enquanto o conteúdo aparece.
        running.push(
          animate(plan, { opacity: [1, 1, 0], borderColor: ["#ff5f5f", "#ffffff", "#ff5f5f"] }, {
            duration: REVEAL * 0.9,
            delay,
            times: [0, 0.15, 1],
          }),
        );
      }
    }
    return () => running.forEach((a) => a.stop());
  }, [status, phase, reduce, order, stage]);

  const glassCls = glass ? "bg-zinc-900/60 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40" : "";

  return (
    <div key={runId} className={`relative ${glassCls} ${className}`}>
      <div ref={contentRef} className="h-full" style={{ opacity: intro || phase === "terminal" ? 0 : 1 }}>
        {children}
      </div>

      {showPlan && (
        // Planta: contorno tracejado + label + esqueleto, enquanto o agente trabalha.
        <span
          ref={planRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 block overflow-hidden rounded-[inherit] border border-dashed border-brand-ink/50 bg-brand/[0.03]"
          style={{ opacity: 0 }}
        >
          <span className="absolute left-2 top-1.5 font-mono text-[10px] text-brand-ink">{label}</span>
          <span className="absolute bottom-1.5 right-2 font-mono text-[10px] text-brand-ink/50">
            {`/* ${order.toString().padStart(2, "0")} */`}
          </span>
          <span className="absolute inset-x-5 top-9 block space-y-3">
            <span className="block h-3 w-1/3 rounded bg-brand/15" />
            <span className="block h-2 w-4/5 rounded bg-white/[0.06]" />
            <span className="block h-2 w-3/5 rounded bg-white/[0.06]" />
          </span>
        </span>
      )}
    </div>
  );
}
