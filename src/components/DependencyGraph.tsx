import { dependencyNodes } from "../data";
import { useInView } from "../hooks/useInView";

export default function DependencyGraph() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`dep-graph reveal${inView ? " is-animated" : ""}`}
      data-delay="1"
      aria-label="Fluxo de arquitetura: React, API, banco de dados e deploy"
    >
      <div className="dep-graph-track">
        {dependencyNodes.map((node, i) => (
          <div className="dep-graph-node-wrap" key={node.id}>
            <div className={`dep-node${inView ? " is-visible" : ""}`} style={{ transitionDelay: `${i * 0.15}s` }}>
              <span className="dep-node-label">{node.label}</span>
              <span className="dep-node-sub">{node.sub}</span>
            </div>
            {i < dependencyNodes.length - 1 && (
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
