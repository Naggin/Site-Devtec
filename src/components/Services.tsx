import { useLanguage } from "../i18n/useLanguage";

export default function Services() {
  const { t } = useLanguage();

  return (
    <section className="section section-border" id="servicos">
      <div className="wrap">
        <p className="kicker reveal">{t.sections.services.kicker}</p>
        <h2 className="section-title reveal" data-delay="1">
          {t.sections.services.title}
        </h2>
        <p className="section-sub reveal" data-delay="2">
          {t.sections.services.sub}
        </p>

        <ul className="service-grid">
          {t.services.map((service, i) => (
            <li className="service-card reveal" data-delay={String((i % 2) + 1)} key={service.code}>
              <span className="service-code" aria-hidden>
                {service.code}
              </span>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <div className="stack">
                {service.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
