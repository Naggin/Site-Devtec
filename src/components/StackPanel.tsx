import { useState } from "react";
import { stacks, stackPipeline } from "../data";

type StackKey = (typeof stacks)[number]["id"];

export default function StackPanel() {
  const [active, setActive] = useState<StackKey>("fullstack");
  const current = stacks.find((s) => s.id === active) ?? stacks[0];

  return (
    <aside className="stack-panel" aria-label="Stack e capacidades técnicas">
      <div className="stack-panel-chrome">
        <span className="stack-dot stack-dot-red" aria-hidden />
        <span className="stack-dot stack-dot-yellow" aria-hidden />
        <span className="stack-dot stack-dot-green" aria-hidden />
        <span className="stack-filename">stack.config.ts</span>
        <span className="stack-status">build ok</span>
      </div>

      <div className="stack-tabs" role="tablist" aria-label="Categorias de stack">
        {stacks.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active === item.id}
            className={`stack-tab${active === item.id ? " is-active" : ""}`}
            onClick={() => setActive(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="stack-editor" role="tabpanel">
        <pre className="stack-code">
          <code>
            <span className="ck-kw">export const</span> capabilities = {"{"}
            {"\n"}
            {stacks.map((item) => (
              <span
                key={item.id}
                className={`stack-line${active === item.id ? " is-active" : ""}`}
              >
                {"  "}
                <span className="ck-prop">{item.id}</span>: [
                {item.tech.map((t, i) => (
                  <span key={t}>
                    <span className={`ck-str${active === item.id ? " is-lit" : ""}`}>
                      &apos;{t}&apos;
                    </span>
                    {i < item.tech.length - 1 ? ", " : ""}
                  </span>
                ))}
                ],
                {"\n"}
              </span>
            ))}
            {"}"} <span className="ck-kw">as const</span>;
          </code>
        </pre>

        <div className="stack-output">
          <span className="stack-output-label">→ output</span>
          <p>{current.output}</p>
        </div>
      </div>

      <div className="stack-pipeline" aria-label="Do zero ao deploy">
        {stackPipeline.map((step, i) => (
          <div className="stack-pipeline-step" key={step.label}>
            <span className="stack-pipeline-icon" aria-hidden>
              {step.icon}
            </span>
            <span className="stack-pipeline-label">{step.label}</span>
            {i < stackPipeline.length - 1 && (
              <span className="stack-pipeline-arrow" aria-hidden>
                →
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="stack-marquee" aria-hidden>
        <div className="stack-marquee-track">
          {[...stacks.flatMap((s) => s.tech), ...stacks.flatMap((s) => s.tech)].map(
            (tag, i) => (
              <span className="stack-chip" key={`${tag}-${i}`}>
                {tag}
              </span>
            ),
          )}
        </div>
      </div>
    </aside>
  );
}
