/**
 * Roteiro da intro multi-agente — fonte única de tempo.
 *
 * Um orquestrador (Claude Code) recebe o prompt, monta um squad de subagentes em
 * panes, eles trocam mensagens e constroem as seções em paralelo. Cada seção
 * pronta é marcada por um raio do pane até ela. Todos os tempos em ms desde o
 * início da intro (IntroContext.time).
 *
 * Quem consome:
 * - SquadIntro (diretor): relógio, fase e status das seções (eventos "stage").
 * - SquadScene: panes, transcripts, linhas de conexão e mensagens.
 * - SiteCamera: zoom/pan do site (eventos "camera" e "focus").
 * - LightningLayer: raios (eventos "strike").
 */

import type { StageId } from "../BuildStage";

export type AgentId =
  | "orchestrator"
  | "ui-designer"
  | "frontend-skills"
  | "frontend-projects"
  | "rag-researcher"
  | "qa-reviewer";

export interface Agent {
  id: AgentId;
  /** Nome exibido no cabeçalho do pane. */
  name: string;
  role: string;
  model: string;
  color: string;
  /** Lado da tela no desktop (o orquestrador fica no topo da coluna esquerda). */
  side: "left" | "right";
}

export const AGENTS: Agent[] = [
  { id: "orchestrator", name: "orchestrator", role: "Claude Code · plano e deploy", model: "opus-5.5", color: "#D77757", side: "left" },
  { id: "ui-designer", name: "ui-designer", role: "Navbar, Hero e tokens", model: "sonnet-5.5", color: "#E879F9", side: "left" },
  { id: "rag-researcher", name: "rag-researcher", role: "GitHub → RAG → Trajetória", model: "haiku-5.5", color: "#10B981", side: "left" },
  { id: "frontend-skills", name: "frontend", role: "Bento de skills e contato", model: "sonnet-5.5", color: "#6366F1", side: "right" },
  { id: "frontend-projects", name: "frontend", role: "Showcase de projetos", model: "sonnet-5.5", color: "#38BDF8", side: "right" },
  { id: "qa-reviewer", name: "qa-reviewer", role: "a11y, contraste e performance", model: "opus-5.5", color: "#FBBF24", side: "right" },
];

export const AGENT_BY_ID = Object.fromEntries(AGENTS.map((a) => [a.id, a])) as Record<AgentId, Agent>;

/** Quem constrói cada seção (cor do contorno e origem do raio). */
export const STAGE_OWNER: Record<StageId, AgentId> = {
  nav: "ui-designer",
  hero: "ui-designer",
  skills: "frontend-skills",
  projects: "frontend-projects",
  timeline: "rag-researcher",
  footer: "frontend-skills",
};

export type LineKind = "text" | "tool" | "result" | "ok" | "warn";

export type SquadEvent =
  /** Pane do subagente nasce (o do orquestrador já existe: é o terminal do Ato 1). */
  | { t: number; type: "spawn"; agent: AgentId }
  /** Linha no transcript do pane. tool = "⏺ Nome(arg)", result = "⎿ …". */
  | { t: number; type: "line"; agent: AgentId; kind: LineKind; text: string }
  /** Mensagem entre agentes: pacote viaja pela linha de conexão (MESSAGE_MS) e aparece nos dois panes. */
  | { t: number; type: "message"; from: AgentId; to: AgentId; text: string }
  /** Seção começa a ser montada / fica pronta. */
  | { t: number; type: "stage"; stage: StageId; status: "building" | "built" }
  /** Raio do pane do agente até a seção, no instante em que ela fica pronta. */
  | { t: number; type: "strike"; agent: AgentId; stage: StageId }
  /** Entrega do subagente ao orquestrador (pacote "handoff ✓"). */
  | { t: number; type: "handoff"; agent: AgentId; text: string }
  /** Pane fecha. */
  | { t: number; type: "close"; agent: AgentId }
  /** Modo da câmera: terminal (site escondido), overview (zoom-out), full (tamanho real). */
  | { t: number; type: "camera"; mode: "terminal" | "overview" | "full" }
  /** Câmera centraliza esta seção (no overview). */
  | { t: number; type: "focus"; stage: StageId };

export const MESSAGE_MS = 700;
export const STRIKE_MS = 650;
export const CLOSE_MS = 1100;

/** Ato 1 (só o terminal do orquestrador). */
export const PRE = {
  shellStart: 250,
  shellEnd: 650,
  welcome: 850,
  promptStart: 1150,
  promptEnd: 2750,
  submit: 2950,
  plan: 3450,
  /** Início do Ato 2: fase "building", câmera em overview, terminal vira o pane do orquestrador. */
  build: 4300,
} as const;

export const PROMPT =
  "O visitante acabou de chegar. Monte um squad, compile minha trajetória, renderize minhas melhores skills e faça um deploy ao vivo do meu portfólio. Capricha na UI.";

const o = "orchestrator" as const;
const ui = "ui-designer" as const;
const rag = "rag-researcher" as const;
const fs = "frontend-skills" as const;
const fp = "frontend-projects" as const;
const qa = "qa-reviewer" as const;

export const EVENTS: SquadEvent[] = [
  // --- Ato 1: o orquestrador planeja (linhas do terminal grande) ---
  { t: PRE.plan, type: "line", agent: o, kind: "text", text: "Vou montar um squad: cada subagente cuida de uma seção e eles se coordenam por mensagens." },
  { t: PRE.plan + 350, type: "line", agent: o, kind: "tool", text: "Read(src/data/portfolio.ts)" },
  { t: PRE.plan + 650, type: "line", agent: o, kind: "result", text: "Read 328 lines" },

  // --- Ato 2: squad sobe ---
  { t: PRE.build, type: "camera", mode: "overview" },
  { t: PRE.build, type: "focus", stage: "hero" },
  { t: 4500, type: "spawn", agent: ui },
  { t: 4500, type: "line", agent: o, kind: "tool", text: "Task(ui-designer: Navbar, Hero e tokens)" },
  { t: 4650, type: "message", from: o, to: ui, text: "task: Navbar + Hero" },
  { t: 4700, type: "spawn", agent: rag },
  { t: 4700, type: "line", agent: o, kind: "tool", text: "Task(rag-researcher: GitHub → Trajetória)" },
  { t: 4850, type: "message", from: o, to: rag, text: "task: indexar GitHub" },
  { t: 4900, type: "spawn", agent: fs },
  { t: 4900, type: "line", agent: o, kind: "tool", text: "Task(frontend: Bento de skills + contato)" },
  { t: 5050, type: "message", from: o, to: fs, text: "task: SkillsBento" },
  { t: 5100, type: "spawn", agent: fp },
  { t: 5100, type: "line", agent: o, kind: "tool", text: "Task(frontend: Showcase de projetos)" },
  { t: 5250, type: "message", from: o, to: fp, text: "task: ProjectsGrid" },
  { t: 5300, type: "spawn", agent: qa },
  { t: 5300, type: "line", agent: o, kind: "tool", text: "Task(qa-reviewer: revisão contínua)" },
  { t: 5450, type: "message", from: o, to: qa, text: "task: revisar tudo" },
  { t: 5600, type: "line", agent: o, kind: "text", text: "5 subagentes rodando em paralelo. Aguardando handoffs…" },

  // ui-designer: tokens + navbar + hero
  { t: 5100, type: "line", agent: ui, kind: "tool", text: "Read(src/app/globals.css)" },
  { t: 5400, type: "line", agent: ui, kind: "result", text: "tokens: #e02020 · #080808 · Geist Black" },
  { t: 5600, type: "message", from: ui, to: fs, text: "recado: primária #e02020, fundo #080808" },
  { t: 5750, type: "message", from: ui, to: fp, text: "recado: mesmos tokens e raio 16px" },
  { t: 5900, type: "line", agent: ui, kind: "tool", text: "Write(src/components/layout/Navbar.tsx)" },
  { t: 5900, type: "stage", stage: "nav", status: "building" },
  { t: 6300, type: "line", agent: ui, kind: "tool", text: "Write(src/components/sections/Hero.tsx)" },
  { t: 6300, type: "stage", stage: "hero", status: "building" },
  { t: 8600, type: "strike", agent: ui, stage: "nav" },
  { t: 8600, type: "stage", stage: "nav", status: "built" },
  { t: 8650, type: "line", agent: ui, kind: "ok", text: "Navbar pronta" },
  { t: 9400, type: "strike", agent: ui, stage: "hero" },
  { t: 9400, type: "stage", stage: "hero", status: "built" },
  { t: 9450, type: "line", agent: ui, kind: "ok", text: "Hero pronto (text scramble ✓)" },
  { t: 9700, type: "handoff", agent: ui, text: "Navbar + Hero prontos" },
  { t: 10300, type: "close", agent: ui },

  // rag-researcher: GitHub → embeddings → timeline + dados de projetos
  { t: 5200, type: "line", agent: rag, kind: "tool", text: "Bash(gh repo list Naggin --json homepageUrl)" },
  { t: 6000, type: "line", agent: rag, kind: "result", text: "30 repos · 12 no ar" },
  { t: 6200, type: "line", agent: rag, kind: "tool", text: "Embed(READMEs → vector store)" },
  { t: 6900, type: "line", agent: rag, kind: "result", text: "12 docs indexados · top-k=4" },
  { t: 7100, type: "message", from: rag, to: fp, text: "12 projetos no ar + resumos (RAG)" },
  { t: 7600, type: "line", agent: rag, kind: "tool", text: "Query(\"trajetória profissional\")" },
  { t: 8100, type: "line", agent: rag, kind: "result", text: "5 marcos recuperados" },
  { t: 9400, type: "line", agent: rag, kind: "tool", text: "Write(src/components/sections/Timeline.tsx)" },
  { t: 9400, type: "stage", stage: "timeline", status: "building" },
  { t: 14200, type: "strike", agent: rag, stage: "timeline" },
  { t: 14200, type: "stage", stage: "timeline", status: "built" },
  { t: 14250, type: "line", agent: rag, kind: "ok", text: "Trajetória pronta" },
  { t: 14500, type: "handoff", agent: rag, text: "Trajetória a partir do GitHub" },
  { t: 15100, type: "close", agent: rag },

  // frontend-skills: bento + correção do QA + footer
  { t: 5500, type: "line", agent: fs, kind: "tool", text: "Read(src/data/portfolio.ts)" },
  { t: 5900, type: "line", agent: fs, kind: "result", text: "6 grupos de skills · 4 métricas" },
  { t: 6600, type: "line", agent: fs, kind: "tool", text: "Write(src/components/sections/SkillsBento.tsx)" },
  { t: 6600, type: "stage", stage: "skills", status: "building" },
  { t: 11000, type: "strike", agent: fs, stage: "skills" },
  { t: 11000, type: "stage", stage: "skills", status: "built" },
  { t: 11050, type: "line", agent: fs, kind: "ok", text: "Bento pronto" },
  { t: 12200, type: "line", agent: fs, kind: "tool", text: "Edit(SkillsBento.tsx: text-muted → text-zinc-300)" },
  { t: 12500, type: "line", agent: fs, kind: "result", text: "contraste 7.1:1 (AA ✓)" },
  { t: 12600, type: "message", from: fs, to: qa, text: "corrigido, pode revalidar" },
  { t: 12700, type: "line", agent: fs, kind: "tool", text: "Write(src/components/sections/TerminalFooter.tsx)" },
  { t: 12700, type: "stage", stage: "footer", status: "building" },
  { t: 15800, type: "strike", agent: fs, stage: "footer" },
  { t: 15800, type: "stage", stage: "footer", status: "built" },
  { t: 15850, type: "line", agent: fs, kind: "ok", text: "Contato + mini-terminal prontos" },
  { t: 16100, type: "handoff", agent: fs, text: "Skills + Contato prontos" },
  { t: 16700, type: "close", agent: fs },

  // frontend-projects: espera os dados do RAG e monta o showcase
  { t: 5600, type: "line", agent: fp, kind: "text", text: "Aguardando dados do rag-researcher…" },
  { t: 7800, type: "line", agent: fp, kind: "result", text: "recebido: 12 projetos com resumo" },
  { t: 8100, type: "line", agent: fp, kind: "tool", text: "Write(src/components/sections/ProjectsGrid.tsx)" },
  { t: 8100, type: "stage", stage: "projects", status: "building" },
  { t: 12600, type: "strike", agent: fp, stage: "projects" },
  { t: 12600, type: "stage", stage: "projects", status: "built" },
  { t: 12650, type: "line", agent: fp, kind: "ok", text: "12 projetos no grid" },
  { t: 12900, type: "handoff", agent: fp, text: "Showcase pronto" },
  { t: 13500, type: "close", agent: fp },

  // qa-reviewer: revisa enquanto os outros constroem
  { t: 5700, type: "line", agent: qa, kind: "text", text: "Aguardando seções para revisar…" },
  { t: 11100, type: "line", agent: qa, kind: "tool", text: "Audit(SkillsBento: a11y, contraste)" },
  { t: 11350, type: "line", agent: qa, kind: "warn", text: "contraste 3.9:1 no card de métricas" },
  { t: 11400, type: "message", from: qa, to: fs, text: "⚠ contraste baixo nas métricas" },
  { t: 13500, type: "line", agent: qa, kind: "ok", text: "SkillsBento aprovado" },
  { t: 15000, type: "line", agent: qa, kind: "tool", text: "Lighthouse(/)" },
  { t: 15500, type: "line", agent: qa, kind: "result", text: "perf 98 · a11y 100 · SEO 100" },
  { t: 16300, type: "line", agent: qa, kind: "ok", text: "6/6 seções aprovadas" },
  { t: 16500, type: "message", from: qa, to: o, text: "aprovado ✓" },
  { t: 16600, type: "handoff", agent: qa, text: "QA aprovado" },
  { t: 17200, type: "close", agent: qa },

  // Câmera acompanha as entregas descendo a página (sem vai-e-volta): parte 700ms antes
  // de cada raio (pan de 600ms, impacto com a tela parada) e só sai ~900ms depois dele,
  // quando o raio, o contorno e a onda de invocação já terminaram.
  { t: 10300, type: "focus", stage: "skills" },
  { t: 13500, type: "focus", stage: "timeline" },
  { t: 11900, type: "focus", stage: "projects" },
  { t: 15100, type: "focus", stage: "footer" },
  { t: 16900, type: "focus", stage: "hero" },

  // --- Final: deploy, zoom-in e cortina ---
  { t: 17300, type: "line", agent: o, kind: "tool", text: "Bash(npm run build && vercel deploy --prod)" },
  { t: 18500, type: "line", agent: o, kind: "result", text: "✓ Deploy concluído — portfólio no ar" },
  { t: 18700, type: "line", agent: o, kind: "text", text: "Pronto! 5 subagentes, 6 seções, 1 deploy." },
  { t: 19000, type: "camera", mode: "full" },
];

/** Cortina do pane do orquestrador e fim da intro. */
export const CLOSE_AT = 20400;
export const DONE_AT = CLOSE_AT + CLOSE_MS;

EVENTS.sort((a, b) => a.t - b.t);

/** Eventos de um tipo já ocorridos em `t`. */
export function eventsUntil<T extends SquadEvent["type"]>(t: number, type: T) {
  return EVENTS.filter((e): e is Extract<SquadEvent, { type: T }> => e.type === type && e.t <= t);
}

/** Último evento de um tipo até `t` (ou undefined). */
export function lastEvent<T extends SquadEvent["type"]>(t: number, type: T) {
  const list = eventsUntil(t, type);
  return list[list.length - 1];
}
