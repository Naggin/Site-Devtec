import { useState } from "react";
import { useLanguage } from "../i18n/useLanguage";

type StackKey = "fullstack" | "mobile" | "ai" | "infra";

export default function StackPanel() {
  const { t } = useLanguage();
  const [active, setActive] = useState<StackKey>("fullstack");
  const current = t.stacks.find((s) => s.id === active) ?? t.stacks[0];

  return (
    <aside className="stack-panel" aria-label={t.a11y.stackPanel}>
      <div className="stack-panel-chrome">
        <span className="stack-dot stack-dot-red" aria-hidden />
        <span className="stack-dot stack-dot-yellow" aria-hidden />
        <span className="stack-dot stack-dot-green" aria-hidden />
        <span className="stack-filename">stack.config.ts</span>
        <span className="stack-status">build ok</span>
      </div>

      <div className="stack-tabs" role="tablist" aria-label={t.a11y.stackCategories}>
        {t.stacks.map((item) => (
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
            {t.stacks.map((item) => (
              <span
                key={item.id}
                className={`stack-line${active === item.id ? " is-active" : ""}`}
              >
                {"  "}
                <span className="ck-prop">{item.id}</span>: [
                {item.tech.map((tech, i) => (
                  <span key={tech}>
                    <span className={`ck-str${active === item.id ? " is-lit" : ""}`}>
                      &apos;{tech}&apos;
                    </span>
                    {i < item.tech.length - 1 ? ", " : ""}
                  </span>
                ))},
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

      <div className="stack-pipeline" aria-label={t.a11y.stackPipeline}>
        {t.stackPipeline.map((step, i) => (
          <div className="stack-pipeline-step" key={step.label}>
            <span className="stack-pipeline-index" aria-hidden>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="stack-pipeline-label">{step.label}</span>
            {i < t.stackPipeline.length - 1 && (
              <span className="stack-pipeline-arrow" aria-hidden>
                →
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="stack-marquee" aria-hidden>
        <div className="stack-marquee-track">
          {[...t.stacks.flatMap((s) => s.tech), ...t.stacks.flatMap((s) => s.tech)].map(
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
