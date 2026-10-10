#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { writeVersion } = require("./write-version");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUT_PATH = path.join(PROJECT_ROOT, "public/data/catalogo/itens-magicos.json");

function main() {
  const mdPath = process.argv[2];
  if (!mdPath || !fs.existsSync(mdPath)) {
    console.error("Uso: node scripts/migrate-catalogo-itens-magicos-shadowdark.js <Itens Mágicos.md>");
    process.exit(1);
  }
  const md = fs.readFileSync(mdPath, "utf8");
  const itens = [];
  const blocks = md.split(/\n###\s+/).slice(1);
  for (const block of blocks) {
    const lines = block.split("\n");
    const nome = lines[0].trim();
    if (!nome) continue;
    const body = lines.slice(1).join("\n").trim();
    const origemMatch = body.match(/^\*Origem:\s*([^*]+)\*/);
    const origem = origemMatch ? origemMatch[1].trim() : "livro";
    const descricao = origemMatch
      ? body.replace(/^\*Origem:[^*]+\*\s*\n?/, "").trim()
      : body;
    itens.push({ nome, descricao, origem });
  }
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify({ itens }, null, 2));
  console.log("Itens mágicos:", itens.length);
  writeVersion(PROJECT_ROOT);
}

if (require.main === module) main();
