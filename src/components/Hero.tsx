import { profile } from "../data";

export default function Hero() {
  return (
    <section className="hero" id="topo">
      <div className="wrap hero-grid">
        <div>
          <p className="kicker">Estúdio de software · {profile.location}</p>
          <h1>
            {profile.brand}
            <br />
            <em>{profile.tagline}</em>
          </h1>
          <p className="lede">
            Eu sou {profile.name}, {profile.role}. Projeto e construo sites, apps e sistemas
            para quem precisa de uma ferramenta que as pessoas realmente usam.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#contato">
              Pedir um orçamento
            </a>
            <a className="btn btn-ghost" href="#projetos">
              Ver projetos
            </a>
          </div>
        </div>
        <aside className="hero-card" aria-label="Resumo">
          <dl>
            <div>
              <dt>Foco</dt>
              <dd>Web, mobile e produtos com IA</dd>
            </div>
            <div>
              <dt>Disponível para</dt>
              <dd>Projetos novos e parcerias</dd>
            </div>
            <div>
              <dt>Contato</dt>
              <dd>
                <a href={`mailto:${profile.email}`}>{profile.email}</a>
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
