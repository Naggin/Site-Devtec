# Devtec

Site institucional e portfólio de **Antonio Junior** — desenvolvimento web, apps e produtos digitais.

## Stack

- React 19 + TypeScript
- Vite 7
- Vitest + Testing Library
- ESLint

## Desenvolvimento

```bash
npm install
npm run dev
```

O servidor sobe em `http://localhost:5173`.

| Comando | Uso |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run lint` | Lint |
| `npm test` | Testes |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Preview do build |

## Movimento

Dois efeitos partilham a mesma poeira de brasa (`src/lib/dustPainter.ts`):

- **Troca de idioma** — o site inteiro se desfaz na diagonal e volta traduzido (`DustTransition`).
- **Entrada das seções** — cada bloco se junta a partir da mesma poeira ao entrar em cena (`dustReveal`), e a borda entre seções acende no vermelho da marca.

Com `prefers-reduced-motion: reduce` os dois saem de cena e o conteúdo aparece direto. Para verificar num browser de verdade, com o `npm run dev` no ar:

```bash
node scripts/verify_dust_reveal.mjs        # entrada das seções
node scripts/verify_dust_reveal_a11y.mjs   # reduced motion
node scripts/verify_dust_cross.mjs         # idioma trocado no meio de uma entrada
node scripts/verify_dust_playwright.mjs    # troca de idioma
node scripts/perf_dust_reveal.mjs          # custo em frames num scroll contínuo
```

## Conteúdo

Textos, projetos e e-mail de contato ficam em `src/data.ts`. Ajuste ali quando quiser atualizar o portfólio sem mexer no layout.
