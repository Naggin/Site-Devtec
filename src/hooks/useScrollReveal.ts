import { useEffect } from "react";

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
          }
        }
      },
      // rootMargin pushes the trigger point up so elements animate
      // before they reach the very bottom of the viewport
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" },
    );

    for (const el of allEls) observer.observe(el);

    return () => observer.disconnect();
  }, []); // [] = run once on mount only
}
