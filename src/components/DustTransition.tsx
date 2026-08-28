import { useEffect, useRef } from "react";
import type { DustCapture, DustParticle } from "../lib/dustCapture";

/** Snappy PT/EN swap — total ~1.1s so it feels alive, not broken. */
const OUT_MS = 450;
const CLEAN_MS = 150;
const IN_MS = 550;
const TOTAL_MS = OUT_MS + CLEAN_MS + IN_MS;

type Phase = "out" | "clean" | "in";

type Props = {
  phase: Phase | "idle";
  capturePromise: Promise<DustCapture>;
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

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export default function DustTransition({
  phase,
  capturePromise,
  onPhaseChange,
  onComplete,
  onSnapshotReady,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<DustParticle[]>([]);
  const snapshotRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const phaseRef = useRef(phase);
  const readyRef = useRef(false);
  const firstFrameRef = useRef(false);
  const particleCountRef = useRef(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const captured = await capturePromise;
      if (cancelled) return;

      snapshotRef.current = captured.snapshot;
      particlesRef.current = captured.particles;
      particleCountRef.current = captured.particles.length;
      readyRef.current = true;

      const canvas = canvasRef.current;
      if (canvas) {
        canvas.dataset.particleCount = String(captured.particles.length);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [capturePromise]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;

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
      canvas.classList.add("is-active");
      onSnapshotReady?.();
    };

    const draw = (ts: number) => {
      if (!readyRef.current) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const currentPhase = phaseRef.current;
      const snapshot = snapshotRef.current;

      ctx.clearRect(0, 0, W, H);

      if (currentPhase === "out") {
        const p = Math.min(1, elapsed / OUT_MS);

        if (snapshot) {
          ctx.globalAlpha = Math.max(0.35, 1 - easeOutQuart(Math.max(0, (p - 0.72) / 0.28)) * 0.65);
          ctx.drawImage(snapshot, 0, 0, W, H);
          notifyFirstFrame();
        }

        for (const s of particlesRef.current) {
          const local = Math.min(
            1,
            Math.max(0, (p - s.delay * 0.4) / Math.max(0.1, 1 - s.delay * 0.4)),
          );
          const eased = easeOutQuart(local);
          if (eased <= 0) continue;

          punchHole(
            s.homeX,
            s.homeY,
            s.size * (0.6 + eased * (s.kind === "char" ? 2.4 : 1.8)),
          );

          const drift = Math.sin(elapsed * 0.008 + s.wobble) * 22 * eased;
          s.x = s.homeX + s.vx * eased * 88 + drift;
          s.y = s.homeY - s.lift * eased * (140 + H * 0.14);
          s.opacity = (0.55 + (1 - eased) * 0.45) * 0.98;

          drawParticle(s, s.opacity);
        }

        const dark = easeOutCubic(Math.max(0, (p - 0.92) / 0.08)) * 0.12;
        ctx.globalAlpha = 1;
        ctx.fillStyle = `rgba(6, 6, 6, ${dark})`;
        ctx.fillRect(0, 0, W, H);

        if (p >= 1) {
          startRef.current = 0;
          onPhaseChange("clean");
        }
      } else if (currentPhase === "clean") {
        notifyFirstFrame();

        const linger = Math.min(1, elapsed / CLEAN_MS);
        const veil = 0.14 * (1 - easeOutCubic(linger));

        ctx.fillStyle = `rgba(6, 6, 6, ${veil})`;
        ctx.fillRect(0, 0, W, H);

        for (const s of particlesRef.current) {
          if (Math.random() > 0.985) continue;
          s.x += s.vx * 1.2;
          s.y -= s.lift * 1.6;
          s.opacity = 0.22 * (1 - linger);
          drawParticle(s, s.opacity);
        }

        if (elapsed >= CLEAN_MS) {
          startRef.current = 0;
          onPhaseChange("in");
        }
      } else if (currentPhase === "in") {
        const p = Math.min(1, elapsed / IN_MS);
        const eased = easeInOutCubic(p);
        const dark = (1 - eased) * 0.16;

        ctx.fillStyle = `rgba(6, 6, 6, ${dark})`;
        ctx.fillRect(0, 0, W, H);

        for (const s of particlesRef.current) {
          const local = Math.min(
            1,
            Math.max(0, (p - s.delay * 0.1) / Math.max(0.04, 1 - s.delay * 0.08)),
          );
          const t = easeOutCubic(local);
          const scatterX = s.vx * 90 + Math.sin(s.wobble) * 50;
          const scatterY = -100 - s.lift * 140;

          s.x = s.homeX + scatterX * (1 - t);
          s.y = s.homeY + scatterY * (1 - t);
          s.opacity = Math.min(1, t * 1.2) * (p > 0.82 ? (1 - p) / 0.18 : 0.92);

          drawParticle(s, s.opacity);
        }

        if (p >= 1) {
          onComplete();
          return;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    startRef.current = 0;
    rafRef.current = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [onComplete, onPhaseChange, onSnapshotReady]);

  return (
    <canvas
      ref={canvasRef}
      className="dust-overlay"
      data-particle-count={particleCountRef.current || undefined}
      aria-hidden
      role="presentation"
    />
  );
}

export { TOTAL_MS, OUT_MS, CLEAN_MS, IN_MS };
