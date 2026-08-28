import { bentoItems } from "../data";

export default function BentoGrid() {
  return (
    <div className="bento-grid reveal" data-delay="2">
      {bentoItems.map((item, i) => (
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
