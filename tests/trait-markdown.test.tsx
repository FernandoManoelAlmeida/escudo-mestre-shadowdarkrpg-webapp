import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TraitMarkdown } from "@/components/ameacas/TraitMarkdown";
import { renderWithTheme } from "./utils/render-theme";

describe("TraitMarkdown", () => {
  it("renderiza negrito sem mostrar asteriscos crus", () => {
    renderWithTheme(
      <TraitMarkdown>**Ação**; **3/dia**; alcance Perto. Dano 1d6.</TraitMarkdown>,
    );
    expect(screen.getByText("Ação")).toBeTruthy();
    expect(screen.queryByText(/\*\*Ação\*\*/)).toBeNull();
  });
});
