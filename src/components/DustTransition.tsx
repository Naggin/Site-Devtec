import { useEffect, useRef } from "react";

const CHARS = "01{}[]<>/\\|&*#@$%constletfn=>;".split("");
const OUT_MS = 750;
const CLEAN_MS = 350;
const IN_MS = 900;
const TOTAL_MS = OUT_MS + CLEAN_MS + IN_MS;

type Phase = "out" | "clean" | "in";

type Particle = {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  size: number;
  vx: number;
  lift: number;
  wobble: number;
  color: string;
  opacity: number;
  delay: number;
  kind: "dust" | "char";
  char: string;
};

type Props = {
  phase: Phase | "idle";
  onPhaseChange: (phase: Phase | "idle") => void;
  onComplete: () => void;
};

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function parseRgb(color: string): [number, number, number] | null {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function sampleColor(x: number, y: number): string {
  const el = document.elementFromPoint(x, y);
  if (!el || el.closest(".dust-overlay")) return "#c8c8c8";

  const style = getComputedStyle(el);
  const bg = style.backgroundColor;
  const fg = style.color;

  const bgRgb = parseRgb(bg);
  if (
    bgRgb &&
    (bgRgb[0] + bgRgb[1] + bgRgb[2] > 24 ||
      (bg.includes("rgba") && !bg.endsWith(", 0)")))
  ) {
    return bg;
  }

  const fgRgb = parseRgb(fg);
  if (fgRgb) return fg;

  return Math.random() > 0.35 ? "#e02020" : "#f0f0f0";
}

function tintColor(color: string, redMix: number): string {
  const rgb = parseRgb(color);
  if (!rgb) return color;
  const [r, g, b] = rgb;
  return `rgb(${Math.round(r * (1 - redMix) + 224 * redMix)}, ${Math.round(g * (1 - redMix) + 32 * redMix)}, ${Math.round(b * (1 - redMix) + 32 * redMix)})`;
}

export default function DustTransition({ phase, onPhaseChange, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const phaseRef = useRef(phase);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;

    const buildParticles = () => {
      const mobile = W < 768;
      const step = mobile ? 7 : 5;
      const maxCount = mobile ? 900 : 2200;
      const particles: Particle[] = [];

      for (let y = step / 2; y < H; y += step) {
        for (let x = step / 2; x < W; x += step) {
          if (particles.length >= maxCount) break;

          const raw = sampleColor(x, y);
          const redMix = Math.random() > 0.72 ? 0.35 + Math.random() * 0.35 : 0;
          const isChar = Math.random() > 0.88;

          particles.push({
            homeX: x,
            homeY: y,
            x,
            y,
            size: isChar ? 10 : 1.2 + Math.random() * 2.2,
            vx: (Math.random() - 0.5) * 1.4,
            lift: 0.7 + Math.random() * 1.6,
            wobble: Math.random() * Math.PI * 2,
            color: tintColor(raw, redMix),
            opacity: 0.75 + Math.random() * 0.25,
            delay: Math.random() * 0.45,
            kind: isChar ? "char" : "dust",
            char: CHARS[Math.floor(Math.random() * CHARS.length)]!,
          });
        }
      }

      particlesRef.current = particles;
    };

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
    };

    const drawParticle = (p: Particle, alpha: number) => {
      if (alpha <= 0.01) return;

      ctx.globalAlpha = alpha;
      if (p.kind === "char") {
        ctx.font = '500 10px "GeistMono", ui-monospace, monospace';
        ctx.fillStyle = p.color;
        ctx.fillText(p.char, p.x - 4, p.y + 3);
        return;
      }

      ctx.fillStyle = p.color;
      const s = p.size;
      ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
    };

    const draw = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const currentPhase = phaseRef.current;

      ctx.clearRect(0, 0, W, H);

      if (currentPhase === "out") {
        const p = Math.min(1, elapsed / OUT_MS);
        const dark = easeOutCubic(p) * 0.96;

        ctx.fillStyle = `rgba(8, 8, 8, ${dark})`;
        ctx.fillRect(0, 0, W, H);

        for (const s of particlesRef.current) {
          const local = Math.min(1, Math.max(0, (p - s.delay * 0.35) / (1 - s.delay * 0.35)));
          const eased = easeOutCubic(local);
          const drift = Math.sin(elapsed * 0.004 + s.wobble) * 12 * eased;

          s.x = s.homeX + s.vx * eased * 48 + drift;
          s.y = s.homeY - s.lift * eased * (90 + H * 0.08);
          s.opacity = (1 - eased * 0.95) * 0.85;

          drawParticle(s, s.opacity);
        }

        if (p >= 1) {
          startRef.current = 0;
          onPhaseChange("clean");
        }
      } else if (currentPhase === "clean") {
        ctx.fillStyle = "#060606";
        ctx.fillRect(0, 0, W, H);

        const linger = Math.min(1, elapsed / CLEAN_MS);
        for (const s of particlesRef.current) {
          if (Math.random() > 0.992) continue;
          s.x += s.vx * 0.6;
          s.y -= s.lift * 0.9;
          s.opacity = 0.08 * (1 - linger);
          drawParticle(s, s.opacity);
        }

        if (elapsed >= CLEAN_MS) {
          startRef.current = 0;
          onPhaseChange("in");
        }
      } else if (currentPhase === "in") {
        const p = Math.min(1, elapsed / IN_MS);
        const eased = easeInOutCubic(p);
        const dark = (1 - eased) * 0.92;

        ctx.fillStyle = `rgba(6, 6, 6, ${dark})`;
        ctx.fillRect(0, 0, W, H);

        for (const s of particlesRef.current) {
          const local = Math.min(1, Math.max(0, (p - s.delay * 0.2) / (1 - s.delay * 0.15)));
          const t = easeInOutCubic(local);
          const scatterX = s.vx * 70 + Math.sin(s.wobble) * 40;
          const scatterY = -80 - s.lift * 120;

          s.x = s.homeX + scatterX * (1 - t);
          s.y = s.homeY + scatterY * (1 - t);
          s.opacity = Math.min(1, t * 1.1) * (p > 0.88 ? (1 - p) / 0.12 : 0.85);

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
  }, [onComplete, onPhaseChange]);

  return (
    <canvas
      ref={canvasRef}
      className="dust-overlay"
      aria-hidden
      role="presentation"
    />
  );
}

export { TOTAL_MS, OUT_MS, CLEAN_MS, IN_MS };
