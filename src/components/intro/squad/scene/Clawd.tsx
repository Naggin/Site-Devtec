/** Mascote do Claude Code, gerado dos block chars do CLI (cada char = 2x2 quadrantes de 1x2). */
const ROWS = [" ▐▛███▜▌ ", "▝▜█████▛▘", "  ▘▘ ▝▝  "];

// Quadrantes acesos: [cima-esq, cima-dir, baixo-esq, baixo-dir].
const QUADS: Record<string, [number, number, number, number]> = {
  " ": [0, 0, 0, 0],
  "█": [1, 1, 1, 1],
  "▐": [0, 1, 0, 1],
  "▌": [1, 0, 1, 0],
  "▛": [1, 1, 1, 0],
  "▜": [1, 1, 0, 1],
  "▝": [0, 1, 0, 0],
  "▘": [1, 0, 0, 0],
};

const RECTS = ROWS.flatMap((row, r) =>
  [...row].flatMap((ch, c) =>
    (QUADS[ch] ?? QUADS[" "]).flatMap((on, q) =>
      on ? [{ x: c * 2 + (q % 2), y: r * 4 + Math.floor(q / 2) * 2 }] : [],
    ),
  ),
);

export function Clawd({ className, color = "#D77757" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 18 12" className={className} fill={color} shapeRendering="crispEdges" aria-hidden>
      {RECTS.map(({ x, y }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1.04} height={2.04} />
      ))}
    </svg>
  );
}
