import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearPieces, markPieces, type DustParticle, type DustSample } from "../lib/dustSample";
import DustTransition, {
  IN_MS,
  OUT_MS,
  PIECE_FADE_MS,
  PIECE_REFORM_MS,
  SWAP_MS,
  SWEEP_IN_MS,
  SWEEP_OUT_MS,
  TOTAL_MS,
  type Phase,
} from "./DustTransition";

function makeSample(): DustSample {
  const particles: DustParticle[] = Array.from({ length: 120 }, (_, i) => ({
    homeX: 20 + (i % 20) * 18,
    homeY: 20 + Math.floor(i / 20) * 18,
    x: 20 + (i % 20) * 18,
    y: 20 + Math.floor(i / 20) * 18,
    size: 2,
    vx: 0.5,
    lift: 1,
    wobble: 0,
    spin: 0,
    tone: i % 10,
    token: 0,
    opacity: 1,
    delay: i / 120,
    kind: "dust",
  }));

  return { particles, pieces: [], range: { min: 0, max: 1 }, W: 400, H: 300 };
}

describe("DustTransition", () => {
  let frames: FrameRequestCallback[];

  beforeEach(() => {
    frames = [];

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(function (
      this: HTMLCanvasElement,
      type: string,
    ) {
      if (type !== "2d") return null;
      return {
        canvas: this,
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        fillText: vi.fn(),
        setTransform: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
        drawImage: vi.fn(),
        measureText: vi.fn(() => ({ width: 10 })),
        textBaseline: "alphabetic",
        globalAlpha: 1,
        globalCompositeOperation: "source-over",
        fillStyle: "",
        font: "",
      } as unknown as CanvasRenderingContext2D;
    });

    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      frames.push(cb);
      return frames.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  const step = async (ts: number) => {
    await act(async () => {
      frames.at(-1)?.(ts);
    });
  };

  it("é lenta de propósito, mas sem blackout", () => {
    expect(TOTAL_MS).toBe(OUT_MS + SWAP_MS + IN_MS);
    // Cadência de varrimento, não de toggle: rápido demais perde o efeito,
    // lento demais transforma trocar de idioma em espera.
    expect(TOTAL_MS).toBeGreaterThanOrEqual(2200);
    expect(TOTAL_MS).toBeLessThanOrEqual(3200);
    // A tela só fica realmente vazia durante o swap.
    expect(SWAP_MS).toBeLessThanOrEqual(160);
    // A última peça entra no varrimento em SWEEP_* e leva PIECE_* para sumir. Se
    // isso estourar a fase, o idioma troca com peça ainda visível — a piscada de volta.
    expect(SWEEP_OUT_MS + PIECE_FADE_MS).toBeLessThanOrEqual(OUT_MS);
    expect(SWEEP_IN_MS + PIECE_REFORM_MS).toBeLessThanOrEqual(IN_MS);
    // A folga entre frente e voo é o que se lê como "varrido": sem ela, a tela
    // inteira se desfaz de uma vez.
    expect(SWEEP_OUT_MS).toBeGreaterThan(OUT_MS * 0.4);
  });

  it("desenha as partículas do primeiro frame", async () => {
    render(
      <DustTransition
        phase="out"
        sample={makeSample()}
        onSwap={vi.fn().mockReturnValue(null)}
        onPhaseChange={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    const canvas = document.querySelector(".dust-overlay")!;
    expect(canvas).toBeInTheDocument();
    expect(Number(canvas.getAttribute("data-particle-count"))).toBe(120);

    await step(0);
    expect(frames.length).toBeGreaterThan(1); // o loop se agendou de novo
  });

  it("percorre out → swap → in e troca o idioma uma única vez", async () => {
    const onSwap = vi.fn().mockReturnValue(makeSample());
    const onPhaseChange = vi.fn();
    const onComplete = vi.fn();

    // A mesma amostra em todos os renders: trocar a identidade do prop recriaria
    // o loop e zeraria o relógio da fase — que é exatamente o que não pode acontecer.
    const sample = makeSample();
    const view = render(
      <DustTransition
        phase="out"
        sample={sample}
        onSwap={onSwap}
        onPhaseChange={onPhaseChange}
        onComplete={onComplete}
      />,
    );

    const rerender = (phase: Phase) =>
      view.rerender(
        <DustTransition
          phase={phase}
          sample={sample}
          onSwap={onSwap}
          onPhaseChange={onPhaseChange}
          onComplete={onComplete}
        />,
      );

    await step(0);
    expect(onSwap).not.toHaveBeenCalled();

    // Meio do "out": ainda voando, nada trocou.
    await step(OUT_MS / 2);
    expect(onSwap).not.toHaveBeenCalled();

    await step(OUT_MS);
    expect(onSwap).toHaveBeenCalledTimes(1);
    expect(onPhaseChange).toHaveBeenLastCalledWith("swap");

    await step(OUT_MS + 10);
    expect(onSwap).toHaveBeenCalledTimes(1); // não repete no frame seguinte

    onPhaseChange.mockClear();
    await act(async () => rerender("swap"));
    await step(OUT_MS + SWAP_MS);
    expect(onPhaseChange).toHaveBeenLastCalledWith("in");

    await act(async () => rerender("in"));
    expect(onComplete).not.toHaveBeenCalled();
    await step(OUT_MS + SWAP_MS + IN_MS);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe("marcação das peças", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  function at(top: number, left = 0): HTMLElement {
    const el = document.createElement("div");
    el.getBoundingClientRect = () =>
      ({ top, left, width: 200, height: 40, bottom: top + 40, right: left + 200 }) as DOMRect;
    document.body.append(el);
    return el;
  }

  const delayOf = (el: HTMLElement) =>
    Number.parseInt(el.style.getPropertyValue("--dust-d"), 10);

  it("na saída a diagonal desce do topo", () => {
    const topoEsq = at(40, 20);
    const baixoDir = at(820, 1200);

    markPieces([topoEsq, baixoDir], 600, 1440, 900, { min: 0, max: 1 }, "down");

    expect(delayOf(topoEsq)).toBeLessThan(delayOf(baixoDir));
  });

  it("na volta é a mesma diagonal pela ponta oposta, de baixo para cima", () => {
    const topoEsq = at(40, 20);
    const baixoDir = at(820, 1200);

    markPieces([topoEsq, baixoDir], 600, 1440, 900, { min: 0, max: 1 }, "up");

    expect(delayOf(baixoDir)).toBeLessThan(delayOf(topoEsq));
  });

  it("a volta é diagonal, não uma faixa horizontal subindo", () => {
    const mesmaAlturaEsq = at(500, 40);
    const mesmaAlturaDir = at(500, 1300);

    markPieces([mesmaAlturaEsq, mesmaAlturaDir], 600, 1440, 900, { min: 0, max: 1 }, "up");

    // Mesma altura, x diferente: se fosse varrimento horizontal os dois seriam iguais.
    expect(delayOf(mesmaAlturaDir)).toBeLessThan(delayOf(mesmaAlturaEsq));
  });

  it("marca e desmarca sem deixar resíduo no DOM", () => {
    const a = document.createElement("div");
    const b = document.createElement("div");
    document.body.append(a, b);

    markPieces([a, b], 300, 1440, 900, { min: 0, max: 1 }, "down");

    expect(a).toHaveClass("dust-piece");
    expect(a.style.getPropertyValue("--dust-d")).toMatch(/^\d+ms$/);

    clearPieces([a, b]);

    expect(a).not.toHaveClass("dust-piece");
    expect(a.style.getPropertyValue("--dust-d")).toBe("");
    expect(b.getAttribute("style")).toBeFalsy();
  });
});
