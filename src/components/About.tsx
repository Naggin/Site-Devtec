import { processSteps } from "../data";

export default function About() {
  return (
    <section className="section section-border" id="sobre">
      <div className="wrap">
        <p className="kicker reveal">01 / Sobre</p>
        <h2 className="section-title reveal" data-delay="1">
          Como eu trabalho.
        </h2>
        <p className="section-sub reveal" data-delay="2">
          Processo enxuto, foco em entregar valor — do briefing ao produto no ar.
        </p>

        <div className="process-grid">
          {processSteps.map((step, i) => (
            <article className="process-card reveal" key={step.num} data-delay={String(i + 2)}>
              <span className="process-num">{step.num}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
