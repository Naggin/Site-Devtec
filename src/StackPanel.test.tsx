import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StackPanel from "./components/StackPanel";

describe("StackPanel", () => {
  it("alterna a categoria ativa ao clicar nas abas", async () => {
    const user = userEvent.setup();
    render(<StackPanel />);

    expect(screen.getByRole("tab", { name: "Full-stack" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText(/Sites, dashboards e APIs/)).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Mobile" }));
    expect(screen.getByRole("tab", { name: "Mobile" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText(/Apps iOS e Android/)).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Infra" }));
    expect(screen.getByText(/Deploy, monitoramento/)).toBeInTheDocument();
  });
});
