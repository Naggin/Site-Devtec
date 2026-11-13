import {
  AGENTS,
  EVENTS,
  MESSAGE_MS,
  PRE,
  PROMPT,
  type AgentId,
  type LineKind,
  type SquadEvent,
} from "../script";

/** Linhas que um pane mostra: as do roteiro + mensagens e handoffs derivados. */
export type TKind = LineKind | "user" | "msgOut" | "msgIn" | "handoffOut" | "handoffIn";

export interface TLine {
  key: string;
  /** Instante em que a linha aparece. */
  at: number;
  kind: TKind;
  text: string;
  /** Outro agente (mensagens e handoffs). */
  peer?: AgentId;
  /** Tools: até quando o dot pisca ("rodando"). */
  doneAt?: number;
}

type Ev<T extends SquadEvent["type"]> = Extract<SquadEvent, { type: T }>;

const isLine = (e: SquadEvent): e is Ev<"line"> => e.type === "line";
const DONE_KINDS: LineKind[] = ["result", "ok", "warn"];

function toolDoneAt(e: Ev<"line">): number {
  // Task(...) do orquestrador termina quando chega o handoff do subagente lançado junto.
  if (e.agent === "orchestrator" && e.text.startsWith("Task(")) {
    const spawn = EVENTS.find((s): s is Ev<"spawn"> => s.type === "spawn" && s.t === e.t);
    const handoff = spawn && EVENTS.find((h): h is Ev<"handoff"> => h.type === "handoff" && h.agent === spawn.agent);
    return handoff ? handoff.t + MESSAGE_MS : Infinity;
  }
  const next = EVENTS.find((x) => isLine(x) && x.agent === e.agent && x.t > e.t && DONE_KINDS.includes(x.kind));
  return next ? next.t : Infinity;
}

function build() {
  const out = Object.fromEntries(AGENTS.map((a) => [a.id, [] as TLine[]])) as Record<AgentId, TLine[]>;
  out.orchestrator.push({ key: "user", at: PRE.submit, kind: "user", text: PROMPT });
  EVENTS.forEach((e, i) => {
    if (e.type === "line") {
      out[e.agent].push({
        key: `l${i}`,
        at: e.t,
        kind: e.kind,
        text: e.text,
        doneAt: e.kind === "tool" ? toolDoneAt(e) : undefined,
      });
    } else if (e.type === "message") {
      out[e.from].push({ key: `mo${i}`, at: e.t, kind: "msgOut", text: e.text, peer: e.to });
      out[e.to].push({ key: `mi${i}`, at: e.t + MESSAGE_MS, kind: "msgIn", text: e.text, peer: e.from });
    } else if (e.type === "handoff") {
      out[e.agent].push({ key: `ho${i}`, at: e.t, kind: "handoffOut", text: e.text, peer: "orchestrator" });
      out.orchestrator.push({ key: `hi${i}`, at: e.t + MESSAGE_MS, kind: "handoffIn", text: e.text, peer: e.agent });
    }
  });
  for (const list of Object.values(out)) list.sort((a, b) => a.at - b.at);
  return out;
}

const ALL = build();

/** Transcript do agente até `t` (mais nova por último). */
export function transcriptAt(agent: AgentId, t: number, max = Infinity) {
  const list = ALL[agent].filter((l) => l.at <= t);
  return list.length > max ? list.slice(-max) : list;
}

const firstOf = <T extends SquadEvent["type"]>(type: T, agent: AgentId) =>
  EVENTS.find((e): e is Ev<T> => e.type === type && "agent" in e && e.agent === agent);

/** Quando cada agente nasce, entrega e fecha (orquestrador: o próprio terminal). */
export const LIFE = Object.fromEntries(
  AGENTS.map((a) => [
    a.id,
    {
      spawn: firstOf("spawn", a.id)?.t ?? 0,
      handoff: firstOf("handoff", a.id)?.t ?? Infinity,
      close: firstOf("close", a.id)?.t ?? Infinity,
    },
  ]),
) as Record<AgentId, { spawn: number; handoff: number; close: number }>;

const VERBS: Record<AgentId, string> = {
  orchestrator: "Coordenando",
  "ui-designer": "Desenhando",
  "rag-researcher": "Indexando",
  "frontend-skills": "Compilando",
  "frontend-projects": "Renderizando",
  "qa-reviewer": "Revisando",
};

const DEPLOY_AT = EVENTS.find((e) => isLine(e) && e.agent === "orchestrator" && e.text.startsWith("Bash("))?.t ?? Infinity;
const ORCH_DONE_AT = EVENTS.filter((e) => isLine(e) && e.agent === "orchestrator").at(-1)?.t ?? Infinity;

export interface SpinnerState {
  verb: string;
  /** ms desde o início do trabalho. */
  elapsed: number;
}

/** Spinner "✻ Verbo…" enquanto o agente trabalha (null quando parado). */
export function spinnerAt(agent: AgentId, t: number): SpinnerState | null {
  if (agent === "orchestrator") {
    if (t < PRE.submit || t >= ORCH_DONE_AT) return null;
    const verb = t < PRE.build ? "Planejando" : t < DEPLOY_AT ? VERBS.orchestrator : "Fazendo deploy";
    return { verb, elapsed: t - PRE.submit };
  }
  const life = LIFE[agent];
  if (t < life.spawn || t >= life.handoff) return null;
  return { verb: VERBS[agent], elapsed: t - life.spawn };
}

const FRAMES = ["·", "✢", "✳", "✶", "✻", "✽"];
const CYCLE = [...FRAMES, ...FRAMES.slice(1, -1).reverse()];

export const spinnerFrame = (t: number) => CYCLE[Math.floor(t / 120) % CYCLE.length];

export const tokensK = (elapsed: number) => (0.4 + (elapsed / 1000) * 0.55).toFixed(1);
