import { useInView } from "../hooks/useInView";
import { useLanguage } from "../i18n/useLanguage";

export default function StatusBoard() {
  const { t } = useLanguage();
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className={`status-board${inView ? " is-live" : ""}`}>
      <div className="status-board-chrome">
        <span className="stack-dot stack-dot-red" aria-hidden />
        <span className="stack-dot stack-dot-yellow" aria-hidden />
        <span className="stack-dot stack-dot-green" aria-hidden />
        <span className="status-board-title">{t.ciRepo.label}</span>
        <span className={`status-board-badge${inView ? " is-on" : ""}`}>
          {inView ? t.statusBoard.passing : t.statusBoard.idle}
        </span>
      </div>

      <ul className="status-checks">
        {t.ciChecks.map((check, i) => (
          <li
            key={check.name}
            className={`status-check${inView ? " is-passed" : ""}`}
            style={{ transitionDelay: `${0.2 + i * 0.18}s` }}
          >
            <span className="status-check-icon" aria-hidden>
              {inView ? "✓" : "○"}
            </span>
            <span className="status-check-name">{check.name}</span>
            <span className="status-check-duration">{check.detail}</span>
          </li>
        ))}
      </ul>

      <div className={`status-footer${inView ? " is-visible" : ""}`}>
        <span className="status-footer-dot" aria-hidden />
        <span>{t.statusBoard.footer}</span>
        <a href={t.ciRepo.href} target="_blank" rel="noreferrer">
          {t.ciRepo.repo}
        </a>
      </div>
    </div>
  );
}
