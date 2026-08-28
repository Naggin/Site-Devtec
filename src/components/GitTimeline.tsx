import { gitCommits, gitTimeline } from "../data";
import { useInView } from "../hooks/useInView";

export default function GitTimeline() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className={`git-timeline${inView ? " is-visible" : ""}`}>
      <div className="git-timeline-header">
        <a
          className="git-timeline-repo"
          href={gitTimeline.href}
          target="_blank"
          rel="noreferrer"
        >
          {gitTimeline.repo}
        </a>
        <span className="git-timeline-branch">{gitTimeline.branch}</span>
      </div>

      <ol className="git-commits">
        {gitCommits.map((commit, i) => (
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
                  href={`${gitTimeline.commitBase}${commit.hash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <code>{commit.hash}</code>
                  <span className="sr-only"> — abrir commit no GitHub</span>
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
