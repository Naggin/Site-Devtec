import { useEffect, useState } from "react";
import { useInView } from "../hooks/useInView";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useLanguage } from "../i18n/useLanguage";

type StackKey = "fullstack" | "mobile" | "ai" | "infra";

const PIPELINE_MS = 1200;
const DEPLOY_MS = 900;

export default function StackPanel() {
  const { t } = useLanguage();
  const { ref: panelRef, inView } = useInView<HTMLElement>();
  const reducedMotion = usePrefersReducedMotion();
  const [active, setActive] = useState<StackKey>("fullstack");
  const [pipelineIndex, setPipelineIndex] = useState(0);
  const [deployIndex, setDeployIndex] = useState(-1);
  const current = t.stacks.find((s) => s.id === active) ?? t.stacks[0];
  const deploySteps = t.deploySteps;
  const deployStatus =
    deployIndex >= 0 ? deploySteps[deployIndex]?.text : deploySteps[deploySteps.length - 1].text;

  useEffect(() => {
    if (!inView || reducedMotion) {
      setPipelineIndex(t.stackPipeline.length - 1);
      setDeployIndex(deploySteps.length - 1);
      return;
    }

    setPipelineIndex(0);
    setDeployIndex(0);

    const pipelineTimer = setInterval(() => {
      setPipelineIndex((i) => (i >= t.stackPipeline.length - 1 ? 0 : i + 1));
    }, PIPELINE_MS);

    const deployTimer = setInterval(() => {
      setDeployIndex((i) => (i >= deploySteps.length - 1 ? 0 : i + 1));
    }, DEPLOY_MS);

    return () => {
      clearInterval(pipelineTimer);
      clearInterval(deployTimer);
    };
  }, [inView, reducedMotion, deploySteps.length, t.stackPipeline.length]);

  return (
    <aside className="stack-panel" ref={panelRef} aria-label={t.a11y.stackPanel}>
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
          <div
            className={`stack-pipeline-step${
              pipelineIndex > i || (reducedMotion && i < t.stackPipeline.length)
                ? " is-done"
                : ""
            }${pipelineIndex === i && !reducedMotion ? " is-active" : ""}`}
            key={step.label}
          >
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

      <div className="stack-deploy-strip" aria-live="polite">
        <span className="stack-deploy-prompt">~</span>
        <span className="stack-deploy-cmd">npm run deploy</span>
        <span className="stack-deploy-sep" aria-hidden>
          →
        </span>
        <span
          className={`stack-deploy-status${
            deployStatus.includes("✓") ? " is-complete" : ""
          }`}
        >
          {deployStatus}
        </span>
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
