import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { renderWithLanguage } from "./test/renderWithLanguage";

describe("site Devtec", () => {
  it("mostra o site, os projetos e aceita um pedido de orçamento", async () => {
    const user = userEvent.setup();
    renderWithLanguage(<App />);

    // Hero
    // As linhas do título são blocos separados; o texto precisa manter os espaços.
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Sites, sistemas e apps.");

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
    await user.selectOptions(screen.getByLabelText("Tipo de projeto"), "Site institucional");
    await user.type(
      screen.getByLabelText("O que você precisa?"),
      "Quero um site para divulgar meu trabalho.",
    );
    await user.click(screen.getByRole("button", { name: "Pedir orçamento" }));

    expect(screen.getByTestId("inquiry-success")).toHaveTextContent("Carla");
    expect(screen.getByTestId("inquiry-success")).toHaveTextContent("Site institucional");
    expect(screen.getByRole("link", { name: "Abrir no e-mail" })).toHaveAttribute(
      "href",
      expect.stringContaining("mailto:antoniocjr1998@gmail.com"),
    );
  });

  it("apresenta os serviços e a Devtec com o fundador", () => {
    renderWithLanguage(<App />);

    const services = screen.getByRole("heading", { name: "O que a Devtec faz." }).closest("section");
    expect(within(services!).getAllByRole("heading", { level: 3 })).toHaveLength(4);

    const about = screen.getByRole("heading", { name: "Sobre a Devtec." }).closest("section");
    expect(within(about!).getByText("Antonio Junior")).toBeInTheDocument();
    expect(within(about!).getByText("projetos em produção")).toBeInTheDocument();
  });
});
