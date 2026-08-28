import { projects, type Project } from "../data";

export default function Projects() {
  return (
    <section className="section section-border" id="projetos">
      <div className="wrap">
        <p className="kicker reveal">03 / Projetos</p>
        <h2 className="section-title reveal" data-delay="1">
          Trabalhos no ar.
        </h2>

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
          {project.year} · {project.kind}
        </span>
        {project.live ? <span className="badge">Ao vivo</span> : null}
      </div>

      <h3>{project.title}</h3>
      <p>{project.summary}</p>

      <div className="stack">
        {project.stack.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>

      <div className="project-links">
        <a href={project.href} target="_blank" rel="noreferrer">
          {project.live ? "Abrir site" : "Ver no GitHub"}
        </a>
        {project.repo ? (
          <a href={project.repo} target="_blank" rel="noreferrer">
            Código
          </a>
        ) : null}
      </div>
    </article>
  );
}
