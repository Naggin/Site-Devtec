export default function About() {
  return (
    <section className="section section-border" id="sobre">
      <div className="wrap">
        <p className="kicker reveal">01 / Sobre</p>
        <h2 className="section-title reveal" data-delay="1">
          Do zero ao deploy.
        </h2>

        <div className="about-grid">
          <div>
            <div className="about-copy reveal-left" data-delay="2">
              <p>
                <strong>Antonio Junior</strong> — web, mobile, IA e produto no ar.
              </p>
            </div>

            <div className="code-chip reveal-left" data-delay="3" aria-hidden>
              <div><span className="ck-kw">const</span> dev = <span className="ck-fn">hire</span>(<span className="ck-str">'Antonio'</span>);</div>
              <div><span className="ck-cm">// web · mobile · IA</span></div>
            </div>
          </div>

          <div className="skills">
            {[
              { b: "Full-stack", s: "React · Next.js · TypeScript · Node" },
              { b: "Mobile",     s: "React Native · Expo · Firebase" },
              { b: "IA aplicada",s: "Claude AI · WhatsApp · NLP" },
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
