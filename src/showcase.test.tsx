import { screen } from "@testing-library/react";
import BentoGrid from "./components/BentoGrid";
import DependencyGraph from "./components/DependencyGraph";
import StatusBoard from "./components/StatusBoard";
import GitTimeline from "./components/GitTimeline";
import ProofStrip from "./components/ProofStrip";
import { gitCommits, gitTimeline } from "./data";
import { renderWithLanguage } from "./test/renderWithLanguage";

describe("melhorias interativas", () => {
  it("renderiza o bento grid com capacidades", () => {
    renderWithLanguage(<BentoGrid />);
    expect(screen.getByText("Web & SaaS")).toBeInTheDocument();
    expect(screen.getByText("IA aplicada")).toBeInTheDocument();
  });

  it("renderiza o grafo de dependências", () => {
    renderWithLanguage(<DependencyGraph />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Deploy")).toBeInTheDocument();
  });

  it("renderiza o status board CI/CD", () => {
    renderWithLanguage(<StatusBoard />);
    expect(screen.getByText("build")).toBeInTheDocument();
    expect(screen.getByText("deploy")).toBeInTheDocument();
  });

  it("mostra commits reais e linka cada hash para o GitHub", () => {
    renderWithLanguage(<GitTimeline />);

    expect(screen.getByText(gitTimeline.repo)).toBeInTheDocument();

    for (const commit of gitCommits) {
      const link = screen.getByRole("link", { name: new RegExp(commit.hash) });
      expect(link).toHaveAttribute("href", `${gitTimeline.commitBase}${commit.hash}`);
    }
  });

  it("expõe provas verificáveis com link para a fonte", () => {
    renderWithLanguage(<ProofStrip />);

    expect(screen.getByText("produtos no ar agora")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /versões publicadas/ })).toHaveAttribute(
      "href",
      "https://github.com/Naggin/IAcockpit-releases/releases",
    );
  });
});
