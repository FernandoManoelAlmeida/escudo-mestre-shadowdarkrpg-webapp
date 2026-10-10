import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, render } from "@testing-library/react";
import BottomNav from "@/components/layout/BottomNav";
import { ThemeProvider } from "styled-components";
import { theme } from "@/lib/theme";
import { mockUsePathname } from "./setup/next-mocks";
import React from "react";

const renderWithTheme = (ui: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe("BottomNav interaction", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      ...window,
      scrollTo: vi.fn(),
    });
  });

  it("não faz scroll nem preventDefault quando clica num item inativo", () => {
    mockUsePathname.mockReturnValue("/");
    renderWithTheme(<BottomNav />);

    // O link de "Regras" leva para /regras. Pathname atual é /.
    const regrasLink = screen.getByRole("link", { name: /regras/i });

    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });

    // Mocking preventDefault
    const preventDefaultSpy = vi.spyOn(clickEvent, "preventDefault");

    fireEvent(regrasLink, clickEvent);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("faz scroll e preventDefault quando clica num item da mesma tela mas NÃO está no topo", () => {
    mockUsePathname.mockReturnValue("/regras");
    vi.stubGlobal("window", { ...window, scrollY: 100, scrollTo: vi.fn() });
    renderWithTheme(<BottomNav />);

    const regrasLink = screen.getByRole("link", { name: /regras/i });
    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(clickEvent, "preventDefault");

    fireEvent(regrasLink, clickEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });

  it("apenas preventDefault quando clica no item da mesma tela e JÁ está no topo", () => {
    mockUsePathname.mockReturnValue("/regras");
    vi.stubGlobal("window", { ...window, scrollY: 0, scrollTo: vi.fn() });
    renderWithTheme(<BottomNav />);

    const regrasLink = screen.getByRole("link", { name: /regras/i });
    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(clickEvent, "preventDefault");

    fireEvent(regrasLink, clickEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("faz scroll e preventDefault quando clica no item da mesma seção (sub-rota) mas NÃO está no topo", () => {
    mockUsePathname.mockReturnValue("/regras/glossario");
    vi.stubGlobal("window", { ...window, scrollY: 100, scrollTo: vi.fn() });
    renderWithTheme(<BottomNav />);

    const regrasLink = screen.getByRole("link", { name: /regras/i });
    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(clickEvent, "preventDefault");

    fireEvent(regrasLink, clickEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });

  it("NÃO faz scroll nem preventDefault (permite navegar) quando clica no item da mesma seção (sub-rota) e JÁ está no topo", () => {
    mockUsePathname.mockReturnValue("/regras/glossario");
    vi.stubGlobal("window", { ...window, scrollY: 0, scrollTo: vi.fn() });
    renderWithTheme(<BottomNav />);

    const regrasLink = screen.getByRole("link", { name: /regras/i });
    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(clickEvent, "preventDefault");

    fireEvent(regrasLink, clickEvent);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("Início (root) apenas faz scroll se estiver exatamente no /", () => {
    // Caso 1: está em /regras, clica em Início (/)
    mockUsePathname.mockReturnValue("/regras");
    vi.stubGlobal("window", { ...window, scrollY: 0, scrollTo: vi.fn() });
    const { rerender } = renderWithTheme(<BottomNav />);

    let inicioLink = screen.getByRole("link", { name: /início/i });
    let clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });
    let preventDefaultSpy = vi.spyOn(clickEvent, "preventDefault");

    fireEvent(inicioLink, clickEvent);
    expect(preventDefaultSpy).not.toHaveBeenCalled();

    // Caso 2: está em /, clica em Início (/), mas scroll > 0
    mockUsePathname.mockReturnValue("/");
    vi.stubGlobal("window", { ...window, scrollY: 100, scrollTo: vi.fn() });
    rerender(
      <ThemeProvider theme={theme}>
        <BottomNav />
      </ThemeProvider>,
    );

    inicioLink = screen.getByRole("link", { name: /início/i });
    clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    preventDefaultSpy = vi.spyOn(clickEvent, "preventDefault");

    fireEvent(inicioLink, clickEvent);
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });
});
