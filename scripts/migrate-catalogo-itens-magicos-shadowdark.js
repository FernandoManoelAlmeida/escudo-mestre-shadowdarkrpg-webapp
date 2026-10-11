#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { writeVersion } = require("./write-version");
const { parseItensFromMd } = require("./catalogo-itens-magicos-lib");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUT_PATH = path.join(PROJECT_ROOT, "public/data/catalogo/itens-magicos.json");

function summarizeSkipped(skipped) {
  const counts = {};
  for (const s of skipped) {
    for (const r of s.reasons) {
      counts[r] = (counts[r] || 0) + 1;
    }
  }
  return counts;
}

function main() {
  const mdPath = process.argv[2];
  if (!mdPath || !fs.existsSync(mdPath)) {
    console.error("Uso: node scripts/migrate-catalogo-itens-magicos-shadowdark.js <Itens Mágicos.md>");
    process.exit(1);
  }
  const md = fs.readFileSync(mdPath, "utf8");
  const { itens, skipped } = parseItensFromMd(md);
  const reasonCounts = summarizeSkipped(skipped);
  if (skipped.length) {
    console.log("Ignorados:", skipped.length, reasonCounts);
    const sample = skipped.slice(0, 8).map((s) => `${s.nome} (${s.reasons.join(",")})`);
    console.log("Exemplos:", sample.join("; "));
  }
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify({ itens }, null, 2));
  console.log("Itens mágicos aceites:", itens.length);
  writeVersion(PROJECT_ROOT);
}

if (require.main === module) main();

module.exports = { OUT_PATH };
