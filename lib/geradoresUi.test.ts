import { describe, it, expect } from "vitest";
import {
  chipLabelForTable,
  isRedundantDescription,
  moduleDescriptionForDisplay,
  rollButtonLabel,
} from "./geradoresUi";

describe("geradoresUi", () => {
  it("detecta descrição redundante com o título", () => {
    expect(isRedundantDescription("Rumores", "Rumores de taverna")).toBe(true);
    expect(
      isRedundantDescription("Rumores", "d100 · fala de taverna"),
    ).toBe(false);
  });

  it("moduleDescriptionForDisplay omite eco do título", () => {
    expect(moduleDescriptionForDisplay("Rumores", "Rumores de taverna")).toBe(
      undefined,
    );
    expect(
      moduleDescriptionForDisplay("Rumores", "d100 · fala de taverna"),
    ).toBe("d100 · fala de taverna");
  });

  it("chipLabelForTable mapeia oráculo SoloDark", () => {
    expect(
      chipLabelForTable(
        {
          id: "solodark-oraculo",
          titulo: "Oráculo — sim/não",
          categoria: "solodark",
          rolagem: "d6",
        },
        "Oráculo",
      ),
    ).toBe("Sim/não");
  });

  it("rollButtonLabel inclui fórmula", () => {
    expect(rollButtonLabel("d100")).toBe("Rolar (d100)");
    expect(rollButtonLabel("2d6 + MOD CAR")).toBe("Rolar (2d6)");
  });
});
