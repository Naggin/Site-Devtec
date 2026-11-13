"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import type { PointerEvent, ReactNode } from "react";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  /** Cor da luz (qualquer cor CSS). Padrão: âmbar Claude. */
  color?: string;
  /** Raio do halo em px. */
  size?: number;
  /** Aplica o glassmorphism (bg-card/60 backdrop-blur-xl border-line). */
  surface?: boolean;
}

// Máscara que recorta só o anel de 1px da borda.
const RING_MASK = "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)";

/**
 * Card glass com uma luz radial que segue o cursor e acende as bordas.
 * Em touch não há hover, então o efeito simplesmente não aparece.
 */
export function SpotlightCard({
  children,
  className = "",
  color = "rgb(224 32 32 / 0.45)",
  size = 420,
  surface = true,
}: SpotlightCardProps) {
  const reduce = useReducedMotion();
  const mouseX = useMotionValue(-size);
  const mouseY = useMotionValue(-size);
  const glow = useSpring(0, { stiffness: 220, damping: 30 });

  const fill = useMotionTemplate`radial-gradient(${size}px circle at ${mouseX}px ${mouseY}px, ${color}, transparent 70%)`;
  const ring = useMotionTemplate`radial-gradient(${size * 0.75}px circle at ${mouseX}px ${mouseY}px, ${color}, transparent 65%)`;

  function handleMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
    glow.set(1);
  }

  const surfaceCls = surface ? "bg-card/60 backdrop-blur-xl border border-line shadow-2xl shadow-black/40" : "";

  return (
    <div
      onPointerMove={handleMove}
      onPointerLeave={() => glow.set(0)}
      className={`group/spot relative isolate overflow-hidden rounded-3xl ${surfaceCls} ${className}`}
    >
      {/* Halo interno, bem sutil */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: fill, opacity: reduce ? 0 : glow, mixBlendMode: "plus-lighter" }}
      />
      {/* Anel da borda iluminado */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] p-px"
        style={{
          background: ring,
          opacity: glow,
          WebkitMask: RING_MASK,
          WebkitMaskComposite: "xor",
          mask: RING_MASK,
          maskComposite: "exclude",
        }}
      />
      {children}
    </div>
  );
}
