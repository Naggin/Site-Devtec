import html2canvas from "html2canvas";
import { useEffect, useRef, useState } from "react";

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
  onSnapshotReady?: () => void;
};

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function tintColor(r: number, g: number, b: number, redMix: number): string {
  return `rgb(${Math.round(r * (1 - redMix) + 224 * redMix)}, ${Math.round(g * (1 - redMix) + 32 * redMix)}, ${Math.round(b * (1 - redMix) + 32 * redMix)})`;
}

function parseRgb(color: string): [number, number, number] | null {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function sampleDomColor(x: number, y: number): [number, number, number] | null {
  if (typeof document.elementFromPoint !== "function") return null;
  const shell = document.querySelector(".app-shell");
  const el = document.elementFromPoint(x, y);
  if (!el || !shell?.contains(el)) return null;

  const style = getComputedStyle(el);
  for (const color of [style.color, style.backgroundColor]) {
    const rgb = parseRgb(color);
    if (!rgb) continue;
    const [r, g, b] = rgb;
    if (r + g + b > 40) return rgb;
  }
  return null;
}

function isCaptureValid(imageData: ImageData): boolean {
  const { data } = imageData;
  let lit = 0;
  const step = 16;
  for (let i = 0; i < data.length; i += 4 * step) {
    if (data[i]! + data[i + 1]! + data[i + 2]! > 90) lit++;
  }
  return lit > 120;
}

function buildParticlesFromImage(
  imageData: ImageData,
  W: number,
  H: number,
): Particle[] {
  const mobile = W < 768;
  const step = mobile ? 6 : 4;
  const maxCount = mobile ? 1200 : 2800;
  const particles: Particle[] = [];
  const { data, width } = imageData;

  for (let y = step / 2; y < H; y += step) {
    for (let x = step / 2; x < W; x += step) {
      if (particles.length >= maxCount) break;

      const px = Math.min(width - 1, Math.floor(x));
      const py = Math.min(imageData.height - 1, Math.floor(y));
      const i = (py * width + px) * 4;
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      const a = data[i + 3]!;

      if (a < 40) continue;
      if (r + g + b < 24) continue;

      particles.push(makeParticle(x, y, r, g, b));
    }
  }

  return particles;
}

function buildParticlesFromDom(W: number, H: number): Particle[] {
  const mobile = W < 768;
  const step = mobile ? 6 : 4;
  const maxCount = mobile ? 1200 : 2800;
  const particles: Particle[] = [];

  for (let y = step / 2; y < H; y += step) {
    for (let x = step / 2; x < W; x += step) {
      if (particles.length >= maxCount) break;
      const rgb = sampleDomColor(x, y);
      if (!rgb) continue;
      const [r, g, b] = rgb;
      particles.push(makeParticle(x, y, r, g, b));
    }
  }

  return particles;
}

function makeParticle(
  x: number,
  y: number,
  r: number,
  g: number,
  b: number,
): Particle {
  const redMix = Math.random() > 0.78 ? 0.3 + Math.random() * 0.4 : 0;
  const isChar = Math.random() > 0.9;

  return {
    homeX: x,
    homeY: y,
    x,
    y,
    size: isChar ? 9 + Math.random() * 3 : 1.4 + Math.random() * 2.6,
    vx: (Math.random() - 0.5) * 1.8,
    lift: 0.8 + Math.random() * 1.8,
    wobble: Math.random() * Math.PI * 2,
    color: tintColor(r, g, b, redMix),
    opacity: 0.8 + Math.random() * 0.2,
    delay: Math.random() * 0.5,
    kind: isChar ? "char" : "dust",
    char: CHARS[Math.floor(Math.random() * CHARS.length)]!,
  };
}

async function captureViewport(): Promise<{
  snapshot: HTMLCanvasElement | null;
  particles: Particle[];
  W: number;
  H: number;
}> {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const target = document.querySelector<HTMLElement>(".app-shell");

  if (!target) {
    return { snapshot: null, particles: buildParticlesFromDom(W, H), W, H };
  }

  const snapshot = document.createElement("canvas");
  snapshot.width = W;
  snapshot.height = H;
  const snapCtx = snapshot.getContext("2d");
  if (!snapCtx) {
    return { snapshot: null, particles: buildParticlesFromDom(W, H), W, H };
  }

  try {
    const shot = await html2canvas(target, {
      backgroundColor: null,
      scale: 1,
      useCORS: true,
      logging: false,
      width: W,
      height: H,
      windowWidth: W,
      windowHeight: H,
      scrollX: 0,
      scrollY: -window.scrollY,
      x: 0,
      y: 0,
    });

    snapCtx.drawImage(shot, 0, 0, W, H);
    const imageData = snapCtx.getImageData(0, 0, W, H);

    if (isCaptureValid(imageData)) {
      return {
        snapshot,
        particles: buildParticlesFromImage(imageData, W, H),
        W,
        H,
      };
    }
  } catch {
    /* fall through to DOM sampling */
  }

  snapCtx.fillStyle = "#080808";
  snapCtx.fillRect(0, 0, W, H);

  const particles = buildParticlesFromDom(W, H);
  for (const p of particles) {
    snapCtx.fillStyle = p.color;
    const s = p.size;
    snapCtx.fillRect(p.homeX - s / 2, p.homeY - s / 2, s, s);
  }

  return { snapshot, particles, W, H };
}

export default function DustTransition({
  phase,
  onPhaseChange,
  onComplete,
  onSnapshotReady,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const snapshotRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const phaseRef = useRef(phase);
  const readyRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const [particleCount, setParticleCount] = useState(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      if (cancelled) return;

      const { snapshot, particles } = await captureViewport();
      if (cancelled) return;

      snapshotRef.current = snapshot;
      particlesRef.current = particles;
      setParticleCount(particles.length);
      readyRef.current = true;
      onSnapshotReady?.();
      setVisible(true);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [onSnapshotReady]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !visible) return;

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

    const drawParticle = (p: Particle, alpha: number) => {
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
          ctx.globalAlpha = 1;
          ctx.drawImage(snapshot, 0, 0, W, H);
        }

        for (const s of particlesRef.current) {
          const local = Math.min(
            1,
            Math.max(0, (p - s.delay * 0.4) / Math.max(0.05, 1 - s.delay * 0.4)),
          );
          const eased = easeOutCubic(local);
          if (eased <= 0) continue;

          punchHole(s.homeX, s.homeY, s.size * (s.kind === "char" ? 2.8 : 2.2));

          const drift = Math.sin(elapsed * 0.005 + s.wobble) * 14 * eased;
          s.x = s.homeX + s.vx * eased * 55 + drift;
          s.y = s.homeY - s.lift * eased * (100 + H * 0.1);
          s.opacity = (1 - eased * 0.55) * 0.98;

          drawParticle(s, s.opacity);
        }

        const dark = easeOutCubic(Math.max(0, (p - 0.78) / 0.22)) * 0.42;
        ctx.globalAlpha = 1;
        ctx.fillStyle = `rgba(6, 6, 6, ${dark})`;
        ctx.fillRect(0, 0, W, H);

        if (p >= 1) {
          startRef.current = 0;
          onPhaseChange("clean");
        }
      } else if (currentPhase === "clean") {
        ctx.fillStyle = "#060606";
        ctx.fillRect(0, 0, W, H);

        const linger = Math.min(1, elapsed / CLEAN_MS);
        for (const s of particlesRef.current) {
          if (Math.random() > 0.985) continue;
          s.x += s.vx * 0.8;
          s.y -= s.lift * 1.1;
          s.opacity = 0.15 * (1 - linger);
          drawParticle(s, s.opacity);
        }

        if (elapsed >= CLEAN_MS) {
          startRef.current = 0;
          onPhaseChange("in");
        }
      } else if (currentPhase === "in") {
        const p = Math.min(1, elapsed / IN_MS);
        const eased = easeInOutCubic(p);
        const dark = (1 - eased) * 0.85;

        ctx.fillStyle = `rgba(6, 6, 6, ${dark})`;
        ctx.fillRect(0, 0, W, H);

        for (const s of particlesRef.current) {
          const local = Math.min(
            1,
            Math.max(0, (p - s.delay * 0.15) / Math.max(0.05, 1 - s.delay * 0.12)),
          );
          const t = easeInOutCubic(local);
          const scatterX = s.vx * 80 + Math.sin(s.wobble) * 45;
          const scatterY = -90 - s.lift * 130;

          s.x = s.homeX + scatterX * (1 - t);
          s.y = s.homeY + scatterY * (1 - t);
          s.opacity = Math.min(1, t * 1.15) * (p > 0.85 ? (1 - p) / 0.15 : 0.9);

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
  }, [onComplete, onPhaseChange, visible]);

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="dust-overlay is-active"
      data-particle-count={particleCount}
      aria-hidden
      role="presentation"
    />
  );
}

export { TOTAL_MS, OUT_MS, CLEAN_MS, IN_MS };
