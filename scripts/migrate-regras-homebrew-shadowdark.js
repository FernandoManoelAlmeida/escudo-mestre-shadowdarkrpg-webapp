#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { writeVersion } = require("./write-version");
const { parseEntradasFromMd } = require("./catalogo-personagem-lib");
const { sanitizeCatalogEntry } = require("./sanitize-catalogo-astraldark");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUT_PATH = path.join(PROJECT_ROOT, "public/data/catalogo/regras-homebrew.json");

function main() {
  const mdPath = process.argv[2];
  if (!mdPath || !fs.existsSync(mdPath)) {
    console.error("Uso: node migrate-regras-homebrew-shadowdark.js <Regras Homebrew.md>");
    process.exit(1);
  }
  const md = fs.readFileSync(mdPath, "utf8");
  const { entradas } = parseEntradasFromMd(md, {
    defaultFonte: "homebrew",
    entryDelimiter: "---",
  });
  const regras = entradas.map((e) => {
    const s = sanitizeCatalogEntry(e);
    return {
      id: s.id,
      nome: s.nome,
      fonte: "homebrew",
      origem: e.origem,
      descricao: s.descricao,
    };
  });
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify({ regras }, null, 2));
  console.log("Regras homebrew:", regras.length);
  const { syncHomebrewRulesToEscudo } = require("./sync-regras-homebrew-escudo");
  syncHomebrewRulesToEscudo(regras);
  writeVersion(PROJECT_ROOT);
}

if (require.main === module) main();
