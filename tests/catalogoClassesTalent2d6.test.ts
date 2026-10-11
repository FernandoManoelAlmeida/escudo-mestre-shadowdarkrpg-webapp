import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { splitCatalogoMarkdownSections } from "../lib/catalogoMarkdown";

type ClasseEntrada = { id: string; descricao: string };

describe("classes.json — talentos 2d6 (SD3-21)", () => {
  const jsonPath = path.join(
    process.cwd(),
    "public/data/catalogo/classes.json",
  );
  const { entradas } = JSON.parse(readFileSync(jsonPath, "utf8")) as {
    entradas: ClasseEntrada[];
  };

  for (const entrada of entradas) {
    it(`${entrada.id}: seções de talento com cabeçalho 2d6`, () => {
      const { sections } = splitCatalogoMarkdownSections(
        entrada.descricao,
        "classe",
      );
      const talentSections = sections.filter((s) =>
        /^Talentos/i.test(s.title),
      );
      expect(talentSections.length).toBeGreaterThan(0);
      for (const sec of talentSections) {
        expect(sec.body).toMatch(/\| 2d6 \|/);
        const firstTableHeader = sec.body.match(/^\| [^|]+ \|/m)?.[0] ?? "";
        expect(firstTableHeader).not.toMatch(/\| d12 \|/);
      }
    });
  }

  it("warlock sem cartões Dádivas —", () => {
    const warlock = entradas.find((e) => e.id === "warlock");
    expect(warlock).toBeTruthy();
    const { sections } = splitCatalogoMarkdownSections(
      warlock!.descricao,
      "classe",
    );
    expect(sections.some((s) => s.title.startsWith("Dádivas"))).toBe(false);
    expect(sections.some((s) => s.title === "Almazzat")).toBe(true);
  });

  it("cavaleiro-do-deserto: Carga e talentos só 2d6", () => {
    const deserto = entradas.find((e) => e.id === "cavaleiro-do-deserto");
    expect(deserto).toBeTruthy();
    const { sections } = splitCatalogoMarkdownSections(
      deserto!.descricao,
      "classe",
    );
    expect(sections.some((s) => s.title === "Carga")).toBe(true);
    const tal = sections.find((s) => s.title === "Talentos");
    expect(tal?.body).toMatch(/\| 2d6 \|/);
    expect(tal?.body).not.toContain("| d6 |");
    expect(tal?.body).not.toContain("Sub-tabela");
  });

  const conjuradoresNv10 = ["mago", "sacerdote", "bruxa", "vidente"] as const;

  for (const id of conjuradoresNv10) {
    it(`${id}: conjuração com magias conhecidas até nível 10`, () => {
      const entrada = entradas.find((e) => e.id === id);
      expect(entrada).toBeTruthy();
      const { sections } = splitCatalogoMarkdownSections(
        entrada!.descricao,
        "classe",
      );
      const conj = sections.find((s) => s.title === "Conjuração");
      expect(conj?.body).toMatch(/\| 10 \|/);
      expect(conj?.body).toMatch(/\| 9 \|/);
    });
  }
});
