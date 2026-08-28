import { useInView } from "../hooks/useInView";
import { useLanguage } from "../i18n/useLanguage";

export default function GitTimeline() {
  const { t } = useLanguage();
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className={`git-timeline${inView ? " is-visible" : ""}`}>
      <div className="git-timeline-header">
        <a
          className="git-timeline-repo"
          href={t.gitTimeline.href}
          target="_blank"
          rel="noreferrer"
        >
          {t.gitTimeline.repo}
        </a>
        <span className="git-timeline-branch">{t.gitTimeline.branch}</span>
      </div>

      <ol className="git-commits">
        {t.gitCommits.map((commit, i) => (
          <li
            key={commit.hash}
            className={`git-commit${inView ? " is-revealed" : ""}`}
            style={{ transitionDelay: `${0.1 + i * 0.12}s` }}
          >
            <span className="git-commit-line" aria-hidden />
            <div className="git-commit-body">
              <div className="git-commit-meta">
                <a
                  className="git-commit-hash"
                  href={`${t.gitTimeline.commitBase}${commit.hash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <code>{commit.hash}</code>
                  <span className="sr-only"> — {t.a11y.openCommit}</span>
                </a>
                <time>{commit.date}</time>
              </div>
              <p className="git-commit-msg">{commit.message}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
