import { useEffect, useRef } from "react";

const CHARS = "01{}[]<>/\\|&*#@$%constletfn=>;".split("");
const TOTAL_MS = 1500;
const OUT_MS = 550;
const CLEAN_MS = 200;
const IN_MS = 750;

type Phase = "out" | "clean" | "in";

type Shard = {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  rot: number;
  rotV: number;
  char: string;
  color: string;
  opacity: number;
};

type Props = {
  phase: Phase | "idle";
  onPhaseChange: (phase: Phase | "idle") => void;
  onComplete: () => void;
};

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function easeInCubic(t: number) {
  return t ** 3;
}

export default function FragmentTransition({ phase, onPhaseChange, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shardsRef = useRef<Shard[]>([]);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const phaseRef = useRef(phase);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
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
      buildShards();
    };

    const buildShards = () => {
      const cols = Math.max(8, Math.min(18, Math.round(W / 72)));
      const rows = Math.max(6, Math.min(14, Math.round(H / 64)));
      const cellW = W / cols;
      const cellH = H / rows;
      const shards: Shard[] = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const homeX = col * cellW + cellW * 0.08;
          const homeY = row * cellH + cellH * 0.08;
          const w = cellW * (0.72 + Math.random() * 0.2);
          const h = cellH * (0.68 + Math.random() * 0.22);
          const cx = homeX + w / 2;
          const cy = homeY + h / 2;
          const angle = Math.atan2(cy - H / 2, cx - W / 2);
          const force = 4 + Math.random() * 10;

          shards.push({
            homeX,
            homeY,
            x: homeX,
            y: homeY,
            w,
            h,
            vx: Math.cos(angle) * force,
            vy: Math.sin(angle) * force,
            rot: (Math.random() - 0.5) * 0.4,
            rotV: (Math.random() - 0.5) * 0.08,
            char: CHARS[Math.floor(Math.random() * CHARS.length)]!,
            color: Math.random() > 0.35 ? "#e02020" : "#f4f4f4",
            opacity: 0.85 + Math.random() * 0.15,
          });
        }
      }
      shardsRef.current = shards;
    };

    const drawGrid = (alpha: number) => {
      ctx.strokeStyle = `rgba(224, 32, 32, ${alpha * 0.12})`;
      ctx.lineWidth = 1;
      const step = 48;
      for (let x = 0; x < W; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
    };

    const draw = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const currentPhase = phaseRef.current;

      ctx.fillStyle = "#080808";
      ctx.fillRect(0, 0, W, H);

      if (currentPhase === "out") {
        const p = Math.min(1, elapsed / OUT_MS);
        const eased = easeOutCubic(p);

        for (const s of shardsRef.current) {
          s.x = s.homeX + s.vx * eased * 28;
          s.y = s.homeY + s.vy * eased * 28;
          s.rot += s.rotV * eased;
          s.opacity = 0.9 * (1 - eased * 0.85);

          ctx.save();
          ctx.translate(s.x + s.w / 2, s.y + s.h / 2);
          ctx.rotate(s.rot);
          ctx.globalAlpha = s.opacity;
          ctx.fillStyle = "rgba(224, 32, 32, 0.08)";
          ctx.fillRect(-s.w / 2 - 2, -s.h / 2 - 2, s.w + 4, s.h + 4);
          ctx.fillStyle = "#111";
          ctx.strokeStyle = "rgba(224, 32, 32, 0.35)";
          ctx.lineWidth = 1;
          ctx.fillRect(-s.w / 2, -s.h / 2, s.w, s.h);
          ctx.strokeRect(-s.w / 2, -s.h / 2, s.w, s.h);
          ctx.font = '500 11px "GeistMono", monospace';
          ctx.fillStyle = s.color;
          ctx.fillText(s.char, -s.w / 2 + 4, s.h / 2 - 4);
          ctx.restore();
        }

        if (p >= 1) {
          startRef.current = 0;
          onPhaseChange("clean");
        }
      } else if (currentPhase === "clean") {
        drawGrid(0.6 + Math.sin(elapsed * 0.02) * 0.1);
        if (elapsed >= CLEAN_MS) {
          startRef.current = 0;
          onPhaseChange("in");
        }
      } else if (currentPhase === "in") {
        const p = Math.min(1, elapsed / IN_MS);
        const eased = easeInCubic(p);
        drawGrid(0.25 * (1 - p));

        for (const s of shardsRef.current) {
          const scatter = 1 - eased;
          s.x = s.homeX + s.vx * scatter * 28;
          s.y = s.homeY + s.vy * scatter * 28;
          s.rot = s.rotV * scatter;
          s.opacity = 0.15 + eased * 0.85;

          ctx.save();
          ctx.translate(s.x + s.w / 2, s.y + s.h / 2);
          ctx.rotate(s.rot);
          ctx.globalAlpha = s.opacity * (p < 0.92 ? 1 : 1 - (p - 0.92) / 0.08);
          ctx.fillStyle = "rgba(224, 32, 32, 0.06)";
          ctx.fillRect(-s.w / 2 - 2, -s.h / 2 - 2, s.w + 4, s.h + 4);
          ctx.fillStyle = "#0e0e0e";
          ctx.strokeStyle = "rgba(224, 32, 32, 0.45)";
          ctx.lineWidth = 1;
          ctx.fillRect(-s.w / 2, -s.h / 2, s.w, s.h);
          ctx.strokeRect(-s.w / 2, -s.h / 2, s.w, s.h);
          ctx.font = '500 11px "GeistMono", monospace';
          ctx.fillStyle = s.color;
          ctx.fillText(s.char, -s.w / 2 + 4, s.h / 2 - 4);
          ctx.restore();
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
  }, [onComplete, onPhaseChange]);

  return (
    <canvas
      ref={canvasRef}
      className="fragment-overlay"
      aria-hidden
      role="presentation"
    />
  );
}

export { TOTAL_MS, OUT_MS, CLEAN_MS, IN_MS };
