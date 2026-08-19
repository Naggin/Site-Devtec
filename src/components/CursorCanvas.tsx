import { useEffect, useRef } from "react";

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
  "SELECT * FROM users",
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
  "git push origin main",
  "npm run build",
];

type Token = {
  x: number; y: number;
  vx: number; vy: number;
  opacity: number; targetOpacity: number;
  text: string; life: number; maxLife: number;
};

type Dot = { x: number; y: number; alpha: number };

export default function CursorCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    let mx = W / 2;
    let my = H / 2;
    let raf = 0;

    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      canvas!.width = W; canvas!.height = H;
    }
    resize();

    const trail: Dot[] = [];
    const tokens: Token[] = [];

    function spawn(nearCursor = false) {
      tokens.push({
        x: nearCursor ? mx + (Math.random() - 0.5) * 320 : Math.random() * W,
        y: nearCursor ? my + (Math.random() - 0.5) * 320 : Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.1,
        opacity: 0,
        targetOpacity: Math.random() * 0.18 + 0.06,
        text: SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)]!,
        life: 0,
        maxLife: Math.random() * 220 + 160,
      });
    }

    for (let i = 0; i < 20; i++) spawn(false);

    let lastSpawn = 0;

    function frame(ts: number) {
      raf = requestAnimationFrame(frame);
      ctx!.clearRect(0, 0, W, H);

      /* — cursor glow (red) — */
      const g = ctx!.createRadialGradient(mx, my, 0, mx, my, 220);
      g.addColorStop(0, "rgba(224,32,32,0.10)");
      g.addColorStop(0.5, "rgba(224,32,32,0.03)");
      g.addColorStop(1, "transparent");
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.arc(mx, my, 220, 0, Math.PI * 2);
      ctx!.fill();

      /* — trail — */
      trail.push({ x: mx, y: my, alpha: 0.55 });
      if (trail.length > 26) trail.shift();
      for (let i = 0; i < trail.length; i++) {
        const d = trail[i]!;
        d.alpha *= 0.87;
        const r = (i / trail.length) * 4.5;
        ctx!.beginPath();
        ctx!.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(224,32,32,${d.alpha * 0.5})`;
        ctx!.fill();
      }

      /* — tokens — */
      if (ts - lastSpawn > 1600 && tokens.length < 28) {
        spawn(Math.random() > 0.5);
        lastSpawn = ts;
      }

      ctx!.font = `400 11.5px "GeistMono", monospace`;
      for (let i = tokens.length - 1; i >= 0; i--) {
        const t = tokens[i]!;
        t.life++;
        t.x += t.vx; t.y += t.vy;

        /* repel from cursor */
        const dx = t.x - mx; const dy = t.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160 && dist > 0) {
          t.vx += (dx / dist) * 0.05;
          t.vy += (dy / dist) * 0.05;
        }
        t.vx *= 0.99; t.vy *= 0.99;

        const prog = t.life / t.maxLife;
        if (prog < 0.12)       t.opacity = Math.min(t.targetOpacity, t.opacity + 0.007);
        else if (prog > 0.80)  t.opacity = Math.max(0, t.opacity - 0.005);
        else                   t.opacity += (t.targetOpacity - t.opacity) * 0.03;

        if (t.life > t.maxLife || t.opacity < 0.005) { tokens.splice(i, 1); continue; }

        ctx!.globalAlpha = t.opacity;
        ctx!.fillStyle = "#e02020";
        ctx!.fillText(t.text, t.x, t.y);
      }
      ctx!.globalAlpha = 1;
    }

    raf = requestAnimationFrame(frame);

    const onMove  = (e: MouseEvent)  => { mx = e.clientX; my = e.clientY; };
    const onTouch = (e: TouchEvent)  => { const t = e.touches[0]; if (t) { mx = t.clientX; my = t.clientY; } };

    window.addEventListener("mousemove", onMove,  { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("resize",    resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("resize",    resize);
    };
  }, []);

  return <canvas ref={ref} id="cursor-canvas" aria-hidden />;
}
