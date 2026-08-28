import { useLanguage } from "../i18n/useLanguage";

export default function BentoGrid() {
  const { t } = useLanguage();

  return (
    <div className="bento-grid reveal" data-delay="2">
      {t.bentoItems.map((item, i) => (
        <article
          key={item.id}
          className={`bento-card bento-${item.span}`}
          tabIndex={0}
        >
          <div className="bento-front">
            <span className="bento-index" aria-hidden>
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3>{item.title}</h3>
            <div className="bento-tech">
              {item.tech.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>
          </div>
          <pre className="bento-snippet" aria-hidden>
            <code>{item.snippet}</code>
          </pre>
        </article>
      ))}
    </div>
  );
}
