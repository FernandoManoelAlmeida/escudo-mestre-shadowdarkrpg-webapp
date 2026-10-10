import { describe, it, expect, vi, afterEach } from "vitest";
import {
  formatLojaNomeFromRow,
  formatLojaClienteFromRow,
  LOJA_QUALIDADE_TABLE_IDS,
} from "./lojasGenerator";
import { rollOnTable, type RollTableData } from "./rollTable";
import { geradorHrefForTabela } from "./geradoresConfig";

describe("lojasGenerator", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("formatLojaNomeFromRow junta duas partes e conhecida por", () => {
    const row = ["10", "O Besouro", "da Esquina", "Sala secreta por trás de uma estante"];
    const { nome, conhecidaPor } = formatLojaNomeFromRow(row);
    expect(nome).toBe("O Besouro da Esquina");
    expect(conhecidaPor).toBe("Sala secreta por trás de uma estante");
  });

  it("formatLojaClienteFromRow escolhe opção 1–4", () => {
    const row = ["2", "Elfo nervoso", "Valentão astuto", "Guarda da cidade", "1d4 sacerdotes"];
    expect(formatLojaClienteFromRow(row, 3)).toBe("Guarda da cidade");
  });

  it("loja-refinada d10 — valor 10 não mistura OCR", () => {
    const table: RollTableData = {
      id: "loja-refinada",
      titulo: "Loja refinada",
      categoria: "lojas",
      rolagem: "d10",
      headers: ["d10", "Resultado"],
      rows: Array.from({ length: 10 }, (_, i) => [
        String(i + 1),
        i === 9 ? "Antiguidades e curiosidades" : `Tipo ${i + 1}`,
      ]),
    };
    vi.spyOn(Math, "random").mockReturnValue(0.999); // d10 → 10
    const r = rollOnTable(table);
    expect(r.valor).toBe(10);
    expect(r.texto).toBe("Antiguidades e curiosidades");
    expect(r.texto).not.toMatch(/d20|NomeConhecida/i);
  });

  it("loja-nome d20 devolve três células de conteúdo", () => {
    const table: RollTableData = {
      id: "loja-nome-conhecida",
      titulo: "Nome",
      categoria: "lojas",
      rolagem: "d20",
      headers: ["d20", "Nome (1)", "Nome (2)", "Conhecida por"],
      rows: Array.from({ length: 20 }, (_, i) => {
        const n = String(i + 1);
        if (i === 1) return [n, "O Sapo", "Imperial", "Compra itens de valor"];
        return [n, `A${n}`, `B${n}`, `C${n}`];
      }),
    };
    vi.spyOn(Math, "random").mockReturnValue(0.075); // d20 → 2
    const r = rollOnTable(table);
    expect(r.valor).toBe(2);
    const row = table.rows[r.linha];
    expect(formatLojaNomeFromRow(row!).nome).toBe("O Sapo Imperial");
  });

  it("geradorHrefForTabela aponta lojas para ids loja-*", () => {
    expect(geradorHrefForTabela("loja-precaria")).toBe("/geradores/lojas");
    expect(geradorHrefForTabela("loja-nome-conhecida")).toBe("/geradores/lojas");
    expect(geradorHrefForTabela(LOJA_QUALIDADE_TABLE_IDS.refinada)).toBe(
      "/geradores/lojas",
    );
  });
});
