import StackPanel from "./StackPanel";
import LiveDeployTerminal from "./LiveDeployTerminal";

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
              <strong>Antonio Junior</strong>, desenvolvedor full-stack. Pego o
              problema do seu dia a dia e devolvo software rodando em produção —
              com o código no seu nome.
            </p>

            <div className="hero-actions">
              <a className="btn btn-primary" href="#contato">
                Falar sobre meu projeto
              </a>
              <a className="btn btn-ghost" href="#projetos">
                Ver trabalhos no ar
              </a>
            </div>

            <LiveDeployTerminal />
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
