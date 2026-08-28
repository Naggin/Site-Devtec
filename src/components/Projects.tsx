import type { Project } from "../i18n/types";
import GitTimeline from "./GitTimeline";
import { useLanguage } from "../i18n/useLanguage";

export default function Projects() {
  const { t } = useLanguage();

  return (
    <section className="section section-border" id="projetos">
      <div className="wrap">
        <p className="kicker reveal">{t.sections.projects.kicker}</p>
        <h2 className="section-title reveal" data-delay="1">
          {t.sections.projects.title}
        </h2>
        <p className="section-sub reveal" data-delay="2">
          {t.sections.projects.sub}
        </p>

        <div className="projects-showcase reveal" data-delay="2">
          <p className="projects-showcase-label">{t.sections.projects.showcaseLabel}</p>
          <GitTimeline />
        </div>

        <div className="project-grid">
          {t.projects.map((project, i) => (
            <ProjectCard
              key={project.title}
              project={project}
              delay={(i % 2) + 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, delay }: { project: Project; delay: number }) {
  const { t } = useLanguage();

  return (
    <article className="project-card reveal" data-delay={String(delay)}>
      <div className="project-meta">
        <span>
          {project.kind} · {project.updated}
        </span>
        {project.live ? <span className="badge">{t.sections.projects.liveBadge}</span> : null}
      </div>

      <h3>{project.title}</h3>
      <p>{project.summary}</p>
      <p className="project-outcome">{project.outcome}</p>

      <div className="stack">
        {project.stack.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>

      <div className="project-links">
        <a href={project.href} target="_blank" rel="noreferrer">
          {project.hrefLabel}
          <span className="sr-only"> — {project.title}</span>
        </a>
        {project.repo ? (
          <a href={project.repo} target="_blank" rel="noreferrer">
            {t.a11y.viewCode}
            <span className="sr-only"> de {project.title}</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
