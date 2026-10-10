import { describe, it, expect } from "vitest";
import {
  parseDiceTokensFromRolagem,
  parseDiceTokensFromFormula,
  ariaLabelForRoll,
} from "./diceDisplay";

describe("diceDisplay", () => {
  it("parseDiceTokensFromRolagem ignora MOD CAR", () => {
    expect(parseDiceTokensFromRolagem("2d6 + MOD CAR")).toEqual({
      tokens: [{ count: 2, sides: 6 }],
      modifier: 0,
    });
    expect(parseDiceTokensFromRolagem("d100")).toEqual({
      tokens: [{ count: 1, sides: 100 }],
      modifier: 0,
    });
  });

  it("parseDiceTokensFromFormula com modificador", () => {
    expect(parseDiceTokensFromFormula("2d6+3")).toEqual({
      tokens: [{ count: 2, sides: 6 }],
      modifier: 3,
    });
    expect(parseDiceTokensFromFormula("1d20+5")).toEqual({
      tokens: [{ count: 1, sides: 20 }],
      modifier: 5,
    });
  });

  it("ariaLabelForRoll", () => {
    expect(ariaLabelForRoll("d12", "rolagem")).toContain("doze faces");
    expect(ariaLabelForRoll("2d6+3", "formula")).toContain("seis faces");
  });
});
