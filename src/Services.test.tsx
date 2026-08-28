import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Services from "./components/Services";

describe("Services", () => {
  it("destaca o serviço selecionado e atualiza o detalhe", async () => {
    const user = userEvent.setup();
    render(<Services />);

    expect(screen.getByText(/Sites, dashboards e apps/)).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();

    await user.click(screen.getByRole("option", { name: /devtec build --mobile/i }));
    expect(screen.getByText(/iOS e Android com React Native/)).toBeInTheDocument();
    expect(screen.getByText("Expo")).toBeInTheDocument();
  });
});
