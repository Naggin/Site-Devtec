import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("site Devtec", () => {
  it("mostra o site, os projetos e aceita um briefing de contato", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Hero
    expect(screen.getByRole("heading", { name: /Transformo/i })).toBeInTheDocument();

    // Little Learners — primeiro projeto
    const llCard = screen.getByRole("heading", { name: "Little Learners Planner" }).closest("article");
    expect(llCard).not.toBeNull();
    expect(within(llCard!).getByRole("link", { name: /Abrir site/ })).toHaveAttribute(
      "href",
      "https://www.littlelearnersplanner.com.br/home",
    );

    // Outros projetos
    expect(screen.getByRole("heading", { name: "Moneyzin" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "JantaJá" })).toBeInTheDocument();

    // Formulário de contato
    await user.type(screen.getByLabelText("Nome"), "Carla Mendes");
    await user.type(screen.getByLabelText("E-mail"), "carla@cliente.com");
    await user.selectOptions(screen.getByLabelText("Tipo de projeto"), "Site institucional");
    await user.type(
      screen.getByLabelText("O que você precisa?"),
      "Quero um site para divulgar meu trabalho.",
    );
    await user.click(screen.getByRole("button", { name: "Enviar briefing" }));

    expect(screen.getByTestId("inquiry-success")).toHaveTextContent("Carla");
    expect(screen.getByTestId("inquiry-success")).toHaveTextContent("Site institucional");
    expect(screen.getByRole("link", { name: "Abrir no e-mail" })).toHaveAttribute(
      "href",
      expect.stringContaining("mailto:antoniocjr1998@gmail.com"),
    );
  });

  it("explica o processo, o que fica com o cliente e responde às dúvidas", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /Como isso funciona na prática/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Entender o problema" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /O que fica com você no final/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("O código no seu repositório")).toBeInTheDocument();
    expect(screen.getByText(/O código é meu mesmo\?/)).toBeInTheDocument();
  });
});
