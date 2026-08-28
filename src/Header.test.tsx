import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "./components/Header";
import { navItems } from "./data";
import { renderWithLanguage } from "./test/renderWithLanguage";

describe("navegação", () => {
  it("abre e fecha o menu mobile pelo botão", async () => {
    const user = userEvent.setup();
    renderWithLanguage(<Header />);

    const toggle = screen.getByRole("button", { name: "Abrir menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("navigation", { name: /mobile/i })).not.toBeInTheDocument();

    await user.click(toggle);

    const panel = screen.getByRole("navigation", { name: /mobile/i });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(panel).toBeVisible();

    // Todo destino do menu principal continua alcançável no mobile.
    for (const item of navItems) {
      expect(within(panel).getByRole("link", { name: item.label })).toHaveAttribute(
        "href",
        item.href,
      );
    }

    await user.click(within(panel).getByRole("link", { name: "Projetos" }));
    expect(screen.getByRole("button", { name: "Abrir menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("fecha o menu com Escape", async () => {
    const user = userEvent.setup();
    renderWithLanguage(<Header />);

    await user.click(screen.getByRole("button", { name: "Abrir menu" }));
    await user.keyboard("{Escape}");

    expect(screen.getByRole("button", { name: "Abrir menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});
