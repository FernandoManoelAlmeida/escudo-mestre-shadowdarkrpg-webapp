#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { writeVersion } = require("./write-version");
const { parseEntradasFromMd } = require("./catalogo-personagem-lib");
const { sanitizeAndDedupeEntradas } = require("./sanitize-catalogo-astraldark");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUT_PATH = path.join(PROJECT_ROOT, "public/data/catalogo/classes.json");

function main() {
  const mdPath = process.argv[2];
  if (!mdPath || !fs.existsSync(mdPath)) {
    console.error("Uso: node migrate-catalogo-classes-shadowdark.js <Classes.md>");
    process.exit(1);
  }
  const md = fs.readFileSync(mdPath, "utf8");
  const { entradas, skipped } = parseEntradasFromMd(md, {
    entryDelimiter: "---",
    catalogoKind: "classe",
  });
  const final = sanitizeAndDedupeEntradas(entradas);
  if (skipped.length) console.log("Ignorados no MD:", skipped.length);
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify({ entradas: final }, null, 2));
  console.log("Classes:", final.length);
  writeVersion(PROJECT_ROOT);
}

if (require.main === module) main();
