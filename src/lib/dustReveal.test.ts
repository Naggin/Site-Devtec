import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cancelReveals,
  resetDustReveal,
  REVEAL_LEAD_STEP_MS,
  REVEAL_TOTAL_MS,
  startDustReveal,
  supportsDustReveal,
} from "./dustReveal";

/** Contexto 2d de mentira: o desenho não é o que está sob teste aqui. */
function fakeContext() {
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
      drawImage: vi.fn(),
      measureText: vi.fn(() => ({ width: 10 })),
      textBaseline: "alphabetic",
      globalAlpha: 1,
      fillStyle: "",
      font: "",
    } as unknown as CanvasRenderingContext2D;
  });
}

/** jsdom não faz layout: sem caixas nem linhas de texto não há tinta nenhuma. */
type RangeRects = { getClientRects?: () => DOMRectList };

function fakeLayout() {
  const box = { top: 300, left: 40, width: 260, height: 120, bottom: 420, right: 300 };
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue(box as DOMRect);
  // `spyOn` não serve: jsdom nem declara getClientRects em Range.
  (Range.prototype as RangeRects).getClientRects = () =>
    [{ ...box, height: 18, bottom: 318 }] as unknown as DOMRectList;
}

function clearFakeLayout() {
  delete (Range.prototype as RangeRects).getClientRects;
}

function block(delay?: string) {
  const el = document.createElement("div");
  el.className = "reveal";
  if (delay) el.dataset.delay = delay;
  // Cor inline: a tinta vem do estilo computado, e jsdom não traz folha padrão.
  el.innerHTML = '<p style="color: rgb(244, 244, 244)">Da interface ao deploy</p>';
  document.body.append(el);
  return el;
}

describe("entrada em poeira das seções", () => {
  let frames: FrameRequestCallback[];

  beforeEach(() => {
    frames = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      frames.push(cb);
      return frames.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  });

  afterEach(() => {
    resetDustReveal();
    clearFakeLayout();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("sem canvas o bloco entra pelo caminho normal", () => {
    // setup.ts já devolve null em getContext: é o cenário de jsdom e o de um
    // browser com canvas indisponível.
    const el = block();

    expect(supportsDustReveal()).toBe(false);
    expect(startDustReveal(el)).toBe(false);
    expect(el).not.toHaveClass("dust-in");
  });

  it("sem tinta suficiente desiste e deixa o bloco visível", () => {
    fakeContext(); // canvas existe, mas jsdom não dá caixas de texto
    const el = block();

    expect(startDustReveal(el)).toBe(false);
    expect(el).toHaveClass("visible");
    expect(el).not.toHaveClass("dust-hold");
    expect(el).not.toHaveClass("dust-in");
    expect(document.querySelectorAll(".dust-piece")).toHaveLength(0);
  });

  it("marca as peças, respeita a cascata do data-delay e limpa no fim", () => {
    fakeContext();
    fakeLayout();
    const el = block("2");
    el.classList.add("dust-hold");

    expect(startDustReveal(el)).toBe(true);
    expect(el).toHaveClass("visible", "dust-in");
    expect(el).not.toHaveClass("dust-hold");
    expect(el.style.getPropertyValue("--dust-lead")).toBe(`${2 * REVEAL_LEAD_STEP_MS}ms`);

    const pieces = document.querySelectorAll(".dust-piece");
    expect(pieces.length).toBeGreaterThan(0);
    for (const piece of pieces) {
      expect((piece as HTMLElement).style.getPropertyValue("--dust-d")).toMatch(/^\d+ms$/);
    }

    // Primeiro frame: ainda dentro da cascata, nada terminou.
    frames.at(-1)?.(0);
    expect(el).toHaveClass("dust-in");

    // Depois do atraso do bloco mais o voo inteiro, a poeira sai de cena.
    frames.at(-1)?.(2 * REVEAL_LEAD_STEP_MS + REVEAL_TOTAL_MS + 1);
    expect(el).not.toHaveClass("dust-in");
    expect(el.style.getPropertyValue("--dust-lead")).toBe("");
    expect(document.querySelectorAll(".dust-piece")).toHaveLength(0);
  });

  it("cancelar deixa o bloco montado, não a meio", () => {
    fakeContext();
    fakeLayout();
    const el = block();

    expect(startDustReveal(el)).toBe(true);
    cancelReveals();

    expect(el).toHaveClass("visible");
    expect(el).not.toHaveClass("dust-in");
    expect(document.querySelectorAll(".dust-piece")).toHaveLength(0);
  });
});
