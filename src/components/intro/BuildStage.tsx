"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useIntro } from "./IntroContext";

/** Seções que o squad constrói. Cada uma é uma etapa independente (podem rodar em paralelo). */
export const STAGES = ["nav", "hero", "skills", "projects", "timeline", "footer"] as const;
export type StageId = (typeof STAGES)[number];

/** id do elemento de cada seção no DOM (alvo de câmera e de raio). */
export const STAGE_ANCHOR: Record<StageId, string> = {
  nav: "site-nav",
  hero: "topo",
  skills: "skills",
  projects: "projetos",
  timeline: "trajetoria",
  footer: "contato",
};

export type StageStatus = "hidden" | "building" | "built";

const StageContext = createContext<StageId | null>(null);

/** Marca a seção como uma etapa da construção. Os BuildBlocks dentro dela seguem essa etapa. */
export function BuildStage({ id, children }: { id: StageId; children: ReactNode }) {
  return <StageContext.Provider value={id}>{children}</StageContext.Provider>;
}

/** Status da etapa da seção atual (ou de `id`, se informado). Fora de um BuildStage, segue a fase. */
export function useStageStatus(id?: StageId): StageStatus {
  const ctxId = useContext(StageContext);
  const { phase, stages } = useIntro();
  const stage = id ?? ctxId;

  if (phase === "done") return "built";
  if (phase === "terminal") return "hidden";
  if (stage === null) return "built";
  return stages[stage] ?? "hidden";
}
