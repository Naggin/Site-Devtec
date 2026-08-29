import { useEffect } from "react";
import { cancelReveals, startDustReveal, supportsDustReveal } from "../lib/dustReveal";

const BLOCKS = ".reveal, .reveal-left, .reveal-right";

export function useScrollReveal() {
  useEffect(() => {
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Sem canvas (jsdom, canvas desligado) o site continua com o fade de sempre.
    const dust = !reduced && supportsDustReveal();

    // `.visible` já posto: em StrictMode o efeito roda duas vezes, e reesconder
    // o que já entrou faria o bloco piscar e remontar de novo.
    const blocks = Array.from(document.querySelectorAll<HTMLElement>(BLOCKS)).filter(
      (el) => !el.classList.contains("visible"),
    );

    // O hold troca o deslize por imobilidade: na poeira quem se move são as
    // partículas, e um translate por baixo delas briga com o pouso.
    if (dust) for (const el of blocks) el.classList.add("dust-hold");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          observer.unobserve(el);
          if (dust && startDustReveal(el)) continue;
          el.classList.remove("dust-hold");
          el.classList.add("visible");
        }
      },
      // rootMargin puxa o gatilho para cima, para o bloco entrar antes de
      // encostar no fim da viewport.
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" },
    );

    for (const el of blocks) observer.observe(el);

    // A borda entre duas seções acende quando a de baixo chega: é o mesmo
    // vermelho da poeira, e amarra a passagem de uma seção para a outra.
    const edges = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("edge-lit");
          edges.unobserve(entry.target);
        }
      },
      { threshold: 0, rootMargin: "0px 0px -20% 0px" },
    );

    const borders = Array.from(document.querySelectorAll<HTMLElement>(".section-border"));
    if (!reduced) for (const el of borders) edges.observe(el);

    return () => {
      observer.disconnect();
      edges.disconnect();
      cancelReveals();
      for (const el of blocks) el.classList.remove("dust-hold");
    };
  }, []); // [] = só na montagem
}
