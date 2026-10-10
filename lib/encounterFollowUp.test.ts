import { describe, it, expect } from "vitest";
import {
  classifyEncounterResult,
  buildEncounterFollowUps,
  parseTreasureBand,
  treasureTableId,
} from "./encounterFollowUp";

describe("encounterFollowUp", () => {
  it("piloto masmorra — linhas 1–6", () => {
    expect(classifyEncounterResult("Rato gigante").kind).toBe("criatura");
    expect(classifyEncounterResult("Esqueletos (1d4)").kind).toBe("criatura");
    expect(classifyEncounterResult("Armadilha de dardos").kind).toBe(
      "armadilha",
    );
    expect(classifyEncounterResult("Patrulha de goblins").kind).toBe(
      "criatura",
    );
    expect(classifyEncounterResult("Sala vazia com ossos").kind).toBe(
      "cena_evento",
    );
    const tes = classifyEncounterResult(
      "Tesouro menor (rolar tesouro NV 0)",
    );
    expect(tes.kind).toBe("tesouro");
    expect(tes.treasureBand).toBe("0-3");
  });

  it("tesouro tumbas — banda 7-9", () => {
    const t = classifyEncounterResult(
      "Um local oculto esconde 1d4 itens da Tabela de Tesouros 7-9",
    );
    expect(t.kind).toBe("tesouro");
    expect(t.treasureBand).toBe("7-9");
  });

  it("combinar encontros", () => {
    expect(
      classifyEncounterResult(
        "Role dois encontros e combine os resultados (role de novo 98–99)",
      ).kind,
    ).toBe("combinar");
  });

  it("buildEncounterFollowUps por tipo", () => {
    expect(
      buildEncounterFollowUps({ kind: "armadilha" }).map((f) => f.tableId),
    ).toEqual(["armadilhas"]);
    expect(
      buildEncounterFollowUps({
        kind: "tesouro",
        treasureBand: "0-3",
      })[0].tableId,
    ).toBe("tesouros-0-3");
    expect(
      buildEncounterFollowUps({ kind: "criatura" }).length,
    ).toBe(2);
    expect(buildEncounterFollowUps({ kind: "cena_evento" })).toEqual([]);
  });

  it("parseTreasureBand NV 0", () => {
    expect(parseTreasureBand("rolar tesouro NV 0")).toBe("0-3");
    expect(treasureTableId("10+")).toBe("tesouros-10-mais");
  });
});
