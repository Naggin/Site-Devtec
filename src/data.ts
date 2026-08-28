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

export const deploySteps = [
  { label: "install", text: "Resolving dependencies…" },
  { label: "build", text: "Compiling TypeScript + Vite bundle…" },
  { label: "test", text: "Running vitest — 6 passed" },
  { label: "deploy", text: "Publishing to Vercel production…" },
  { label: "live", text: "✓ Deploy complete — produto no ar" },
] as const;

export const dependencyNodes = [
  { id: "react", label: "React", sub: "UI + estado" },
  { id: "api", label: "API", sub: "Node / Next.js" },
  { id: "db", label: "DB", sub: "Prisma + Postgres" },
  { id: "deploy", label: "Deploy", sub: "Vercel / Docker" },
] as const;

export const bentoItems = [
  {
    id: "web",
    span: "wide",
    icon: "⚛",
    title: "Web & SaaS",
    tech: ["React", "Next.js", "TS"],
    snippet: "export default function App() {\n  return <Dashboard />;\n}",
  },
  {
    id: "mobile",
    span: "tall",
    icon: "📱",
    title: "Mobile",
    tech: ["Expo", "RN", "Firebase"],
    snippet: "const app = await Expo\n  .build({ platform: 'all' });",
  },
  {
    id: "ai",
    span: "normal",
    icon: "🤖",
    title: "IA aplicada",
    tech: ["Claude", "NLP"],
    snippet: "const reply = await ai\n  .chat({ channel: 'wa' });",
  },
  {
    id: "api",
    span: "normal",
    icon: "🔌",
    title: "APIs",
    tech: ["Node", "Prisma"],
    snippet: "app.get('/api/data',\n  async (req, res) => …);",
  },
  {
    id: "infra",
    span: "wide",
    icon: "☁",
    title: "Infra & deploy",
    tech: ["Docker", "Vercel", "CI/CD"],
    snippet: "vercel deploy --prod\n# ✓ build · test · deploy",
  },
  {
    id: "desktop",
    span: "normal",
    icon: "🖥",
    title: "Desktop",
    tech: ["Tauri", "Rust"],
    snippet: "tauri build --release\n# installer ready",
  },
] as const;

export const ciChecks = [
  { name: "build", duration: "12s", status: "passed" as const },
  { name: "test", duration: "4s", status: "passed" as const },
  { name: "lint", duration: "2s", status: "passed" as const },
  { name: "deploy", duration: "8s", status: "passed" as const },
] as const;

export const gitCommits = [
  {
    hash: "a3f91c2",
    message: "feat: dashboard financeiro com gráficos",
    date: "12 Jan 2026",
  },
  {
    hash: "7b2e4d0",
    message: "feat: integração WhatsApp para registrar gastos",
    date: "18 Jan 2026",
  },
  {
    hash: "c8f1a33",
    message: "feat: categorização automática com Claude AI",
    date: "02 Fev 2026",
  },
  {
    hash: "e4d9021",
    message: "fix: sync Prisma + Supabase em produção",
    date: "14 Fev 2026",
  },
  {
    hash: "1ac7f88",
    message: "chore: deploy Vercel — moneyzin.vercel.app",
    date: "20 Fev 2026",
  },
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
