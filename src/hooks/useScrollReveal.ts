import { useEffect } from "react";
import { burstReveal, stopRevealDust } from "../lib/revealDust";

export function useScrollReveal() {
  useEffect(() => {
    const selectors = ".reveal, .reveal-left, .reveal-right";

    // Mark elements already in viewport as visible immediately (no animation delay)
    const allEls = document.querySelectorAll<HTMLElement>(selectors);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // Small stagger driven by data-delay already set on CSS
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
            // Os fragmentos são amostrados do bloco já revelado: a classe
            // `visible` precisa estar aplicada para a tinta ser lida com a
            // opacidade final, e não com o zero do estado inicial.
            burstReveal(entry.target as HTMLElement);
          }
        }
      },
      // rootMargin pushes the trigger point up so elements animate
      // before they reach the very bottom of the viewport
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" },
    );

    for (const el of allEls) observer.observe(el);

    return () => {
      observer.disconnect();
      stopRevealDust();
    };
  }, []); // [] = run once on mount only
}
