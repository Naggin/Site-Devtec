import { useEffect, useRef, useState } from "react";
import { deploySteps } from "../data";

const COMMAND = "npm run deploy";

type Phase = "idle" | "typing" | "running" | "done";

export default function LiveDeployTerminal() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [typed, setTyped] = useState("");
  const [stepIndex, setStepIndex] = useState(-1);
  const [lines, setLines] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setPhase("typing");
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (phase !== "typing") return;

    if (typed.length < COMMAND.length) {
      const t = setTimeout(() => setTyped(COMMAND.slice(0, typed.length + 1)), 65);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      setPhase("running");
      setStepIndex(0);
      setLines([`> ${COMMAND}`]);
    }, 400);
    return () => clearTimeout(t);
  }, [phase, typed]);

  useEffect(() => {
    if (phase !== "running" || stepIndex < 0) return;

    if (stepIndex >= deploySteps.length) {
      const t = setTimeout(() => setPhase("done"), 600);
      return () => clearTimeout(t);
    }

    const step = deploySteps[stepIndex];
    setLines((prev) => [...prev, `  ${step.label}… ${step.text}`]);

    const t = setTimeout(() => setStepIndex((i) => i + 1), 900);
    return () => clearTimeout(t);
  }, [phase, stepIndex]);

  useEffect(() => {
    if (phase !== "done") return;

    const t = setTimeout(() => {
      setPhase("idle");
      setTyped("");
      setStepIndex(-1);
      setLines([]);
      started.current = false;
    }, 5000);
    return () => clearTimeout(t);
  }, [phase]);

  const handleRun = () => {
    if (phase !== "idle") return;
    started.current = true;
    setPhase("typing");
  };

  return (
    <div className="live-terminal" ref={containerRef}>
      <div className="live-terminal-chrome">
        <span className="stack-dot stack-dot-red" aria-hidden />
        <span className="stack-dot stack-dot-yellow" aria-hidden />
        <span className="stack-dot stack-dot-green" aria-hidden />
        <span className="live-terminal-title">deploy — live</span>
      </div>

      <div className="live-terminal-body">
        <div className="live-terminal-input">
          <span className="tprompt">~</span>
          <span className="live-terminal-cmd">
            {typed}
            {phase === "typing" && <span className="tcursor" />}
          </span>
        </div>

        {lines.map((line, i) => (
          <div className="live-terminal-line" key={`${line}-${i}`}>
            <span className={line.startsWith("  live") || line.includes("✓") ? "targ" : "tcomment"}>
              {line}
            </span>
          </div>
        ))}

        {phase === "running" && stepIndex < deploySteps.length && (
          <div className="live-terminal-line">
            <span className="tcomment">  …</span>
          </div>
        )}

        <div className="live-pipeline">
          {deploySteps.map((step, i) => (
            <span
              key={step.label}
              className={`live-pipeline-step${
                stepIndex > i || phase === "done" ? " is-done" : ""
              }${stepIndex === i && phase === "running" ? " is-active" : ""}`}
            >
              {step.label}
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="live-terminal-run"
        onClick={handleRun}
        disabled={phase !== "idle"}
      >
        {phase === "idle" ? "▶ run deploy" : phase === "done" ? "✓ deployed" : "running…"}
      </button>
    </div>
  );
}
