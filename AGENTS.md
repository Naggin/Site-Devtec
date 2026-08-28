# AGENTS.md

Site da Devtec: portfólio estático em React + Vite. Não há backend, banco nem autenticação.

## Cursor Cloud specific instructions

- Refresh de dependências: `npm install` na raiz (só quando `package.json` existir no checkout).
- Servidor de desenvolvimento: `npm run dev` (Vite em `0.0.0.0:5173`). O hot reload cobre TS/CSS; depois de instalar pacotes novos, reinicie o processo do Vite.
- Preview do build: `npm run preview` na porta `4173`.
- Comandos canônicos de lint, teste e build estão no `README.md` e no `package.json`.
- O fluxo principal do produto é enviar um briefing em `#contato`. Não há e-mail server-side: o formulário valida no cliente, mostra a confirmação e monta um `mailto:`.
- Fontes do Google Fonts são carregadas no `index.html`. Sem rede para `fonts.googleapis.com` / `fonts.gstatic.com` o layout ainda funciona, só cai no fallback do sistema.
