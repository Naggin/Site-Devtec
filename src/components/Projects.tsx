import { projects, type Project } from "../data";
import GitTimeline from "./GitTimeline";

export default function Projects() {
  return (
    <section className="section section-border" id="projetos">
      <div className="wrap">
        <p className="kicker reveal">03 / Projetos</p>
        <h2 className="section-title reveal" data-delay="1">
          Trabalhos no ar.
        </h2>
        <p className="section-sub reveal" data-delay="2">
          Três deles você abre agora, no navegador. O resto está com o código aberto
          para você ler antes de me contratar.
        </p>

        <div className="projects-showcase reveal" data-delay="2">
          <p className="projects-showcase-label">Commits reais, direto do GitHub</p>
          <GitTimeline />
        </div>

        <div className="project-grid">
          {projects.map((project, i) => (
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
  return (
    <article className="project-card reveal" data-delay={String(delay)}>
      <div className="project-meta">
        <span>
          {project.kind} · {project.updated}
        </span>
        {project.live ? <span className="badge">Ao vivo</span> : null}
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
            Ver código
            <span className="sr-only"> de {project.title}</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
