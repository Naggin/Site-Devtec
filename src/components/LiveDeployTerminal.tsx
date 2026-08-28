import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useLanguage } from "../i18n/useLanguage";

const COMMAND = "npm run deploy";
const TYPE_MS = 65;
const STEP_MS = 900;
const HOLD_MS = 4000;

type Phase = "idle" | "typing" | "running" | "done";

export default function LiveDeployTerminal() {
  const { t } = useLanguage();
  const reducedMotion = usePrefersReducedMotion();
  const [inView, setInView] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [typed, setTyped] = useState("");
  const [stepIndex, setStepIndex] = useState(-1);
  const [lines, setLines] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const deploySteps = t.deploySteps;

  const allLines = () => [
    `> ${COMMAND}`,
    ...deploySteps.map((step) => `  ${step.label}… ${step.text}`),
  ];

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || !inView || phase !== "idle") return;
    setPhase("typing");
  }, [reducedMotion, inView, phase]);

  useEffect(() => {
    if (phase !== "typing") return;

    if (typed.length < COMMAND.length) {
      const timer = setTimeout(() => setTyped(COMMAND.slice(0, typed.length + 1)), TYPE_MS);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setPhase("running");
      setStepIndex(0);
      setLines([`> ${COMMAND}`]);
    }, 400);
    return () => clearTimeout(timer);
  }, [phase, typed]);

  useEffect(() => {
    if (phase !== "running" || stepIndex < 0) return;

    if (stepIndex >= deploySteps.length) {
      const timer = setTimeout(() => setPhase("done"), 600);
      return () => clearTimeout(timer);
    }

    const step = deploySteps[stepIndex];
    setLines((prev) => [...prev, `  ${step.label}… ${step.text}`]);

    const timer = setTimeout(() => setStepIndex((i) => i + 1), STEP_MS);
    return () => clearTimeout(timer);
  }, [phase, stepIndex, deploySteps]);

  useEffect(() => {
    if (phase !== "done" || reducedMotion) return;

    const timer = setTimeout(() => {
      setTyped("");
      setStepIndex(-1);
      setPhase("idle");
    }, HOLD_MS);
    return () => clearTimeout(timer);
  }, [phase, reducedMotion]);

  const staticResult = reducedMotion;
  const shownLines = staticResult ? allLines() : lines;
  const shownTyped = staticResult ? COMMAND : typed;
  const holdingResult = !staticResult && lines.length > 0 && phase !== "running";
  const doneCount = staticResult ? deploySteps.length : stepIndex;

  const replay = () => {
    setTyped("");
    setStepIndex(-1);
    setPhase("typing");
  };

  return (
    <div className="live-terminal" ref={containerRef}>
      <div className="live-terminal-chrome">
        <span className="stack-dot stack-dot-red" aria-hidden />
        <span className="stack-dot stack-dot-yellow" aria-hidden />
        <span className="stack-dot stack-dot-green" aria-hidden />
        <span className="live-terminal-title">{t.terminal.deployTitle}</span>
      </div>

      <div className="live-terminal-body" data-testid="terminal-output">
        <div className="live-terminal-input">
          <span className="tprompt">~</span>
          <span className="live-terminal-cmd">
            {shownTyped}
            {phase === "typing" && !staticResult && <span className="tcursor" />}
          </span>
        </div>

        {shownLines.map((line, i) => (
          <div className="live-terminal-line" key={`${line}-${i}`}>
            <span className={line.includes("✓") ? "targ" : "tcomment"}>{line}</span>
          </div>
        ))}

        <div className="live-pipeline">
          {deploySteps.map((step, i) => (
            <span
              key={step.label}
              className={`live-pipeline-step${
                doneCount > i || phase === "done" || holdingResult ? " is-done" : ""
              }${doneCount === i && phase === "running" ? " is-active" : ""}`}
            >
              {step.label}
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="live-terminal-run"
        onClick={replay}
        disabled={phase === "typing" || phase === "running"}
      >
        {phase === "typing" || phase === "running" ? t.terminal.running : t.terminal.runDeploy}
      </button>
    </div>
  );
}
