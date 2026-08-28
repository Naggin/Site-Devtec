import { deliverables, faq, processSteps } from "../data";

export default function Process() {
  return (
    <section className="section section-border" id="processo">
      <div className="wrap">
        <p className="kicker reveal">04 / Processo</p>
        <h2 className="section-title reveal" data-delay="1">
          Como isso funciona na prática.
        </h2>
        <p className="section-sub reveal" data-delay="2">
          Contratar dev costuma ser um salto no escuro. Aqui está exatamente o que
          acontece depois que você me manda a primeira mensagem.
        </p>

        <ol className="process-steps">
          {processSteps.map((step, i) => (
            <li className="process-step reveal" data-delay={String((i % 2) + 1)} key={step.num}>
              <span className="process-num" aria-hidden>
                {step.num}
              </span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="deliverables reveal" data-delay="1">
          <h3 className="deliverables-title">O que fica com você no final</h3>
          <ul>
            {deliverables.map((item) => (
              <li key={item.title}>
                <span className="deliverable-check" aria-hidden>
                  ✓
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="faq reveal" data-delay="1">
          <h3 className="faq-title">Perguntas que sempre aparecem</h3>
          {faq.map((item) => (
            <details className="faq-item" key={item.question}>
              <summary>
                {item.question}
                <span className="faq-marker" aria-hidden />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
