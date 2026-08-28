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
            <span className="line-white">Transformo</span>
            <span className="line-red">ideias</span>
            <span className="line-white">em produto.</span>
          </h1>

          <p className="hero-sub">
            Antonio Junior · full-stack. Do problema ao deploy.
          </p>

          <div className="hero-actions">
            <a className="btn btn-primary" href="#contato">Contato</a>
            <a className="btn btn-ghost"   href="#projetos">Projetos</a>
          </div>

          <div className="hero-terminal" aria-hidden>
            <div className="tline">
              <span className="tprompt">~</span>
              <span className="tcmd">git clone</span>
              <span className="targ"> seu-projeto</span>
            </div>
            <div className="tline">
              <span className="tprompt">~</span>
              <span className="tcmd">npm install</span>
              <span className="tcomment"> &amp;&amp; npm run dev</span>
            </div>
            <div className="tline">
              <span className="tprompt">~</span>
              <span className="targ">Servidor rodando em </span>
              <span className="tcmd">localhost:3000</span>
              <span className="tcursor" />
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
