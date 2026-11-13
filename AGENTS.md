# AGENTS.md

Portfólio da Devtec (Antonio Junior) em Next.js (App Router) + React 19 + Tailwind v4 + Framer Motion. Site estático, sem backend.

- Dev: `npm run dev` (porta 3000). Lint: `npm run lint`. Typecheck: `npx tsc --noEmit`. Build: `npm run build`.
- Conteúdo (nome, bio, skills, projetos, trajetória, links) fica só em `src/data/portfolio.ts`.
- A intro multi-agente é dirigida por um roteiro: `src/components/intro/squad/script.ts` (tempos, falas dos agentes, raios, câmera). Mude o roteiro ali; os componentes só leem.
- Performance da intro: nada de ler layout (`getBoundingClientRect`, `offset*`) a cada frame depois de escrever estilo; meça antes de trocar propriedades animadas (ver comentários em `BuildBlock.tsx`, `SiteCamera.tsx`, `ConnectionLayer.tsx`). Avalie fps na build de produção, não no dev.
- Paleta e tipografia da Devtec: tokens em `src/app/globals.css` (`--brand` #e02020 etc.). A intro mantém as cores do Claude Code e dos agentes.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
