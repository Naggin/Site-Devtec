import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DustTransition, { CLEAN_MS, IN_MS, OUT_MS, TOTAL_MS } from "./DustTransition";

vi.mock("html2canvas", () => ({
  default: vi.fn(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#f4f4f4";
    ctx.fillRect(0, 0, 400, 300);
    ctx.fillStyle = "#e02020";
    ctx.fillRect(40, 40, 200, 80);
    return canvas;
  }),
}));

describe("DustTransition", () => {
  beforeEach(() => {
    const shell = document.createElement("div");
    shell.className = "app-shell";
    shell.innerHTML = "<h1 style='color:#f4f4f4'>Devtec</h1>";
    shell.style.background = "#111111";
    shell.style.color = "#f4f4f4";
    document.body.appendChild(shell);

    Object.defineProperty(document, "elementFromPoint", {
      configurable: true,
      value: (x: number, y: number) => (x < 400 && y < 300 ? shell : null),
    });
  });

  afterEach(() => {
    document.body.innerHTML = "";
    Reflect.deleteProperty(document, "elementFromPoint");
    vi.restoreAllMocks();
  });

  it("exporta durações rápidas e fluidas (snappy, não blackout)", () => {
    expect(TOTAL_MS).toBeGreaterThanOrEqual(900);
    expect(TOTAL_MS).toBeLessThanOrEqual(1300);
    expect(TOTAL_MS).toBe(OUT_MS + CLEAN_MS + IN_MS);
    expect(CLEAN_MS).toBeLessThanOrEqual(200);
  });

  it("renderiza canvas overlay após captura da snapshot", async () => {
    const onPhaseChange = vi.fn();
    const onComplete = vi.fn();
    const onSnapshotReady = vi.fn();

    render(
      <DustTransition
        phase="out"
        onPhaseChange={onPhaseChange}
        onComplete={onComplete}
        onSnapshotReady={onSnapshotReady}
      />,
    );

    await waitFor(() => {
      expect(document.querySelector(".dust-overlay")).toBeInTheDocument();
    });

    const canvas = document.querySelector(".dust-overlay")!;
    expect(canvas.tagName).toBe("CANVAS");
    expect(onSnapshotReady).toHaveBeenCalled();
    expect(Number(canvas.getAttribute("data-particle-count"))).toBeGreaterThan(0);
    expect(screen.queryByRole("presentation", { hidden: true })).toBeTruthy();
  });
});
