import { describe, it, expect } from "vitest";
import {
  classifyEncounterResult,
  classifyEncounterRow,
  buildEncounterFollowUps,
  parseTreasureBand,
  treasureTableId,
} from "./encounterFollowUp";

describe("encounterFollowUp", () => {
  it("classifyEncounterRow — metadata da linha", () => {
    expect(
      classifyEncounterRow("Dois ursos pardos flanqueiam os PJs", "criatura")
        .kind,
    ).toBe("criatura");
    expect(
      classifyEncounterRow(
        "Hrugin, o troll, arrasta 1d4 exploradores rivais",
        "cena_evento",
      ).kind,
    ).toBe("cena_evento");
    expect(
      classifyEncounterRow("Patrulha da Guarda segue os PJs", "cena_evento")
        .kind,
    ).toBe("cena_evento");
    expect(
      classifyEncounterRow("Um fio de armadilha aciona uma rede", "armadilha")
        .kind,
    ).toBe("armadilha");
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
      classifyEncounterRow(
        "Role dois encontros e combine os resultados (role de novo 98–99)",
        "combinar",
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
    expect(buildEncounterFollowUps({ kind: "criatura" }).length).toBe(2);
    expect(buildEncounterFollowUps({ kind: "cena_evento" })).toEqual([]);
  });

  it("parseTreasureBand NV 0", () => {
    expect(parseTreasureBand("rolar tesouro NV 0")).toBe("0-3");
    expect(treasureTableId("10+")).toBe("tesouros-10-mais");
  });

  it("fallback por texto quando sem followUp na linha", () => {
    expect(classifyEncounterRow("Armadilha de dardos").kind).toBe("armadilha");
  });
});
