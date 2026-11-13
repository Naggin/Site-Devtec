"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useIntro } from "../../IntroContext";
import { AGENT_BY_ID, MESSAGE_MS, type AgentId } from "../script";
import { curveBetween, curvePath, curvePoint, paneRect } from "./geometry";

/** Duração da viagem + fade de saída do pacote. */
export const PACKET_LIFE = MESSAGE_MS + 220;

/**
 * Linhas orquestrador ↔ subagentes vivos. O traçado segue os panes (a 30 Hz)
 * (lendo o DOM), sem re-render: só a lista de vivos passa pelo React.
 */
export function ConnectionLayer({ alive }: { alive: AgentId[] }) {
  const paths = useRef(new Map<AgentId, SVGPathElement>());

  useEffect(() => {
    let raf = 0;
    let n = 0;
    const last = new Map<AgentId, string>();
    const tick = () => {
      // A 30 Hz, com todas as leituras antes das escritas: ler e escrever intercalado
      // forçava um layout por linha a cada frame. Panes quase não se movem.
      if (n++ % 2 === 0) {
        const orch = paneRect("orchestrator");
        const rects = orch ? [...paths.current.keys()].map((id) => [id, paneRect(id)] as const) : [];
        for (const [id, r] of rects) {
          const el = paths.current.get(id);
          if (!el || !r || !orch) continue;
          const d = curvePath(curveBetween(orch, r, window.innerWidth));
          if (last.get(id) !== d) {
            last.set(id, d);
            el.setAttribute("d", d);
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg className="pointer-events-none fixed inset-0 h-full w-full overflow-visible" aria-hidden>
      <AnimatePresence>
        {alive.map((id) => (
          <motion.path
            key={id}
            ref={(el: SVGPathElement | null) => {
              if (el) paths.current.set(id, el);
              else paths.current.delete(id);
            }}
            fill="none"
            stroke={AGENT_BY_ID[id].color}
            strokeWidth={1.2}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.35 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </AnimatePresence>
    </svg>
  );
}

const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);

/** Pacote (mensagem ou handoff) viajando de um pane a outro em MESSAGE_MS. */
export function Packet({ from, to, at, label }: { from: AgentId; to: AgentId; at: number; label: string }) {
  const { time } = useIntro();
  const ref = useRef<HTMLDivElement>(null);
  const color = AGENT_BY_ID[from].color;

  useEffect(() => {
    let raf = 0;
    // A curva é medida uma vez: ler o layout dos panes a cada frame forçava reflow.
    let curve: ReturnType<typeof curveBetween> | null = null;
    const tick = () => {
      const el = ref.current;
      if (!el) return;
      const p = (time.get() - at) / MESSAGE_MS;
      if (!curve) {
        const a = paneRect(from);
        const b = paneRect(to);
        if (a && b) curve = curveBetween(a, b, window.innerWidth);
      }
      if (!curve || p < 0 || p > PACKET_LIFE / MESSAGE_MS) {
        el.style.opacity = "0";
      } else {
        const pt = curvePoint(curve, ease(Math.min(1, p)));
        el.style.transform = `translate(${pt.x}px, ${pt.y}px) translate(-50%, -50%)`;
        el.style.opacity = String(p < 0.12 ? p / 0.12 : p > 1 ? Math.max(0, 1 - (p - 1) / 0.3) : 1);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [time, at, from, to]);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed left-0 top-0 flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-[10px] will-change-transform"
      style={{
        opacity: 0,
        color,
        borderColor: `${color}88`,
        background: "rgba(9,9,11,0.92)",
        boxShadow: `0 0 16px -2px ${color}88`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      {label}
    </div>
  );
}
