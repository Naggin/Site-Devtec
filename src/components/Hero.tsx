export default function Hero() {
  return (
    <section className="hero" id="topo">
      <div className="wrap">
        <div className="hero-inner">
          <div className="hero-badge">
            <span className="hero-badge-dot" aria-hidden />
            Disponível para novos projetos
          </div>

          <h1>
            Desenvolvo
            <br />
            <span className="accent">software</span> que
            <br />
            as pessoas usam.
          </h1>

          <p className="hero-sub">
            Antonio Junior — desenvolvedor full-stack. Pego um problema real
            e entrego um produto funcional: web, mobile ou sistema.
          </p>

          <div className="hero-actions">
            <a className="btn btn-primary" href="#contato">Falar sobre o projeto</a>
            <a className="btn btn-ghost" href="#projetos">Ver trabalhos</a>
          </div>

          <div className="hero-terminal" aria-hidden>
            <div className="tline">
              <span className="hero-prompt">~</span>
              <span className="hero-cmd">git clone</span>
              <span className="hero-arg"> seu-projeto</span>
            </div>
            <div className="tline">
              <span className="hero-prompt">~</span>
              <span className="hero-cmd">npm install</span>
              <span className="hero-comment"> &amp;&amp; npm run dev</span>
            </div>
            <div className="tline">
              <span className="hero-prompt">~</span>
              <span className="hero-arg">Servidor rodando em </span>
              <span className="hero-cmd">localhost:3000</span>
              <span className="hero-cursor-blink" />
            </div>
          </div>
        </div>

        <div className="scroll-hint" aria-hidden>
          <span>scroll</span>
        </div>
      </div>
    </section>
  );
}
