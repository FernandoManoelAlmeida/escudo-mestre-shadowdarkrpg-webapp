import { describe, it, expect } from "vitest";
import { theme } from "./theme";
import { getCreatureSheetTheme } from "./creatureSheetThemes";

describe("getCreatureSheetTheme", () => {
  it("retorna tema padrão para null e origens", () => {
    expect(getCreatureSheetTheme(null)).toBe(theme);
    expect(getCreatureSheetTheme("oficial")).toBe(theme);
    expect(getCreatureSheetTheme("homebrew")).toBe(theme);
  });
});
