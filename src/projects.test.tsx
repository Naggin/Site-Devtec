import { render, screen, within } from "@testing-library/react";
import Projects from "./components/Projects";
import { projects } from "./data";

describe("cards de projeto", () => {
  it("nunca oferece dois links para o mesmo endereço", () => {
    render(<Projects />);

    for (const project of projects) {
      const card = screen.getByRole("heading", { name: project.title }).closest("article");
      const hrefs = within(card!)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href"));

      expect(new Set(hrefs).size).toBe(hrefs.length);
    }
  });

  it("descreve o resultado de cada projeto, não só a stack", () => {
    render(<Projects />);

    for (const project of projects) {
      expect(screen.getByText(project.outcome)).toBeInTheDocument();
    }
  });
});
