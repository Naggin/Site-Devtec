import { gitCommits } from "../data";
import { useInView } from "../hooks/useInView";

export default function GitTimeline() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className={`git-timeline reveal${inView ? " is-visible" : ""}`} data-delay="2">
      <div className="git-timeline-header">
        <span className="git-timeline-repo">Naggin/moneyzin</span>
        <span className="git-timeline-branch">main</span>
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
                <code className="git-commit-hash">{commit.hash}</code>
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
