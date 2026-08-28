import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LiveDeployTerminal from "./components/LiveDeployTerminal";
import BentoGrid from "./components/BentoGrid";
import DependencyGraph from "./components/DependencyGraph";
import StatusBoard from "./components/StatusBoard";
import GitTimeline from "./components/GitTimeline";

describe("melhorias interativas", () => {
  it("renderiza o bento grid com capacidades", () => {
    render(<BentoGrid />);
    expect(screen.getByText("Web & SaaS")).toBeInTheDocument();
    expect(screen.getByText("IA aplicada")).toBeInTheDocument();
  });

  it("renderiza o grafo de dependências", () => {
    render(<DependencyGraph />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Deploy")).toBeInTheDocument();
  });

  it("renderiza o status board CI/CD", () => {
    render(<StatusBoard />);
    expect(screen.getByText("build")).toBeInTheDocument();
    expect(screen.getByText("deploy")).toBeInTheDocument();
  });

  it("renderiza a timeline git do Moneyzin", () => {
    render(<GitTimeline />);
    expect(screen.getByText(/Naggin\/moneyzin/)).toBeInTheDocument();
    expect(screen.getByText(/feat: dashboard financeiro/)).toBeInTheDocument();
  });

  it("executa deploy ao clicar no terminal", async () => {
    const user = userEvent.setup();
    render(<LiveDeployTerminal />);

    await user.click(screen.getByRole("button", { name: /run deploy/i }));

    await waitFor(() => {
      expect(screen.getByText(/running/i)).toBeInTheDocument();
    });
  });
});
