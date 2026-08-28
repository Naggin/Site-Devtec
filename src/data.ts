export const profile = {
  brand: "Devtec",
  name: "Antonio Junior",
  role: "Desenvolvedor full-stack",
  tagline: "Software que resolve o dia a dia.",
  location: "Brasil",
  email: "antoniocjr1998@gmail.com",
  github: "https://github.com/Naggin",
  githubLabel: "github.com/Naggin",
  site: "https://ajrdevtec.vercel.app",
};

export const navItems = [
  { href: "#sobre", label: "Sobre" },
  { href: "#servicos", label: "Serviços" },
  { href: "#projetos", label: "Projetos" },
  { href: "#processo", label: "Processo" },
  { href: "#contato", label: "Contato" },
] as const;

/**
 * Números conferíveis: cada item aponta para a fonte pública que o comprova.
 * Se um projeto sair do ar ou uma release nova subir, atualize aqui.
 */
export const proofPoints = [
  {
    value: "3",
    label: "produtos no ar agora",
    detail: "Little Learners Planner, Moneyzin e SuporteTI — todos abrem em produção.",
    href: "#projetos",
  },
  {
    value: "11",
    label: "versões publicadas",
    detail: "AI Cockpit, app desktop com updater automático até a v1.11.0.",
    href: "https://github.com/Naggin/IAcockpit-releases/releases",
  },
  {
    value: "5",
    label: "projetos de código aberto",
    detail: "Dá para ler cada linha antes de falar comigo.",
    href: "https://github.com/Naggin?tab=repositories",
  },
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
  { label: "ideia" },
  { label: "código" },
  { label: "deploy" },
  { label: "produto" },
] as const;

export const deploySteps = [
  { label: "install", text: "Resolving dependencies…" },
  { label: "build", text: "Compiling TypeScript + Vite bundle…" },
  { label: "test", text: "Running vitest — 20 passed" },
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
    title: "Web & SaaS",
    tech: ["React", "Next.js", "TS"],
    snippet: "export default function App() {\n  return <Dashboard />;\n}",
  },
  {
    id: "mobile",
    span: "tall",
    title: "Mobile",
    tech: ["Expo", "RN", "Firebase"],
    snippet: "const app = await Expo\n  .build({ platform: 'all' });",
  },
  {
    id: "ai",
    span: "normal",
    title: "IA aplicada",
    tech: ["Claude", "NLP"],
    snippet: "const reply = await ai\n  .chat({ channel: 'wa' });",
  },
  {
    id: "api",
    span: "normal",
    title: "APIs",
    tech: ["Node", "Prisma"],
    snippet: "app.get('/api/data',\n  async (req, res) => …);",
  },
  {
    id: "infra",
    span: "wide",
    title: "Infra & deploy",
    tech: ["Docker", "Vercel", "CI/CD"],
    snippet: "vercel deploy --prod\n# ✓ build · test · deploy",
  },
  {
    id: "desktop",
    span: "normal",
    title: "Desktop",
    tech: ["Tauri", "Rust"],
    snippet: "tauri build --release\n# installer ready",
  },
] as const;

/**
 * O pipeline deste site, não um enfeite: os valores saem de
 * `npm run lint`, `npm test` e `npm run build` neste repositório.
 */
export const ciChecks = [
  { name: "lint", detail: "0 problemas" },
  { name: "test", detail: "20 passaram" },
  { name: "build", detail: "72 kB gzip" },
  { name: "deploy", detail: "Vercel" },
] as const;

export const ciRepo = {
  label: "CI/CD — este site",
  repo: "Naggin/site-devtec",
  href: "https://github.com/Naggin/site-devtec",
};

/**
 * Commits reais de github.com/Naggin/moneyzin (branch main).
 * Cada hash abre o commit no GitHub — é para ser conferido.
 */
export const gitTimeline = {
  repo: "Naggin/moneyzin",
  branch: "main",
  href: "https://github.com/Naggin/moneyzin",
  commitBase: "https://github.com/Naggin/moneyzin/commit/",
};

export const gitCommits = [
  {
    hash: "7caada3",
    message: "feat: favicon, OG tags, loading de transações e página 404",
    date: "13 mai 2026",
  },
  {
    hash: "896ec29",
    message: "feat: metas corrigidas, gráficos alternáveis e dashboard arrastável",
    date: "13 mai 2026",
  },
  {
    hash: "db8f24b",
    message: "perf: layout server component + loading states para metas e settings",
    date: "13 mai 2026",
  },
  {
    hash: "11d5b8b",
    message: "perf: cache de queries Prisma + remove currentUser() do hot path",
    date: "13 mai 2026",
  },
  {
    hash: "70eb5f1",
    message: "fix: corrige crash do dashboard ao desserializar Decimal do cache",
    date: "15 mai 2026",
  },
] as const;

export const processSteps = [
  {
    num: "01",
    title: "Entender o problema",
    text: "Uma conversa para virar o seu problema em escopo: o que entra, o que fica para depois e o que dá para cortar sem perder o essencial.",
  },
  {
    num: "02",
    title: "Combinar antes de começar",
    text: "Escopo, prazo e preço fechados por escrito. Você aprova sabendo o que vai receber — sem surpresa no meio do caminho.",
  },
  {
    num: "03",
    title: "Entregar em pedaços",
    text: "Versões curtas no ar para você usar e opinar cedo. Mudança de rumo custa barato no começo e caro no final.",
  },
  {
    num: "04",
    title: "Continuar depois do deploy",
    text: "Documentação, acompanhamento e manutenção combinada. Produto que roda de verdade sempre pede ajuste.",
  },
] as const;

export const deliverables = [
  {
    title: "O código no seu repositório",
    text: "Seu nome no repositório desde o primeiro commit. Nada fica preso comigo.",
  },
  {
    title: "No ar, não só na sua mão",
    text: "Domínio, HTTPS e publicação configurados. A entrega é o produto rodando.",
  },
  {
    title: "Stack padrão de mercado",
    text: "React, Node e Postgres. Qualquer desenvolvedor consegue continuar depois.",
  },
  {
    title: "Acompanhamento pós-entrega",
    text: "Documentação e um período de suporte para ajustar o que a vida real mostrar.",
  },
] as const;

export const faq = [
  {
    question: "Ainda não sei direito o que eu preciso.",
    answer:
      "Isso é o normal, não a exceção. A primeira conversa serve justamente para separar o problema da solução. Você descreve o incômodo do dia a dia e eu volto com uma proposta de escopo — inclusive dizendo o que não vale a pena construir agora.",
  },
  {
    question: "Quanto tempo leva e quanto custa?",
    answer:
      "Depende do escopo, e você descobre antes de assinar qualquer coisa. Prazo e preço vão fechados na proposta, junto com a lista do que está incluído. Se algo mudar no caminho, a gente combina de novo antes de eu escrever a primeira linha.",
  },
  {
    question: "E se eu quiser mudar algo no meio?",
    answer:
      "Mudança faz parte de todo projeto que dá certo. Por isso eu entrego em versões curtas: você vê o produto cedo, opina enquanto ajustar ainda é barato, e não descobre o que faltava só no dia da entrega.",
  },
  {
    question: "O código é meu mesmo?",
    answer:
      "É. Repositório no seu nome, ferramentas padrão de mercado e nenhuma dependência proprietária minha. Se um dia você quiser levar o projeto para outro time, é só dar acesso — sem taxa e sem migração.",
  },
  {
    question: "Você some depois de entregar?",
    answer:
      "Não. Toda entrega vem com documentação e um período de acompanhamento, e a partir daí dá para combinar manutenção contínua. Vários dos projetos aqui do portfólio continuam recebendo commit hoje.",
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
  title: string;
  kind: string;
  /** Último sinal público de atividade — data real do GitHub ou do site no ar. */
  updated: string;
  stack: readonly string[];
  summary: string;
  /** O que o produto resolve para quem usa. */
  outcome: string;
  href: string;
  hrefLabel: string;
  /** Só quando o código fica em endereço diferente do link principal. */
  repo?: string;
  live: boolean;
};

export const projects: Project[] = [
  {
    title: "Little Learners Planner",
    kind: "Produto entregue",
    updated: "no ar",
    stack: ["Web app", "Vercel", "EdTech"],
    summary: "Planos de aula, pareceres e flashcards em minutos. PDF e WhatsApp.",
    outcome: "Devolve para a professora a noite que ela passaria montando plano de aula.",
    href: "https://www.littlelearnersplanner.com.br/home",
    hrefLabel: "Abrir site",
    live: true,
  },
  {
    title: "Moneyzin",
    kind: "Finanças pessoais",
    updated: "mai 2026",
    stack: ["Next.js", "Prisma", "Supabase", "Claude AI"],
    summary: "Dashboard financeiro e gastos registrados por mensagem no WhatsApp.",
    outcome: "Registrar um gasto vira uma frase no WhatsApp, e a categoria sai pronta.",
    href: "https://moneyzin.vercel.app",
    hrefLabel: "Abrir site",
    repo: "https://github.com/Naggin/moneyzin",
    live: true,
  },
  {
    title: "SuporteTI",
    kind: "Site institucional",
    updated: "mai 2026",
    stack: ["React", "TypeScript", "Vite"],
    summary: "Site de suporte técnico com fluxo de contato direto.",
    outcome: "Tira o atendimento do telefone e organiza o pedido antes de chegar.",
    href: "https://siteparasuportetcnico.vercel.app",
    hrefLabel: "Abrir site",
    repo: "https://github.com/Naggin/Siteparasuportetcnico",
    live: true,
  },
  {
    title: "AI Cockpit",
    kind: "App desktop · v1.11.0",
    updated: "ago 2026",
    stack: ["Tauri", "Rust", "Updater"],
    summary: "App desktop com instalador e atualização automática.",
    outcome: "11 versões publicadas: o usuário abre o app e ele já se atualiza sozinho.",
    href: "https://github.com/Naggin/IAcockpit-releases/releases",
    hrefLabel: "Ver releases",
    live: false,
  },
  {
    title: "JantaJá",
    kind: "App mobile",
    updated: "mai 2026",
    stack: ["React Native", "Expo", "Firebase"],
    summary: "Jantar da semana e lista de compras sincronizados em tempo real.",
    outcome: "Acaba a pergunta das 19h: o cardápio já está decidido e a lista pronta.",
    href: "https://github.com/Naggin/Jantaja",
    hrefLabel: "Ver código",
    live: false,
  },
  {
    title: "Debt Manager",
    kind: "Gestão financeira",
    updated: "mai 2026",
    stack: ["JavaScript", "Full-stack"],
    summary: "Organiza dívidas e acompanha vencimentos em um lugar só.",
    outcome: "Mostra o que vence primeiro em vez de deixar a conta aparecer de surpresa.",
    href: "https://github.com/Naggin/debt-manager",
    hrefLabel: "Ver código",
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
