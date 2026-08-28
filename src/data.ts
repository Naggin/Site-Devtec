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
    text: "Sites, dashboards e apps com React e Next.js.",
  },
  {
    code: "02",
    title: "Apps mobile",
    text: "iOS e Android com React Native e Expo.",
  },
  {
    code: "03",
    title: "Full-stack & dados",
    text: "APIs, banco e painel em produção.",
  },
  {
    code: "04",
    title: "IA aplicada",
    text: "WhatsApp, NLP e copilots no produto.",
  },
  {
    code: "05",
    title: "Suporte e consultoria",
    text: "Infra, manutenção e orientação técnica.",
  },
  {
    code: "06",
    title: "Desktop & tooling",
    text: "Apps nativos e instaladores com Tauri.",
  },
] as const;

export type Project = {
  year: string;
  title: string;
  kind: string;
  stack: readonly string[];
  summary: string;
  href: string;
  repo?: string;
  live: boolean;
};

export const projects: Project[] = [
  {
    year: "2026",
    title: "Little Learners Planner",
    kind: "Produto entregue",
    stack: ["Web app", "Vercel", "EdTech"],
    summary: "Planos de aula, pareceres e flashcards em minutos. PDF e WhatsApp.",
    href: "https://www.littlelearnersplanner.com.br/home",
    live: true,
  },
  {
    year: "2026",
    title: "Moneyzin",
    kind: "Finanças pessoais",
    stack: ["Next.js", "Prisma", "Supabase", "Claude AI"],
    summary: "Dashboard financeiro e gastos via WhatsApp com IA.",
    href: "https://moneyzin.vercel.app",
    repo: "https://github.com/Naggin/moneyzin",
    live: true,
  },
  {
    year: "2026",
    title: "JantaJá",
    kind: "App mobile",
    stack: ["React Native", "Expo", "Firebase"],
    summary: "Jantar da semana e lista de compras em tempo real.",
    href: "https://github.com/Naggin/Jantaja",
    repo: "https://github.com/Naggin/Jantaja",
    live: false,
  },
  {
    year: "2026",
    title: "Debt Manager",
    kind: "Gestão financeira",
    stack: ["JavaScript", "Full-stack"],
    summary: "Organize dívidas e acompanhe vencimentos.",
    href: "https://github.com/Naggin/debt-manager",
    repo: "https://github.com/Naggin/debt-manager",
    live: false,
  },
  {
    year: "2026",
    title: "SuporteTI",
    kind: "Site institucional",
    stack: ["React", "TypeScript", "Vite"],
    summary: "Site de suporte técnico com fluxo de contato.",
    href: "https://siteparasuportetcnico.vercel.app",
    repo: "https://github.com/Naggin/Siteparasuportetcnico",
    live: true,
  },
  {
    year: "2026",
    title: "AI Cockpit",
    kind: "App desktop",
    stack: ["Tauri", "Updater"],
    summary: "App desktop com atualização automática.",
    href: "https://github.com/Naggin/IAcockpit-releases",
    repo: "https://github.com/Naggin/IAcockpit-releases",
    live: false,
  },
];

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
