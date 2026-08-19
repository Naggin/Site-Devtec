export default function About() {
  return (
    <section className="section section-border" id="sobre">
      <div className="wrap">
        <p className="kicker reveal">01 / Sobre</p>
        <h2 className="section-title reveal" data-delay="1">
          Produto, não só código.
        </h2>

        <div className="about-grid">
          <div className="about-copy reveal-left" data-delay="2">
            <p>
              Meu nome é <strong>Antonio Junior</strong>. Trabalho ponta a
              ponta: entendo o problema, projeto o fluxo, construo e coloco no
              ar.
            </p>
            <p>
              Já entreguei plataformas EdTech, controle financeiro com IA,
              apps mobile, sistemas de gestão e ferramentas desktop. O fio
              comum é: funciona de verdade.
            </p>
          </div>

          <div className="skills">
            {[
              { b: "Full-stack", s: "React · Next.js · TypeScript · APIs" },
              { b: "Mobile", s: "React Native · Expo · Firebase" },
              { b: "IA aplicada", s: "WhatsApp · NLP · Claude AI" },
              { b: "Suporte TI", s: "Consultoria · infra · manutenção" },
            ].map((item, i) => (
              <div
                className="skill-card reveal"
                key={item.b}
                data-delay={String(i + 2)}
              >
                <b>{item.b}</b>
                <span>{item.s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
