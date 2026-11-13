"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Agent } from "../script";
import type { Rect } from "./geometry";
import { spinnerAt, spinnerFrame, transcriptAt, type TLine } from "./transcript";
import { CC, SpinnerLine, TranscriptLines } from "./TranscriptLines";

const SPRING = { duration: 0.45, ease: [0.22, 1, 0.36, 1] } as const;

function StatusDot({ color, working }: { color: string; working: boolean }) {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      {working && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ background: color }}
          animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <span className="relative h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
    </span>
  );
}

/** Pane de um subagente (desktop): cabeçalho + mini-transcript estilo Claude Code. */
export function AgentPane({ agent, rect, t }: { agent: Agent; rect: Rect; t: number }) {
  const spinner = spinnerAt(agent.id, t);
  const lines = transcriptAt(agent.id, t, 12);
  return (
    <motion.div
      data-agent-pane={agent.id}
      // Fundo quase opaco sem backdrop-blur: o blur re-renderizava a cada frame da cena por trás.
      className="fixed flex flex-col overflow-hidden rounded-xl border will-change-transform"
      style={{
        ...rect,
        borderColor: `${agent.color}66`,
        background: "rgba(9,9,11,0.95)",
        boxShadow: `0 8px 24px -14px ${agent.color}66`,
      }}
      initial={{ opacity: 0, scale: 0.85, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.5, ease: [0.4, 0, 1, 1] } }}
      transition={SPRING}
    >
      <div className="shrink-0 border-b border-white/[0.06] px-3 py-2 font-mono">
        <div className="flex items-center gap-2 text-[12px]">
          <StatusDot color={agent.color} working={!!spinner} />
          <span className="font-semibold" style={{ color: agent.color }}>
            {agent.name}
          </span>
          <span className="ml-auto text-[10px]" style={{ color: CC.dim }}>
            {agent.model}
          </span>
        </div>
        <div className="truncate pl-4 text-[10.5px]" style={{ color: CC.dim }}>
          {agent.role}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-end overflow-hidden px-3 pb-2.5 font-mono text-[11px] leading-[1.5] text-white">
        <TranscriptLines lines={lines} t={t} />
        {spinner && <SpinnerLine state={spinner} t={t} color={agent.color} compact />}
      </div>
    </motion.div>
  );
}

function plain(l: TLine | undefined) {
  if (!l) return "";
  switch (l.kind) {
    case "tool":
      return `⏺ ${l.text}`;
    case "text":
      return `⏺ ${l.text}`;
    case "ok":
      return `✓ ${l.text}`;
    case "warn":
      return `⚠ ${l.text}`;
    case "msgOut":
      return `→ ${l.text}`;
    case "msgIn":
      return `← ${l.text}`;
    case "handoffOut":
      return "✓ handoff → orchestrator";
    default:
      return `⎿ ${l.text}`;
  }
}

/** Mobile: subagentes viram pills na base, com a última linha de cada. */
export function AgentPills({ agents, t }: { agents: Agent[]; t: number }) {
  return (
    <div className="fixed inset-x-3 bottom-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {agents.map((a) => {
          const spinner = spinnerAt(a.id, t);
          return (
            <motion.div
              key={a.id}
              layout
              data-agent-pane={a.id}
              className="min-w-0 rounded-lg border px-2.5 py-1.5 font-mono"
              style={{ borderColor: `${a.color}66`, background: "rgba(9,9,11,0.95)" }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={SPRING}
            >
              <div className="flex items-center gap-1.5 text-[11px]">
                <StatusDot color={a.color} working={!!spinner} />
                <span className="truncate font-semibold" style={{ color: a.color }}>
                  {a.name}
                </span>
                <span className="ml-auto shrink-0" style={{ color: spinner ? a.color : CC.green }}>
                  {spinner ? spinnerFrame(t) : "✓"}
                </span>
              </div>
              <div className="truncate text-[10px] text-white/60">{plain(transcriptAt(a.id, t, 1)[0]) || a.role}</div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
