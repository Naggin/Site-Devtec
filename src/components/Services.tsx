import { useState } from "react";
import { useLanguage } from "../i18n/useLanguage";

export default function Services() {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const current = t.services[active];

  return (
    <section className="section section-border" id="servicos">
      <div className="wrap">
        <p className="kicker reveal">{t.sections.services.kicker}</p>
        <h2 className="section-title reveal" data-delay="1">
          {t.sections.services.title}
        </h2>

        <div className="service-terminal reveal" data-delay="2">
          <div className="service-terminal-chrome">
            <span className="stack-dot stack-dot-red" aria-hidden />
            <span className="stack-dot stack-dot-yellow" aria-hidden />
            <span className="stack-dot stack-dot-green" aria-hidden />
            <span className="service-terminal-title">devtec — services</span>
            <span className="service-terminal-count">
              {t.services.length} {t.sections.services.modules}
            </span>
          </div>

          <div className="service-terminal-body">
            <div className="service-terminal-prompt" aria-hidden>
              <span className="tprompt">~</span>
              <span className="tcmd">devtec services --list</span>
            </div>

            <ul className="service-list" role="listbox" aria-label={t.a11y.servicesList}>
              {t.services.map((service, i) => (
                <li key={service.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active === i}
                    className={`service-row${active === i ? " is-active" : ""}`}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                  >
                    <span className="service-row-code">{service.code}</span>
                    <span className="service-row-cmd">
                      <span className="tcmd">{service.command}</span>
                    </span>
                    <span className="service-row-title">{service.title}</span>
                    <span className="service-row-arrow" aria-hidden>
                      →
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="service-detail" aria-live="polite">
              <span className="service-detail-prompt" aria-hidden>
                <span className="tprompt">→</span>
              </span>
              <div className="service-detail-content">
                <p className="service-detail-text">{current.text}</p>
                <div className="service-detail-tags">
                  {current.tags.map((tag) => (
                    <span className="service-tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
