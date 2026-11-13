"use client";

import { useMotionValueEvent, type MotionValue } from "framer-motion";
import { useCallback, useEffect, useId, useMemo, useRef } from "react";
import type { StageId } from "../../BuildStage";
import { AGENT_BY_ID, STRIKE_MS, type AgentId } from "../script";
import { strikeGeometry, type StrikeGeometry } from "./anchors";

const GEO_REFRESH = 150;
import { makeBolt, rng, toPath, type BoltShape } from "./bolt";

/** Linha do tempo de um raio, em ms desde o evento "strike". */
const GROW = 120;
/** Quanto o raio leva do pane até o alvo: a seção começa a ser invocada no impacto. */
export const STRIKE_GROW = GROW;
/** Re-gera o caminho nesses instantes (o raio "treme"). */
const RESEED = [200, 330, 450];
/** Quedas de brilho entre os re-seeds: [início, fim, opacidade]. */
const DIPS = [
  [165, 200, 0.25],
  [295, 330, 0.35],
  [415, 450, 0.3],
] as const;
const FADE_FROM = 480;
const FLASH_MS = 350;
const OUTLINE_MS = 800;
const SPARK_MS = 500;
const SHAKE_MS = 180;
const BADGE_MS = 1200;
export const STRIKE_LIFE = GROW + BADGE_MS + 40;

const MAX_BRANCHES = 4;
const SPARKS = 10;
const LAYERS = ["glow", "mid", "core"] as const;

const ease = (p: number) => 1 - (1 - p) ** 3;
const clamp01 = (p: number) => Math.min(Math.max(p, 0), 1);

export interface StrikeProps {
  id: string;
  agent: AgentId;
  stage: StageId;
  /** Instante do evento no relógio da intro. */
  at: number;
  time: MotionValue<number>;
  reduce: boolean;
  onDone: (id: string) => void;
}

export function Strike({ id, agent, stage, at, time, reduce, onDone }: StrikeProps) {
  const uid = useId().replace(/:/g, "");
  const color = AGENT_BY_ID[agent].color;
  const seed = useMemo(() => Math.floor(at * 7919 + stage.length * 104729), [at, stage]);

  const svgRef = useRef<SVGSVGElement>(null);
  const boltRef = useRef<SVGGElement>(null);
  const mainRefs = useRef<(SVGPathElement | null)[]>([]);
  const branchRefs = useRef<(SVGPathElement | null)[]>([]);
  const flashRef = useRef<SVGCircleElement>(null);
  const sparkRefs = useRef<(SVGLineElement | null)[]>([]);
  const outlineRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const shape = useRef<{ n: number; bolt: BoltShape } | null>(null);
  const done = useRef(false);
  const geoRef = useRef<{ at: number; geo: StrikeGeometry } | null>(null);

  // Faíscas: direção e velocidade fixas por raio (px/ms), com gravidade.
  const sparks = useMemo(() => {
    const rand = rng(seed ^ 0x9e3779b9);
    return Array.from({ length: SPARKS }, () => {
      const a = rand() * Math.PI * 2;
      const v = 0.25 + rand() * 0.45;
      return { vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.15, len: 5 + rand() * 7 };
    });
  }, [seed]);

  const update = useCallback(
    (t: number) => {
      const e = t - at;
      if (e >= STRIKE_LIFE) {
        if (!done.current) {
          done.current = true;
          onDone(id);
        }
        return;
      }
      // Ler o DOM a cada frame (depois das escritas da câmera) forçava layout da página inteira.
      // A câmera quase não se move durante um raio: medir a cada GEO_REFRESH ms basta.
      if (!geoRef.current || t - geoRef.current.at > GEO_REFRESH) {
        const g = strikeGeometry(agent, stage);
        geoRef.current = g ? { at: t, geo: g } : null;
      }
      const geo = geoRef.current?.geo;
      if (!geo) return;
      const { from, to, target } = geo;

      // Selo "✓ pronto" no canto superior direito da seção (dentro da tela).
      const badge = badgeRef.current;
      if (badge) {
        const be = e - GROW;
        const o = be < 0 ? 0 : be < 150 ? be / 150 : be > BADGE_MS - 300 ? clamp01((BADGE_MS - be) / 300) : 1;
        badge.style.opacity = String(o);
        const x = Math.min(Math.max(target.right - 10, 90), window.innerWidth - 10);
        const y = Math.min(Math.max(target.top + 10, 10), window.innerHeight - 40);
        badge.style.transform = `translate(${x}px, ${y + (1 - ease(clamp01(be / 250))) * 6}px) translateX(-100%)`;
      }
      if (reduce) return;

      // Raio: cresce até o alvo, treme (re-seed + quedas de brilho) e some.
      const n = RESEED.filter((r) => e >= r).length;
      if (!shape.current || shape.current.n !== n) shape.current = { n, bolt: makeBolt(seed + n * 31337) };
      const { bolt } = shape.current;
      const grow = ease(clamp01(e / GROW));
      let alpha = e > FADE_FROM ? clamp01(1 - (e - FADE_FROM) / (STRIKE_MS - FADE_FROM)) : 1;
      for (const [a, b, o] of DIPS) if (e >= a && e < b) alpha *= o;
      if (boltRef.current) boltRef.current.style.opacity = String(alpha);

      const main = toPath(bolt.main, from, to);
      for (const p of mainRefs.current) {
        if (!p) continue;
        p.setAttribute("d", main);
        p.style.strokeDashoffset = String(1 - grow);
      }
      branchRefs.current.forEach((p, i) => {
        if (!p) return;
        const br = bolt.branches[i % MAX_BRANCHES];
        if (!br) {
          p.setAttribute("d", "");
          return;
        }
        p.setAttribute("d", toPath(br.pts, from, to));
        // O galho só aparece depois que o raio principal passou por ele.
        p.style.strokeDashoffset = String(1 - clamp01((e / GROW - br.at) / 0.5));
      });

      // Impacto: flash radial, tremor curto do overlay e faíscas.
      const ie = e - GROW;
      const flash = flashRef.current;
      if (flash) {
        const p = clamp01(ie / FLASH_MS);
        flash.setAttribute("cx", to.x.toFixed(1));
        flash.setAttribute("cy", to.y.toFixed(1));
        flash.setAttribute("r", (18 + ease(p) * 80).toFixed(1));
        flash.style.opacity = ie < 0 ? "0" : String(0.75 * (1 - p));
      }
      const svg = svgRef.current;
      if (svg) {
        const s = ie >= 0 && ie < SHAKE_MS ? 3 * (1 - ie / SHAKE_MS) : 0;
        svg.style.transform = s ? `translate(${(Math.random() * 2 - 1) * s}px, ${(Math.random() * 2 - 1) * s}px)` : "";
      }
      sparkRefs.current.forEach((l, i) => {
        if (!l) return;
        const sp = sparks[i];
        const st = Math.max(ie, 0);
        const x = to.x + sp.vx * st;
        const y = to.y + sp.vy * st + 0.0006 * st * st;
        const vx = sp.vx;
        const vy = sp.vy + 0.0012 * st;
        const vl = Math.hypot(vx, vy) || 1;
        l.setAttribute("x1", x.toFixed(1));
        l.setAttribute("y1", y.toFixed(1));
        l.setAttribute("x2", (x - (vx / vl) * sp.len).toFixed(1));
        l.setAttribute("y2", (y - (vy / vl) * sp.len).toFixed(1));
        l.style.opacity = ie < 0 ? "0" : String(clamp01(1 - ie / SPARK_MS));
      });

      // Contorno da seção acende, pulsa e apaga.
      const outline = outlineRef.current;
      if (outline) {
        const p = ie / OUTLINE_MS;
        const env = ie < 0 || p >= 1 ? 0 : Math.min(1, ie / 80) * (1 - p);
        const pulse = 0.65 + 0.35 * Math.cos((ie / 260) * Math.PI * 2);
        outline.style.opacity = String(env * pulse);
        outline.style.transform = `translate(${target.left}px, ${target.top}px)`;
        outline.style.width = `${target.width}px`;
        outline.style.height = `${target.height}px`;
      }
    },
    [agent, at, id, onDone, reduce, seed, sparks, stage],
  );

  useMotionValueEvent(time, "change", update);
  useEffect(() => update(time.get()), [time, update]);

  const pathProps = { pathLength: 1, strokeDasharray: "1 1", strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;
  const layerStyle = {
    // Glow como traço largo translúcido: o feGaussianBlur em tela cheia custava frames.
    glow: { stroke: color, strokeWidth: 9, opacity: 0.28, filter: undefined },
    mid: { stroke: color, strokeWidth: 2.6, opacity: 1, filter: undefined },
    core: { stroke: "#fff", strokeWidth: 1.1, opacity: 1, filter: undefined },
  } as const;

  return (
    <>
      {!reduce && (
        <>
          <div
            ref={outlineRef}
            className="absolute left-0 top-0 rounded-2xl"
            style={{
              opacity: 0,
              border: `1.5px solid ${color}`,
              boxShadow: `0 0 28px ${color}88, inset 0 0 22px ${color}55`,
            }}
          />
          <svg ref={svgRef} className="absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <radialGradient id={`flash-${uid}`}>
                <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
                <stop offset="35%" stopColor={color} stopOpacity="0.55" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle ref={flashRef} r="0" fill={`url(#flash-${uid})`} style={{ opacity: 0 }} />
            <g ref={boltRef} style={{ opacity: 0 }}>
              {LAYERS.map((layer, k) => {
                const { filter, ...s } = layerStyle[layer];
                return (
                  <g key={layer} filter={filter} style={{ opacity: s.opacity }}>
                    <path
                      ref={(el) => {
                        mainRefs.current[k] = el;
                      }}
                      {...pathProps}
                      stroke={s.stroke}
                      strokeWidth={s.strokeWidth}
                    />
                    {Array.from({ length: MAX_BRANCHES }, (_, i) => (
                      <path
                        key={i}
                        ref={(el) => {
                          branchRefs.current[k * MAX_BRANCHES + i] = el;
                        }}
                        {...pathProps}
                        stroke={s.stroke}
                        strokeWidth={s.strokeWidth * 0.55}
                      />
                    ))}
                  </g>
                );
              })}
            </g>
            <g stroke={color} strokeWidth={1.4} strokeLinecap="round">
              {sparks.map((_, i) => (
                <line
                  key={i}
                  ref={(el) => {
                    sparkRefs.current[i] = el;
                  }}
                  style={{ opacity: 0 }}
                />
              ))}
            </g>
          </svg>
        </>
      )}
      <div
        ref={badgeRef}
        className="absolute left-0 top-0 whitespace-nowrap rounded-md border bg-zinc-950/80 px-2 py-0.5 font-mono text-[11px] font-medium backdrop-blur"
        style={{ opacity: 0, color, borderColor: `${color}66`, boxShadow: `0 0 12px ${color}33` }}
      >
        ✓ pronto
      </div>
    </>
  );
}
