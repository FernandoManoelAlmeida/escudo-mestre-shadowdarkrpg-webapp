#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { writeVersion } = require("./write-version");
const { parseAntecedentesFromMd } = require("./catalogo-personagem-lib");
const { findForbiddenInCatalogEntry } = require("./sanitize-catalogo-astraldark");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUT_PATH = path.join(PROJECT_ROOT, "public/data/catalogo/antecedentes.json");

function main() {
  const mdPath = process.argv[2];
  if (!mdPath || !fs.existsSync(mdPath)) {
    console.error(
      "Uso: node migrate-catalogo-antecedentes-shadowdark.js <Antecedentes.md>",
    );
    process.exit(1);
  }
  const md = fs.readFileSync(mdPath, "utf8");
  const { entradas, skipped } = parseAntecedentesFromMd(md);
  const final = [];
  const ids = new Set();
  for (const e of entradas) {
    if (ids.has(e.id)) continue;
    ids.add(e.id);
    const forbidden = findForbiddenInCatalogEntry(e);
    if (forbidden.length) {
      console.warn("Ignorado (glossário):", e.id, forbidden.join(", "));
      continue;
    }
    final.push(e);
  }
  if (skipped.length) console.log("Ignorados no MD:", skipped.length);
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify({ entradas: final }, null, 2));
  console.log("Antecedentes:", final.length);
  writeVersion(PROJECT_ROOT);
}

if (require.main === module) main();
