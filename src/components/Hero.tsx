import StackPanel from "./StackPanel";

export default function Hero() {
  return (
    <section className="hero" id="topo">
      <div className="wrap">
        <div className="hero-layout">
          <div className="hero-copy">
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
              <strong>Antonio Junior</strong> — web, mobile, IA e produto no ar.
              Do zero ao deploy.
            </p>

            <div className="hero-actions">
              <a className="btn btn-primary" href="#contato">
                Contato
              </a>
              <a className="btn btn-ghost" href="#projetos">
                Projetos
              </a>
            </div>

            <div className="hero-terminal" aria-hidden>
              <div className="tline">
                <span className="tprompt">~</span>
                <span className="tcmd">npx create-devtec</span>
                <span className="tcomment"> --stack=all</span>
              </div>
              <div className="tline">
                <span className="tprompt">~</span>
                <span className="targ">Building </span>
                <span className="tcmd">web · mobile · IA</span>
                <span className="targ">…</span>
              </div>
              <div className="tline">
                <span className="tprompt">~</span>
                <span className="targ">Deploy em </span>
                <span className="tcmd">production</span>
                <span className="tcursor" />
              </div>
            </div>
          </div>

          <StackPanel />
        </div>

        <div className="scroll-hint" aria-hidden>
          <span>scroll</span>
        </div>
      </div>
    </section>
  );
}
