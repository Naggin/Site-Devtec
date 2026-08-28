import { proofPoints } from "../data";

export default function ProofStrip() {
  return (
    <section className="proof-strip" aria-label="Provas verificáveis">
      <div className="wrap">
        <ul className="proof-list">
          {proofPoints.map((point) => {
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
