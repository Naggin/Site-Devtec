export const profile = {
  brand: "Devtec",
  name: "Antonio Junior",
  role: "Desenvolvedor full-stack",
  tagline: "Software que resolve o dia a dia.",
  location: "Brasil",
  email: "antoniocjr1998@gmail.com",
  github: "https://github.com/Naggin",
  githubLabel: "github.com/Naggin",
};

export const navItems = [
  { href: "#sobre", label: "Sobre" },
  { href: "#servicos", label: "Serviços" },
  { href: "#projetos", label: "Projetos" },
  { href: "#contato", label: "Contato" },
] as const;

export const services = [
  {
    code: "01",
    title: "Web & produtos digitais",
    text: "Sites, dashboards e aplicações com React, Next.js e TypeScript — da landing ao sistema em produção.",
  },
  {
    code: "02",
    title: "Apps mobile",
    text: "Aplicativos iOS e Android com React Native e Expo, autenticação, tempo real e uma UX que as pessoas usam de verdade.",
  },
  {
    code: "03",
    title: "Full-stack & dados",
    text: "APIs, bancos PostgreSQL, autenticação e integrações. Do backend ao painel que o cliente abre todo dia.",
  },
  {
    code: "04",
    title: "IA aplicada",
    text: "Fluxos com modelos de linguagem no produto — WhatsApp, extração de texto, copilots — sem enrolação.",
  },
  {
    code: "05",
    title: "Suporte e consultoria",
    text: "Infra, manutenção e orientação técnica para quem precisa de alguém que realmente entende o problema.",
  },
  {
    code: "06",
    title: "Desktop & tooling",
    text: "Ferramentas nativas e instaladores (Tauri e afins) para times que precisam de um app de verdade na máquina.",
  },
] as const;

export const projects = [
  {
    year: "2026",
    title: "Moneyzin",
    kind: "Finanças pessoais",
    stack: ["Next.js", "Prisma", "Supabase", "Claude AI"],
    summary:
      "Controle financeiro com dashboard, metas e lançamento de gastos pelo WhatsApp com IA. O usuário manda “50 mercado” e a transação entra sozinha.",
    href: "https://moneyzin.vercel.app",
    repo: "https://github.com/Naggin/moneyzin",
    live: true,
  },
  {
    year: "2026",
    title: "JantaJá",
    kind: "App mobile",
    stack: ["React Native", "Expo", "Firebase"],
    summary:
      "App para casais planejarem o jantar da semana e a lista de compras em tempo real — convite, aprovação e lista compartilhada.",
    href: "https://github.com/Naggin/Jantaja",
    repo: "https://github.com/Naggin/Jantaja",
    live: false,
  },
  {
    year: "2026",
    title: "Debt Manager",
    kind: "Gestão financeira",
    stack: ["JavaScript", "Full-stack"],
    summary:
      "Aplicação full-stack para organizar dívidas, acompanhar vencimentos e ter clareza do que precisa ser pago.",
    href: "https://github.com/Naggin/debt-manager",
    repo: "https://github.com/Naggin/debt-manager",
    live: false,
  },
  {
    year: "2026",
    title: "SuporteTI",
    kind: "Site institucional",
    stack: ["React", "TypeScript", "Vite"],
    summary:
      "Presença digital para suporte técnico: remoto, consultoria, segurança e manutenção preventiva, com fluxo claro de contato.",
    href: "https://siteparasuportetcnico.vercel.app",
    repo: "https://github.com/Naggin/Siteparasuportetcnico",
    live: true,
  },
  {
    year: "2026",
    title: "AI Cockpit",
    kind: "App desktop",
    stack: ["Tauri", "Updater"],
    summary:
      "Aplicativo desktop com atualização automática. Os instaladores públicos ficam em repositório próprio para o updater baixar com segurança.",
    href: "https://github.com/Naggin/IAcockpit-releases",
    repo: "https://github.com/Naggin/IAcockpit-releases",
    live: false,
  },
] as const;

export const projectTypes = [
  "Site institucional",
  "Produto web / SaaS",
  "App mobile",
  "Sistema interno",
  "Integração com IA",
  "Consultoria / suporte",
  "Outro",
] as const;

export type ProjectType = (typeof projectTypes)[number];
