# Devtec

Portfólio de **Antonio Junior**: desenvolvimento web, apps, IA e arquitetura multi-agente.

Ao abrir o site, o Claude Code recebe um prompt, monta um squad de subagentes em panes (ui-designer, rag-researcher, frontend, qa-reviewer) e eles constroem o portfólio ao vivo: trocam mensagens, montam as seções em paralelo e marcam cada seção pronta com um raio. `Esc` pula a intro; "Replay Intro" na navbar assiste de novo.

## Stack

- Next.js (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Framer Motion + Lucide

## Desenvolvimento

```bash
npm install
npm run dev
```

| Comando | Uso |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (porta 3000) |
| `npm run lint` | Lint |
| `npx tsc --noEmit` | Typecheck |
| `npm run build` | Build de produção |
| `npm run start` | Serve o build |

## Conteúdo

Textos, skills, projetos, trajetória e links ficam em `src/data/portfolio.ts`.

## Intro

O roteiro inteiro (tempos, falas dos agentes, mensagens, raios e câmera) está em `src/components/intro/squad/script.ts`.
Com `prefers-reduced-motion: reduce` a intro é pulada e o site aparece direto.
