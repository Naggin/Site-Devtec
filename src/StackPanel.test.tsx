import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StackPanel from "./components/StackPanel";
import { renderWithLanguage } from "./test/renderWithLanguage";

describe("StackPanel", () => {
  it("alterna a categoria ativa ao clicar nas abas", async () => {
    const user = userEvent.setup();
    renderWithLanguage(<StackPanel />);

    expect(screen.getByRole("tab", { name: "Full-stack" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText(/Sites, dashboards e APIs/)).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Mobile" }));
    expect(screen.getByRole("tab", { name: "Mobile" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText(/Apps iOS e Android/)).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Infra" }));
    expect(screen.getByText(/Deploy, monitoramento/)).toBeInTheDocument();
  });

  it("mostra o deploy inline no rodapé do painel", () => {
    renderWithLanguage(<StackPanel />);

    expect(screen.getByText("npm run deploy")).toBeInTheDocument();
    expect(screen.getByText(/Deploy complete|Resolving dependencies/)).toBeInTheDocument();
  });

  it("cicla o status de deploy sem sumir do painel", async () => {
    vi.useFakeTimers();

    try {
      renderWithLanguage(<StackPanel />);

      expect(screen.getByText("Resolving dependencies…")).toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(3600);
      });

      expect(screen.getByText(/Deploy complete/)).toBeInTheDocument();
      expect(screen.getByText("npm run deploy")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
