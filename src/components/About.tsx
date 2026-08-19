export default function About() {
  return (
    <section className="section section-border" id="sobre">
      <div className="wrap">
        <p className="kicker reveal">01 / Sobre</p>
        <h2 className="section-title reveal" data-delay="1">
          Código que vira produto.
        </h2>

        <div className="about-grid">
          <div>
            <div className="about-copy reveal-left" data-delay="2">
              <p>
                Sou <strong>Antonio Junior</strong>. Desenvolvo do zero ao
                deploy — banco, API, interface e tudo no meio.
              </p>
              <p>
                Já entreguei plataformas EdTech, apps mobile com Firebase,
                sistemas financeiros com IA e ferramentas desktop com
                atualização automática.
              </p>
            </div>

            <div className="code-chip reveal-left" data-delay="3" aria-hidden>
              <div><span className="ck-kw">const</span> dev = <span className="ck-kw">await</span> <span className="ck-fn">hire</span>(<span className="ck-str">'Antonio'</span>);</div>
              <div><span className="ck-cm">// entrega: web · mobile · IA</span></div>
              <div><span className="ck-fn">console</span>.<span className="ck-fn">log</span>(dev.stack);</div>
              <div><span className="ck-cm">// ['React','Next.js','RN','Node','TS']</span></div>
            </div>
          </div>

          <div className="skills">
            {[
              { b: "Full-stack", s: "React · Next.js · TypeScript · Node" },
              { b: "Mobile", s: "React Native · Expo · Firebase" },
              { b: "IA aplicada", s: "Claude AI · WhatsApp · NLP" },
              { b: "Infra & TI", s: "Docker · Vercel · consultoria" },
            ].map((item, i) => (
              <div className="skill-card reveal" key={item.b} data-delay={String(i + 2)}>
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
