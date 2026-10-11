import { describe, it, expect } from "vitest";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const {
  stripAncestryIntroMeta,
  parseAncestryFile,
  parseClassFile,
  slug,
} = require("../scripts/catalogo-personagem-lib.js");

describe("stripAncestryIntroMeta", () => {
  it("remove meta de orçamento e escuridão", () => {
    const raw = [
      "**Homebrew** para Shadowdark, no orçamento do núcleo.",
      "Elfos do subterrâneo, pele como obsidiana.",
      "Não concede visão na escuridão total — no Shadowdark, a escuridão continua mortal para PJs.",
    ].join("\n\n");
    expect(stripAncestryIntroMeta(raw)).toBe("Elfos do subterrâneo, pele como obsidiana.");
  });
});

describe("parseAncestryFile", () => {
  it("mantém só flavor antes das seções ##", () => {
    const md = [
      "# Drow - Ancestralidade",
      "",
      "**Homebrew** para Shadowdark, no orçamento do núcleo.",
      "",
      "Flavor lore aqui.",
      "",
      "---",
      "",
      "## Idiomas",
      "",
      "Você conhece Comum.",
    ].join("\n");
    const e = parseAncestryFile(md, { origem: "test.md", fonte: "homebrew" });
    expect(e?.descricao).toContain("Flavor lore aqui.");
    expect(e?.descricao).not.toContain("orçamento do núcleo");
    expect(e?.descricao).toContain("## Idiomas");
  });
});

describe("parseClassFile", () => {
  it("extrai Bárbaro homebrew com id sem acento partido", () => {
    expect(slug("Bárbaro")).toBe("barbaro");
    const md = [
      "# Classe Bárbaro",
      "",
      "Homebrew para Shadowdark RPG.",
      "",
      "---",
      "",
      "**Armas:** todas",
      "",
      "**Armadura:** couro",
      "",
      "**Pontos de vida:** 1d8 por nível",
      "",
      "Texto longo de habilidades ".repeat(5),
    ].join("\n");
    const e = parseClassFile(md, { origem: "test.md", fonte: "homebrew" });
    expect(e?.id).toBe("barbaro");
    expect(e?.nome).toBe("Bárbaro");
    expect(e?.descricao).not.toMatch(/Homebrew para Shadowdark/i);
  });
});
