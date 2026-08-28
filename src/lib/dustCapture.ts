import html2canvas from "html2canvas";

const CHARS = "01{}[]<>/\\|&*#@$%constletfn=>;".split("");

export type DustParticle = {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  size: number;
  vx: number;
  lift: number;
  wobble: number;
  color: string;
  opacity: number;
  delay: number;
  kind: "dust" | "char";
  char: string;
};

export type DustCapture = {
  snapshot: HTMLCanvasElement | null;
  particles: DustParticle[];
  W: number;
  H: number;
};

function tintColor(r: number, g: number, b: number, redMix: number): string {
  return `rgb(${Math.round(r * (1 - redMix) + 224 * redMix)}, ${Math.round(g * (1 - redMix) + 32 * redMix)}, ${Math.round(b * (1 - redMix) + 32 * redMix)})`;
}

function parseRgb(color: string): [number, number, number] | null {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function sampleDomColor(x: number, y: number): [number, number, number] | null {
  if (typeof document.elementFromPoint !== "function") return null;
  const shell = document.querySelector(".app-shell");
  const el = document.elementFromPoint(x, y);
  if (!el || !shell?.contains(el)) return null;

  const style = getComputedStyle(el);
  for (const color of [style.color, style.backgroundColor]) {
    const rgb = parseRgb(color);
    if (!rgb) continue;
    const [r, g, b] = rgb;
    if (r + g + b > 40) return rgb;
  }
  return null;
}

function isCaptureValid(imageData: ImageData): boolean {
  const { data } = imageData;
  let lit = 0;
  const step = 16;
  for (let i = 0; i < data.length; i += 4 * step) {
    if (data[i]! + data[i + 1]! + data[i + 2]! > 90) lit++;
  }
  return lit > 120;
}

function makeParticle(x: number, y: number, r: number, g: number, b: number): DustParticle {
  const redMix = Math.random() > 0.62 ? 0.35 + Math.random() * 0.45 : 0.08 + Math.random() * 0.12;
  const isChar = Math.random() > 0.88;

  return {
    homeX: x,
    homeY: y,
    x,
    y,
    size: isChar ? 10 + Math.random() * 4 : 2 + Math.random() * 3.2,
    vx: (Math.random() - 0.5) * 2.4,
    lift: 1 + Math.random() * 2.2,
    wobble: Math.random() * Math.PI * 2,
    color: tintColor(r, g, b, redMix),
    opacity: 0.88 + Math.random() * 0.12,
    delay: Math.random() * 0.42,
    kind: isChar ? "char" : "dust",
    char: CHARS[Math.floor(Math.random() * CHARS.length)]!,
  };
}

function buildParticlesFromImage(
  imageData: ImageData,
  W: number,
  H: number,
): DustParticle[] {
  const mobile = W < 768;
  const step = mobile ? 5 : 3;
  const maxCount = mobile ? 1400 : 3200;
  const particles: DustParticle[] = [];
  const { data, width } = imageData;

  for (let y = step / 2; y < H; y += step) {
    for (let x = step / 2; x < W; x += step) {
      if (particles.length >= maxCount) break;

      const px = Math.min(width - 1, Math.floor(x));
      const py = Math.min(imageData.height - 1, Math.floor(y));
      const i = (py * width + px) * 4;
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      const a = data[i + 3]!;

      if (a < 40) continue;
      if (r + g + b < 24) continue;

      particles.push(makeParticle(x, y, r, g, b));
    }
  }

  return particles;
}

function buildParticlesFromDom(W: number, H: number): DustParticle[] {
  const mobile = W < 768;
  const step = mobile ? 5 : 3;
  const maxCount = mobile ? 1400 : 3200;
  const particles: DustParticle[] = [];

  for (let y = step / 2; y < H; y += step) {
    for (let x = step / 2; x < W; x += step) {
      if (particles.length >= maxCount) break;
      const rgb = sampleDomColor(x, y);
      if (!rgb) continue;
      const [r, g, b] = rgb;
      particles.push(makeParticle(x, y, r, g, b));
    }
  }

  return particles;
}

/** Capture the visible viewport before any transition CSS hides content. */
export async function captureViewport(): Promise<DustCapture> {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const target = document.querySelector<HTMLElement>(".app-shell");

  if (!target) {
    return { snapshot: null, particles: buildParticlesFromDom(W, H), W, H };
  }

  const snapshot = document.createElement("canvas");
  snapshot.width = W;
  snapshot.height = H;
  const snapCtx = snapshot.getContext("2d");
  if (!snapCtx) {
    return { snapshot: null, particles: buildParticlesFromDom(W, H), W, H };
  }

  try {
    const shot = await html2canvas(target, {
      backgroundColor: "#080808",
      scale: 1,
      useCORS: true,
      logging: false,
      width: W,
      height: H,
      windowWidth: W,
      windowHeight: H,
      scrollX: 0,
      scrollY: -window.scrollY,
      x: 0,
      y: 0,
      onclone: (doc) => {
        const shell = doc.querySelector<HTMLElement>(".app-shell");
        if (!shell) return;
        shell.style.visibility = "visible";
        shell.classList.remove("is-captured");
      },
    });

    snapCtx.drawImage(shot, 0, 0, W, H);
    const imageData = snapCtx.getImageData(0, 0, W, H);

    if (isCaptureValid(imageData)) {
      return {
        snapshot,
        particles: buildParticlesFromImage(imageData, W, H),
        W,
        H,
      };
    }
  } catch {
    /* fall through to DOM sampling */
  }

  snapCtx.fillStyle = "#080808";
  snapCtx.fillRect(0, 0, W, H);

  const particles = buildParticlesFromDom(W, H);
  for (const p of particles) {
    snapCtx.fillStyle = p.color;
    const s = p.size;
    snapCtx.fillRect(p.homeX - s / 2, p.homeY - s / 2, s, s);
  }

  return { snapshot, particles, W, H };
}
