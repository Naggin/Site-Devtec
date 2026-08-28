import { useInView } from "../hooks/useInView";
import { useLanguage } from "../i18n/useLanguage";

export default function DependencyGraph() {
  const { t } = useLanguage();
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`dep-graph${inView ? " is-animated" : ""}`}
      aria-label={t.a11y.dependencyGraph}
    >
      <div className="dep-graph-track">
        {t.dependencyNodes.map((node, i) => (
          <div className="dep-graph-node-wrap" key={node.id}>
            <div className={`dep-node${inView ? " is-visible" : ""}`} style={{ transitionDelay: `${i * 0.15}s` }}>
              <span className="dep-node-label">{node.label}</span>
              <span className="dep-node-sub">{node.sub}</span>
            </div>
            {i < t.dependencyNodes.length - 1 && (
              <div className={`dep-edge${inView ? " is-flowing" : ""}`} aria-hidden>
                <span className="dep-edge-line" />
                <span className="dep-edge-arrow">→</span>
                <span className="dep-edge-pulse" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
