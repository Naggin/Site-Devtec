import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import LiveDeployTerminal from "./components/LiveDeployTerminal";
import BentoGrid from "./components/BentoGrid";
import DependencyGraph from "./components/DependencyGraph";
import StatusBoard from "./components/StatusBoard";
import GitTimeline from "./components/GitTimeline";
import ProofStrip from "./components/ProofStrip";
import { gitCommits, gitTimeline } from "./data";

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

  it("mostra commits reais e linka cada hash para o GitHub", () => {
    render(<GitTimeline />);

    expect(screen.getByText(gitTimeline.repo)).toBeInTheDocument();

    for (const commit of gitCommits) {
      const link = screen.getByRole("link", { name: new RegExp(commit.hash) });
      expect(link).toHaveAttribute("href", `${gitTimeline.commitBase}${commit.hash}`);
    }
  });

  it("expõe provas verificáveis com link para a fonte", () => {
    render(<ProofStrip />);

    expect(screen.getByText("produtos no ar agora")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /versões publicadas/ })).toHaveAttribute(
      "href",
      "https://github.com/Naggin/IAcockpit-releases/releases",
    );
  });

  it("começa o deploy sozinho quando entra em vista", async () => {
    render(<LiveDeployTerminal />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /running/i })).toBeDisabled();
    });
  });

  // Regressão: entre ciclos o terminal não pode ficar sem linhas de saída.
  it("mantém linhas visíveis ao reiniciar o ciclo (sem piscar vazio)", async () => {
    vi.useFakeTimers();

    try {
      render(<LiveDeployTerminal />);
      const output = screen.getByTestId("terminal-output");
      const lineCount = () => output.querySelectorAll(".live-terminal-line").length;

      const advance = async (ms: number) => {
        for (let elapsed = 0; elapsed < ms; elapsed += 50) {
          await act(async () => {
            await vi.advanceTimersByTimeAsync(50);
          });
        }
      };

      await advance(7000);
      expect(output).toHaveTextContent("Deploy complete");
      expect(lineCount()).toBeGreaterThan(0);

      // Janela em que o ciclo antigo apagava tudo antes de redigitar o comando.
      for (let elapsed = 0; elapsed < 5000; elapsed += 50) {
        await act(async () => {
          await vi.advanceTimersByTimeAsync(50);
        });
        expect(lineCount()).toBeGreaterThan(0);
      }
      expect(output).toHaveTextContent("Deploy complete");
    } finally {
      vi.useRealTimers();
    }
  });

  // Regressão: o ciclo antigo zerava as linhas e parava, deixando uma caixa
  // vazia no hero para quem chegasse depois da primeira execução.
  it("reinicia o ciclo sozinho em vez de terminar em branco", async () => {
    vi.useFakeTimers();

    try {
      render(<LiveDeployTerminal />);
      const output = screen.getByTestId("terminal-output");

      const advance = async (ms: number) => {
        for (let elapsed = 0; elapsed < ms; elapsed += 50) {
          await act(async () => {
            await vi.advanceTimersByTimeAsync(50);
          });
        }
      };

      // Primeiro ciclo completo.
      await advance(7000);
      expect(output).toHaveTextContent("Deploy complete");

      // Muito depois do ponto em que a versão antiga apagava tudo.
      await advance(10000);
      expect(output).toHaveTextContent("Resolving dependencies");

      await advance(23000);
      expect(output).toHaveTextContent("Resolving dependencies");

      // Na janela em que o resultado fica parado na tela, dá para repetir na mão.
      await advance(3000);
      const replay = screen.getByRole("button", { name: /run deploy/i });
      await act(async () => {
        fireEvent.click(replay);
      });
      expect(screen.getByRole("button", { name: /running/i })).toBeDisabled();
    } finally {
      vi.useRealTimers();
    }
  });
});
