export default function Hero() {
  return (
    <section className="hero" id="topo">
      <div className="wrap">
        <div className="hero-inner">
          <p className="hero-badge">Devtec · Estúdio de software</p>

          <h1>
            Software que
            <span className="line-acc">resolve.</span>
          </h1>

          <p className="hero-sub">
            Eu construo produtos que as pessoas abrem todo dia —
            sites, apps, sistemas e integrações com IA.
          </p>

          <div className="hero-actions">
            <a className="btn btn-primary" href="#contato">
              Falar sobre o projeto
            </a>
            <a className="btn btn-ghost" href="#projetos">
              Ver trabalhos
            </a>
          </div>
        </div>

        <div className="scroll-hint" aria-hidden>
          <span>scroll</span>
        </div>
      </div>
    </section>
  );
}
