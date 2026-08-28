import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { renderWithLanguage } from "./test/renderWithLanguage";
import { STORAGE_KEY } from "./i18n";

describe("internacionalização", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renderiza em português por padrão", () => {
    renderWithLanguage(<App />);
    expect(screen.getByRole("heading", { name: /Transformo/i })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("pt-BR");
  });

  it("alterna para inglês com reduced motion (sem efeito de poeira)", async () => {
    const user = userEvent.setup();
    const matchMedia = vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }));

    renderWithLanguage(<App />);

    await user.click(screen.getAllByRole("button", { name: /Mudar para inglês/i })[0]!);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /I turn/i })).toBeInTheDocument();
    });
    expect(document.documentElement.lang).toBe("en");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("en");
    expect(screen.getAllByRole("status")[0]).toHaveTextContent("Language changed to English");
    expect(document.querySelector(".dust-overlay")).not.toBeInTheDocument();

    matchMedia.mockRestore();
  });

  it("volta para português e anuncia a mudança", async () => {
    const user = userEvent.setup();
    localStorage.setItem(STORAGE_KEY, "en");

    vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }));

    renderWithLanguage(<App />);
    expect(screen.getByRole("heading", { name: /I turn/i })).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /Switch to Portuguese/i })[0]!);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Transformo/i })).toBeInTheDocument();
    });
    expect(document.documentElement.lang).toBe("pt-BR");
    expect(screen.getAllByRole("status")[0]).toHaveTextContent("Idioma alterado para português");
  });

  it("restaura locale salvo do localStorage", () => {
    localStorage.setItem(STORAGE_KEY, "en");
    renderWithLanguage(<App />);
    expect(screen.getByRole("heading", { name: /I turn/i })).toBeInTheDocument();
  });

  it("toggle de idioma é acessível pelo teclado no header desktop", async () => {
    const user = userEvent.setup();
    renderWithLanguage(<App />);

    const toggle = screen.getAllByRole("button", { name: /Mudar para inglês/i })[0]!;
    toggle.focus();
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /I turn/i })).toBeInTheDocument();
    });
  });
});

describe("strings em inglês", () => {
  beforeEach(() => {
    localStorage.setItem(STORAGE_KEY, "en");
  });

  it("traduz navegação, serviços e contato", () => {
    renderWithLanguage(<App />);

    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /What I build/ })).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send briefing" })).toBeInTheDocument();
  });
});
