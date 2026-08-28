import { useEffect } from "react";

export function useNavScroll() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    if (!header) return;

    function onScroll() {
      if (window.scrollY > 32) {
        header!.classList.add("scrolled");
      } else {
        header!.classList.remove("scrolled");
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}
