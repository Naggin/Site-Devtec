import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { renderWithLanguage } from "./test/renderWithLanguage";

describe("site Devtec", () => {
  it("mostra o site, os projetos e aceita uma mensagem de contato", async () => {
    const user = userEvent.setup();
    renderWithLanguage(<App />);

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
    expect(screen.getByRole("heading", { name: "Juliana Queiroz" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "CasaOS" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "SuporteTI" })).toBeInTheDocument();

    // Formulário de contato
    await user.type(screen.getByLabelText("Nome"), "Carla Mendes");
    await user.type(screen.getByLabelText("E-mail"), "carla@cliente.com");
    await user.selectOptions(screen.getByLabelText("Assunto"), "Vaga / oportunidade");
    await user.type(
      screen.getByLabelText("Mensagem"),
      "Tenho uma vaga de dev full-stack.",
    );
    await user.click(screen.getByRole("button", { name: "Enviar mensagem" }));

    expect(screen.getByTestId("inquiry-success")).toHaveTextContent("Carla");
    expect(screen.getByTestId("inquiry-success")).toHaveTextContent("Vaga / oportunidade");
    expect(screen.getByRole("link", { name: "Abrir no e-mail" })).toHaveAttribute(
      "href",
      expect.stringContaining("mailto:antoniocjr1998@gmail.com"),
    );
  });
});
