import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  parseFormula,
  rollDice,
  rollFormula,
  extractDiceFormula,
  extractAllDiceFormulas,
  isAllowedDiceSides,
  rollTesteShadowdark,
} from "./dice";

describe("isAllowedDiceSides", () => {
  it("aceita apenas d3, d4, d6, d8, d10, d12, d20, d100", () => {
    expect(isAllowedDiceSides(3)).toBe(true);
    expect(isAllowedDiceSides(4)).toBe(true);
    expect(isAllowedDiceSides(6)).toBe(true);
    expect(isAllowedDiceSides(8)).toBe(true);
    expect(isAllowedDiceSides(10)).toBe(true);
    expect(isAllowedDiceSides(12)).toBe(true);
    expect(isAllowedDiceSides(20)).toBe(true);
    expect(isAllowedDiceSides(100)).toBe(true);
    expect(isAllowedDiceSides(5)).toBe(false);
    expect(isAllowedDiceSides(7)).toBe(false);
    expect(isAllowedDiceSides(1)).toBe(false);
  });
});

describe("parseFormula", () => {
  it("retorna count, sides e modifier para fórmula válida 2d20+5", () => {
    expect(parseFormula("2d20+5")).toEqual({
      count: 2,
      sides: 20,
      modifier: 5,
    });
  });

  it("retorna count 1 quando omitido (d20)", () => {
    expect(parseFormula("d20")).toEqual({ count: 1, sides: 20, modifier: 0 });
  });

  it("retorna modifier 0 quando omitido", () => {
    expect(parseFormula("4d8")).toEqual({ count: 4, sides: 8, modifier: 0 });
  });

  it("aceita modifier negativo", () => {
    expect(parseFormula("3d6-2")).toEqual({ count: 3, sides: 6, modifier: -2 });
  });

  it("aceita count negativo para d20 (usar o menor valor): -2d20", () => {
    expect(parseFormula("-2d20")).toEqual({
      count: -2,
      sides: 20,
      modifier: 0,
    });
    expect(parseFormula("-3d20+5")).toEqual({
      count: -3,
      sides: 20,
      modifier: 5,
    });
  });

  it("remove espaços antes de parsear", () => {
    expect(parseFormula("  2d20+5  ")).toEqual({
      count: 2,
      sides: 20,
      modifier: 5,
    });
  });

  it("retorna null para fórmula inválida", () => {
    expect(parseFormula("xdy")).toBeNull();
    expect(parseFormula("20")).toBeNull();
    expect(parseFormula("2d")).toBeNull();
    expect(parseFormula("d")).toBeNull();
    expect(parseFormula("2d20+")).toBeNull();
  });

  it("retorna null para count ou sides fora do limite", () => {
    expect(parseFormula("0d20")).toBeNull();
    expect(parseFormula("101d20")).toBeNull();
    expect(parseFormula("-101d20")).toBeNull();
    expect(parseFormula("2d0")).toBeNull();
  });

  it("retorna null para count negativo em dados que não são d20", () => {
    expect(parseFormula("-2d6")).toBeNull();
    expect(parseFormula("-1d8")).toBeNull();
  });
});

describe("rollDice", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0.5); // 1-20 -> 10 ou 11 dependendo do round
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("retorna quantidade correta de rolagens", () => {
    const r = rollDice(3, 6, 0);
    expect(r.rolls).toHaveLength(3);
  });

  it("soma dos dados + modifier = total", () => {
    const r = rollDice(2, 10, 5);
    const sum = r.rolls[0]! + r.rolls[1]!;
    expect(r.total).toBe(sum + 5);
    expect(r.modifier).toBe(5);
  });

  it("display contém os dados e o total", () => {
    const r = rollDice(1, 20, 0);
    expect(r.display).toContain(String(r.rolls[0]));
    expect(r.display).toContain(String(r.total));
  });

  it("múltiplos d20: total é o maior dado + modifier (não a soma)", () => {
    const r = rollDice(3, 20, 10);
    const best = Math.max(...r.rolls);
    expect(r.total).toBe(best + 10);
    expect(r.display).toContain("=");
    expect(r.display).toContain(String(r.total));
  });

  it("melhor de 2d20 sem modifier: display sem trecho de modifier", () => {
    const r = rollDice(2, 20, 0);
    expect(r.total).toBe(Math.max(...r.rolls));
    expect(r.display).toMatch(/\[[\d, ]+\]\s+=\s+\d+/);
  });

  it("cada roll está entre 1 e sides", () => {
    const r = rollDice(5, 8, 2);
    r.rolls.forEach((n) => {
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(8);
    });
  });

  it("count negativo d20: rola N dados e total é o menor + modifier (use o pior)", () => {
    const r = rollDice(-2, 20, 0);
    expect(r.rolls).toHaveLength(2);
    const worst = Math.min(...r.rolls);
    expect(r.total).toBe(worst);
    expect(r.display).toContain("use o pior");
    expect(r.chosenD20).toBe(worst);
    expect(r.displayHint).toBe("use o pior");
  });

  it("count negativo d20 com modifier: -2d20+5 usa o menor dado + 5", () => {
    const r = rollDice(-2, 20, 5);
    expect(r.rolls).toHaveLength(2);
    const worst = Math.min(...r.rolls);
    expect(r.total).toBe(worst + 5);
    expect(r.display).toContain("use o pior");
  });

  it("dados que não são d20: modifier negativo aparece no display", () => {
    const r = rollDice(2, 8, -3);
    const sum = r.rolls[0]! + r.rolls[1]!;
    expect(r.total).toBe(sum - 3);
    expect(r.display).toContain("-3");
  });
});

describe("extractDiceFormula", () => {
  it("extrai a primeira fórmula válida no texto", () => {
    expect(extractDiceFormula("4d8 mental")).toBe("4d8");
    expect(extractDiceFormula("dano 2d6+3 de sangue")).toBe("2d6+3");
    expect(extractDiceFormula("1d20+5")).toBe("1d20+5");
  });

  it("retorna a primeira ocorrência quando há várias", () => {
    expect(extractDiceFormula("DT 20 e 1d6+1 mental e 2d8")).toBe("1d6+1");
  });

  it("aceita fórmula com espaços ao redor do texto", () => {
    expect(extractDiceFormula("  4d8  ")).toBe("4d8");
  });

  it("retorna null quando não há fórmula válida", () => {
    expect(extractDiceFormula("")).toBeNull();
    expect(extractDiceFormula("   ")).toBeNull();
    expect(extractDiceFormula("apenas texto")).toBeNull();
    expect(extractDiceFormula("0d20 inválido")).toBeNull();
  });

  it("retorna null quando o match não é fórmula válida (limites)", () => {
    expect(extractDiceFormula("101d20")).toBeNull();
    expect(extractDiceFormula("2d0")).toBeNull();
  });
});

describe("extractAllDiceFormulas", () => {
  it("retorna todas as fórmulas válidas sem repetir (case insensitive)", () => {
    const list = extractAllDiceFormulas("DT 20 e 1d6+1 mental e 2d8 e 1d6+1");
    expect(list).toContain("1d6+1");
    expect(list).toContain("2d8");
    expect(list.filter((f) => f === "1d6+1")).toHaveLength(1);
  });

  it("retorna array vazio para texto vazio ou só espaços", () => {
    expect(extractAllDiceFormulas("")).toEqual([]);
    expect(extractAllDiceFormulas("   ")).toEqual([]);
  });

  it("retorna array vazio quando não há padrão de dados no texto", () => {
    expect(extractAllDiceFormulas("apenas texto sem números")).toEqual([]);
  });

  it("não inclui fórmulas inválidas (ex: 0d20)", () => {
    const list = extractAllDiceFormulas("4d8 e 0d20 e 2d6");
    expect(list).toContain("4d8");
    expect(list).toContain("2d6");
    expect(list).not.toContain("0d20");
  });

  it("deduplica 2d20 e 2D20 como mesma fórmula", () => {
    const list = extractAllDiceFormulas("2d20 e 2D20");
    expect(list.length).toBe(1);
    expect(parseFormula(list[0]!)).toEqual({
      count: 2,
      sides: 20,
      modifier: 0,
    });
  });
});

describe("rollFormula", () => {
  it("retorna RollResult para fórmula válida (d20 usa o maior dado + modifier)", () => {
    const r = rollFormula("2d20+5");
    expect(r).not.toBeNull();
    expect(r!.rolls).toHaveLength(2);
    expect(r!.modifier).toBe(5);
    expect(r!.total).toBe(Math.max(r!.rolls[0]!, r!.rolls[1]!) + 5);
    expect(r!.display).toContain("=");
    expect(r!.display).toContain(String(r!.total));
  });

  it("fórmula com d8/d6 soma todos os dados + modifier", () => {
    const r = rollFormula("4d8");
    expect(r).not.toBeNull();
    const sum = r!.rolls.reduce((a, b) => a + b, 0);
    expect(r!.total).toBe(sum);
  });

  it("retorna null para fórmula inválida", () => {
    expect(rollFormula("invalid")).toBeNull();
  });
});

describe("rollTesteShadowdark", () => {
  it("soma modificador ao d20", () => {
    const r = rollTesteShadowdark(3);
    expect(r.rolls).toHaveLength(1);
    expect(r.total).toBe(r.rolls[0]! + 3);
  });

  it("com CD marca sucesso quando total >= cd", () => {
    const r = rollTesteShadowdark(0, 1);
    expect(r.cd).toBe(1);
    expect(r.success).toBe(r.total >= 1);
  });
});
