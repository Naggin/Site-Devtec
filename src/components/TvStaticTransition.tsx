import { useEffect, useRef } from "react";

const OUT_MS = 420;
const CLEAN_MS = 680;
const IN_MS = 500;
const TOTAL_MS = OUT_MS + CLEAN_MS + IN_MS;

const RED = { r: 224, g: 32, b: 32 };

type Phase = "out" | "clean" | "in";

type Props = {
  phase: Phase | "idle";
  signalLabel: string;
  onPhaseChange: (phase: Phase | "idle") => void;
  onComplete: () => void;
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeOutQuad(t: number) {
  return 1 - (1 - t) * (1 - t);
}

function easeInQuad(t: number) {
  return t * t;
}

export default function TvStaticTransition({
  phase,
  signalLabel,
  onPhaseChange,
  onComplete,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const phaseRef = useRef(phase);
  const rollRef = useRef(0);
  const noiseRef = useRef<Uint8ClampedArray | null>(null);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
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
      noiseRef.current = new Uint8ClampedArray(Math.ceil(W * H));
    };

    const fillNoise = (intensity: number, redBias: number) => {
      const buf = noiseRef.current;
      if (!buf) return;
      const count = buf.length;
      for (let i = 0; i < count; i++) {
        const n = Math.random();
        const v = n < intensity ? Math.random() * 255 : Math.random() * 40;
        buf[i] = Math.min(255, v * (1 - redBias * 0.25) + redBias * 180);
      }
    };

    const drawNoise = (intensity: number, redTint: number, roll: number) => {
      const buf = noiseRef.current;
      if (!buf) return;

      fillNoise(intensity, redTint);

      const image = ctx.createImageData(W, H);
      const data = image.data;
      const rollPx = Math.floor(roll * H) % H;
      const redMix = redTint * 0.55;

      for (let y = 0; y < H; y++) {
        const srcY = (y + rollPx) % H;
        const scanDim = y % 3 === 0 ? 0.82 : 1;
        for (let x = 0; x < W; x++) {
          const gray = buf[srcY * W + x]!;
          const i = (y * W + x) * 4;
          const r = lerp(gray, RED.r, redMix) * scanDim;
          const g = lerp(gray * 0.9, RED.g, redMix * 0.35) * scanDim;
          const b = lerp(gray * 0.85, RED.b, redMix * 0.35) * scanDim;
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = 255;
        }
      }

      ctx.putImageData(image, 0, 0);
    };

    const drawVignette = (alpha: number) => {
      const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);
      g.addColorStop(0, `rgba(0,0,0,0)`);
      g.addColorStop(1, `rgba(0,0,0,${alpha})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    };

    const drawColorBars = (alpha: number) => {
      if (alpha <= 0) return;
      const barW = W / 7;
      const colors = ["#1a0505", "#2a0808", "#3a0c0c", "#e02020", "#8a1010", "#140404", "#0a0a0a"];
      ctx.globalAlpha = alpha * 0.35;
      for (let i = 0; i < colors.length; i++) {
        ctx.fillStyle = colors[i]!;
        ctx.fillRect(i * barW, 0, barW + 1, H * 0.08);
      }
      ctx.globalAlpha = 1;
    };

    const drawSignalText = (alpha: number) => {
      if (alpha <= 0.05) return;
      const size = Math.max(13, Math.min(18, W * 0.014));
      ctx.save();
      ctx.globalAlpha = alpha * 0.55;
      ctx.font = `500 ${size}px "GeistMono", ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#f4f4f4";
      ctx.shadowColor = "rgba(224, 32, 32, 0.9)";
      ctx.shadowBlur = 12;
      const jitterX = (Math.random() - 0.5) * 3;
      const jitterY = (Math.random() - 0.5) * 2;
      ctx.fillText(signalLabel, W / 2 + jitterX, H / 2 + jitterY);
      ctx.restore();
    };

    const drawScanRoll = (strength: number) => {
      if (strength <= 0) return;
      const bandH = 4 + strength * 6;
      const y = (rollRef.current * H * 0.4) % (H + bandH) - bandH;
      ctx.fillStyle = `rgba(224, 32, 32, ${0.08 + strength * 0.12})`;
      ctx.fillRect(0, y, W, bandH);
    };

    const draw = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const currentPhase = phaseRef.current;

      rollRef.current += 0.004 + Math.random() * 0.006;

      if (currentPhase === "out") {
        const p = Math.min(1, elapsed / OUT_MS);
        const eased = easeOutQuad(p);
        const intensity = lerp(0.15, 0.95, eased);
        const redTint = lerp(0.1, 0.65, eased);

        ctx.fillStyle = "#080808";
        ctx.fillRect(0, 0, W, H);
        drawNoise(intensity, redTint, rollRef.current);
        drawScanRoll(eased * 0.6);
        drawVignette(0.35 + eased * 0.25);
        drawColorBars(eased * 0.5);

        if (p >= 1) {
          startRef.current = 0;
          onPhaseChange("clean");
        }
      } else if (currentPhase === "clean") {
        const p = Math.min(1, elapsed / CLEAN_MS);
        const flicker = 0.92 + Math.sin(elapsed * 0.05) * 0.05;
        const intensity = 0.98 * flicker;
        const textAlpha = p < 0.15 ? p / 0.15 : p > 0.85 ? (1 - p) / 0.15 : 1;

        ctx.fillStyle = "#050505";
        ctx.fillRect(0, 0, W, H);
        drawNoise(intensity, 0.75, rollRef.current * 1.6);
        drawScanRoll(0.85);
        drawVignette(0.55);
        drawColorBars(0.25);
        drawSignalText(textAlpha);

        if (p >= 1) {
          startRef.current = 0;
          onPhaseChange("in");
        }
      } else if (currentPhase === "in") {
        const p = Math.min(1, elapsed / IN_MS);
        const eased = easeInQuad(p);
        const intensity = lerp(0.95, 0, 1 - eased);
        const redTint = lerp(0.6, 0, 1 - eased);

        if (intensity > 0.02) {
          drawNoise(intensity, redTint, rollRef.current * (1 - eased));
          drawScanRoll((1 - eased) * 0.5);
          drawVignette(0.45 * (1 - eased));
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
  }, [onComplete, onPhaseChange, signalLabel]);

  return (
    <canvas
      ref={canvasRef}
      className="tv-static-overlay"
      aria-hidden
      role="presentation"
    />
  );
}

export { TOTAL_MS, OUT_MS, CLEAN_MS, IN_MS };
