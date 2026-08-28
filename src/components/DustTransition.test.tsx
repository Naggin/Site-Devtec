import { act, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DustCapture } from "../lib/dustCapture";
import DustTransition, { CLEAN_MS, IN_MS, OUT_MS, TOTAL_MS } from "./DustTransition";

function makeCapture(): DustCapture {
  const snapshot = document.createElement("canvas");
  snapshot.width = 400;
  snapshot.height = 300;

  const particles = Array.from({ length: 120 }, (_, i) => ({
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
    delay: 0.1,
    kind: "dust" as const,
    char: "0",
  }));

  return { snapshot, particles, W: 400, H: 300 };
}

describe("DustTransition", () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(function (
      this: HTMLCanvasElement,
      type: string,
    ) {
      if (type !== "2d") return null;
      return {
        canvas: this,
        clearRect: vi.fn(),
        drawImage: vi.fn(),
        fillRect: vi.fn(),
        fillText: vi.fn(),
        arc: vi.fn(),
        beginPath: vi.fn(),
        fill: vi.fn(),
        setTransform: vi.fn(),
        globalAlpha: 1,
        globalCompositeOperation: "source-over",
        fillStyle: "",
        font: "",
      } as unknown as CanvasRenderingContext2D;
    });

    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("exporta durações rápidas e fluidas (snappy, não blackout)", () => {
    expect(TOTAL_MS).toBeGreaterThanOrEqual(900);
    expect(TOTAL_MS).toBeLessThanOrEqual(1300);
    expect(TOTAL_MS).toBe(OUT_MS + CLEAN_MS + IN_MS);
    expect(CLEAN_MS).toBeLessThanOrEqual(200);
  });

  it("renderiza canvas imediatamente e sinaliza snapshot após 1º frame", async () => {
    const callbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      callbacks.push(cb);
      return callbacks.length;
    });

    const onSnapshotReady = vi.fn();

    render(
      <DustTransition
        phase="out"
        capturePromise={Promise.resolve(makeCapture())}
        onPhaseChange={vi.fn()}
        onComplete={vi.fn()}
        onSnapshotReady={onSnapshotReady}
      />,
    );

    expect(document.querySelector(".dust-overlay")).toBeInTheDocument();

    await waitFor(() => {
      expect(callbacks.length).toBeGreaterThan(0);
    });

    await act(async () => {
      callbacks.at(-1)?.(OUT_MS / 2);
    });

    await waitFor(() => {
      expect(onSnapshotReady).toHaveBeenCalled();
    });

    const canvas = document.querySelector(".dust-overlay")!;
    expect(canvas.classList.contains("is-active")).toBe(true);
    expect(Number(canvas.getAttribute("data-particle-count"))).toBeGreaterThan(0);
  });
});
