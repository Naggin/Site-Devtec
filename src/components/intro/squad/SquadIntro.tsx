"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { StageMap } from "../IntroContext";
import { useIntro } from "../IntroContext";
import { LightningLayer } from "./LightningLayer";
import { SquadScene } from "./SquadScene";
import { DONE_AT, eventsUntil, PRE } from "./script";

/**
 * Diretor da intro multi-agente: dono do relógio (IntroContext.time), da fase e do
 * status de cada seção. Tudo que aparece na tela é derivado do roteiro em script.ts.
 */
export function SquadIntro() {
  const { phase, runId } = useIntro();
  if (phase === "done") return null;
  return <Director key={runId} />;
}

function Director() {
  const { time, setPhase, setStages, skip } = useIntro();
  const reduce = useReducedMotion();
  const lastStages = useRef("");

  // Relógio único. O tempo vai para um MotionValue; estado React só muda quando fase/seções mudam.
  useEffect(() => {
    if (reduce) {
      const id = window.setTimeout(skip, 0);
      return () => window.clearTimeout(id);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    const start = performance.now();
    let raf = 0;
    let building = false;
    const tick = (now: number) => {
      const t = now - start;
      time.set(t);

      if (!building && t >= PRE.build) {
        building = true;
        setPhase("building");
      }

      const stages: StageMap = {};
      for (const e of eventsUntil(t, "stage")) stages[e.stage] = e.status;
      const key = JSON.stringify(stages);
      if (key !== lastStages.current) {
        lastStages.current = key;
        setStages(stages);
      }

      if (t >= DONE_AT) {
        setPhase("done");
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, time, setPhase, setStages, skip]);

  // Esc pula a intro.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skip]);

  // O visitante não rola durante a intro; a câmera (SiteCamera) faz o movimento.
  // data-intro desliga sombras e blur caros do site enquanto ele está em zoom-out (ver globals.css).
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    html.dataset.intro = "";
    return () => {
      html.style.overflow = prev;
      delete html.dataset.intro;
    };
  }, []);

  if (reduce) return <div className="fixed inset-0 z-50 bg-bg" aria-hidden />;

  return (
    <>
      <SquadScene />
      <LightningLayer />
    </>
  );
}
