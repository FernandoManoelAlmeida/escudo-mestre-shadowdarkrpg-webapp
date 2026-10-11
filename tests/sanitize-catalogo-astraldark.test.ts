import { describe, it, expect } from "vitest";
import {
  sanitizeAndDedupeEntradas,
  findForbiddenInCatalogEntry,
} from "../scripts/sanitize-catalogo-astraldark";

describe("sanitize-catalogo-astraldark", () => {
  it("substitui Githyanki por Matriprole e dedupe astraldark > homebrew", () => {
    const entradas = [
      {
        id: "matriprole",
        nome: "Matriprole",
        fonte: "astraldark",
        origem: "astraldark.md",
        descricao: "Guerreiros do Plano Astral.",
      },
      {
        id: "githyanki",
        nome: "Githyanki",
        fonte: "homebrew",
        origem: "mesa.md",
        descricao: "Versão de mesa.",
      },
    ];
    const out = sanitizeAndDedupeEntradas(entradas);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("matriprole");
    expect(out[0].nome).toBe("Matriprole");
    expect(findForbiddenInCatalogEntry(out[0])).toHaveLength(0);
  });

  it("multiclasse sem termos proibidos após glossário", () => {
    const entry = {
      id: "multiclasse-simples",
      nome: "Multiclasse simples",
      fonte: "homebrew",
      descricao: "Duas classes fixas na criação.",
    };
    expect(findForbiddenInCatalogEntry(entry)).toHaveLength(0);
  });
});
