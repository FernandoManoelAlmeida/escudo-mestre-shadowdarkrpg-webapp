import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSection, getTable, getEscudo, filterRegrasIndex } from "./escudo";
import type { EscudoData } from "./escudo";

const fixture: EscudoData = {
  meta: {
    title: "Escudo Teste",
    description: "Desc",
    sources: ["Livro base"],
  },
  index: [
    { id: "1", title: "Mecânica", anchor: "1-mecanica" },
    { id: "2", title: "Criação", anchor: "2-criacao" },
  ],
  sections: [
    {
      id: "1",
      title: "Mecânica básica",
      subsections: [
        { id: "1.1", title: "Testes", content: "Role 1d20." },
        { id: "1.2", title: "Termos", tableRef: "termos_importantes" },
      ],
    },
    {
      id: "2",
      title: "Criação de personagem",
      subsections: [
        { id: "2.1", title: "Passo a passo", content: "Conceito, atributos." },
      ],
    },
  ],
  tables: {
    termos_importantes: {
      headers: ["Termo", "Significado"],
      rows: [
        { termo: "PV", significado: "Pontos de Vida" },
        { termo: "PD", significado: "Pontos de Determinação" },
      ],
    },
    dificuldades_dt: {
      headers: ["Tarefa", "DT"],
      rows: [
        { tarefa: "Fácil", dt: 5 },
        { tarefa: "Difícil", dt: 15 },
      ],
    },
  },
  glossary: [
    {
      term: "AGI",
      fullName: "Agilidade",
      description: "Coordenação e reflexos.",
    },
    {
      term: "PD",
      fullName: "Pontos de Determinação",
      description: "Energia para habilidades.",
    },
  ],
};

describe("getSection", () => {
  it("retorna a seção quando o id existe", () => {
    const section = getSection(fixture, "1");
    expect(section).toBeDefined();
    expect(section!.id).toBe("1");
    expect(section!.title).toBe("Mecânica básica");
    expect(section!.subsections).toHaveLength(2);
  });

  it("retorna undefined quando o id não existe", () => {
    expect(getSection(fixture, "99")).toBeUndefined();
  });
});

describe("getTable", () => {
  it("retorna a tabela quando a ref existe", () => {
    const table = getTable(fixture, "termos_importantes");
    expect(table).toBeDefined();
    expect(table!.headers).toEqual(["Termo", "Significado"]);
    expect(table!.rows).toHaveLength(2);
  });

  it("retorna undefined quando a ref não existe", () => {
    expect(getTable(fixture, "tabela_inexistente")).toBeUndefined();
  });
});

describe("filterRegrasIndex", () => {
  it("sem texto ou texto vazio retorna o índice inteiro", () => {
    expect(filterRegrasIndex(fixture, {})).toEqual(fixture.index);
    expect(filterRegrasIndex(fixture, { texto: "" })).toEqual(fixture.index);
    expect(filterRegrasIndex(fixture, { texto: "   " })).toEqual(fixture.index);
  });

  it("busca por título da seção (case insensitive)", () => {
    const result = filterRegrasIndex(fixture, { texto: "mecânica" });
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("1");
    expect(result[0]!.title).toBe("Mecânica"); // título vem do index, não da section
  });

  it("busca por conteúdo de subseção encontra a seção", () => {
    const result = filterRegrasIndex(fixture, { texto: "1d20" });
    expect(result.some((i) => i.id === "1")).toBe(true);
  });

  it("busca por termo do glossário adiciona item Glossário ao resultado", () => {
    const result = filterRegrasIndex(fixture, { texto: "AGI" });
    expect(
      result.some((i) => i.id === "glossario" && i.title === "Glossário"),
    ).toBe(true);
  });

  it("busca por fullName do glossário adiciona Glossário", () => {
    const result = filterRegrasIndex(fixture, { texto: "Agilidade" });
    expect(result.some((i) => i.id === "glossario")).toBe(true);
  });

  it("busca por description do glossário adiciona Glossário", () => {
    const result = filterRegrasIndex(fixture, { texto: "Coordenação" });
    expect(result.some((i) => i.id === "glossario")).toBe(true);
  });

  it("não duplica Glossário quando a seção glossario já entrou pelo índice", () => {
    const data: EscudoData = {
      ...fixture,
      index: [
        ...fixture.index,
        { id: "glossario", title: "Glossário", anchor: "glossario" },
      ],
      sections: [
        ...fixture.sections,
        {
          id: "glossario",
          title: "Glossário",
          subsections: [
            { id: "g.1", title: "Termos", content: "AGI e outros atributos." },
          ],
        },
      ],
    };
    const result = filterRegrasIndex(data, { texto: "AGI" });
    expect(result.filter((i) => i.id === "glossario")).toHaveLength(1);
  });

  it("busca que bate em tabela (header ou key) adiciona item Tabelas", () => {
    const byHeader = filterRegrasIndex(fixture, { texto: "Termo" });
    expect(
      byHeader.some((i) => i.id === "tabelas" && i.title === "Tabelas"),
    ).toBe(true);
    const byKey = filterRegrasIndex(fixture, { texto: "dificuldades_dt" });
    expect(byKey.some((i) => i.id === "tabelas")).toBe(true);
  });

  it("busca que bate em célula da tabela adiciona Tabelas", () => {
    const result = filterRegrasIndex(fixture, { texto: "Pontos de Vida" });
    expect(result.some((i) => i.id === "tabelas")).toBe(true);
  });

  it("combina match de seção com glossário/tabelas sem duplicar", () => {
    const result = filterRegrasIndex(fixture, { texto: "PD" });
    const glossarioEntries = result.filter((i) => i.id === "glossario");
    expect(glossarioEntries).toHaveLength(1);
  });

  it("retorna array vazio quando nada bate (index vazio de matches)", () => {
    const result = filterRegrasIndex(fixture, { texto: "xyznonexistent" });
    expect(result).toHaveLength(0);
  });

  it("busca em formulas declaradas na subseção", () => {
    const data: EscudoData = {
      ...fixture,
      sections: fixture.sections.map((s) =>
        s.id === "1"
          ? {
              ...s,
              subsections: [
                ...s.subsections,
                { id: "1.9", title: "Dano", formulas: ["4d8+2 perfuração"] },
              ],
            }
          : s,
      ),
    };
    const result = filterRegrasIndex(data, { texto: "perfuração" });
    expect(result.some((i) => i.id === "1")).toBe(true);
  });

  it("tolera glossary ou tables ausentes em runtime", () => {
    const partial = {
      ...fixture,
      glossary: undefined,
      tables: undefined,
    } as EscudoData;
    const r1 = filterRegrasIndex(partial, { texto: "mecânica" });
    expect(r1.some((i) => i.id === "1")).toBe(true);
    expect(r1.some((i) => i.id === "glossario")).toBe(false);
  });

  it("tabela com rows não-array só casa por chave ou cabeçalho", () => {
    const data: EscudoData = {
      ...fixture,
      tables: {
        so_chave: {
          headers: ["A"],
          rows: { a: "1" } as unknown as EscudoData["tables"][string]["rows"],
        },
      },
    };
    expect(
      filterRegrasIndex(data, { texto: "so_chave" }).some(
        (i) => i.id === "tabelas",
      ),
    ).toBe(true);
  });
});

describe("getEscudo", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    // Reset module cache to clear cached escudo
    vi.resetModules();
  });

  it("retorna dados quando fetch é ok", async () => {
    const { getEscudo: getEscudoFresh } = await import("./escudo");
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => fixture,
    });
    const data = await getEscudoFresh();
    expect(data.meta.title).toBe(fixture.meta.title);
    expect(data.sections).toHaveLength(2);
    expect(data.tables.termos_importantes).toBeDefined();
    expect(data.glossary).toHaveLength(2);
  });

  it("segunda chamada reutiliza cache (um único fetch)", async () => {
    const { getEscudo: getEscudoFresh } = await import("./escudo");
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => fixture,
    });
    await getEscudoFresh();
    await getEscudoFresh();
    expect(
      (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls,
    ).toHaveLength(1);
  });

  it("lança erro quando fetch não é ok", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });
    await expect(getEscudo()).rejects.toThrow("Falha ao carregar Escudo");
  });
});
