/**
 * Amostragem de "tinta" a partir do DOM vivo.
 *
 * Substitui o antigo `dustCapture`, que rasterizava a viewport com html2canvas.
 * Aquele caminho não servia para este site: o clone do html2canvas reinicia as
 * animações CSS, então tudo que depende de `animation: fade-up ... forwards`
 * (hero, terminal, stack panel) era fotografado ainda em `opacity: 0`; e
 * `mask-image` não é suportado, então a grade de fundo saía sem a máscara
 * radial. Aqui nada é rasterizado: as partículas nascem das caixas de texto,
 * fundos e bordas que o layout já calculou.
 */

/**
 * O site se desfaz no material de que é feito. Tokens curtos aparecem muito
 * mais que palavras porque a lista os repete — e palavra inteira em meio à
 * poeira vira ruído se for frequente demais.
 */
export const TOKENS = [
  ..."0101{}[]<>/\\|&*#@$%;:=~^".split(""),
  "=>", "()", "[]", "{}", "::", "&&", "||", "!=", "/*", "*/", "0x", "fn", "if",
  "const", "null", "void", "async", "return",
];

/** Altura máxima de um bloco para ele virar uma "peça" que some por inteiro. */
const PIECE_MAX_H = 220;
/** Até esta altura, um container com fundo/borda próprios também some junto. */
const SURFACE_MAX_H = 700;
/** Landmarks nunca somem como unidade: são só o esqueleto do layout. */
const LAYOUT_TAGS = new Set(["MAIN", "SECTION", "HEADER", "FOOTER", "NAV"]);
/** Fatia máxima do orçamento que uma única fonte de tinta pode puxar. */
const MAX_SOURCE_SHARE = 0.05;
const BUDGET_DESKTOP = 3400;
/**
 * Menos que o desktop em número absoluto, mas ainda mais denso por área: uma
 * viewport de celular tem ~1/4 dos pixels. O que pesa no telefone é o volume
 * de partículas desenhadas por frame, então densidade equivalente sai barato.
 */
const BUDGET_MOBILE = 1000;

/** Tinta necessária por fragmento na revelação de um bloco. */
const INK_PER_FRAGMENT = 95;
const MIN_FRAGMENTS = 18;

export type DustParticle = {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  size: number;
  vx: number;
  lift: number;
  wobble: number;
  /** Radianos de tombo ao longo do voo. Zero para a poeira fina. */
  spin: number;
  /** Índice em EMBER_PALETTE. Discreto para o atlas de fragmentos funcionar. */
  tone: number;
  /** Índice em TOKENS. Só usado quando kind === "char". */
  token: number;
  opacity: number;
  /** 0–1 na diagonal, define quando a partícula entra no varrimento. */
  delay: number;
  kind: "dust" | "char";
};

/**
 * Extensão da diagonal realmente ocupada por conteúdo. Os atrasos são remapeados
 * para esse intervalo: sem isso o varrimento gasta o fim do percurso cruzando
 * canto vazio, e a tela fica parada esperando uma poeira que já acabou.
 */
export type SweepRange = { min: number; max: number };

export type DustSample = {
  particles: DustParticle[];
  pieces: HTMLElement[];
  range: SweepRange;
  W: number;
  H: number;
};

type Rgb = { r: number; g: number; b: number };

type Ink = { x: number; y: number; w: number; h: number; color: Rgb; weight: number };

type BoxLike = {
  width: number;
  height: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
};

function clamp01(n: number) {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

/** Aceita `rgb(0,0,0)`, `rgba(0,0,0,.5)` e a sintaxe moderna `rgb(0 0 0 / 50%)`. */
function parseColor(css: string) {
  const m = css.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+)(%?))?/);
  if (!m) return null;
  const rawA = m[4] === undefined ? 1 : Number(m[4]);
  return {
    r: Number(m[1]),
    g: Number(m[2]),
    b: Number(m[3]),
    a: m[5] === "%" ? rawA / 100 : rawA,
  };
}

/**
 * Rampa brasa apagada -> vermelho da marca -> faísca quente.
 *
 * A ponta escura não é preto de verdade: sobre o #080808 do fundo, preto é o
 * mesmo que invisível, e a partícula viraria orçamento desperdiçado.
 */
const EMBER_RAMP = [
  { at: 0, r: 70, g: 16, b: 16 },
  { at: 0.5, r: 224, g: 32, b: 32 },
  { at: 1, r: 255, g: 150, b: 150 },
];

/**
 * Tons discretos em vez de cor contínua: com poucos tons dá para pré-renderizar
 * os fragmentos de texto num atlas (um por tom) e trocar `fillText` por
 * `drawImage`, que é o que mantém a animação em 60fps. Dez degraus já não se
 * distinguem de uma rampa contínua nesta escala.
 */
const EMBER_STEPS = 10;

function rampAt(t: number): string {
  const hi = t <= EMBER_RAMP[1]!.at ? 1 : 2;
  const a = EMBER_RAMP[hi - 1]!;
  const b = EMBER_RAMP[hi]!;
  const k = (t - a.at) / (b.at - a.at);
  const mix = (x: number, y: number) => Math.round(x + (y - x) * k);
  return `rgb(${mix(a.r, b.r)}, ${mix(a.g, b.g)}, ${mix(a.b, b.b)})`;
}

export const EMBER_PALETTE = Array.from({ length: EMBER_STEPS }, (_, i) =>
  rampAt(i / (EMBER_STEPS - 1)),
);

/**
 * Traduz a tinta original para a paleta do site sem perder o desenho da página:
 * a luminância do que estava ali vira a temperatura da brasa, então texto claro
 * solta fragmento quente e área escura solta fragmento quase preto.
 */
function emberTone(src: Rgb): number {
  const lum = (0.2126 * src.r + 0.7152 * src.g + 0.0722 * src.b) / 255;
  // Piso de 0.18: mesmo tinta escura sai como brasa, nunca como nada.
  const t = clamp01(0.18 + lum ** 0.7 * (0.55 + Math.random() * 0.5));
  return Math.round(t * (EMBER_STEPS - 1));
}

/**
 * Sentido do varrimento. É sempre a mesma diagonal; o que muda é de que ponta
 * ela parte. A saída desce do topo, a volta sobe de baixo trazendo a tradução.
 */
export type SweepAxis = "down" | "up";

/** Posição de um ponto ao longo do eixo, 0 = onde começa, 1 = onde termina. */
function sweepAt(x: number, y: number, W: number, H: number, axis: SweepAxis) {
  const along = 0.55 * (x / W) + 0.45 * (y / H);
  return clamp01(axis === "up" ? 1 - along : along);
}

function isDecorative(el: Element) {
  return (
    el.id === "cursor-canvas" ||
    el.classList.contains("bg-grid") ||
    el.classList.contains("dust-overlay") ||
    el.classList.contains("sr-only") ||
    el.classList.contains("skip-link")
  );
}

/** Retângulo dentro do qual a tinta interessa. */
type Bounds = { left: number; top: number; right: number; bottom: number };

function intersects(r: BoxLike, b: Bounds) {
  return (
    r.width > 0 && r.height > 0 &&
    r.bottom > b.top && r.top < b.bottom &&
    r.right > b.left && r.left < b.right
  );
}

const viewportBounds = (W: number, H: number): Bounds => ({ left: 0, top: 0, right: W, bottom: H });

/** Tem pintura própria — fundo ou borda visível — e não só filhos. */
function hasSurface(style: CSSStyleDeclaration) {
  const bg = parseColor(style.backgroundColor);
  if (bg && bg.a > 0.04 && bg.r + bg.g + bg.b > 24) return true;
  const bc = parseColor(style.borderTopColor);
  return (Number.parseFloat(style.borderTopWidth) || 0) > 0 && !!bc && bc.a > 0.06;
}

/**
 * Desce a árvore até blocos pequenos o bastante para sumirem como uma unidade.
 *
 * Um container alto normalmente só serve de esqueleto, então descemos nele. Mas
 * se ele tem superfície própria (um card com fundo e borda), precisa sumir
 * também: senão a moldura fica flutuando vazia depois que o conteúdo virou
 * poeira. Nesse caso ancestral e descendente saem os dois marcados, e a
 * opacidade multiplica — o fade fica um pouco mais seco, o que é bem melhor do
 * que a moldura órfã.
 */
function collectPieces(
  roots: Element[],
  bounds: Bounds,
  styleOf: (el: Element) => CSSStyleDeclaration,
): HTMLElement[] {
  const out: HTMLElement[] = [];

  const visit = (el: Element) => {
    if (!(el instanceof HTMLElement) || isDecorative(el)) return;
    const r = el.getBoundingClientRect();
    if (!intersects(r, bounds)) return;
    // Não vira poeira o que ainda não apareceu (um `.reveal` por revelar, por
    // exemplo). Também é o que permite a volta mirar opacidade 1 com segurança.
    if (Number.parseFloat(styleOf(el).opacity) < 0.5) return;
    if (el.children.length === 0 || r.height <= PIECE_MAX_H) {
      out.push(el);
      return;
    }
    if (r.height <= SURFACE_MAX_H && !LAYOUT_TAGS.has(el.tagName) && hasSurface(styleOf(el))) {
      out.push(el);
    }
    for (const child of el.children) visit(child);
  };

  for (const root of roots) visit(root);
  return out;
}

function collectInk(
  pieces: HTMLElement[],
  bounds: Bounds,
  styleOf: (el: Element) => CSSStyleDeclaration,
): Ink[] {
  const ink: Ink[] = [];
  const range = typeof document.createRange === "function" ? document.createRange() : null;

  for (const piece of pieces) {
    const r = piece.getBoundingClientRect();
    const style = styleOf(piece);

    const bg = parseColor(style.backgroundColor);
    if (bg && bg.a > 0.04 && bg.r + bg.g + bg.b > 24) {
      // Fundos chapados pesam pouco: são áreas grandes e uniformes.
      ink.push({
        x: r.left,
        y: r.top,
        w: r.width,
        h: r.height,
        color: bg,
        weight: r.width * r.height * 0.09,
      });
    }

    const bw = Number.parseFloat(style.borderTopWidth) || 0;
    const bc = parseColor(style.borderTopColor);
    if (bw > 0 && bc && bc.a > 0.06) {
      const color = bc;
      const t = Math.max(1.5, bw);
      ink.push({ x: r.left, y: r.top, w: r.width, h: t, color, weight: r.width * t });
      ink.push({ x: r.left, y: r.bottom - t, w: r.width, h: t, color, weight: r.width * t });
      ink.push({ x: r.left, y: r.top, w: t, h: r.height, color, weight: t * r.height });
      ink.push({ x: r.right - t, y: r.top, w: t, h: r.height, color, weight: t * r.height });
    }

    if (!range) continue;

    const walker = document.createTreeWalker(piece, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const parent = node.parentElement;
      if (node.nodeValue?.trim() && parent && !isDecorative(parent)) {
        const ps = styleOf(parent);
        const col = parseColor(ps.color);
        if (col && col.a > 0.08 && ps.visibility !== "hidden") {
          const color = col;
          range.selectNodeContents(node);
          for (const line of range.getClientRects()) {
            if (line.width < 2 || line.height < 2 || !intersects(line, bounds)) continue;
            // Texto é a tinta que mais importa: peso alto por área.
            ink.push({
              x: line.left,
              y: line.top,
              w: line.width,
              h: line.height,
              color,
              weight: line.width * line.height * 0.55,
            });
          }
        }
      }
      node = walker.nextNode();
    }
  }

  return ink;
}

function makeParticle(x: number, y: number, src: Rgb, delay: number): DustParticle {
  const isChar = Math.random() > 0.66;
  const token = Math.floor(Math.random() * TOKENS.length);
  const char = TOKENS[token]!;

  return {
    homeX: x,
    homeY: y,
    x,
    y,
    // Token longo encolhe: senão um `return` solto pesa mais que o resto da poeira.
    size: isChar ? (char.length > 2 ? 9 + Math.random() * 2.5 : 11 + Math.random() * 3.5) : 2 + Math.random() * 3.2,
    vx: (Math.random() - 0.5) * 2.2,
    lift: 0.7 + Math.random() * 2,
    wobble: Math.random() * Math.PI * 2,
    // Só os fragmentos giram, e pouco: poeira fina girando não se lê como nada.
    spin: isChar ? (Math.random() - 0.5) * 1.1 : 0,
    tone: emberTone(src),
    token,
    opacity: 0.85 + Math.random() * 0.15,
    delay,
    kind: isChar ? "char" : "dust",
  };
}

/**
 * Sorteia partículas nas fontes de tinta, proporcional ao peso de cada uma.
 *
 * A versão anterior repartia o orçamento por regra de três e arredondava por
 * fonte, o que perdia ~30% das partículas entre o arredondamento e o teto —
 * pedia 4600 e entregava 3100. Sorteando, o orçamento sai exato.
 */
function distribute(
  ink: Ink[],
  budget: number,
  delayAt: (x: number, y: number) => number,
): DustParticle[] {
  if (!ink.length) return [];

  const raw = ink.reduce((sum, i) => sum + i.weight, 0);
  if (raw <= 0) return [];
  // Teto por fonte: sem ele o fundo de um card grande engole o orçamento inteiro.
  const cap = raw * MAX_SOURCE_SHARE;

  const cumulative: number[] = [];
  let total = 0;
  for (const src of ink) {
    total += Math.min(src.weight, cap);
    cumulative.push(total);
  }

  const particles: DustParticle[] = [];
  for (let i = 0; i < budget; i++) {
    const target = Math.random() * total;
    let lo = 0;
    let hi = cumulative.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cumulative[mid]! < target) lo = mid + 1;
      else hi = mid;
    }
    const src = ink[lo]!;
    const x = src.x + Math.random() * src.w;
    const y = src.y + Math.random() * src.h;
    particles.push(makeParticle(x, y, src.color, delayAt(x, y)));
  }
  return particles;
}

/**
 * Remapeia os atrasos brutos para 0–1 sobre a faixa que tem conteúdo e devolve
 * a faixa usada, para as peças seguirem exatamente o mesmo eixo.
 */
function normalizeDelays(particles: DustParticle[]): SweepRange {
  if (!particles.length) return { min: 0, max: 1 };

  let min = Infinity;
  let max = -Infinity;
  for (const p of particles) {
    if (p.delay < min) min = p.delay;
    if (p.delay > max) max = p.delay;
  }

  // Piso na extensão: conteúdo concentrado num ponto não vira varrimento instantâneo.
  const span = Math.max(0.08, max - min);
  for (const p of particles) {
    // Jitter estreito: é a borda de dissolução que desenha o varrimento,
    // e com dispersão demais ela deixa de se ler como uma frente.
    p.delay = clamp01((p.delay - min) / span + (Math.random() - 0.5) * 0.07);
  }
  return { min, max: min + span };
}

/** Lê o layout atual e monta partículas + peças. Síncrono e sem rasterizar. */
export function sampleViewport(axis: SweepAxis): DustSample {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const shell = document.querySelector<HTMLElement>(".app-shell");
  if (!shell) return { particles: [], pieces: [], range: { min: 0, max: 1 }, W, H };

  // Um único cache de estilo para toda a amostragem: getComputedStyle é caro
  // e os mesmos elementos são consultados na seleção de peças e na de tinta.
  const styles = new Map<Element, CSSStyleDeclaration>();
  const styleOf = (el: Element) => {
    let s = styles.get(el);
    if (!s) {
      s = getComputedStyle(el);
      styles.set(el, s);
    }
    return s;
  };

  const bounds = viewportBounds(W, H);
  const roots = Array.from(shell.children).filter((el) => !isDecorative(el));
  const pieces = collectPieces(roots, bounds, styleOf);
  const budget = W < 768 ? BUDGET_MOBILE : BUDGET_DESKTOP;
  const particles = distribute(collectInk(pieces, bounds, styleOf), budget, (x, y) =>
    sweepAt(x, y, W, H, axis),
  );
  // Agrupadas por tom para a guarda de fillStyle no desenho quase nunca errar.
  // A ordem não importa para nada além disso: as partículas não se sobrepõem
  // de forma significativa e cada uma tem seu próprio atraso.
  particles.sort((a, b) => a.tone - b.tone);
  return { particles, pieces, range: normalizeDelays(particles), W, H };
}

/**
 * Fragmentos de um bloco só, para a revelação por scroll.
 *
 * Mesma tinta e mesma paleta da transição de idioma — é o que faz as duas
 * animações parecerem a mesma linguagem. O atraso corre na diagonal dentro da
 * caixa do próprio bloco, então cada seção tem seu pequeno varrimento em vez de
 * herdar o eixo da viewport.
 */
export function sampleFragments(el: HTMLElement, maxBudget: number): DustParticle[] {
  const r = el.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return [];

  const styles = new Map<Element, CSSStyleDeclaration>();
  const styleOf = (node: Element) => {
    let st = styles.get(node);
    if (!st) {
      st = getComputedStyle(node);
      styles.set(node, st);
    }
    return st;
  };

  // A caixa do bloco, não a viewport: ele costuma estar entrando pela borda de
  // baixo, e recortar pela tela descartaria justo a parte que ainda vai surgir.
  const bounds = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
  const ink = collectInk([el], bounds, styleOf);

  // Orçamento proporcional à tinta, não fixo: os blocos vão de um rótulo de
  // 107x18 a um showcase de 1100x439 — quase 50x de diferença. Número fixo
  // empilhava o mesmo tanto de partículas num rótulo minúsculo e num painel.
  const weight = ink.reduce((sum, i) => sum + i.weight, 0);
  const scaled = Math.min(maxBudget, Math.max(MIN_FRAGMENTS, Math.round(weight / INK_PER_FRAGMENT)));

  const particles = distribute(ink, scaled, (x, y) =>
    clamp01(0.55 * ((x - r.left) / r.width) + 0.45 * ((y - r.top) / r.height)),
  );

  // O bloco é amostrado no instante em que ganha `visible`, ainda deslocado
  // pelo `translate` do estado inicial. Sem descontar esse deslocamento os
  // fragmentos convergiriam para onde o bloco estava, não para onde ele vai
  // parar — e ficariam 36px fora do lugar.
  const [tx, ty] = translationOf(styleOf(el));
  if (tx || ty) {
    for (const p of particles) {
      p.homeX -= tx;
      p.homeY -= ty;
      p.x = p.homeX;
      p.y = p.homeY;
    }
  }

  particles.sort((a, b) => a.tone - b.tone);
  return particles;
}

/** Translação atual de um elemento, em px. Zero quando não há transform. */
function translationOf(style: CSSStyleDeclaration): [number, number] {
  const t = style.transform;
  if (!t || t === "none" || typeof DOMMatrixReadOnly !== "function") return [0, 0];
  try {
    const m = new DOMMatrixReadOnly(t);
    return [m.m41, m.m42];
  } catch {
    return [0, 0];
  }
}

/** Atraso da transição CSS do elemento, em ms. */
export function transitionDelayOf(el: HTMLElement): number {
  const raw = getComputedStyle(el).transitionDelay.split(",")[0]?.trim() ?? "0s";
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return 0;
  return raw.endsWith("ms") ? n : n * 1000;
}

/**
 * Congela as animações de entrada já terminadas, escrevendo o resultado delas
 * como estilo inline.
 *
 * O hero entra com `animation: fade-up ... forwards`, e uma animação preenchendo
 * a opacidade impede o browser de transicionar essa mesma opacidade — nem com
 * `!important`, que vence na cascata mas não faz a transição disparar. O efeito
 * era a peça reaparecer de estalo no fim da transição.
 *
 * `commitStyles` + `cancel` grava o estado final e tira a animação do caminho.
 * Só mexe no que já terminou: pulso, marquee e cursor piscando seguem rodando.
 */
function bakeFinishedEntryAnimations(el: HTMLElement) {
  if (typeof el.getAnimations !== "function") return;
  for (const anim of el.getAnimations()) {
    if (anim.playState !== "finished" || !("animationName" in anim)) continue;
    try {
      anim.commitStyles();
      anim.cancel();
    } catch {
      /* commitStyles lança se o elemento não estiver renderizado */
    }
  }
}

/**
 * Marca as peças com o atraso do varrimento. Lê todos os rects antes de
 * escrever qualquer estilo, para não alternar leitura e escrita de layout.
 */
export function markPieces(
  pieces: HTMLElement[],
  sweepMs: number,
  W: number,
  H: number,
  range: SweepRange,
  axis: SweepAxis,
) {
  const span = Math.max(0.08, range.max - range.min);
  const delays = pieces.map((el) => {
    const r = el.getBoundingClientRect();
    // 35% dentro da caixa: a peça começa a sumir quando a frente do varrimento a alcança.
    const raw = sweepAt(r.left + r.width * 0.35, r.top + r.height * 0.35, W, H, axis);
    return clamp01((raw - range.min) / span);
  });

  pieces.forEach((el, i) => {
    bakeFinishedEntryAnimations(el);
    el.style.setProperty("--dust-d", `${Math.round(delays[i]! * sweepMs)}ms`);
    el.classList.add("dust-piece");
  });
}

export function clearPieces(pieces: HTMLElement[]) {
  for (const el of pieces) {
    el.classList.remove("dust-piece");
    el.style.removeProperty("--dust-d");
  }
}
