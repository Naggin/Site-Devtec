"use client";

import { useMotionValueEvent, useReducedMotion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import type { StageId } from "../BuildStage";
import { useIntro } from "../IntroContext";
import { Strike } from "./lightning/Strike";
import { EVENTS, STRIKE_MS, type AgentId } from "./script";

interface ActiveStrike {
  id: string;
  agent: AgentId;
  stage: StageId;
  at: number;
}

const STRIKES = EVENTS.filter((e) => e.type === "strike");

/**
 * Raios do roteiro (eventos "strike"): do pane do agente até a seção que ficou pronta.
 * Estado React só muda quando um raio nasce ou termina; a animação é imperativa,
 * lida do relógio da intro em cada <Strike>.
 */
export function LightningLayer() {
  const { time } = useIntro();
  const reduce = useReducedMotion() ?? false;
  const [active, setActive] = useState<ActiveStrike[]>([]);
  const prev = useRef<number | null>(null);

  useMotionValueEvent(time, "change", (t) => {
    const from = prev.current ?? t;
    prev.current = t;
    // Só dispara o que acabou de cruzar (sem rajada se a aba ficou em segundo plano).
    const fresh = STRIKES.filter((e) => e.t > from && e.t <= t && t - e.t < STRIKE_MS);
    if (!fresh.length) return;
    setActive((list) => [
      ...list,
      ...fresh.map((e) => ({ id: `${e.t}-${e.stage}`, agent: e.agent, stage: e.stage, at: e.t })),
    ]);
  });

  const remove = useCallback((id: string) => setActive((list) => list.filter((s) => s.id !== id)), []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      {active.map((s) => (
        <Strike key={s.id} {...s} time={time} reduce={reduce} onDone={remove} />
      ))}
    </div>
  );
}
