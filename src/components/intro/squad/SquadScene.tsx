"use client";

import { AnimatePresence, motion, useMotionValueEvent, type MotionValue } from "framer-motion";
import { useState, useSyncExternalStore } from "react";
import { useIntro } from "../IntroContext";
import { AgentPane, AgentPills } from "./scene/AgentPane";
import { ClaudeTerminal } from "./scene/ClaudeTerminal";
import { ConnectionLayer, Packet, PACKET_LIFE } from "./scene/ConnectionLayer";
import { DESKTOP_MIN, desktopLayout, mobileOrchestratorRect, terminalRect, useViewport } from "./scene/geometry";
import { LIFE } from "./scene/transcript";
import { CC } from "./scene/TranscriptLines";
import { AGENTS, CLOSE_AT, EVENTS, PRE, type AgentId } from "./script";

const SUBAGENTS = AGENTS.filter((a) => a.id !== "orchestrator");

const PACKETS = EVENTS.flatMap((e, i) =>
  e.type === "message"
    ? [{ key: `m${i}`, at: e.t, from: e.from, to: e.to, label: e.text.length > 30 ? `${e.text.slice(0, 29)}…` : e.text }]
    : e.type === "handoff"
      ? [{ key: `h${i}`, at: e.t, from: e.agent, to: "orchestrator" as AgentId, label: "✓ handoff" }]
      : [],
);

/** Relógio da cena com throttle: ~30fps no Ato 1 (digitação), ~15fps no Ato 2. */
function useSceneTime(time: MotionValue<number>) {
  const [t, setT] = useState(() => time.get());
  useMotionValueEvent(time, "change", (v) => {
    const step = v < PRE.build ? 33 : 66;
    setT((prev) => (v >= prev && Math.floor(v / step) === Math.floor(prev / step) ? prev : v));
  });
  return t;
}

const noop = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

/**
 * Cena multi-agente da intro. Ato 1: terminal do Claude Code sobre fundo preto.
 * Ato 2: o terminal vira o pane do orquestrador e os subagentes sobem em panes
 * ligados por linhas, trocando pacotes. Tudo derivado de script.ts.
 */
export function SquadScene() {
  const { time } = useIntro();
  const t = useSceneTime(time);
  const vp = useViewport();
  const hydrated = useHydrated();

  const desktop = vp.w >= DESKTOP_MIN;
  const act2 = t >= PRE.build;
  const layout = desktopLayout(vp);
  const termRect = !act2 ? terminalRect(vp) : desktop ? layout.orchestrator : mobileOrchestratorRect(vp);
  const alive = SUBAGENTS.filter((a) => t >= LIFE[a.id].spawn && t < LIFE[a.id].close);
  const packets = desktop ? PACKETS.filter((p) => t >= p.at && t < p.at + PACKET_LIFE) : [];

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <div aria-hidden>
        <motion.div
          className={`absolute inset-0 ${act2 ? "" : "pointer-events-auto"}`}
          style={{ background: CC.bg }}
          initial={false}
          animate={{ opacity: act2 ? 0 : 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />

        {hydrated && (
          <>
            {desktop && act2 && <ConnectionLayer alive={alive.map((a) => a.id)} />}

            <ClaudeTerminal t={t} rect={termRect} act2={act2} mobile={!desktop} closing={t >= CLOSE_AT} />

            {desktop ? (
              <AnimatePresence>
                {alive.map((a) => (
                  <AgentPane key={a.id} agent={a} rect={layout[a.id]} t={t} />
                ))}
              </AnimatePresence>
            ) : (
              <AgentPills agents={alive} t={t} />
            )}

            {packets.map((p) => (
              <Packet key={p.key} from={p.from} to={p.to} at={p.at} label={p.label} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
