/**
 * Fonte única de conteúdo do portfólio.
 * Edite aqui para atualizar textos, skills, projetos e links sem mexer no layout.
 */

export type SkillLevel = 1 | 2 | 3 | 4 | 5;

export interface Skill {
  name: string;
  level: SkillLevel;
}

export interface SkillGroup {
  id: "frontend" | "backend" | "mobile" | "ai" | "agents" | "devops";
  label: string;
  skills: Skill[];
}

export interface Qualification {
  kind: "formacao" | "certificacao" | "curso";
  title: string;
  issuer: string;
  year: string;
}

export interface Metric {
  value: string;
  label: string;
}

export interface Project {
  title: string;
  kind: string;
  tags: string[];
  problem: string;
  solution: string;
  /** Gradiente usado como preview quando não há imagem. */
  accent: string;
  image?: string;
  /** Destaque: card grande no grid. Os demais aparecem em formato compacto. */
  featured?: boolean;
  liveUrl?: string;
  repoUrl?: string;
}

export interface TimelineItem {
  period: string;
  title: string;
  org: string;
  description: string;
  tags: string[];
}

export interface SocialLink {
  id: "github" | "linkedin" | "email" | "whatsapp";
  label: string;
  href: string;
}

export const portfolioData = {
  name: "Antonio Junior",
  brand: "Devtec",
  role: "Desenvolvedor Full Stack",
  specialty: "Sites, sistemas, apps e IA sob medida",
  bio: "Desenvolvo sites, sistemas e apps sob medida — da primeira conversa ao software rodando em produção. Cada projeto é conduzido de ponta a ponta por quem escreve o código, sem repasse e sem telefone sem fio.",
  availability: "Disponível para novos projetos",
  location: "Brasil",
  cvUrl: "#contato",
  /** Fixo: ler a data em render bloqueia o prerender do Next 16 (Cache Components). */
  copyrightYear: 2026,

  skillGroups: [
    {
      id: "frontend",
      label: "Front-end",
      skills: [
        { name: "React", level: 5 },
        { name: "Next.js", level: 5 },
        { name: "TypeScript", level: 5 },
        { name: "Tailwind CSS", level: 4 },
      ],
    },
    {
      id: "backend",
      label: "Back-end",
      skills: [
        { name: "Node.js", level: 4 },
        { name: "Supabase", level: 4 },
        { name: "PostgreSQL", level: 4 },
        { name: "APIs REST", level: 4 },
      ],
    },
    {
      id: "mobile",
      label: "Mobile",
      skills: [
        { name: "React Native", level: 4 },
        { name: "Expo", level: 4 },
        { name: "Firebase", level: 3 },
        { name: "PWA", level: 5 },
      ],
    },
    {
      id: "ai",
      label: "IA & RAG",
      skills: [
        { name: "RAG (Retrieval-Augmented Generation)", level: 4 },
        { name: "Embeddings & busca vetorial", level: 4 },
        { name: "Claude API / Claude Code", level: 5 },
        { name: "WhatsApp API", level: 4 },
      ],
    },
    {
      id: "agents",
      label: "Arquitetura multi-agente",
      skills: [
        { name: "Orquestração de agentes", level: 5 },
        { name: "MCP (Model Context Protocol)", level: 5 },
        { name: "Claude · Codex · Gemini CLI", level: 5 },
        { name: "Tauri + Node sidecar", level: 4 },
      ],
    },
    {
      id: "devops",
      label: "DevOps",
      skills: [
        { name: "Docker", level: 3 },
        { name: "Vercel", level: 5 },
        { name: "Git / CI", level: 4 },
      ],
    },
  ] satisfies SkillGroup[],

  // TODO(Antonio): substituir pelos seus cursos e certificações reais.
  qualifications: [
    { kind: "formacao", title: "Análise e Desenvolvimento de Sistemas", issuer: "Graduação", year: "—" },
    { kind: "certificacao", title: "Desenvolvimento Full Stack com React & Node", issuer: "Certificação", year: "—" },
    { kind: "curso", title: "Engenharia de IA aplicada com Claude", issuer: "Curso livre", year: "—" },
  ] satisfies Qualification[],

  metrics: [
    { value: "10+", label: "projetos no ar" },
    { value: "1", label: "ponto de contato, da conversa ao suporte" },
    { value: "0", label: "surpresas: escopo, prazo e preço fechados antes" },
    { value: "100%", label: "do código escrito por quem atende você" },
  ] satisfies Metric[],

  differentials: [
    "Ponta a ponta: briefing, código, deploy e suporte",
    "IA integrada ao fluxo do cliente: RAG, Claude e WhatsApp",
    "Arquitetura multi-agente: orquestradores com squads de Claude, Codex e Gemini",
    "Performance e SEO como requisito, não extra",
  ],

  projects: [
    {
      title: "Maestro",
      kind: "App desktop · Orquestração multi-agente",
      tags: ["Tauri 2", "Claude Code", "Codex", "Gemini CLI", "git worktree"],
      problem: "Coordenar várias IAs de código no mesmo projeto vira um terminal solto por agente, sem plano, revisão nem desfazer.",
      solution: "Orquestrador que lê o projeto, monta um squad de até 12 subagentes isolados em worktrees e executa planos aprovados com testes, memória e recados entre agentes.",
      accent: "from-amber-500/40 via-indigo-500/20 to-transparent",
      featured: true,
      repoUrl: "https://github.com/Naggin/maestro-releases",
    },
    {
      title: "Little Learners Planner",
      kind: "Produto · EdTech + IA",
      tags: ["Web app", "IA", "PDF", "WhatsApp"],
      problem: "Professoras de educação infantil gastavam a noite montando planos de aula bilíngues e pareceres.",
      solution: "Gera a semana de aulas, pareceres descritivos e flashcards em minutos, com export em PDF e envio por WhatsApp.",
      accent: "from-amber-500/40 via-orange-500/20 to-transparent",
      featured: true,
      liveUrl: "https://www.littlelearnersplanner.com.br/home",
    },
    {
      title: "CasaOS",
      kind: "Web app · PWA",
      tags: ["Next.js", "Supabase", "Realtime", "PWA"],
      problem: "Compras, finanças, agenda e tarefas da casa espalhadas em vários apps.",
      solution: "Um app só, instalável, em que quem mora junto vê a mesma lista atualizada em tempo real.",
      accent: "from-violet-500/40 via-indigo-500/20 to-transparent",
      featured: true,
      liveUrl: "https://casa-os-zeta.vercel.app",
    },
    {
      title: "Prumo",
      kind: "Web app · Gestão de banca",
      tags: ["TypeScript", "Dashboard", "NBA"],
      problem: "Apostar sem controle de banca nem visão dos jogos leva a decisões no impulso.",
      solution: "Centro de controle com gestão de banca, calendário da NBA e cinco ligas europeias.",
      accent: "from-emerald-500/40 via-teal-500/20 to-transparent",
      liveUrl: "https://banca-hub-tau.vercel.app",
    },
    {
      title: "Juliana Queiroz",
      kind: "Site de cliente",
      tags: ["Next.js", "TypeScript", "Tailwind", "MDX"],
      problem: "Famílias não entendiam o atendimento e precisavam ligar antes de agendar.",
      solution: "Site institucional com serviços e blog que leva o visitante direto ao contato.",
      accent: "from-teal-500/40 via-emerald-500/20 to-transparent",
      featured: true,
      liveUrl: "https://juliana-queiroz.vercel.app",
    },
    {
      title: "RQ Importados",
      kind: "Catálogo · Vendas por WhatsApp",
      tags: ["JavaScript", "Catálogo", "WhatsApp"],
      problem: "Vender perfumes mandando foto por foto no Instagram não escala.",
      solution: "Catálogo online em que o cliente escolhe os perfumes e finaliza o pedido pelo WhatsApp.",
      accent: "from-rose-500/40 via-amber-500/20 to-transparent",
      liveUrl: "https://catalogo-perfumes-ig.vercel.app",
    },
    {
      title: "Livro Mágico",
      kind: "Livro digital · Escola Infantil Canguru",
      tags: ["JavaScript", "Bilíngue", "Storytelling"],
      problem: "A memória do ano da turma ficava presa em papel e fotos soltas.",
      solution: "Livro encantado digital do ano da turma, para compartilhar com as famílias.",
      accent: "from-fuchsia-500/40 via-amber-500/20 to-transparent",
      liveUrl: "https://livro-magico.vercel.app",
    },
    {
      title: "SuporteTI",
      kind: "Site institucional",
      tags: ["React", "TypeScript", "Vite"],
      problem: "Pedidos de suporte chegavam desorganizados pelo telefone.",
      solution: "Site com fluxo de contato que organiza o pedido antes de chegar ao técnico.",
      accent: "from-orange-500/40 via-rose-500/20 to-transparent",
      liveUrl: "https://siteparasuportetcnico.vercel.app",
      repoUrl: "https://github.com/Naggin/Siteparasuportetcnico",
    },  ] satisfies Project[],

  // TODO(Antonio): ajustar períodos e cargos reais.
  timeline: [
    {
      period: "2026 — hoje",
      title: "Fundador & Desenvolvedor Full Stack",
      org: "Devtec",
      description: "Sites, sistemas e apps sob medida com IA integrada, do briefing ao deploy.",
      tags: ["Next.js", "Supabase", "Claude AI"],
    },
    {
      period: "2026",
      title: "Arquitetura multi-agente & RAG",
      org: "Maestro · AI Cockpit",
      description: "Orquestradores locais que coordenam squads de Claude, Codex e Gemini via MCP, com worktrees isolados, memória compartilhada e RAG sobre o contexto do projeto.",
      tags: ["MCP", "RAG", "Tauri", "Multi-agente"],
    },
    {
      period: "2025 — 2026",
      title: "Produtos próprios",
      org: "Little Learners Planner · CasaOS",
      description: "Concepção e entrega de produtos web/PWA em produção com usuários reais.",
      tags: ["PWA", "Realtime", "EdTech"],
    },
    {
      period: "2024 — 2025",
      title: "Desenvolvedor Web",
      org: "Projetos para clientes",
      description: "Sites institucionais rápidos, com SEO e contato direto para o cliente final.",
      tags: ["React", "Vite", "SEO"],
    },
    {
      period: "Formação",
      title: "Análise e Desenvolvimento de Sistemas",
      org: "Graduação",
      description: "Base em engenharia de software, banco de dados e arquitetura de sistemas.",
      tags: ["Engenharia", "SQL"],
    },
  ] satisfies TimelineItem[],

  links: [
    { id: "github", label: "github.com/Naggin", href: "https://github.com/Naggin" },
    // TODO(Antonio): confirmar URL do LinkedIn e número do WhatsApp.
    { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/" },
    { id: "email", label: "antoniocjr1998@gmail.com", href: "mailto:antoniocjr1998@gmail.com" },
    { id: "whatsapp", label: "WhatsApp", href: "https://wa.me/" },
  ] satisfies SocialLink[],

  navItems: [
    { href: "#skills", label: "Skills" },
    { href: "#projetos", label: "Projetos" },
    { href: "#trajetoria", label: "Trajetória" },
    { href: "#contato", label: "Contato" },
  ],
} as const;

export type PortfolioData = typeof portfolioData;
