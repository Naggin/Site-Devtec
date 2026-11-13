"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { AGENT_BY_ID, type AgentId } from "../script";
import { spinnerFrame, tokensK, type SpinnerState, type TLine } from "./transcript";

/** Paleta do Claude Code no terminal. */
export const CC = {
  bg: "#080808",
  orange: "#D77757",
  dim: "#8a8a8f",
  green: "#4EBA65",
  amber: "#E5B93C",
  violet: "#AF87FF",
} as const;

/** Liga/desliga em degrau (cursor, dot de tool rodando). */
export function Blink({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <motion.span
      className={className}
      style={style}
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ duration: 1, times: [0, 0.5, 0.5, 1], repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.span>
  );
}

function Peer({ id }: { id: AgentId }) {
  const a = AGENT_BY_ID[id];
  return <span style={{ color: a.color }}>{a.name}</span>;
}

/** "Nome(arg)" → Nome em negrito. */
function Tool({ text }: { text: string }) {
  const i = text.indexOf("(");
  if (i < 0) return <span className="font-bold text-white">{text}</span>;
  return (
    <>
      <span className="font-bold text-white">{text.slice(0, i)}</span>
      <span className="text-white/85">{text.slice(i)}</span>
    </>
  );
}

const Elbow = () => <span style={{ color: CC.dim }}>{"  ⎿  "}</span>;

function Line({ line, t }: { line: TLine; t: number }) {
  switch (line.kind) {
    case "user":
      return (
        <div className="-mx-1 bg-white/[0.06] px-1 text-white/90">
          <span style={{ color: CC.dim }}>{"> "}</span>
          {line.text}
        </div>
      );
    case "text":
      return (
        <div className="text-white">
          {"⏺ "}
          {line.text}
        </div>
      );
    case "tool": {
      const running = t < (line.doneAt ?? Infinity);
      return (
        <div>
          {running ? <Blink style={{ color: CC.dim }}>⏺</Blink> : <span style={{ color: CC.green }}>⏺</span>}{" "}
          <Tool text={line.text} />
        </div>
      );
    }
    case "result":
      return (
        <div style={{ color: CC.dim }}>
          <Elbow />
          {line.text}
        </div>
      );
    case "ok":
      return (
        <div>
          <Elbow />
          <span style={{ color: CC.green }}>✓ {line.text}</span>
        </div>
      );
    case "warn":
      return (
        <div>
          <Elbow />
          <span style={{ color: CC.amber }}>⚠ {line.text}</span>
        </div>
      );
    case "msgOut":
      return (
        <div className="text-white/75">
          <span style={{ color: CC.dim }}>{"  → "}</span>
          <Peer id={line.peer!} />
          <span style={{ color: CC.dim }}>: </span>
          {line.text}
        </div>
      );
    case "msgIn":
      return (
        <div className="text-white/75">
          <span style={{ color: CC.dim }}>{"  ← "}</span>
          <Peer id={line.peer!} />
          <span style={{ color: CC.dim }}>: </span>
          {line.text}
        </div>
      );
    case "handoffOut":
      return (
        <div>
          <Elbow />
          <span style={{ color: CC.green }}>✓ handoff → </span>
          <Peer id="orchestrator" />
        </div>
      );
    case "handoffIn":
      return (
        <div className="text-white/80">
          <Elbow />
          <span style={{ color: CC.green }}>✓ </span>
          handoff de <Peer id={line.peer!} />
          <span style={{ color: CC.dim }}>: {line.text}</span>
        </div>
      );
  }
}

/** Blocos "⏺" ganham respiro em cima, como no Claude Code. */
const BLOCK_START = new Set(["user", "text", "tool"]);

export function TranscriptLines({ lines, t }: { lines: TLine[]; t: number }) {
  return (
    <>
      {lines.map((l, i) => (
        <motion.div
          key={l.key}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className={`whitespace-pre-wrap break-words ${i > 0 && BLOCK_START.has(l.kind) ? "mt-[0.7em]" : ""}`}
        >
          <Line line={l} t={t} />
        </motion.div>
      ))}
    </>
  );
}

/** "✻ Verbo… (Ns · ↓ X.Xk tokens · esc to interrupt)". */
export function SpinnerLine({
  state,
  t,
  color = CC.orange,
  compact = false,
}: {
  state: SpinnerState;
  t: number;
  color?: string;
  compact?: boolean;
}) {
  const s = Math.floor(state.elapsed / 1000);
  return (
    <div className="mt-[0.7em] whitespace-pre-wrap">
      <span style={{ color }}>
        <span className="inline-block w-[2ch]">{spinnerFrame(t)}</span>
        {state.verb}…
      </span>
      <span style={{ color: CC.dim }}>
        {" "}
        ({s}s · ↓ {tokensK(state.elapsed)}k tokens
        {compact ? ")" : (
          <>
            {" · "}
            <span className="font-bold text-white/70">esc</span> to interrupt)
          </>
        )}
      </span>
    </div>
  );
}
