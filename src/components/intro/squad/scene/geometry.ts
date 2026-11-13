"use client";

import { useSyncExternalStore } from "react";
import { AGENTS, type AgentId } from "../script";

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Viewport {
  w: number;
  h: number;
}

/** A partir daqui os panes ficam em colunas; abaixo, card + pills. */
export const DESKTOP_MIN = 1024;

const SERVER_VIEWPORT: Viewport = { w: 1440, h: 900 };
let cached: Viewport = SERVER_VIEWPORT;

function subscribe(cb: () => void) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}

function getSnapshot(): Viewport {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w !== cached.w || h !== cached.h) cached = { w, h };
  return cached;
}

export function useViewport() {
  return useSyncExternalStore(subscribe, getSnapshot, () => SERVER_VIEWPORT);
}

/** Terminal grande do Ato 1, centralizado. */
export function terminalRect({ w, h }: Viewport): Rect {
  if (w < DESKTOP_MIN) {
    const width = w - 24;
    const height = Math.min(h * 0.78, 640);
    return { left: 12, top: Math.max(56, (h - height) / 2), width, height };
  }
  const width = Math.min(880, w - 48);
  const height = Math.min(600, h - 96);
  return { left: (w - width) / 2, top: (h - height) / 2, width, height };
}

const LEFT = AGENTS.filter((a) => a.side === "left" && a.id !== "orchestrator").map((a) => a.id);
const RIGHT = AGENTS.filter((a) => a.side === "right").map((a) => a.id);

/** Posição de cada pane no Ato 2 (desktop): orquestrador no topo da coluna esquerda. */
export function desktopLayout({ w, h }: Viewport): Record<AgentId, Rect> {
  const m = 20;
  const gap = 14;
  const colW = Math.round(Math.min(340, Math.max(300, w * 0.22)));
  const rightX = w - m - colW;
  const out = {} as Record<AgentId, Rect>;

  // Esquerda: orquestrador ocupa ~40%, os dois subagentes dividem o resto.
  const availL = h - 2 * m - gap * LEFT.length;
  const orchH = Math.round(availL * 0.4);
  out.orchestrator = { left: m, top: m, width: colW, height: orchH };
  const subH = (availL - orchH) / LEFT.length;
  LEFT.forEach((id, i) => {
    out[id] = { left: m, top: m + orchH + gap + i * (subH + gap), width: colW, height: subH };
  });

  // Direita: abaixo do botão de pular.
  const topR = 64;
  const hR = (h - topR - m - gap * (RIGHT.length - 1)) / RIGHT.length;
  RIGHT.forEach((id, i) => {
    out[id] = { left: rightX, top: topR + i * (hR + gap), width: colW, height: hR };
  });
  return out;
}

/** Card compacto do orquestrador no mobile. */
export function mobileOrchestratorRect({ w }: Viewport): Rect {
  return { left: 12, top: 56, width: w - 24, height: 150 };
}

export interface Pt {
  x: number;
  y: number;
}

export interface Curve {
  p0: Pt;
  c0: Pt;
  c1: Pt;
  p1: Pt;
}

/** Ponto de saída na borda do pane voltada para o outro (ou para o centro, se estão na mesma coluna). */
function anchor(r: DOMRect, other: DOMRect, vw: number): { p: Pt; dir: 1 | -1 } {
  const cx = r.left + r.width / 2;
  const ox = other.left + other.width / 2;
  const dir: 1 | -1 = Math.abs(ox - cx) > 40 ? (ox > cx ? 1 : -1) : cx < vw / 2 ? 1 : -1;
  return { p: { x: dir === 1 ? r.right : r.left, y: r.top + r.height / 2 }, dir };
}

export function curveBetween(a: DOMRect, b: DOMRect, vw: number): Curve {
  const A = anchor(a, b, vw);
  const B = anchor(b, a, vw);
  const k = Math.max(70, Math.abs(B.p.x - A.p.x) * 0.45);
  return {
    p0: A.p,
    c0: { x: A.p.x + A.dir * k, y: A.p.y },
    c1: { x: B.p.x + B.dir * k, y: B.p.y },
    p1: B.p,
  };
}

export function curvePath({ p0, c0, c1, p1 }: Curve) {
  return `M${p0.x},${p0.y} C${c0.x},${c0.y} ${c1.x},${c1.y} ${p1.x},${p1.y}`;
}

export function curvePoint({ p0, c0, c1, p1 }: Curve, t: number): Pt {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return { x: a * p0.x + b * c0.x + c * c1.x + d * p1.x, y: a * p0.y + b * c0.y + c * c1.y + d * p1.y };
}

export function paneRect(id: AgentId) {
  return document.querySelector<HTMLElement>(`[data-agent-pane="${id}"]`)?.getBoundingClientRect() ?? null;
}
