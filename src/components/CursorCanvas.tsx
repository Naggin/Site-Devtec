import { useEffect, useRef } from "react";

/* ── snippets that float in the background ── */
const SNIPPETS = [
  "const build = () =>",
  "npm run dev",
  "git commit -m",
  "async function deploy()",
  "return <Component />",
  "interface Props {",
  "useState<T>(null)",
  "useEffect(() => {",
  "fetch('/api/data')",
  "border-radius: 12px",
  "flex-direction: column",
  "SELECT * FROM",
  "docker compose up",
  "ssh ubuntu@prod",
  "yarn add react",
  "type Result<T> =",
  "export default function",
  "Promise.all([...])",
  "z-index: 9999",
  ".map((item) =>",
  "if (err) throw err",
  "require('express')",
  "padding: 0 24px",
  "border: 1px solid",
];

type FloatingToken = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  targetOpacity: number;
  text: string;
  size: number;
  life: number;
  maxLife: number;
};

type TrailDot = { x: number; y: number; alpha: number };

export default function CursorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    let mx = w / 2;
    let my = h / 2;
    let raf = 0;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w;
      canvas!.height = h;
    }
    resize();

    /* trail dots following cursor */
    const trail: TrailDot[] = [];

    /* floating code tokens */
    const tokens: FloatingToken[] = [];

    function spawnToken(near = false) {
      const idx = Math.floor(Math.random() * SNIPPETS.length);
      const token: FloatingToken = {
        x: near ? mx + (Math.random() - 0.5) * 300 : Math.random() * w,
        y: near ? my + (Math.random() - 0.5) * 300 : Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35 - 0.12,
        opacity: 0,
        targetOpacity: Math.random() * 0.22 + 0.08,
        text: SNIPPETS[idx]!,
        size: Math.random() * 2 + 11,
        life: 0,
        maxLife: Math.random() * 260 + 160,
      };
      tokens.push(token);
    }

    /* seed initial tokens */
    for (let i = 0; i < 18; i++) spawnToken(false);

    let lastSpawn = 0;

    function draw(ts: number) {
      raf = requestAnimationFrame(draw);
      ctx!.clearRect(0, 0, w, h);

      /* ── cursor glow ── */
      const grd = ctx!.createRadialGradient(mx, my, 0, mx, my, 200);
      grd.addColorStop(0, "rgba(108,143,255,0.12)");
      grd.addColorStop(0.5, "rgba(108,143,255,0.04)");
      grd.addColorStop(1, "transparent");
      ctx!.fillStyle = grd;
      ctx!.beginPath();
      ctx!.arc(mx, my, 200, 0, Math.PI * 2);
      ctx!.fill();

      /* ── trail ── */
      trail.push({ x: mx, y: my, alpha: 0.6 });
      if (trail.length > 28) trail.shift();

      for (let i = 0; i < trail.length; i++) {
        const t = trail[i]!;
        t.alpha *= 0.88;
        const r = (i / trail.length) * 5;
        ctx!.beginPath();
        ctx!.arc(t.x, t.y, r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(108,143,255,${t.alpha * 0.55})`;
        ctx!.fill();
      }

      /* ── tokens ── */
      if (ts - lastSpawn > 1400 && tokens.length < 26) {
        spawnToken(Math.random() > 0.55);
        lastSpawn = ts;
      }

      ctx!.font = `500 12px "GeistMono", monospace`;

      for (let i = tokens.length - 1; i >= 0; i--) {
        const t = tokens[i]!;
        t.life++;
        t.x += t.vx;
        t.y += t.vy;

        /* repel slightly from cursor */
        const dx = t.x - mx;
        const dy = t.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          t.vx += (dx / dist) * 0.06;
          t.vy += (dy / dist) * 0.06;
        }
        /* dampen velocity */
        t.vx *= 0.99;
        t.vy *= 0.99;

        /* fade in / out */
        const progress = t.life / t.maxLife;
        if (progress < 0.15) {
          t.opacity += 0.008;
        } else if (progress > 0.75) {
          t.opacity -= 0.006;
        } else {
          t.opacity += (t.targetOpacity - t.opacity) * 0.04;
        }
        t.opacity = Math.max(0, Math.min(1, t.opacity));

        if (t.life > t.maxLife || t.opacity <= 0.005) {
          tokens.splice(i, 1);
          continue;
        }

        ctx!.globalAlpha = t.opacity;
        ctx!.fillStyle = "#6c8fff";
        ctx!.fillText(t.text, t.x, t.y);
      }

      ctx!.globalAlpha = 1;
    }

    raf = requestAnimationFrame(draw);

    function onMove(e: MouseEvent) { mx = e.clientX; my = e.clientY; }
    function onTouch(e: TouchEvent) {
      const t = e.touches[0];
      if (t) { mx = t.clientX; my = t.clientY; }
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} id="cursor-canvas" aria-hidden />;
}
