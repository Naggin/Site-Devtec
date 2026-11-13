"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

const SPRING = { stiffness: 40, damping: 20, mass: 1.2 };

/**
 * Ato 3 — background ambiental: grade sutil + luzes difusas no vermelho da marca
 * que seguem levemente o cursor. Estático com prefers-reduced-motion.
 */
export function AmbientBackground() {
  const reduce = useReducedMotion();

  // Posição normalizada do cursor em [-1, 1], centro = 0.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, SPRING);
  const sy = useSpring(my, SPRING);

  // Cada luz se desloca em direção/intensidade diferente → sensação de profundidade.
  const redX = useTransform(sx, (v) => v * 60);
  const redY = useTransform(sy, (v) => v * 40);
  const emberX = useTransform(sx, (v) => v * -80);
  const emberY = useTransform(sy, (v) => v * -50);
  const spotX = useTransform(sx, (v) => `${50 + v * 50}%`);
  const spotY = useTransform(sy, (v) => `${50 + v * 50}%`);
  const spotlight = useTransform(
    [spotX, spotY],
    ([x, y]) => `radial-gradient(600px circle at ${x} ${y}, rgb(224 32 32 / 0.06), transparent 70%)`,
  );

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, mx, my]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />

      <motion.div
        className="absolute -left-[10%] -top-[15%] h-[70vmax] w-[70vmax] rounded-full opacity-[0.12] blur-[120px]"
        style={{
          x: reduce ? 0 : redX,
          y: reduce ? 0 : redY,
          background: "radial-gradient(circle, var(--brand) 0%, transparent 65%)",
        }}
      />
      <motion.div
        className="absolute -bottom-[20%] -right-[15%] h-[75vmax] w-[75vmax] rounded-full opacity-[0.08] blur-[140px]"
        style={{
          x: reduce ? 0 : emberX,
          y: reduce ? 0 : emberY,
          background: "radial-gradient(circle, var(--brand-hover) 0%, transparent 65%)",
        }}
      />

      {!reduce && <motion.div className="absolute inset-0" style={{ background: spotlight }} />}

      {/* Vinheta: segura o contraste nas bordas em telas grandes. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(8_8_8/0.85)_100%)]" />
    </div>
  );
}
