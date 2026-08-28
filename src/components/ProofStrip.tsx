import { useLanguage } from "../i18n/useLanguage";

export default function ProofStrip() {
  const { t } = useLanguage();

  return (
    <section className="proof-strip" aria-label={t.a11y.proofStrip}>
      <div className="wrap">
        <ul className="proof-list">
          {t.proofPoints.map((point) => {
            const external = point.href.startsWith("http");
            return (
              <li className="proof-item reveal" key={point.label}>
                <a
                  href={point.href}
                  {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                >
                  <span className="proof-value">{point.value}</span>
                  <span className="proof-label">{point.label}</span>
                </a>
                <p className="proof-detail">{point.detail}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
