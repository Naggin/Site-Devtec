"use client";

import { animate, useMotionValue, useMotionValueEvent, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { STAGE_ANCHOR, type StageId } from "../BuildStage";
import { useIntro } from "../IntroContext";
import { STRIKE_GROW } from "./lightning/Strike";
import { EVENTS, lastEvent } from "./script";

/** Largura a partir da qual os panes ficam em colunas laterais (abaixo: barra no topo + pills na base). */
const DESKTOP_MIN = 1024;
/** Desktop: coluna de panes (cada lado) + respiro entre coluna e site. */
const SIDE_COLUMN = 340;
const SIDE_GAP = 24;
/** Altura da barra de "browser" da moldura. */
const BAR_DESKTOP = 30;
const BAR_MOBILE = 22;
/** Mobile: barra compacta do topo e faixa de pills da base (fração da altura). */
const MOBILE_TOP = 52;
const MOBILE_PILLS = 0.25;
/** Duração do zoom-in final (evento camera "full"). */
const ZOOM_IN_S = 1.3;
const ZOOM_EASE = [0.65, 0, 0.35, 1] as const;
/**
 * Pan entre seções no overview: tween curto em vez de mola, para a câmera chegar e
 * PARAR antes do raio (o roteiro dá foco 700ms antes de cada strike).
 */
const PAN = { duration: 0.6, ease: [0.65, 0, 0.35, 1] } as const;
/** Reação ao impacto do raio: punch-in curto + tranco vertical, de volta em ~0.5s. */
const PUNCH = { duration: 0.5, times: [0, 0.18, 1], ease: ["easeOut", "easeInOut"] } as const;
const PUNCH_SCALE = 1.03;
const JOLT = { duration: 0.35, times: [0, 0.2, 0.55, 1] } as const;
const STRIKES = EVENTS.filter((e) => e.type === "strike");

interface Frame {
  /** Escala do site no overview. */
  scale: number;
  /** Faixa vertical da tela (px) onde o site aparece no overview. */
  top: number;
  bottom: number;
  bar: number;
  radius: number;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Janela do overview: centro livre entre as colunas (desktop) ou acima das pills (mobile). */
function frameFor(vw: number, vh: number): Frame {
  if (vw >= DESKTOP_MIN) {
    const free = vw - 2 * (SIDE_COLUMN + SIDE_GAP);
    const bar = BAR_DESKTOP;
    return { scale: clamp(free / vw, 0.3, 0.55), top: 20 + bar, bottom: vh - 20, bar, radius: 14 };
  }
  const bar = BAR_MOBILE;
  return { scale: 0.62, top: MOBILE_TOP + 8 + bar, bottom: vh * (1 - MOBILE_PILLS) - 8, bar, radius: 10 };
}

/**
 * Câmera do Ato 2: o site inteiro (Navbar + main + footer) vira uma "planta" em zoom-out
 * no centro da tela, numa moldura de browser, e faz pan até a seção do evento "focus".
 * No evento camera "full" dá zoom-in até a escala 1 no topo; com a intro em "done"
 * o wrapper fica sem transform e o scroll volta ao normal.
 *
 * Tudo é escrito direto no style (MotionValues), sem re-renderizar a página a cada frame.
 */
export function SiteCamera({ children }: { children: ReactNode }) {
  const { phase, time, runId } = useIntro();
  const reduce = useReducedMotion();
  const active = phase !== "done" && !reduce;

  const wrapRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  // s = escala, ty = translateY (px na tela), f = 1 com moldura de overview, 0 em tela cheia.
  const s = useMotionValue(1);
  const ty = useMotionValue(0);
  const f = useMotionValue(1);
  // p = punch-in do impacto (multiplica a escala), j = tranco vertical (px).
  const p = useMotionValue(1);
  const j = useMotionValue(0);
  const prevT = useRef(0);
  const controls = useRef<AnimationPlaybackControls[]>([]);
  const shot = useRef<string | null>(null);
  // Tamanho do site sem transform. Em cache: ler offset* dentro de paint() forçava layout da página inteira a cada frame.
  const size = useRef({ w: 0, h: 0 });
  const measure = useCallback(() => {
    const el = wrapRef.current;
    if (el) size.current = { w: el.offsetWidth, h: el.offsetHeight };
  }, []);

  const punchCtl = useRef<AnimationPlaybackControls[]>([]);
  const stop = () => {
    for (const c of [...controls.current, ...punchCtl.current]) c.stop();
    controls.current = [];
    punchCtl.current = [];
  };

  /** Pinta transform, recorte e moldura a partir de s/ty/f. */
  const paint = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const fr = frameFor(vw, vh);
    const sv = s.get();
    const tv = ty.get();
    const fv = f.get();
    const pv = p.get();

    // Janela visível interpola entre a do overview e a viewport inteira.
    const top = fr.top * fv;
    const bottom = vh + (fr.bottom - vh) * fv;
    // Punch-in centrado no meio da janela; a moldura fica parada e o site "salta" dentro dela.
    const mid = (top + bottom) / 2;
    const se = sv * pv;
    const te = mid - (mid - tv) * pv + j.get();
    const height = size.current.h;
    const clipTop = Math.max(0, (top - te) / se);
    const clipBottom = Math.max(0, height - (bottom - te) / se);
    const clipX = Math.max(0, (size.current.w * (se - sv)) / 2 / se);
    const r = (fr.radius * fv) / se;

    el.style.transformOrigin = "50% 0";
    el.style.transform = `translate3d(0, ${te}px, 0) scale(${se})`;
    el.style.clipPath = `inset(${clipTop}px ${clipX}px ${clipBottom}px ${clipX}px round 0 0 ${r}px ${r}px)`;

    const w = size.current.w * sv;
    const left = (vw - w) / 2;
    for (const box of [chromeRef.current, fillRef.current]) {
      if (!box) continue;
      box.style.left = `${left}px`;
      box.style.width = `${w}px`;
      box.style.top = `${top - fr.bar * fv}px`;
      box.style.height = `${bottom - top + fr.bar * fv}px`;
      box.style.opacity = String(fv);
    }
  }, [s, ty, f, p, j]);

  useMotionValueEvent(s, "change", paint);
  useMotionValueEvent(p, "change", paint);
  useMotionValueEvent(j, "change", paint);
  useMotionValueEvent(ty, "change", paint);
  useMotionValueEvent(f, "change", paint);

  /** Alvo da câmera para o momento atual do roteiro. */
  const target = useCallback(
    (mode: string, stage: StageId) => {
      const el = wrapRef.current;
      if (!el || mode === "full") return { s: 1, ty: 0, f: 0 };
      const fr = frameFor(window.innerWidth, window.innerHeight);
      const view = fr.bottom - fr.top;

      // Posição da seção no layout sem transform (rect atual ÷ escala atual).
      let y = 0;
      let h = 0;
      const anchor = stage === "nav" ? null : document.getElementById(STAGE_ANCHOR[stage]);
      if (anchor) {
        const base = el.getBoundingClientRect();
        const rect = anchor.getBoundingClientRect();
        // Escala efetiva inclui o punch do impacto, se ainda estiver rodando.
        const scale = s.get() * p.get();
        y = (rect.top - base.top) / scale;
        h = rect.height / scale;
      }

      // Centraliza a seção; se não couber, mostra o começo dela.
      const center = fr.top + view / 2 - fr.scale * (y + h / 2);
      const head = fr.top + 24 - fr.scale * y;
      let t = fr.scale * h > view - 48 ? head : center;
      // Não passa do topo nem do fim da página.
      t = clamp(t, Math.min(fr.top, fr.bottom - fr.scale * size.current.h), fr.top);
      return { s: fr.scale, ty: t, f: 1 };
    },
    [s, p],
  );

  const go = useCallback(
    (snap: boolean) => {
      const t = time.get();
      const mode = lastEvent(t, "camera")?.mode ?? "terminal";
      const stage = lastEvent(t, "focus")?.stage ?? "hero";
      measure();
      const next = target(mode, stage);
      stop();
      if (snap) {
        // Reinício (replay) ou resize: sem punch residual.
        p.set(1);
        j.set(0);
        s.set(next.s);
        ty.set(next.ty);
        f.set(next.f);
        paint();
        return;
      }
      const opts = mode === "full" ? { duration: ZOOM_IN_S, ease: ZOOM_EASE } : PAN;
      controls.current = [animate(s, next.s, opts), animate(ty, next.ty, opts), animate(f, next.f, opts)];
    },
    [time, target, s, ty, f, p, j, paint, measure],
  );

  // Começa já em overview (atrás do terminal do Ato 1) a cada (re)início da intro.
  useLayoutEffect(() => {
    if (!active) return;
    shot.current = null;
    go(true);
  }, [active, runId, go]);

  // Eventos "camera"/"focus" do roteiro: só anima quando o alvo muda.
  useMotionValueEvent(time, "change", (t) => {
    if (!active) return;
    // Impacto de um raio neste frame: a câmera reage (só no overview).
    const before = prevT.current;
    prevT.current = t;
    if (lastEvent(t, "camera")?.mode === "overview" && STRIKES.some((e) => before < e.t + STRIKE_GROW && e.t + STRIKE_GROW <= t)) {
      for (const c of punchCtl.current) c.stop();
      punchCtl.current = [
        animate(p, [1, PUNCH_SCALE, 1], { duration: PUNCH.duration, times: [...PUNCH.times], ease: [...PUNCH.ease] }),
        animate(j, [0, 5, -2, 0], { duration: JOLT.duration, times: [...JOLT.times] }),
      ];
    }
    const mode = lastEvent(t, "camera")?.mode ?? "terminal";
    const stage = lastEvent(t, "focus")?.stage ?? "hero";
    const key = `${mode}:${stage}`;
    if (key === shot.current) return;
    const first = shot.current === null;
    shot.current = key;
    // Durante o terminal o site está coberto: reposiciona sem animar.
    go(first || mode === "terminal");
  });

  // Resize (janela ou altura do site): recalcula o alvo atual.
  useEffect(() => {
    if (!active) return;
    const el = wrapRef.current;
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => go(true));
    };
    window.addEventListener("resize", onResize);
    const ro = el ? new ResizeObserver(onResize) : null;
    if (el) ro?.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
    };
  }, [active, go]);

  // Fim da intro: sem transform, sem recorte, scroll normal a partir do topo.
  useLayoutEffect(() => {
    if (active) return;
    stop();
    // Zera o punch antes de limpar o transform: jump() ainda dispara um paint.
    p.jump(1);
    j.jump(0);
    const el = wrapRef.current;
    if (el) {
      el.style.transform = "none";
      el.style.transformOrigin = "";
      el.style.clipPath = "";
    }
    if (phase === "done") window.scrollTo({ top: 0, behavior: "instant" });
  }, [active, phase, p, j]);

  return (
    <>
      {active && (
        <div
          ref={fillRef}
          aria-hidden
          className="pointer-events-none fixed rounded-[14px] bg-bg/85 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
        />
      )}
      <div ref={wrapRef} data-site-camera className="relative">
        {children}
      </div>
      {active && (
        <div
          ref={chromeRef}
          aria-hidden
          className="pointer-events-none fixed z-[1] overflow-hidden rounded-[14px] border border-white/10 ring-1 ring-black/40"
        >
          <div className="flex h-[22px] items-center gap-2 border-b border-white/10 bg-zinc-900/90 px-3 lg:h-[30px]">
            <span className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-white/15" />
              <span className="h-2 w-2 rounded-full bg-white/15" />
              <span className="h-2 w-2 rounded-full bg-white/15" />
            </span>
            <span className="mx-auto rounded-md bg-white/5 px-3 py-0.5 font-mono text-[10px] text-zinc-400 lg:text-[11px]">
              localhost:3000
            </span>
          </div>
        </div>
      )}
    </>
  );
}
