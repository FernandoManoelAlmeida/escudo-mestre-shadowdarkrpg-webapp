import { describe, it, expect, vi } from "vitest";
import {
  buildOracleSuffix,
  emitSolodarkOracleRolls,
} from "@/lib/solodarkOracleToast";
import type { RollTableData } from "@/lib/rollTable";
import type { RollOnTableResult } from "@/lib/rollTable";

const oracleTable: RollTableData = {
  id: "solodark-oraculo",
  titulo: "Oráculo",
  categoria: "solodark",
  rolagem: "1d20",
  headers: ["d20", "Resposta"],
  rows: [["1-9", "Não"], ["10", "Reviravolta"], ["11-20", "Sim"]],
};

const algoTable: RollTableData = {
  id: "algo-acontece",
  titulo: "Algo acontece",
  categoria: "solodark",
  rolagem: "1d100",
  headers: ["d100", "Evento"],
  rows: [["01", "Teste"]],
};

function rollResult(
  valor: number,
  texto: string,
  diceTotal = valor,
): RollOnTableResult {
  return {
    valor,
    diceTotal,
    modifier: 0,
    texto,
    linha: 0,
    matched: true,
  };
}

describe("buildOracleSuffix", () => {
  it("inclui texto e nuance", () => {
    expect(buildOracleSuffix("Sim", "adicione um mas")).toBe(
      "· Sim — adicione um mas",
    );
  });

  it("só texto quando sem nuance", () => {
    expect(buildOracleSuffix("Não", null)).toBe("· Não");
  });
});

describe("emitSolodarkOracleRolls", () => {
  it("uma chamada addRoll sem reviravolta", () => {
    const addRoll = vi.fn();
    emitSolodarkOracleRolls(
      addRoll,
      oracleTable,
      rollResult(15, "Sim"),
      { nuance: "hint" },
    );
    expect(addRoll).toHaveBeenCalledTimes(1);
    expect(addRoll).toHaveBeenCalledWith(
      expect.objectContaining({ total: 15, formula: "1d20" }),
      { label: "Oráculo", suffix: "· Sim — hint" },
    );
  });

  it("duas chamadas em reviravolta (algo antes, oráculo depois)", () => {
    const addRoll = vi.fn();
    const sim = rollResult(10, "Reviravolta");
    const algo = rollResult(42, "Evento X", 42);
    emitSolodarkOracleRolls(addRoll, oracleTable, sim, {
      algoTable,
      algoRoll: algo,
    });
    expect(addRoll).toHaveBeenCalledTimes(2);
    expect(addRoll.mock.calls[0][1]).toEqual({
      label: "Algo acontece",
      suffix: "· Evento X",
    });
    expect(addRoll.mock.calls[1][1]).toEqual({
      label: "Oráculo",
      suffix: "· Reviravolta",
    });
  });
});
