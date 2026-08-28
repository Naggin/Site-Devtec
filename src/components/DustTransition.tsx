import { useEffect, useRef } from "react";
import type { DustCapture, DustParticle } from "../lib/dustCapture";

const OUT_MS = 520;
const CLEAN_MS = 120;
const IN_MS = 480;
const TOTAL_MS = OUT_MS + CLEAN_MS + IN_MS;

type Phase = "out" | "clean" | "in";

type Props = {
  phase: Phase | "idle";
  capture: DustCapture;
  onPhaseChange: (phase: Phase | "idle") => void;
  onComplete: () => void;
  onSnapshotReady?: () => void;
};

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function easeOutQuart(t: number) {
  return 1 - (1 - t) ** 4;
}

export default function DustTransition({
  phase,
  capture,
  onPhaseChange,
  onComplete,
  onSnapshotReady,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<DustParticle[]>(capture.particles);
  const snapshotRef = useRef(capture.snapshot);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const phaseRef = useRef(phase);
  const firstFrameRef = useRef(false);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let W = capture.W;
    let H = capture.H;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawParticle = (p: DustParticle, alpha: number) => {
      if (alpha <= 0.01) return;
      ctx.globalAlpha = alpha;
      if (p.kind === "char") {
        ctx.font = '600 11px "GeistMono", ui-monospace, monospace';
        ctx.fillStyle = p.color;
        ctx.fillText(p.char, p.x - 5, p.y + 4);
        return;
      }
      ctx.fillStyle = p.color;
      const s = p.size;
      ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
    };

    const punchHole = (x: number, y: number, radius: number) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    };

    const notifyFirstFrame = () => {
      if (firstFrameRef.current) return;
      firstFrameRef.current = true;
      onSnapshotReady?.();
    };

    const draw = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const currentPhase = phaseRef.current;
      const snapshot = snapshotRef.current;

      ctx.clearRect(0, 0, W, H);

      if (currentPhase === "out") {
        const p = Math.min(1, elapsed / OUT_MS);

        if (snapshot) {
          ctx.globalAlpha = 1;
          ctx.drawImage(snapshot, 0, 0, W, H);
          notifyFirstFrame();
        }

        for (const s of particlesRef.current) {
          const local = Math.min(
            1,
            Math.max(0, (p - s.delay * 0.45) / Math.max(0.12, 1 - s.delay * 0.45)),
          );
          const eased = easeOutQuart(local);
          if (eased <= 0) continue;

          punchHole(s.homeX, s.homeY, s.size * (0.5 + eased * (s.kind === "char" ? 2.6 : 2)));

          const drift = Math.sin(elapsed * 0.009 + s.wobble) * 24 * eased;
          s.x = s.homeX + s.vx * eased * 96 + drift;
          s.y = s.homeY - s.lift * eased * (150 + H * 0.15);
          s.opacity = 0.65 + (1 - eased) * 0.35;

          drawParticle(s, s.opacity);
        }

        if (p >= 1) {
          startRef.current = 0;
          onPhaseChange("clean");
        }
      } else if (currentPhase === "clean") {
        for (const s of particlesRef.current) {
          s.x += s.vx * 1.4;
          s.y -= s.lift * 2;
          s.opacity = Math.max(0, s.opacity - 0.04);
          drawParticle(s, s.opacity);
        }

        if (elapsed >= CLEAN_MS) {
          startRef.current = 0;
          onPhaseChange("in");
        }
      } else if (currentPhase === "in") {
        const p = Math.min(1, elapsed / IN_MS);
        const fade = 1 - easeOutCubic(p);
        canvas.style.opacity = String(fade);

        for (const s of particlesRef.current) {
          s.opacity *= 0.92;
          drawParticle(s, s.opacity * fade);
        }

        if (p >= 1) {
          onComplete();
          return;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    rafRef.current = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [capture, onComplete, onPhaseChange, onSnapshotReady]);

  return (
    <canvas
      ref={canvasRef}
      className="dust-overlay is-active"
      data-particle-count={capture.particles.length}
      aria-hidden
      role="presentation"
    />
  );
}

export { TOTAL_MS, OUT_MS, CLEAN_MS, IN_MS };
