#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { stripPdfNoise } = require("./catalogo-personagem-lib");

function extractMulticlasse(mdPath) {
  const md = fs.readFileSync(mdPath, "utf8");
  const h1 = md.match(/^#\s+(.+)$/m);
  const nome = h1 ? h1[1].trim() : "Multiclasse simples";
  let body = md.replace(/^#\s+.+$/m, "").trim();
  const hr = body.indexOf("\n---\n");
  if (hr >= 0) body = body.slice(hr + 5).trim();
  body = stripPdfNoise(body);
  return { nome, id: "multiclasse-simples", descricao: body };
}

function toCatalogMd(regras) {
  const lines = [
    "# Catálogo — Regras homebrew",
    "",
    "Fonte: Referências/Shadowdark/Homebrews/",
    "",
  ];
  for (const r of regras) {
    lines.push("---");
    lines.push(`## ${r.nome}`);
    lines.push(`*Origem: ${r.origem}*`);
    lines.push(`*Fonte: homebrew*`);
    lines.push("");
    lines.push(r.descricao);
    lines.push("");
  }
  return lines.join("\n");
}

function main() {
  const multiclassePath = process.argv[2];
  const outMd = process.argv[3];
  if (!multiclassePath || !outMd) {
    console.error(
      "Uso: node extract-regras-homebrew-shadowdark.js <Multiclasse simples pt-BR.md> <Regras Homebrew.md>",
    );
    process.exit(1);
  }
  const entry = extractMulticlasse(path.resolve(multiclassePath));
  entry.origem = `Homebrews/${path.basename(multiclassePath)}`;
  entry.fonte = "homebrew";
  const md = toCatalogMd([entry]);
  fs.mkdirSync(path.dirname(path.resolve(outMd)), { recursive: true });
  fs.writeFileSync(path.resolve(outMd), md, "utf8");
  console.log("Regras homebrew: 1 →", outMd);
}

if (require.main === module) main();

module.exports = { extractMulticlasse, toCatalogMd };
