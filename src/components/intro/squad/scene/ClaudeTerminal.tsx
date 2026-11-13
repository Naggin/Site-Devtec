"use client";

import { motion } from "framer-motion";
import { AGENT_BY_ID, CLOSE_MS, PRE, PROMPT } from "../script";
import { Clawd } from "./Clawd";
import type { Rect } from "./geometry";
import { spinnerAt, transcriptAt } from "./transcript";
import { Blink, CC, SpinnerLine, TranscriptLines } from "./TranscriptLines";

const SHELL_CMD = "claude";
const ORCH = AGENT_BY_ID.orchestrator;

function typed(text: string, start: number, end: number, t: number) {
  const k = Math.min(1, Math.max(0, (t - start) / (end - start)));
  return text.slice(0, Math.round(text.length * k));
}

const Cursor = () => (
  <Blink className="inline-block h-[1.15em] w-[1ch] translate-y-[0.2em] bg-white/85" style={{ marginLeft: 1 }}>
    {""}
  </Blink>
);

function TitleBar({ compact }: { compact: boolean }) {
  return (
    <div className="relative flex shrink-0 items-center border-b border-white/[0.07] px-3 py-2">
      <div className="flex gap-1.5">
        <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
        <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
        <span className="h-3 w-3 rounded-full bg-[#28C840]" />
      </div>
      {compact ? (
        <>
          <span className="ml-3 truncate font-mono text-[12px] font-semibold" style={{ color: ORCH.color }}>
            ✳ {ORCH.name}
          </span>
          <span className="ml-auto shrink-0 pl-2 font-mono text-[10px]" style={{ color: CC.dim }}>
            {ORCH.model}
          </span>
        </>
      ) : (
        <div className="absolute inset-x-0 text-center font-mono text-[12px]" style={{ color: CC.dim }}>
          <span style={{ color: CC.orange }}>✳</span> Claude Code — ~/portfolio
        </div>
      )}
    </div>
  );
}

function Welcome({ narrow }: { narrow: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="relative mt-[1.1em] rounded-md border px-2 pb-3 pt-4"
      style={{ borderColor: CC.orange }}
    >
      <span className="absolute -top-[0.8em] left-3 px-1" style={{ background: CC.bg, color: CC.orange }}>
        Claude Code <span style={{ color: CC.dim }}>v2.1.0</span>
      </span>
      <div className="flex">
        <div className="flex flex-1 flex-col items-center px-2 text-center">
          <div className="font-bold text-white">Welcome back Antonio!</div>
          <Clawd className="my-[0.9em] h-[3.4em] w-auto" color={CC.orange} />
          <div style={{ color: CC.dim }}>Opus 5.5 · Claude Max</div>
          <div style={{ color: CC.dim }}>~/portfolio</div>
        </div>
        {!narrow && (
          <div className="flex-[1.2] border-l pl-4 pr-2" style={{ borderColor: CC.orange }}>
            <div className="font-bold" style={{ color: CC.orange }}>
              Tips for getting started
            </div>
            <div className="text-white/80">Run /init to create a CLAUDE.md file with instructions for Claude</div>
            <div className="my-[0.6em] border-t" style={{ borderColor: `${CC.orange}80` }} />
            <div className="font-bold" style={{ color: CC.orange }}>
              Recent activity
            </div>
            <div style={{ color: CC.dim }}>No recent activity</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * O Claude Code: terminal grande no Ato 1, pane do orquestrador no Ato 2.
 * A janela é uma só e anima de posição/tamanho entre os atos.
 */
export function ClaudeTerminal({
  t,
  rect,
  act2,
  mobile,
  closing,
}: {
  t: number;
  rect: Rect;
  act2: boolean;
  mobile: boolean;
  closing: boolean;
}) {
  const submitted = t >= PRE.submit;
  const lines = transcriptAt("orchestrator", t, act2 ? (mobile ? 3 : 16) : Infinity).filter(
    (l) => submitted || l.kind !== "user",
  );
  const spinner = spinnerAt("orchestrator", t);
  const fontSize = act2 ? (mobile ? 10.5 : 11) : mobile ? 11.5 : 13;

  return (
    <motion.div
      data-agent-pane="orchestrator"
      className="fixed"
      initial={{ ...rect, opacity: 0, scale: 0.97 }}
      animate={{ ...rect, opacity: 1, scale: 1 }}
      transition={{
        default: { duration: 1.2, ease: [0.65, 0, 0.35, 1] },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 },
      }}
    >
      <motion.div
        className="flex h-full flex-col overflow-hidden rounded-xl border shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] transition-colors duration-1000"
        style={{
          background: CC.bg,
          borderColor: act2 ? `${ORCH.color}66` : "rgba(255,255,255,0.1)",
          boxShadow: act2 ? `0 12px 40px -12px ${ORCH.color}40` : undefined,
        }}
        initial={false}
        animate={{ clipPath: closing ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 0% 0%)" }}
        transition={{ duration: CLOSE_MS / 1000, ease: [0.76, 0, 0.24, 1] }}
      >
        <TitleBar compact={act2} />
        <div
          className={`flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-3 font-mono ${act2 ? "justify-end" : "justify-start pt-2"} leading-[1.5] text-white transition-[font-size] duration-1000`}
          style={{ fontSize }}
        >
          {!act2 && t >= PRE.shellStart && (
            <div className="whitespace-pre-wrap">
              <span style={{ color: CC.green }}>antonio@devtec</span>
              <span style={{ color: CC.dim }}>:</span>
              <span style={{ color: "#6CA0F5" }}>~/portfolio</span>
              <span className="text-white/80">$ </span>
              {typed(SHELL_CMD, PRE.shellStart, PRE.shellEnd, t)}
              {t < PRE.welcome && <Cursor />}
            </div>
          )}
          {!act2 && t >= PRE.welcome && <Welcome narrow={mobile} />}

          {lines.length > 0 && (
            <div className="mt-[0.9em]">
              <TranscriptLines lines={lines} t={t} />
            </div>
          )}
          {spinner && <SpinnerLine state={spinner} t={t} compact={act2} />}

          {t >= PRE.welcome && !(act2 && mobile) && (
            <>
              <div className="mt-[0.7em] border-y py-[0.2em]" style={{ borderColor: "#3a3a40" }}>
                <span style={{ color: CC.dim }}>{"> "}</span>
                {!submitted && t >= PRE.promptStart ? (
                  <>
                    {typed(PROMPT, PRE.promptStart, PRE.promptEnd, t)}
                    <Cursor />
                  </>
                ) : (
                  <>
                    <Cursor />
                    {!submitted && <span style={{ color: CC.dim }}> Try &quot;refactor &lt;filepath&gt;&quot;</span>}
                  </>
                )}
              </div>
              <div className="truncate px-[2ch] pt-[0.15em]" style={{ color: CC.dim }}>
                {submitted ? (
                  <>
                    <span style={{ color: CC.violet }}>⏵⏵ accept edits on</span> (shift+tab to cycle)
                  </>
                ) : (
                  "? for shortcuts"
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {closing && (
        <motion.div
          className="pointer-events-none absolute inset-x-0 h-[2px]"
          style={{
            background: "linear-gradient(90deg, #D97757, #6366F1)",
            boxShadow: "0 0 12px 2px rgba(217,119,87,0.55), 0 0 24px 4px rgba(99,102,241,0.35)",
          }}
          initial={{ top: "0%", opacity: 1 }}
          animate={{ top: "100%", opacity: [1, 1, 0] }}
          transition={{ duration: CLOSE_MS / 1000, ease: [0.76, 0, 0.24, 1], opacity: { times: [0, 0.85, 1], duration: CLOSE_MS / 1000 } }}
        />
      )}
    </motion.div>
  );
}
