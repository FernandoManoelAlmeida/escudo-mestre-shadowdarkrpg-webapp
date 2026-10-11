import { describe, it, expect } from "vitest";
import {
  finalizeClassDescricao,
  parseEntradasFromMd,
} from "../scripts/catalogo-personagem-lib";
import {
  normalizeClassDescricao,
  splitCatalogoMarkdownSections,
} from "../lib/catalogoMarkdown";
import {
  classeListBadge,
  classeListTitle,
  cursedScrollNumber,
} from "../lib/catalogoPersonagem";

const GUERREIRO_SNIPPET = `
Armas: todas as armas.

Armaduras: todas as armaduras.

Pontos de Vida: 1d8 por nível.

Ataque Poderoso. Você pode usar sua Força para ataques.

### TALENTOS DE GUERREIRO

| d12 | Resultado |
| --- | --- |
| 2 | +1 PV |
`;

describe("normalizeClassDescricao", () => {
  it("produz seções ## para classe do livro", () => {
    const out = normalizeClassDescricao(GUERREIRO_SNIPPET);
    const { sections } = splitCatalogoMarkdownSections(out, "classe");
    expect(sections.length).toBeGreaterThanOrEqual(2);
    expect(sections.some((s) => s.title === "Proficiências")).toBe(true);
    expect(sections.some((s) => s.title === "Ataque Poderoso")).toBe(true);
  });

  it("migrate com catalogoKind classe não trunca Guerreiro", () => {
    const md = `# Catálogo

---
## Guerreiro
*Fonte: livro*

${GUERREIRO_SNIPPET.trim()}
`;
    const { entradas } = parseEntradasFromMd(md, {
      entryDelimiter: "---",
      catalogoKind: "classe",
    });
    expect(entradas[0].descricao.length).toBeGreaterThan(100);
    expect(entradas[0].descricao).toMatch(/Ataque Poderoso/);
    expect(finalizeClassDescricao(GUERREIRO_SNIPPET, "livro")).toMatch(/## Proficiências/);
  });
});

describe("listagem de classes", () => {
  const vidente = {
    id: "vidente",
    nome: "Vidente",
    descricao: "",
    fonte: "cursed-scroll" as const,
    origem: "Cursed Scroll 3 - Sol da Meia-Noite pt-BR",
  };

  it("extrai número do Cursed Scroll em origem", () => {
    expect(cursedScrollNumber(vidente.origem)).toBe(3);
  });

  it("título só com nome; badge com Cursed Scroll N", () => {
    expect(classeListTitle(vidente)).toBe("Vidente");
    expect(classeListBadge(vidente)).toBe("Cursed Scroll 3");
  });
});
