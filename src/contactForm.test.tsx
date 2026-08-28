import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Contact from "./components/Contact";
import { renderWithLanguage } from "./test/renderWithLanguage";

describe("acessibilidade do formulário", () => {
  it("marca os campos inválidos, associa a mensagem e foca o primeiro erro", async () => {
    const user = userEvent.setup();
    renderWithLanguage(<Contact />);

    await user.click(screen.getByRole("button", { name: "Enviar briefing" }));

    const name = screen.getByLabelText("Nome");
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription("Informe seu nome.");
    expect(name).toHaveFocus();

    expect(screen.getByRole("alert")).toHaveTextContent("Faltou preencher 4 campos.");
  });

  it("limpa o aviso conforme os campos são preenchidos", async () => {
    const user = userEvent.setup();
    renderWithLanguage(<Contact />);

    await user.type(screen.getByLabelText("Nome"), "Ana");
    await user.type(screen.getByLabelText("E-mail"), "ana@cliente.com");
    await user.click(screen.getByRole("button", { name: "Enviar briefing" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Faltou preencher 2 campos.");
    expect(screen.getByLabelText("Tipo de projeto")).toHaveFocus();
    expect(screen.getByLabelText("Nome")).not.toHaveAttribute("aria-invalid");
  });
});
