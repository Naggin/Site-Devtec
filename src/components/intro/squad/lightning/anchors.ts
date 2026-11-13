import { STAGE_ANCHOR, type StageId } from "../../BuildStage";
import { AGENT_BY_ID, type AgentId } from "../script";
import type { Vec } from "./bolt";

export interface StrikeGeometry {
  from: Vec;
  to: Vec;
  /** Rect da seção na tela (já com o zoom da câmera). */
  target: DOMRect;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), Math.max(lo, hi));

/**
 * Origem e alvo do raio, lidos do DOM (o Strike remede periodicamente: a câmera pode mover a seção no meio
 * do raio). Sem o pane do agente, o raio sai da borda lateral do lado dele.
 */
export function strikeGeometry(agent: AgentId, stage: StageId): StrikeGeometry | null {
  const section = document.getElementById(STAGE_ANCHOR[stage]);
  if (!section) return null;
  const target = section.getBoundingClientRect();
  if (target.width === 0 && target.height === 0) return null;
  const cx = target.left + target.width / 2;
  const cy = target.top + target.height / 2;

  let from: Vec;
  const pane = document.querySelector(`[data-agent-pane="${agent}"]`)?.getBoundingClientRect();
  if (pane && pane.width > 0 && pane.height > 0) {
    // Ponto da borda do pane voltado para a seção.
    from = { x: clamp(cx, pane.left, pane.right), y: clamp(cy, pane.top, pane.bottom) };
  } else {
    const h = window.innerHeight;
    from = {
      x: AGENT_BY_ID[agent].side === "left" ? -12 : window.innerWidth + 12,
      y: clamp(cy - 140, 60, h - 60),
    };
  }

  // Atinge a seção perto da borda voltada para o pane, sem cravar no canto.
  const to = {
    x: clamp(from.x, target.left + target.width * 0.12, target.right - target.width * 0.12),
    y: clamp(from.y, target.top + target.height * 0.25, target.bottom - target.height * 0.25),
  };
  return { from, to, target };
}
