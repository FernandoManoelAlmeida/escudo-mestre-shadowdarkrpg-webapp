import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import MarkdownContent from "@/components/ui/MarkdownContent";
import { renderWithTheme } from "./utils/render-theme";

describe("MarkdownContent links", () => {
  it("usa next/link para href internos (basePath no Pages)", () => {
    renderWithTheme(
      <MarkdownContent>
        {"[Falha](/regras/tabelas#tabela-falha-magica-mago-1-2)"}
      </MarkdownContent>,
    );
    const link = screen.getByRole("link", { name: "Falha" });
    expect(link.getAttribute("href")).toBe(
      "/regras/tabelas#tabela-falha-magica-mago-1-2",
    );
  });

  it("mantém âncoras externas como <a>", () => {
    renderWithTheme(
      <MarkdownContent>{"[Docs](https://example.com/x)"}</MarkdownContent>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.getAttribute("href")).toBe("https://example.com/x");
  });
});
