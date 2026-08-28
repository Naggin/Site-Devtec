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

export const stacks = [
  {
    id: "fullstack",
    label: "Full-stack",
    tech: ["React", "Next.js", "TypeScript", "Node"],
    output: "Sites, dashboards e APIs em produção.",
  },
  {
    id: "mobile",
    label: "Mobile",
    tech: ["React Native", "Expo", "Firebase"],
    output: "Apps iOS e Android com sync em tempo real.",
  },
  {
    id: "ai",
    label: "IA",
    tech: ["Claude AI", "WhatsApp", "NLP"],
    output: "Copilots, bots e fluxos inteligentes no produto.",
  },
  {
    id: "infra",
    label: "Infra",
    tech: ["Docker", "Vercel", "consultoria"],
    output: "Deploy, monitoramento e suporte técnico.",
  },
] as const;

export const stackPipeline = [
  { icon: "💡", label: "ideia" },
  { icon: "⌨", label: "código" },
  { icon: "🚀", label: "deploy" },
  { icon: "✓", label: "produto" },
] as const;

export const processSteps = [
  {
    num: "01",
    title: "Entender o problema",
    text: "Briefing, escopo e prioridades claras antes de escrever código.",
  },
  {
    num: "02",
    title: "Prototipar rápido",
    text: "MVP funcional para validar fluxo, UX e integrações.",
  },
  {
    num: "03",
    title: "Entregar no ar",
    text: "Deploy, performance e documentação — produto pronto para uso.",
  },
  {
    num: "04",
    title: "Evoluir junto",
    text: "Manutenção, melhorias e suporte conforme o produto cresce.",
  },
] as const;

export const services = [
  {
    code: "01",
    command: "devtec build --web",
    title: "Web & produtos digitais",
    text: "Sites, dashboards e apps com React e Next.js.",
    tags: ["React", "Next.js", "TypeScript"],
  },
  {
    code: "02",
    command: "devtec build --mobile",
    title: "Apps mobile",
    text: "iOS e Android com React Native e Expo.",
    tags: ["React Native", "Expo", "Firebase"],
  },
  {
    code: "03",
    command: "devtec build --api",
    title: "Full-stack & dados",
    text: "APIs, banco e painel em produção.",
    tags: ["Node", "Prisma", "PostgreSQL"],
  },
  {
    code: "04",
    command: "devtec build --ai",
    title: "IA aplicada",
    text: "WhatsApp, NLP e copilots no produto.",
    tags: ["Claude AI", "WhatsApp", "NLP"],
  },
  {
    code: "05",
    command: "devtec ops --support",
    title: "Suporte e consultoria",
    text: "Infra, manutenção e orientação técnica.",
    tags: ["Docker", "Vercel", "DevOps"],
  },
  {
    code: "06",
    command: "devtec build --desktop",
    title: "Desktop & tooling",
    text: "Apps nativos e instaladores com Tauri.",
    tags: ["Tauri", "Rust", "Updater"],
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
