import { describe, it, expect, vi, afterEach } from "vitest";
import {
  parseDicePool,
  parseTipoFromRow,
  pickGovernmentIndex,
  poiTableIdForDistrito,
  poiDeepLink,
  formatNomeExemploFromRow,
} from "./assentamentosGenerator";
import { geradorHrefForTabela } from "./geradoresConfig";
import {
  findRowMatchForValue,
  rollOnTable,
  type RollTableData,
} from "./rollTable";

describe("assentamentosGenerator", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parseDicePool extrai contagem de 4d4", () => {
    expect(parseDicePool("4d4")).toEqual({
      diceFormula: "4d4",
      diceCount: 4,
    });
  });

  it("parseTipoFromRow lê tipo e pool", () => {
    const row = ["2–3", "Cidade pequena", "4d4"];
    const t = parseTipoFromRow(row, 2);
    expect(t.tipo).toBe("Cidade pequena");
    expect(t.diceCount).toBe(4);
    expect(t.diceFormula).toBe("4d4");
  });

  it("poiTableIdForDistrito mapeia distrito baixo", () => {
    expect(poiTableIdForDistrito("Distrito Baixo")).toBe(
      "assentamento-poi-baixo",
    );
  });

  it("pickGovernmentIndex escolhe maior face", () => {
    const distritos = [
      { face: 3, index: 0, valor: 1, faixa: "1", nome: "A" },
      { face: 7, index: 1, valor: 2, faixa: "2", nome: "B" },
      { face: 5, index: 2, valor: 3, faixa: "3", nome: "C" },
    ];
    expect(pickGovernmentIndex(distritos)).toBe(1);
  });

  it("POI distrito baixo faixa 2–3 casa taverna precária", () => {
    const rows = [
      ["1", "Cemitério"],
      ["2–3", "Taverna precária"],
      ["4", "Loja precária"],
      ["5", "Loja padrão"],
      ["6", "Armazéns/galpões"],
    ];
    expect(findRowMatchForValue(rows, 3)?.index).toBe(1);
  });

  it("poiDeepLink aponta gerador de lojas", () => {
    expect(poiDeepLink("Loja padrão").href).toBe("/geradores/lojas");
  });

  it("formatNomeExemploFromRow escolhe coluna", () => {
    const row = ["1", "Reduto de Bruga", "Feira Nova", "Doraine"];
    expect(formatNomeExemploFromRow(row, 2)).toBe("Feira Nova");
  });

  it("assentamento-tipo d6 valor 6 é metrópole 8d8", () => {
    const table: RollTableData = {
      id: "assentamento-tipo",
      titulo: "Tipo",
      categoria: "assentamentos",
      rolagem: "d6",
      headers: ["d6", "Tipo", "Dados no mapa"],
      rows: [
        ["1", "Vilarejo", "3d4"],
        ["2–3", "Cidade pequena", "4d4"],
        ["4–5", "Cidade grande", "6d6"],
        ["6", "Metrópole", "8d8"],
      ],
    };
    vi.spyOn(Math, "random").mockReturnValue(0.999);
    const r = rollOnTable(table);
    expect(r.valor).toBe(6);
    const parsed = parseTipoFromRow(table.rows[r.linha]!, r.valor);
    expect(parsed.tipo).toBe("Metrópole");
    expect(parsed.diceCount).toBe(8);
  });

  it("geradorHrefForTabela aponta assentamentos", () => {
    expect(geradorHrefForTabela("assentamento-tipo")).toBe(
      "/geradores/assentamentos",
    );
    expect(geradorHrefForTabela("assentamento-poi-alto")).toBe(
      "/geradores/assentamentos",
    );
  });
});
