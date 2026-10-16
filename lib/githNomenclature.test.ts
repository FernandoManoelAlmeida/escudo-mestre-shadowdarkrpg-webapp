import { describe, it, expect, afterEach, vi } from "vitest";
import type { Criatura } from "./ameacas";

describe("githNomenclature", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function load(flag: string) {
    vi.stubEnv("NEXT_PUBLIC_COPYRIGHT_FREE", flag);
    vi.resetModules();
    return import("./githNomenclature");
  }

  it("CF=1 mantém Matri* e converte Gith* residual", async () => {
    const n = await load("1");
    expect(n.applyNomenclatureForDisplay("GUERREIRO MATRIPROLE")).toBe(
      "GUERREIRO MATRIPROLE",
    );
    expect(n.applyNomenclatureForDisplay("Matriarca")).toBe("Matriarca");
    expect(n.applyNomenclatureForDisplay("Guerreiro Githyanki")).toBe(
      "Guerreiro Matriprole",
    );
    expect(n.applyNomenclatureForDisplay("cota githyanki")).toBe(
      "cota matriprole",
    );
    expect(n.applyNomenclatureForDisplay("cota githyanki")).not.toMatch(
      /matriyanki/i,
    );
  });

  it("flag off reverte Matri* → Gith*/Vlaakith", async () => {
    const n = await load("");
    expect(n.applyNomenclatureForDisplay("GUERREIRO MATRIPROLE")).toBe(
      "GUERREIRO GITHYANKI",
    );
    expect(n.applyNomenclatureForDisplay("MONGE MATRÍMPIO")).toBe(
      "MONGE GITHZERAI",
    );
    expect(n.applyNomenclatureForDisplay("Matriarca")).toBe("Vlaakith");
    expect(
      n.applyNomenclatureForDisplay(
        "Cavaleira-artista matriprole. Marcada pela Rainha-Lich Matriarca.",
      ),
    ).toBe("Cavaleira-artista githyanki. Marcada pela Rainha-Lich Vlaakith.");
    expect(n.applyNomenclatureForDisplay("juramentos em matri (x)")).toBe(
      "juramentos em gith (x)",
    );
    expect(n.applyNomenclatureForDisplay("matriprole")).not.toMatch(
      /matriyanki|githprole/i,
    );
  });

  it("mapCriaturaNomenclature não altera id", async () => {
    const n = await load("");
    const c: Criatura = {
      id: "guerreiro-matriprole",
      nome: "GUERREIRO MATRIPROLE",
      flavor: "Soldado fanático de Matriarca.",
      tipo: "Humanóide (Matriprole)",
      nv: 3,
      al: "C",
      ca: 15,
      pv: 16,
      atq: "lâmina",
      mv: "Perto",
      atributos: { F: 0, D: 0, C: 0, I: 0, S: 0, Car: 0 },
      tracos: [{ nome: "Psi", descricao: "poder matriprole" }],
      origem: "homebrew",
    };
    const out = n.mapCriaturaNomenclature(c);
    expect(out.id).toBe("guerreiro-matriprole");
    expect(out.nome).toBe("GUERREIRO GITHYANKI");
    expect(out.flavor).toContain("Vlaakith");
    expect(out.tipo).toContain("Githyanki");
    expect(out.tracos[0].descricao).toContain("githyanki");
  });

  it("mapTokenNomenclature ajusta rótulo Githyanki ↔ Matriprole", async () => {
    const tok = {
      url: "https://example.com/gith_1_fbb.png",
      credito: "You see this.",
      rotulo: "Githyanki",
    };
    const cf = await load("1");
    expect(cf.mapTokenNomenclature(tok).rotulo).toBe("Matriprole");
    const mesa = await load("");
    expect(mesa.mapTokenNomenclature(tok).rotulo).toBe("Githyanki");
  });

  it("mapCatalogoEntradaNomenclature na ancestralidade", async () => {
    const n = await load("");
    const out = n.mapCatalogoEntradaNomenclature({
      id: "matriprole",
      nome: "Matriprole",
      descricao: "prole da Matriarca; legado Matriprole.",
      origem: "Matriprole ancestralidade pt-BR.md",
      fonte: "astraldark",
    });
    expect(out.id).toBe("matriprole");
    expect(out.nome).toBe("Githyanki");
    expect(out.descricao).toContain("Vlaakith");
    expect(out.descricao).toContain("Githyanki");
    expect(out.origem).toContain("Githyanki");
  });
});
