import { describe, it, expect } from "vitest";
import { condicoesFromSection } from "@/lib/condicoes";
import type { EscudoSection } from "@/lib/escudo";

describe("condicoesFromSection", () => {
  it("mapeia subsecções para entradas nome + descrição", () => {
    const section: EscudoSection = {
      id: "7",
      title: "Condições",
      subsections: [
        {
          id: "7.1",
          title: "Cego",
          content: "Falha em testes de visão.",
        },
        {
          id: "7.2",
          title: "Surdo",
          content: "Falha em testes de audição.",
        },
      ],
    };
    expect(condicoesFromSection(section)).toEqual([
      { id: "7.1", nome: "Cego", descricao: "Falha em testes de visão." },
      { id: "7.2", nome: "Surdo", descricao: "Falha em testes de audição." },
    ]);
  });

  it("ignora subsecção Lista sem nome de condição", () => {
    const section: EscudoSection = {
      id: "7",
      title: "Condições",
      subsections: [
        {
          id: "7.1",
          title: "Lista",
          content: "**Cego.** Texto.",
        },
      ],
    };
    expect(condicoesFromSection(section)).toEqual([]);
  });
});
