export type Locale = "pt-BR" | "en";

export type NavItem = { href: string; label: string };

export type Stack = {
  id: "fullstack" | "mobile" | "ai" | "infra";
  label: string;
  tech: readonly string[];
  output: string;
};

export type PipelineStep = { label: string };

export type GitCommit = { hash: string; message: string; date: string };

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
    stackPanel: string;
    stackCategories: string;
    stackPipeline: string;
    openCommit: string;
    viewCode: string;
    switchToEn: string;
    switchToPt: string;
    languageChanged: string;
    languageChangedEn: string;
  };
  profile: {
    brand: string;
    name: string;
    role: string;
    tagline: string;
    location: string;
  };
  navItems: readonly NavItem[];
  stacks: readonly Stack[];
  stackPipeline: readonly PipelineStep[];
  gitTimeline: { repo: string; branch: string; href: string; commitBase: string };
  gitCommits: readonly GitCommit[];
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
    projects: {
      kicker: string;
      title: string;
      sub: string;
      showcaseLabel: string;
      liveBadge: string;
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
