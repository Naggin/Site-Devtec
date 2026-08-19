import { useEffect, useRef } from "react";

type ParticleSpec = {
  left: string;
  size: number;
  duration: number;
  delay: number;
};

function makeParticles(count: number): ParticleSpec[] {
  return Array.from({ length: count }, () => ({
    left: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 12 + 10,
    delay: Math.random() * 14,
  }));
}

const PARTICLES = makeParticles(24);

export default function Background() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /* Parallax on mouse move — very subtle */
    function onMove(e: MouseEvent) {
      const el = containerRef.current;
      if (!el) return;
      const xPct = (e.clientX / window.innerWidth - 0.5) * 20;
      const yPct = (e.clientY / window.innerHeight - 0.5) * 14;
      el.style.transform = `translate(${xPct}px, ${yPct}px)`;
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      <div className="bg-grid" aria-hidden />
      <div className="bg-particles" aria-hidden>
        <div ref={containerRef} style={{ position: "absolute", inset: 0, transition: "transform 1.2s cubic-bezier(0.16,1,0.3,1)" }}>
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="particle"
              style={{
                left: p.left,
                bottom: "-20px",
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
