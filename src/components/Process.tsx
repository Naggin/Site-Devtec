import { useLanguage } from "../i18n/useLanguage";

export default function Process() {
  const { t } = useLanguage();

  return (
    <section className="section section-border" id="processo">
      <div className="wrap">
        <p className="kicker reveal">{t.sections.process.kicker}</p>
        <h2 className="section-title reveal" data-delay="1">
          {t.sections.process.title}
        </h2>
        <p className="section-sub reveal" data-delay="2">
          {t.sections.process.sub}
        </p>

        <ol className="process-steps">
          {t.processSteps.map((step, i) => (
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
          <h3 className="deliverables-title">{t.sections.process.deliverablesTitle}</h3>
          <ul>
            {t.deliverables.map((item) => (
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
          <h3 className="faq-title">{t.sections.process.faqTitle}</h3>
          {t.faq.map((item) => (
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
