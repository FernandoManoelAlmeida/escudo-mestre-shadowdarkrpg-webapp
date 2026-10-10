import { describe, it, expect, vi, afterEach } from "vitest";
import {
  parseDiceFormula,
  parseRangeCell,
  findRowIndexForValue,
  inferRolagemFromTable,
  rollOnTable,
  type RollTableData,
} from "./rollTable";

describe("rollTable", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parseDiceFormula extrai NdM com sufixo", () => {
    expect(parseDiceFormula("2d6 + MOD CAR")).toBe("2d6");
    expect(parseDiceFormula("d100")).toBe("1d100");
  });

  it("parseRangeCell interpreta faixas e 00", () => {
    expect(parseRangeCell("0–6")).toEqual({ min: 0, max: 6 });
    expect(parseRangeCell("12+")).toEqual({ min: 12, max: 9999 });
    expect(parseRangeCell("00")).toEqual({ min: 100, max: 100 });
    expect(parseRangeCell("82–83")).toEqual({ min: 82, max: 83 });
  });

  it("findRowIndexForValue usa faixa de reação", () => {
    const rows = [
      ["0–6", "Hostil"],
      ["7–8", "Desconfiado"],
      ["12+", "Amigável"],
    ];
    expect(findRowIndexForValue(rows, 1)).toBe(0);
    expect(findRowIndexForValue(rows, 8)).toBe(1);
    expect(findRowIndexForValue(rows, 14)).toBe(2);
  });

  it("inferRolagemFromTable detecta d100 por faixas", () => {
    const rows = [["01", "A"], ["82–83", "B"], ["00", "C"]];
    expect(inferRolagemFromTable(["d20", "Resultado"], rows)).toBe("d100");
  });

  it("rollOnTable reação com MOD CAR", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // d6 → 1; 2d6 = 2
    const table: RollTableData = {
      id: "reacao",
      titulo: "Reacao",
      categoria: "reacao",
      rolagem: "2d6 + MOD CAR",
      headers: ["Resultado", "Comportamento"],
      rows: [
        ["0–6", "Hostil"],
        ["7–8", "Desconfiado"],
        ["9", "Neutro"],
        ["10–11", "Curioso"],
        ["12+", "Amigável"],
      ],
    };
    const r = rollOnTable(table, { modifier: 5 });
    expect(r.diceTotal).toBe(2);
    expect(r.valor).toBe(7);
    expect(r.texto).toContain("Desconfiado");
  });

  it("rollOnTable rumores d100 faixa 83", () => {
    const table: RollTableData = {
      id: "rumores-taverna",
      titulo: "Rumores",
      categoria: "rumores",
      rolagem: "d100",
      headers: ["d100", "Resultado"],
      rows: [
        ["01", "Um"],
        ["82–83", "Torre mecânica"],
        ["00", "Dragão"],
      ],
    };
    const linha = findRowIndexForValue(table.rows, 83);
    expect(table.rows[linha][1]).toBe("Torre mecânica");
  });

  it("rollOnTable oráculo SoloDark d20 faixas 9, 10 e 20", () => {
    const table: RollTableData = {
      id: "solodark-oraculo",
      titulo: "Oráculo — sim/não",
      categoria: "solodark",
      rolagem: "d20",
      headers: ["d20", "Resposta"],
      rows: [
        ["1–9", "Não"],
        ["10", "Reviravolta"],
        ["11–20", "Sim"],
      ],
    };
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(rollOnTable(table).texto).toBe("Não");
    vi.spyOn(Math, "random").mockReturnValue(0.45);
    expect(rollOnTable(table).texto).toBe("Reviravolta");
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    expect(rollOnTable(table).texto).toBe("Sim");
  });
});
