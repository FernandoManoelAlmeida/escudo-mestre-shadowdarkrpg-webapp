import { describe, it, expect } from "vitest";
import { theme } from "./theme";

describe("theme", () => {
  it("expõe paleta e espaçamentos usados no app", () => {
    expect(theme.colors.primary).toMatch(/^#/);
    expect(theme.spacing.md).toBe("16px");
    expect(theme.bottomNavHeight).toBe("56px");
  });
});
