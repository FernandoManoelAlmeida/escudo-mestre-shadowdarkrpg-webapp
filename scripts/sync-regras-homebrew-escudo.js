/**
 * Injeta regras de public/data/catalogo/regras-homebrew.json no escudo-shadowdark.json
 * (índice + seções), para aparecerem na lista /regras como as demais seções.
 */
const fs = require("fs");
const path = require("path");
const { slug: slugNome } = require("./catalogo-personagem-lib");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const ESCUDO_PATH = path.join(PROJECT_ROOT, "public/data/escudo-shadowdark.json");
const REGRAS_PATH = path.join(PROJECT_ROOT, "public/data/catalogo/regras-homebrew.json");

/** Capítulo na listagem /regras (após § 6 do livro). */
const LIST_CHAPTER_BY_RULE_ID = {
  "multiclasse-simples": "8",
};

function stripFonteLine(text) {
  return text.replace(/^\*Fonte:\s*[^*]+\*\s*/i, "").trim();
}

function descricaoToSubsections(descricao) {
  const body = stripFonteLine(descricao);
  // Só ## no início da linha — não partir dentro de ### (lookahead em "## " quebrava em ###).
  const parts = body.split(/(?=^## )/m).map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) {
    return [{ id: "conteudo", title: "Conteúdo", content: body }];
  }
  return parts.map((block, i) => {
    const lines = block.split("\n");
    const first = lines[0] ?? "";
    if (!first.startsWith("## ")) {
      return { id: `sub-${i}`, title: "Conteúdo", content: block };
    }
    const title = first.replace(/^##\s+/, "").trim();
    const content = lines.slice(1).join("\n").trim();
    const id = slugNome(title) || `sub-${i}`;
    return { id, title, content };
  });
}

function syncHomebrewRulesToEscudo(regras) {
  if (!fs.existsSync(ESCUDO_PATH)) {
    console.warn("Aviso: escudo-shadowdark.json ausente; skip sync homebrew");
    return;
  }
  const escudo = JSON.parse(fs.readFileSync(ESCUDO_PATH, "utf8"));
  const ids = new Set(regras.map((r) => r.id));

  escudo.index = (escudo.index ?? []).filter((i) => !ids.has(i.id));
  escudo.sections = (escudo.sections ?? []).filter((s) => !ids.has(s.id));

  for (const r of regras) {
    const chapter = LIST_CHAPTER_BY_RULE_ID[r.id];
    const indexEntry = {
      id: r.id,
      title: r.nome,
      anchor: r.id,
    };
    if (chapter) indexEntry.chapter = chapter;
    escudo.index.push(indexEntry);
    const sectionEntry = {
      id: r.id,
      title: r.nome,
      homebrew: true,
      subsections: descricaoToSubsections(r.descricao),
    };
    if (chapter) sectionEntry.chapter = chapter;
    escudo.sections.push(sectionEntry);
  }

  fs.writeFileSync(ESCUDO_PATH, JSON.stringify(escudo, null, 2));
  console.log("Escudo: regras homebrew sincronizadas:", regras.map((r) => r.id).join(", "));
}

function main() {
  if (!fs.existsSync(REGRAS_PATH)) {
    console.warn("Aviso: regras-homebrew.json ausente");
    return;
  }
  const { regras } = JSON.parse(fs.readFileSync(REGRAS_PATH, "utf8"));
  syncHomebrewRulesToEscudo(regras ?? []);
}

if (require.main === module) main();

module.exports = { syncHomebrewRulesToEscudo, descricaoToSubsections };
