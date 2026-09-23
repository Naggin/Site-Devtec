import { screen } from "@testing-library/react";
import GitTimeline from "./components/GitTimeline";
import { gitCommits, gitTimeline } from "./data";
import { renderWithLanguage } from "./test/renderWithLanguage";

describe("timeline de commits", () => {
  it("mostra commits reais e linka cada hash para o GitHub", () => {
    renderWithLanguage(<GitTimeline />);

    expect(screen.getByText(gitTimeline.repo)).toBeInTheDocument();

    for (const commit of gitCommits) {
      const link = screen.getByRole("link", { name: new RegExp(commit.hash) });
      expect(link).toHaveAttribute("href", `${gitTimeline.commitBase}${commit.hash}`);
    }
  });
});
