import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearPieces, markPieces, type DustParticle, type DustSample } from "../lib/dustSample";
import DustTransition, {
  IN_MS,
  OUT_MS,
  PIECE_FADE_MS,
  SWAP_MS,
  SWEEP_MS,
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
    color: "rgb(224, 32, 32)",
    opacity: 1,
    delay: i / 120,
    kind: "dust",
    char: "0",
  }));

  return { particles, pieces: [], W: 400, H: 300 };
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
        globalAlpha: 1,
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

  it("mantém a transição curta e sem blackout", () => {
    expect(TOTAL_MS).toBe(OUT_MS + SWAP_MS + IN_MS);
    expect(TOTAL_MS).toBeGreaterThanOrEqual(900);
    expect(TOTAL_MS).toBeLessThanOrEqual(1300);
    // A tela só fica realmente vazia durante o swap.
    expect(SWAP_MS).toBeLessThanOrEqual(120);
    // A última peça entra no varrimento em SWEEP_MS e leva PIECE_FADE_MS para sumir.
    // Se isso estourar o "out", o idioma troca com peça ainda visível — a piscada de volta.
    expect(SWEEP_MS + PIECE_FADE_MS).toBeLessThanOrEqual(OUT_MS);
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

  it("marca e desmarca sem deixar resíduo no DOM", () => {
    const a = document.createElement("div");
    const b = document.createElement("div");
    document.body.append(a, b);

    markPieces([a, b], 300, 1440, 900);

    expect(a).toHaveClass("dust-piece");
    expect(a.style.getPropertyValue("--dust-d")).toMatch(/^\d+ms$/);

    clearPieces([a, b]);

    expect(a).not.toHaveClass("dust-piece");
    expect(a.style.getPropertyValue("--dust-d")).toBe("");
    expect(b.getAttribute("style")).toBeFalsy();
  });
});
