import { bentoItems } from "../data";

export default function BentoGrid() {
  return (
    <div className="bento-grid reveal" data-delay="2">
      {bentoItems.map((item) => (
        <article
          key={item.id}
          className={`bento-card bento-${item.span}`}
        >
          <div className="bento-front">
            <span className="bento-icon" aria-hidden>
              {item.icon}
            </span>
            <h3>{item.title}</h3>
            <div className="bento-tech">
              {item.tech.map((t) => (
                <span key={t}>{t}</span>
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
