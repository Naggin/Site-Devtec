export type Locale = "pt-BR" | "en";

export type NavItem = { href: string; label: string };

export type ProofPoint = {
  value: string;
  label: string;
  detail: string;
  href: string;
};

export type Stack = {
  id: "fullstack" | "mobile" | "ai" | "infra";
  label: string;
  tech: readonly string[];
  output: string;
};

export type PipelineStep = { label: string };

export type DeployStep = { label: string; text: string };

export type DependencyNode = { id: string; label: string; sub: string };

export type BentoItem = {
  id: string;
  span: "wide" | "tall" | "normal";
  title: string;
  tech: readonly string[];
  snippet: string;
};

export type CiCheck = { name: string; detail: string };

export type GitCommit = { hash: string; message: string; date: string };

export type ProcessStep = { num: string; title: string; text: string };

export type Deliverable = { title: string; text: string };

export type FaqItem = { question: string; answer: string };

export type Service = {
  code: string;
  command: string;
  title: string;
  text: string;
  tags: readonly string[];
};

export type Project = {
  title: string;
  kind: string;
  updated: string;
  stack: readonly string[];
  summary: string;
  outcome: string;
  href: string;
  hrefLabel: string;
  repo?: string;
  live: boolean;
};

export type Translation = {
  meta: {
    lang: Locale;
    title: string;
    description: string;
    ogLocale: string;
    ogDescription: string;
    ogImageAlt: string;
    jobTitle: string;
  };
  a11y: {
    skipLink: string;
    openMenu: string;
    closeMenu: string;
    navPrimary: string;
    navMobile: string;
    proofStrip: string;
    stackPanel: string;
    stackCategories: string;
    stackPipeline: string;
    dependencyGraph: string;
    servicesList: string;
    openCommit: string;
    viewCode: string;
    switchToEn: string;
    switchToPt: string;
    languageChanged: string;
    languageChangedEn: string;
    noSignal: string;
  };
  profile: {
    brand: string;
    name: string;
    role: string;
    tagline: string;
    location: string;
  };
  navItems: readonly NavItem[];
  proofPoints: readonly ProofPoint[];
  stacks: readonly Stack[];
  stackPipeline: readonly PipelineStep[];
  deploySteps: readonly DeployStep[];
  dependencyNodes: readonly DependencyNode[];
  bentoItems: readonly BentoItem[];
  ciChecks: readonly CiCheck[];
  ciRepo: { label: string; repo: string; href: string };
  gitTimeline: { repo: string; branch: string; href: string; commitBase: string };
  gitCommits: readonly GitCommit[];
  processSteps: readonly ProcessStep[];
  deliverables: readonly Deliverable[];
  faq: readonly FaqItem[];
  services: readonly Service[];
  projects: readonly Project[];
  projectTypes: readonly string[];
  hero: {
    badge: string;
    lineWhite1: string;
    lineRed: string;
    lineWhite2: string;
    subStrong: string;
    subRest: string;
    ctaPrimary: string;
    ctaSecondary: string;
    scrollHint: string;
  };
  sections: {
    about: { kicker: string; title: string; sub: string };
    services: { kicker: string; title: string; modules: string };
    projects: {
      kicker: string;
      title: string;
      sub: string;
      showcaseLabel: string;
      liveBadge: string;
    };
    process: {
      kicker: string;
      title: string;
      sub: string;
      deliverablesTitle: string;
      faqTitle: string;
    };
    contact: {
      kicker: string;
      title: string;
      sub: string;
      note: string;
      nameLabel: string;
      emailLabel: string;
      projectTypeLabel: string;
      messageLabel: string;
      selectPlaceholder: string;
      messagePlaceholder: string;
      submit: string;
      footNote: string;
      missingFields: (count: number) => string;
      successKicker: string;
      successTitle: (firstName: string) => string;
      successBody: string;
      successType: string;
      successEmail: string;
      openEmail: string;
    };
  };
  footer: { email: string };
  terminal: {
    deployTitle: string;
    runDeploy: string;
    running: string;
  };
  statusBoard: { passing: string; idle: string; footer: string };
  contactErrors: {
    name: string;
    email: string;
    projectType: string;
    message: string;
  };
  mailto: {
    subject: (projectType: string, name: string) => string;
    bodyLabels: { name: string; email: string; type: string };
  };
};
