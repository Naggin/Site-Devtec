import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

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

/** Texto que o fundo não pode atrapalhar. */
const QUIET_SELECTOR = ".hero h1, .hero-sub, .hero-badge, .section-title, .section-sub";
const QUIET_PADDING = 24;
const QUIET_REFRESH_FRAMES = 20;

type Token = {
  x: number; y: number;
  vx: number; vy: number;
  opacity: number; targetOpacity: number;
  text: string; life: number; maxLife: number;
  color: string;   // fixed at spawn — never changes
};

type Dot = { x: number; y: number; alpha: number };
type Rect = { top: number; right: number; bottom: number; left: number };

export default function CursorCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    let mx = W / 2;
    let my = H / 2;
    let raf = 0;
    let maxTokens = 0;

    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      // Sem o devicePixelRatio o texto do fundo sai borrado em tela retina.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      canvas!.style.width = `${W}px`;
      canvas!.style.height = `${H}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Densidade proporcional à tela: num celular o mesmo número de snippets
      // vira poluição em cima do texto.
      maxTokens = Math.round(Math.min(30, Math.max(8, W / 46)));
    }
    resize();

    const trail: Dot[] = [];
    const tokens: Token[] = [];
    let quietZones: Rect[] = [];

    function readQuietZones() {
      const zones: Rect[] = [];
      for (const el of document.querySelectorAll(QUIET_SELECTOR)) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -QUIET_PADDING || r.top > H + QUIET_PADDING) continue;
        zones.push({
          top: r.top - QUIET_PADDING,
          right: r.right + QUIET_PADDING,
          bottom: r.bottom + QUIET_PADDING,
          left: r.left - QUIET_PADDING,
        });
      }
      quietZones = zones;
    }

    function inQuietZone(x: number, y: number) {
      for (const z of quietZones) {
        if (x >= z.left && x <= z.right && y >= z.top && y <= z.bottom) return true;
      }
      return false;
    }

    function spawn(nearCursor = false) {
      tokens.push({
        x: nearCursor ? mx + (Math.random() - 0.5) * 320 : Math.random() * W,
        y: nearCursor ? my + (Math.random() - 0.5) * 320 : Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25 - 0.08,
        opacity: 0,
        targetOpacity: Math.random() * 0.16 + 0.10, // 0.10 – 0.26
        text: SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)]!,
        life: 0,
        maxLife: Math.random() * 340 + 260,          // longer life = smoother
        color: Math.random() > 0.38 ? "#e02020" : "#f4f4f4", // fixed once
      });
    }

    for (let i = 0; i < maxTokens; i++) spawn(false);
    readQuietZones();

    let lastSpawn = 0;
    let frameCount = 0;

    function frame(ts: number) {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;

      if (frameCount++ % QUIET_REFRESH_FRAMES === 0) readQuietZones();
      ctx!.clearRect(0, 0, W, H);

      /* — cursor glow (red) — */
      const g = ctx!.createRadialGradient(mx, my, 0, mx, my, 280);
      g.addColorStop(0,   "rgba(224,32,32,0.20)");
      g.addColorStop(0.4, "rgba(224,32,32,0.07)");
      g.addColorStop(1,   "transparent");
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.arc(mx, my, 220, 0, Math.PI * 2);
      ctx!.fill();

      /* — trail — */
      trail.push({ x: mx, y: my, alpha: 0.55 });
      if (trail.length > 26) trail.shift();
      for (let i = 0; i < trail.length; i++) {
        const d = trail[i]!;
        d.alpha *= 0.90;
        const r = (i / trail.length) * 6;
        ctx!.beginPath();
        ctx!.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(224,32,32,${d.alpha * 0.6})`;
        ctx!.fill();
      }

      /* — tokens — */
      if (ts - lastSpawn > 900 && tokens.length < maxTokens) {
        spawn(Math.random() > 0.5);
        lastSpawn = ts;
      }

      ctx!.font = `500 13px "GeistMono", monospace`;
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

        // smooth ease-in / hold / ease-out — no sudden jumps
        const prog = t.life / t.maxLife;
        if (prog < 0.15) {
          // ease-in: lerp toward target slowly
          t.opacity += (t.targetOpacity - t.opacity) * 0.04;
        } else if (prog > 0.80) {
          // ease-out: lerp toward 0 slowly
          t.opacity += (0 - t.opacity) * 0.03;
        } else {
          // hold at target with tiny drift
          t.opacity += (t.targetOpacity - t.opacity) * 0.02;
        }

        if (t.life > t.maxLife || t.opacity < 0.005) { tokens.splice(i, 1); continue; }

        if (inQuietZone(t.x, t.y)) continue;

        ctx!.globalAlpha = t.opacity;
        ctx!.fillStyle = t.color;
        ctx!.fillText(t.text, t.x, t.y);
      }
      ctx!.globalAlpha = 1;
    }

    raf = requestAnimationFrame(frame);

    const onMove  = (e: MouseEvent)  => { mx = e.clientX; my = e.clientY; };
    const onTouch = (e: TouchEvent)  => { const t = e.touches[0]; if (t) { mx = t.clientX; my = t.clientY; } };
    const onScroll = () => readQuietZones();

    window.addEventListener("mousemove", onMove,  { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("scroll",    onScroll, { passive: true });
    window.addEventListener("resize",    resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("scroll",    onScroll);
      window.removeEventListener("resize",    resize);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return <canvas ref={ref} id="cursor-canvas" aria-hidden />;
}
