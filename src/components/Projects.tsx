import { projects } from "../data";

export default function Projects() {
  return (
    <section className="section" id="projetos">
      <div className="wrap">
        <p className="kicker">03 / Projetos</p>
        <h2>Trabalhos recentes.</h2>
        <p className="section-intro">
          Uma seleção do que já saiu do repositório e foi para a mão de alguém. Clique
          para ver a demo ou o código.
        </p>
        <div className="project-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.title}>
              <div className="project-meta">
                <span>{project.year} · {project.kind}</span>
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
                  {project.live ? "Abrir demo" : "Ver no GitHub"}
                </a>
                {project.live ? (
                  <a href={project.repo} target="_blank" rel="noreferrer">
                    Código
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
