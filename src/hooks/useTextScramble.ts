"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const DEFAULT_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}[]=+*#$%&_";

interface ScrambleOptions {
  /** Quando true, a decodificação roda (uma vez por `replayKey`). */
  play: boolean;
  /** Troque o valor para tocar o efeito de novo (ex.: `runId` do intro). */
  replayKey?: number | string;
  /** Atraso antes de começar a decodificar, em ms. Lido no início de cada execução. */
  delay?: number;
  /** Duração total da decodificação, em ms. */
  duration?: number;
  /** Intervalo mínimo entre trocas de caractere, em ms. */
  frameInterval?: number;
  charset?: string;
}

const isBlank = (ch: string) => ch.trim() === "";

/** Ruído determinístico — usado no render antes do primeiro frame, sem flash do texto final. */
function placeholder(text: string, charset: string) {
  return Array.from(text, (ch, i) => (isBlank(ch) ? ch : charset[(i * 7 + ch.charCodeAt(0)) % charset.length])).join("");
}

function frame(text: string, progress: number, charset: string) {
  const len = text.length || 1;
  return Array.from(text, (ch, i) => {
    if (isBlank(ch)) return ch;
    // Revela da esquerda para a direita, com uma janela de "ruído" à frente.
    const revealAt = (i / len) * 0.75 + 0.2;
    return progress >= revealAt ? ch : charset[Math.floor(Math.random() * charset.length)];
  }).join("");
}

/**
 * Efeito Text Scramble / Decode: o texto entra embaralhado e estabiliza caractere a caractere.
 * Com `prefers-reduced-motion` ou `play=false`, devolve o texto final direto.
 */
export function useTextScramble(
  text: string,
  { play, replayKey = 0, delay = 0, duration = 900, frameInterval = 40, charset = DEFAULT_CHARSET }: ScrambleOptions,
) {
  const reduce = useReducedMotion();
  const [state, setState] = useState<{ key: number | string | null; value: string }>({ key: null, value: text });

  // Mudar o delay no meio da execução (ex.: fase building → done) não deve reiniciar o efeito.
  const delayRef = useRef(delay);
  useEffect(() => {
    delayRef.current = delay;
  });

  useEffect(() => {
    if (!play || reduce) return;

    let raf = 0;
    let last = -Infinity;
    const start = performance.now() + delayRef.current;

    const tick = (now: number) => {
      const progress = Math.min(1, Math.max(0, (now - start) / duration));
      if (progress >= 1) {
        setState({ key: replayKey, value: text });
        return;
      }
      if (now - last >= frameInterval) {
        last = now;
        setState({ key: replayKey, value: frame(text, progress, charset) });
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, reduce, replayKey, text, duration, frameInterval, charset]);

  if (!play || reduce) return text;
  if (state.key !== replayKey) return placeholder(text, charset);
  return state.value;
}
