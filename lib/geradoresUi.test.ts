import { describe, it, expect } from "vitest";
import {
  chipLabelForTable,
  isRedundantDescription,
  isFalhaMagicaModule,
  isTesourosFaixaModule,
  falhaMagicaTables,
  labelForFalhaMagica,
  labelForTesourosFaixa,
  moduleDescriptionForDisplay,
  rollButtonLabel,
  rollButtonAriaLabel,
  tesourosFaixaTables,
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

  it("rollButtonLabel e aria", () => {
    expect(rollButtonLabel("d100")).toBe("Rolar");
    expect(rollButtonAriaLabel("2d6 + MOD CAR")).toContain("seis faces");
  });

  it("tesouros: faixas na ordem do livro, sem guia", () => {
    const tables = [
      {
        id: "tesouro-encontro-po",
        titulo: "Ouro sugerido por encontro",
        categoria: "tesouros",
        subcategoria: "guia",
        rolagem: "d6",
      },
      {
        id: "tesouros-10-mais",
        titulo: "Tesouros 10+",
        categoria: "tesouros",
        subcategoria: "10-mais",
        rolagem: "d100",
      },
      {
        id: "tesouros-0-3",
        titulo: "Tesouros 0–3",
        categoria: "tesouros",
        subcategoria: "0-3",
        rolagem: "d100",
      },
      {
        id: "tesouros-7-9",
        titulo: "Tesouros 7–9",
        categoria: "tesouros",
        subcategoria: "7-9",
        rolagem: "d100",
      },
      {
        id: "tesouros-4-6",
        titulo: "Tesouros 4–6",
        categoria: "tesouros",
        subcategoria: "4-6",
        rolagem: "d100",
      },
    ];
    expect(isTesourosFaixaModule(tables)).toBe(true);
    expect(tesourosFaixaTables(tables).map((t) => t.id)).toEqual([
      "tesouros-0-3",
      "tesouros-4-6",
      "tesouros-7-9",
      "tesouros-10-mais",
    ]);
    expect(labelForTesourosFaixa(tables[2]!)).toBe("0–3");
    expect(labelForTesourosFaixa(tables[1]!)).toBe("10+");
  });

  it("falha mágica: tabelas na ordem do livro e CS1", () => {
    const tables = [
      {
        id: "falha-magica-diabolica-4-5",
        titulo: "Falhas Diabólicas 4 5",
        categoria: "falha-magica",
        rolagem: "d12",
      },
      {
        id: "falha-magica-mago-1-2",
        titulo: "Falha Magica Mago 1 2",
        categoria: "falha-magica",
        rolagem: "d12",
      },
      {
        id: "falha-magica-mago-5",
        titulo: "Falha Mágica Mago 5",
        categoria: "falha-magica",
        rolagem: "d12",
      },
      {
        id: "falha-magica-mago-3-4",
        titulo: "Falha Mágica Mago 3 4",
        categoria: "falha-magica",
        rolagem: "d12",
      },
      {
        id: "falha-magica-diabolica-1-3",
        titulo: "Falhas Diabólicas 1 3",
        categoria: "falha-magica",
        rolagem: "d12",
      },
    ];
    expect(isFalhaMagicaModule(tables)).toBe(true);
    expect(falhaMagicaTables(tables).map((t) => t.id)).toEqual([
      "falha-magica-mago-1-2",
      "falha-magica-mago-3-4",
      "falha-magica-mago-5",
      "falha-magica-diabolica-1-3",
      "falha-magica-diabolica-4-5",
    ]);
    expect(labelForFalhaMagica(tables[1]!)).toBe("Mago — graus 1–2");
    expect(labelForFalhaMagica(tables[0]!)).toContain("Bruxa");
  });
});
