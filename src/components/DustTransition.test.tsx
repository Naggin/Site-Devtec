import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DustTransition, { CLEAN_MS, IN_MS, OUT_MS, TOTAL_MS } from "./DustTransition";

describe("DustTransition", () => {
  it("exporta durações dentro da janela cinematográfica", () => {
    expect(TOTAL_MS).toBeGreaterThanOrEqual(1500);
    expect(TOTAL_MS).toBeLessThanOrEqual(2500);
    expect(TOTAL_MS).toBe(OUT_MS + CLEAN_MS + IN_MS);
  });

  it("renderiza canvas overlay durante a transição", () => {
    const onPhaseChange = vi.fn();
    const onComplete = vi.fn();

    render(
      <DustTransition phase="out" onPhaseChange={onPhaseChange} onComplete={onComplete} />,
    );

    const canvas = screen.getByRole("presentation", { hidden: true });
    expect(canvas).toHaveClass("dust-overlay");
    expect(canvas.tagName).toBe("CANVAS");
  });
});
