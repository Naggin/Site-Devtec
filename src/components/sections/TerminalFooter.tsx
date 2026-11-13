"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type SVGProps,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, CornerDownLeft, Mail, MessageCircle, Terminal } from "lucide-react";
import { BuildBlock } from "@/components/intro/BuildBlock";
import { portfolioData, type SocialLink } from "@/data/portfolio";

const links = portfolioData.links as readonly SocialLink[];

const ICONS: Record<SocialLink["id"], (p: SVGProps<SVGSVGElement>) => ReactNode> = {
  email: (p) => <Mail aria-hidden {...p} />,
  whatsapp: (p) => <MessageCircle aria-hidden {...p} />,
};

const NAMES: Record<SocialLink["id"], string> = {
  email: "E-mail",
  whatsapp: "WhatsApp",
};

const isExternal = (href: string) => href.startsWith("http");

/* ---------------------------------------------------------------- terminal */

type LineKind = "input" | "output" | "error" | "system";
interface Line {
  id: number;
  kind: LineKind;
  content: ReactNode;
}

const SECTIONS: Record<string, string> = {
  topo: "top",
  inicio: "top",
  skills: "skills",
  projetos: "projetos",
  trajetoria: "trajetoria",
  contato: "contato",
};

const COMMANDS = ["help", "skills", "projetos", "contato", "whoami", "ir", "clear"] as const;
const ALIASES: Record<string, (typeof COMMANDS)[number]> = {
  ajuda: "help",
  "?": "help",
  stack: "skills",
  projects: "projetos",
  ls: "projetos",
  contact: "contato",
  cd: "ir",
  goto: "ir",
  cls: "clear",
  limpar: "clear",
};

function TermLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      {...(isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="text-brand-ink underline decoration-brand-ink/30 underline-offset-2 transition-colors hover:text-ink hover:decoration-ink/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-ink"
    >
      {children}
    </a>
  );
}

function helpOutput() {
  const rows: [string, string][] = [
    ["help", "lista os comandos"],
    ["skills", "stack e nível de domínio"],
    ["projetos", "projetos em destaque com links"],
    ["contato", "onde me encontrar"],
    ["whoami", "quem está por trás do código"],
    ["ir <seção>", "rola até skills · projetos · trajetoria · contato · topo"],
    ["clear", "limpa o terminal"],
  ];
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5">
      {rows.map(([cmd, desc]) => (
        <div key={cmd} className="contents">
          <span className="text-brand-ink">{cmd}</span>
          <span className="text-ink-2">{desc}</span>
        </div>
      ))}
      <span className="col-span-2 mt-1 text-ink-3">dica: ↑/↓ navega no histórico · Tab completa</span>
    </div>
  );
}

function skillsOutput() {
  return (
    <div className="space-y-1">
      {portfolioData.skillGroups.map((g) => (
        <div key={g.id} className="flex flex-wrap gap-x-2">
          <span className="w-24 shrink-0 text-green">{g.label}</span>
          <span className="text-ink/90">
            {g.skills.map((s, i) => (
              <span key={s.name}>
                {s.name}
                <span className="text-brand-ink/70" aria-label={`nível ${s.level} de 5`}>
                  {" "}
                  {"▮".repeat(s.level)}
                  <span className="text-white/15">{"▮".repeat(5 - s.level)}</span>
                </span>
                {i < g.skills.length - 1 && <span className="text-ink-2">{" · "}</span>}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

function projectsOutput() {
  return (
    <ul className="space-y-2">
      {portfolioData.projects.map((p, i) => {
        const project: { liveUrl?: string; repoUrl?: string } = p;
        return (
          <li key={p.title}>
            <span className="text-ink-2">{String(i + 1).padStart(2, "0")} </span>
            <span className="font-semibold text-ink">{p.title}</span>
            <span className="text-ink-2"> — {p.kind}</span>
            <div className="pl-6 text-ink-2/90">
              {p.solution}{" "}
              {project.liveUrl && <TermLink href={project.liveUrl}>[demo]</TermLink>}{" "}
              {project.repoUrl && <TermLink href={project.repoUrl}>[repo]</TermLink>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function contactOutput() {
  return (
    <ul className="space-y-0.5">
      {links.map((l) => (
        <li key={l.id}>
          <span className="inline-block w-24 text-green">{NAMES[l.id]}</span>
          <TermLink href={l.href}>{l.label}</TermLink>
        </li>
      ))}
    </ul>
  );
}

function whoamiOutput() {
  return (
    <div>
      <span className="text-ink">{portfolioData.name}</span>
      <span className="text-ink-2"> · {portfolioData.role} @ </span>
      <span className="text-brand-ink">{portfolioData.brand}</span>
      <div className="text-ink-2">{portfolioData.bio}</div>
      <div className="mt-1 text-green">● {portfolioData.availability}</div>
    </div>
  );
}

const WELCOME: Line[] = [
  {
    id: 0,
    kind: "system",
    content: (
      <>
        <span className="text-brand-ink">✻</span> Bem-vindo ao terminal do {portfolioData.brand}. Digite{" "}
        <span className="text-brand-ink">help</span> para ver os comandos.
      </>
    ),
  },
];

function MiniTerminal() {
  const reduce = useReducedMotion();
  const inputId = useId();
  const [lines, setLines] = useState<Line[]>(WELCOME);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const nextId = useRef(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const push = useCallback((...entries: Omit<Line, "id">[]) => {
    setLines((prev) => [...prev, ...entries.map((e) => ({ ...e, id: nextId.current++ }))]);
  }, []);

  const scrollToSection = useCallback(
    (target: string) => {
      const behavior: ScrollBehavior = reduce ? "auto" : "smooth";
      if (target === "top") window.scrollTo({ top: 0, behavior });
      else document.getElementById(target)?.scrollIntoView({ behavior, block: "start" });
    },
    [reduce],
  );

  const run = useCallback(
    (raw: string) => {
      const input = raw.trim();
      if (!input) return;
      setHistory((h) => (h[h.length - 1] === input ? h : [...h, input]));
      setCursor(null);

      const [head, ...args] = input.split(/\s+/);
      const name = head.toLowerCase();
      const cmd = (COMMANDS as readonly string[]).includes(name) ? name : ALIASES[name];
      const echo: Omit<Line, "id"> = { kind: "input", content: input };

      switch (cmd) {
        case "clear":
          setLines([]);
          return;
        case "help":
          return push(echo, { kind: "output", content: helpOutput() });
        case "skills":
          return push(echo, { kind: "output", content: skillsOutput() });
        case "projetos":
          return push(echo, { kind: "output", content: projectsOutput() });
        case "contato":
          return push(echo, { kind: "output", content: contactOutput() });
        case "whoami":
          return push(echo, { kind: "output", content: whoamiOutput() });
        case "ir": {
          const key = (args[0] ?? "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .replace(/^#/, "");
          const target = SECTIONS[key];
          if (!target) {
            return push(echo, {
              kind: "error",
              content: `seção "${args[0] ?? ""}" não existe. Tente: ${Object.keys(SECTIONS).join(" · ")}`,
            });
          }
          push(echo, { kind: "output", content: `→ indo para #${key}…` });
          scrollToSection(target);
          return;
        }
        default:
          return push(echo, {
            kind: "error",
            content: (
              <>
                comando não encontrado: <span className="text-ink">{head}</span>. Digite{" "}
                <span className="text-brand-ink">help</span> para ver o que dá pra fazer.
              </>
            ),
          });
      }
    },
    [push, scrollToSection],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      run(value);
      setValue("");
    } else if (e.key === "ArrowUp") {
      if (!history.length) return;
      e.preventDefault();
      const next = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setValue(history[next]);
    } else if (e.key === "ArrowDown") {
      if (cursor === null) return;
      e.preventDefault();
      const next = cursor + 1;
      if (next >= history.length) {
        setCursor(null);
        setValue("");
      } else {
        setCursor(next);
        setValue(history[next]);
      }
    } else if (e.key === "Tab" && value.trim()) {
      const match = COMMANDS.find((c) => c.startsWith(value.trim().toLowerCase()));
      if (match) {
        e.preventDefault();
        setValue(match === "ir" ? "ir " : match);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-[#0c0c10]/90 shadow-2xl shadow-black/50 backdrop-blur-xl">
      {/* Barra da janela */}
      <div className="flex items-center gap-3 border-b border-line bg-white/[0.02] px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#ff5f57]/80" />
          <span className="size-2.5 rounded-full bg-[#febc2e]/80" />
          <span className="size-2.5 rounded-full bg-[#28c840]/80" />
        </div>
        <p className="flex min-w-0 items-center gap-1.5 truncate font-mono text-[11px] text-ink-2">
          <Terminal className="size-3.5 shrink-0 text-brand-ink" aria-hidden />
          {portfolioData.brand.toLowerCase()} — claude-code
        </p>
      </div>

      {/* Saída */}
      <div
        ref={scrollRef}
        onClick={() => inputRef.current?.focus()}
        className="h-64 overflow-y-auto overscroll-contain px-4 py-3 font-mono text-[12.5px] leading-relaxed sm:h-72 sm:text-[13px] 2xl:h-80 2xl:text-sm"
      >
        <div role="log" aria-live="polite" aria-label="Saída do terminal" className="space-y-2">
          {lines.map((line) => (
            <motion.div
              key={line.id}
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={
                line.kind === "error" ? "text-rose-400" : line.kind === "system" ? "text-ink-2" : "text-ink/90"
              }
            >
              {line.kind === "input" ? (
                <p>
                  <span className="text-brand-ink" aria-hidden>
                    ❯{" "}
                  </span>
                  <span className="sr-only">comando: </span>
                  {line.content}
                </p>
              ) : (
                line.content
              )}
            </motion.div>
          ))}
        </div>

        {/* Prompt */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-brand-ink" aria-hidden>
            ❯
          </span>
          <label htmlFor={inputId} className="sr-only">
            Digite um comando (help para ajuda)
          </label>
          <input
            id={inputId}
            ref={inputRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setCursor(null);
            }}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="send"
            placeholder="digite help…"
            className="min-w-0 flex-1 bg-transparent text-ink caret-brand outline-none placeholder:text-ink-2/40"
          />
          <CornerDownLeft className="size-3.5 shrink-0 text-ink-2/40" aria-hidden />
        </div>
      </div>

      {/* Atalhos (toque) */}
      <div className="flex gap-1.5 overflow-x-auto border-t border-line px-3 py-2.5 [scrollbar-width:none]">
        {(["help", "skills", "projetos", "contato", "whoami", "clear"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              run(c);
              inputRef.current?.focus({ preventScroll: true });
            }}
            className="shrink-0 rounded-md border border-line bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-ink-2 transition-colors hover:border-brand/40 hover:text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-ink"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ footer */

export function TerminalFooter() {
  const email = links.find((l) => l.id === "email");
  const whatsapp = links.find((l) => l.id === "whatsapp");
  const year = portfolioData.copyrightYear;

  return (
    <footer id="contato" className="relative scroll-mt-24 overflow-hidden border-t border-line">
      {/* Brilho ambiente */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_at_top,rgba(224,32,32,0.12),transparent_60%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-24 sm:px-6 sm:pt-32 lg:px-8 2xl:max-w-7xl 2xl:pt-40">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* CTA */}
          <BuildBlock label="<ContactCTA />" order={0}>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand-ink">
              <span aria-hidden>{"// "}</span>contato
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.045em] text-ink sm:text-4xl lg:text-5xl 2xl:text-6xl">
              Tem um projeto em mente?{" "}
              <span className="text-brand">
                Vamos tirar do papel.
              </span>
            </h2>
            <p className="mt-4 max-w-md text-base text-ink-2 sm:text-lg">
              {portfolioData.specialty}. Você fala direto com quem escreve o código — resposta rápida, sem
              intermediários.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {email && (
                <a
                  href={email.href}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-medium text-white hover:bg-brand-hover shadow-[0_0_24px_rgba(224,32,32,0.35)] transition-all hover:shadow-[0_0_36px_rgba(224,32,32,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ink focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                >
                  <Mail className="size-4" aria-hidden />
                  Enviar e-mail
                  <ArrowUpRight
                    className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </a>
              )}
              {whatsapp && (
                <a
                  href={whatsapp.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white/[0.03] px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-green/40 hover:bg-green/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
                >
                  <MessageCircle className="size-4 text-green" aria-hidden />
                  Chamar no WhatsApp
                </a>
              )}
            </div>

            <ul className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {links.map((l) => {
                const Icon = ICONS[l.id];
                return (
                  <li key={l.id}>
                    <a
                      href={l.href}
                      {...(isExternal(l.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      aria-label={`${NAMES[l.id]}: ${l.label}`}
                      className="group flex items-center gap-2.5 rounded-xl border border-line bg-bg-2/60 px-3.5 py-3 text-sm text-ink-2 transition-all hover:-translate-y-0.5 hover:border-white/15 hover:text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-ink motion-reduce:hover:translate-y-0"
                    >
                      <Icon className="size-4 shrink-0 transition-colors group-hover:text-brand-ink" />
                      {NAMES[l.id]}
                    </a>
                  </li>
                );
              })}
            </ul>
          </BuildBlock>

          {/* Terminal */}
          <BuildBlock label="<MiniTerminal />" order={1} className="rounded-2xl">
            <MiniTerminal />
          </BuildBlock>
        </div>

        <div className="mt-20 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-ink-2 sm:flex-row">
          <p>
            © {year} {portfolioData.name} · <span className="text-ink/80">{portfolioData.brand}</span>
          </p>
          <p className="font-mono">
            <span className="text-brand-ink">●</span> Built by Claude · {portfolioData.location}
          </p>
        </div>
      </div>
    </footer>
  );
}
