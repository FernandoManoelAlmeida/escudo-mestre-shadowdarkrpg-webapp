import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithTheme } from "./utils/render-theme";
import { SkeletonBox } from "@/components/ui/Skeleton";
import InlineBold from "@/components/ui/InlineBold";
import { Accordion } from "@/components/ui/Accordion";
import { D20RollButton } from "@/components/ui/D20RollButton";
import { RasterIconSvg } from "@/components/ui/RasterIconSvg";
import { OrdemParanormalDesesperoLogo } from "@/components/branding/OrdemParanormalDesesperoLogo";
import MarkdownContent from "@/components/ui/MarkdownContent";
import { ResponsiveTable } from "@/components/ui/ResponsiveTable";
import RollToaster from "@/components/ui/RollToaster";
import { useRollToast } from "@/context/RollToastContext";
import { GlobalStyles } from "@/components/layout/GlobalStyles";
import { escudoFixture } from "./fixtures/escudo-data";

describe("UI components", () => {
  it("SkeletonBox renderiza", () => {
    renderWithTheme(<SkeletonBox data-testid="sk" $height="8px" />);
    expect(screen.getByTestId("sk")).toBeInTheDocument();
  });

  it("InlineBold com as customizado", () => {
    renderWithTheme(<InlineBold as="strong">negrito</InlineBold>);
    expect(screen.getByText("negrito").tagName).toBe("STRONG");
  });

  it("Accordion abre e fecha", () => {
    renderWithTheme(
      <Accordion title="Título painel">
        <p>Conteúdo interno</p>
      </Accordion>,
    );
    const btn = screen.getByRole("button", { name: /título painel/i });
    fireEvent.click(btn);
    expect(screen.getByText("Conteúdo interno")).toBeVisible();
    fireEvent.click(btn);
    expect(screen.queryByText("Conteúdo interno")).not.toBeVisible();
  });

  it("D20RollButton dispara onClick", () => {
    const onClick = vi.fn();
    renderWithTheme(<D20RollButton onClick={onClick} aria-label="Rolar" />);
    fireEvent.click(screen.getByRole("button", { name: "Rolar" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("RasterIconSvg referencia webp no SVG", () => {
    const { container } = renderWithTheme(
      <RasterIconSvg name="home-icon" alt="Início" />,
    );
    const href = container.querySelector("image")?.getAttribute("href");
    expect(href).toContain("home-icon");
    expect(screen.getByRole("img", { name: "Início" })).toBeInTheDocument();
  });

  it("OrdemParanormalDesesperoLogo", () => {
    renderWithTheme(<OrdemParanormalDesesperoLogo alt="Logo" />);
    expect(screen.getByRole("img", { name: "Logo" })).toBeInTheDocument();
  });

  it("MarkdownContent renderiza markdown", () => {
    renderWithTheme(<MarkdownContent>## Olá **mundo**</MarkdownContent>);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(/Olá/);
  });

  it("MarkdownContent vazio retorna null", () => {
    const { container } = renderWithTheme(<MarkdownContent> </MarkdownContent>);
    expect(container.firstChild).toBeNull();
  });

  it("ResponsiveTable renderiza tabela", () => {
    const table = escudoFixture.tables.termos_importantes!;
    renderWithTheme(<ResponsiveTable table={table} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getAllByText("PV").length).toBeGreaterThanOrEqual(1);
  });

  it("GlobalStyles não quebra o render", () => {
    const { container } = renderWithTheme(
      <>
        <GlobalStyles />
        <p>ok</p>
      </>,
    );
    expect(container.querySelector("p")).toHaveTextContent("ok");
  });

  it("RollToaster mostra rolagem após addRoll", async () => {
    function AddBtn() {
      const { addRoll } = useRollToast();
      return (
        <button
          type="button"
          onClick={() =>
            addRoll({
              formula: "1d20",
              rolls: [7],
              modifier: 0,
              total: 7,
              display: "[7] = 7",
            })
          }
        >
          rolar
        </button>
      );
    }
    renderWithTheme(
      <>
        <RollToaster />
        <AddBtn />
      </>,
      { withToast: true },
    );
    fireEvent.click(screen.getByRole("button", { name: "rolar" }));
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /total 7/i }),
      ).toBeInTheDocument();
    });
  });
});
