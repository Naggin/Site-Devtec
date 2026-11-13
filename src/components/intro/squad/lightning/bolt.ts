/**
 * Geometria procedural do raio (midpoint displacement com seed).
 *
 * Os pontos ficam num referencial normalizado: u vai de 0 (origem) a 1 (alvo) ao longo
 * do eixo e v é o desvio perpendicular, em unidades do comprimento do eixo. Assim o
 * mesmo formato acompanha origem/alvo que se movem (câmera) sem ser re-gerado.
 */

export type Pt = readonly [u: number, v: number];

export interface Branch {
  /** Fração do raio principal onde o galho nasce (para revelar na ordem certa). */
  at: number;
  pts: Pt[];
}

export interface BoltShape {
  main: Pt[];
  branches: Branch[];
}

/** PRNG determinístico (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Subdivide o segmento a→b deslocando cada ponto médio na perpendicular. */
function displace(a: Pt, b: Pt, depth: number, rough: number, rand: () => number): Pt[] {
  let pts: Pt[] = [a, b];
  let amp = rough;
  for (let d = 0; d < depth; d++) {
    const next: Pt[] = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const [u0, v0] = pts[i - 1];
      const [u1, v1] = pts[i];
      const du = u1 - u0;
      const dv = v1 - v0;
      const off = (rand() * 2 - 1) * amp;
      // Perpendicular ao segmento local, proporcional ao tamanho do segmento original.
      next.push([(u0 + u1) / 2 - dv * off, (v0 + v1) / 2 + du * off], pts[i]);
    }
    pts = next;
    amp *= 0.62;
  }
  return pts;
}

export function makeBolt(seed: number): BoltShape {
  const rand = rng(seed);
  const main = displace([0, 0], [1, 0], 6, 0.42, rand);
  // As pontas ficam presas na origem e no alvo.
  main[0] = [0, 0];
  main[main.length - 1] = [1, 0];

  const branches: Branch[] = [];
  const count = 2 + Math.floor(rand() * 3);
  for (let k = 0; k < count; k++) {
    const i = Math.floor((0.18 + rand() * 0.6) * (main.length - 1));
    const [u, v] = main[i];
    const angle = (rand() < 0.5 ? -1 : 1) * (0.35 + rand() * 0.5);
    const len = 0.1 + rand() * 0.22;
    const end: Pt = [u + Math.cos(angle) * len, v + Math.sin(angle) * len];
    branches.push({ at: i / (main.length - 1), pts: displace([u, v], end, 4, 0.5, rand) });
  }
  return { main, branches };
}

export interface Vec {
  x: number;
  y: number;
}

/** Converte pontos normalizados em `d` de path SVG para o eixo a→b na tela. */
export function toPath(pts: Pt[], a: Vec, b: Vec): string {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let d = "";
  for (let i = 0; i < pts.length; i++) {
    const [u, v] = pts[i];
    const x = a.x + u * dx - v * dy;
    const y = a.y + u * dy + v * dx;
    d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}
