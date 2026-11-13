"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useIntro } from "@/components/intro/IntroContext";
import { useStageStatus } from "@/components/intro/BuildStage";
import { portfolioData } from "@/data/portfolio";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Badge "● Built by Claude • Replay Intro" — reabre o terminal do Ato 1. */
function ReplayBadge({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-dim px-3 py-1.5 font-mono text-[11px] text-brand-ink transition-colors hover:border-brand/60 hover:bg-brand/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ink/60 ${className}`}
      aria-label="Built by Claude — assistir a intro novamente"
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
      </span>
      <span>Built by Claude</span>
      <span className="text-brand-ink/40">•</span>
      <span className="inline-flex items-center gap-1 text-ink/80 transition-colors group-hover:text-ink">
        Replay Intro
        <RotateCcw className="h-3 w-3 transition-transform duration-500 group-hover:-rotate-[360deg]" />
      </span>
    </button>
  );
}

export function Navbar() {
  const { replay } = useIntro();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  // Na intro a navbar só aparece quando o raio do ui-designer a invoca.
  const visible = useStageStatus() === "built";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Destaca o link da seção que está no centro da viewport.
  useEffect(() => {
    const ids = portfolioData.navItems.map((item) => item.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(`#${entry.target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleReplay = () => {
    setOpen(false);
    replay();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          id="site-nav"
          key="navbar"
          className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6 sm:pt-4 2xl:pt-6"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -24 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <nav
            aria-label="Principal"
            className={`mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl border px-3 py-2 backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300 sm:px-4 2xl:max-w-[96rem] 2xl:py-3 ${
              scrolled || open
                ? "border-line bg-bg/70 shadow-2xl shadow-black/40"
                : "border-line bg-bg/30"
            }`}
          >
            <a
              href="#topo"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-1 font-mono text-sm font-semibold tracking-tight text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ink/60 2xl:text-base"
            >
              <span className="text-brand-ink">&gt;_</span>
              {portfolioData.brand.toLowerCase()}
            </a>

            <ul className="hidden items-center gap-1 md:flex">
              {portfolioData.navItems.map((item) => {
                const isActive = active === item.href;
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      aria-current={isActive ? "true" : undefined}
                      className={`relative rounded-lg px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ink/60 2xl:text-base ${
                        isActive ? "text-ink" : "text-ink-2 hover:text-ink"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 -z-10 rounded-lg bg-white/[0.06]"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-2">
              <ReplayBadge onClick={handleReplay} className="hidden sm:inline-flex" />
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Fechar menu" : "Abrir menu"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ink/60 md:hidden"
              >
                {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </nav>

          <AnimatePresence>
            {open && (
              <motion.div
                id="mobile-menu"
                className="mx-auto mt-2 max-w-6xl overflow-hidden rounded-2xl border border-line bg-bg/85 p-2 backdrop-blur-xl md:hidden"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                <ul className="flex flex-col">
                  {portfolioData.navItems.map((item, i) => (
                    <motion.li
                      key={item.href}
                      initial={reduce ? false : { opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * i, duration: 0.25 }}
                    >
                      <a
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-base transition-colors hover:bg-white/5 ${
                          active === item.href ? "text-ink" : "text-ink-2"
                        }`}
                      >
                        {item.label}
                        <span className="font-mono text-xs text-brand-ink">{`0${i + 1}`}</span>
                      </a>
                    </motion.li>
                  ))}
                </ul>
                <div className="mt-1 border-t border-line px-2 pb-1 pt-3 sm:hidden">
                  <ReplayBadge onClick={handleReplay} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
