"use client";

import { useMotionValue, type MotionValue } from "framer-motion";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { StageId } from "./BuildStage";

/**
 * Fases da experiência:
 * - "terminal": Ato 1, o Claude Code (orquestrador) abre, recebe o prompt e planeja o squad.
 * - "building": Ato 2, os subagentes sobem em panes e constroem as seções em paralelo.
 * - "done": Ato 3, portfólio final.
 */
export type IntroPhase = "terminal" | "building" | "done";

/** Status por seção, controlado pelo diretor (SquadIntro) a partir do roteiro. */
export type StageMap = Partial<Record<StageId, "building" | "built">>;

interface IntroState {
  phase: IntroPhase;
  stages: StageMap;
  /**
   * Relógio da intro em ms. É um MotionValue para não re-renderizar a página a cada
   * frame: leia com useMotionValueEvent / useTransform / time.get().
   */
  time: MotionValue<number>;
  /** Incrementa a cada replay, para remontar animações. */
  runId: number;
  setPhase: (phase: IntroPhase) => void;
  setStages: (stages: StageMap) => void;
  skip: () => void;
  replay: () => void;
}

const IntroContext = createContext<IntroState | null>(null);

export function IntroProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<IntroPhase>("terminal");
  const [stages, setStages] = useState<StageMap>({});
  const [runId, setRunId] = useState(0);
  const time = useMotionValue(0);

  const skip = useCallback(() => setPhase("done"), []);
  const replay = useCallback(() => {
    window.scrollTo({ top: 0 });
    time.set(0);
    setRunId((n) => n + 1);
    setStages({});
    setPhase("terminal");
  }, [time]);

  const value = useMemo(
    () => ({ phase, stages, time, runId, setPhase, setStages, skip, replay }),
    [phase, stages, time, runId, skip, replay],
  );
  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>;
}

export function useIntro() {
  const ctx = useContext(IntroContext);
  if (!ctx) throw new Error("useIntro precisa estar dentro de <IntroProvider>");
  return ctx;
}
