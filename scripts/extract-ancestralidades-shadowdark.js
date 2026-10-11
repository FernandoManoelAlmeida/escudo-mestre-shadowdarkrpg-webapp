#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const {
  extractAncestryLivro,
  parseAncestryFile,
  toCatalogMd,
  slug,
} = require("./catalogo-personagem-lib");

function globAncestryFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /ancestralidade pt-BR\.md$/i.test(f))
    .map((f) => path.join(dir, f));
}

function main() {
  const args = process.argv.slice(2);
  let livroPath;
  let outMd;
  let astraldarkDir;
  let homebrewsDir;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--livro" && args[i + 1]) livroPath = args[++i];
    else if (args[i] === "--out" && args[i + 1]) outMd = args[++i];
    else if (args[i] === "--astraldark" && args[i + 1]) astraldarkDir = args[++i];
    else if (args[i] === "--homebrews" && args[i + 1]) homebrewsDir = args[++i];
  }
  if (!livroPath || !outMd) {
    console.error(
      "Uso: node extract-ancestralidades-shadowdark.js --livro <livro.md> --out <Ancestralidades.md> [--astraldark dir] [--homebrews dir]",
    );
    process.exit(1);
  }

  const livro = fs.readFileSync(path.resolve(livroPath), "utf8");
  let entradas = [];
  const fromLivro = extractAncestryLivro(livro);
  entradas = entradas.concat(fromLivro.entradas);
  console.log("Livro:", fromLivro.entradas.length, "ancestralidades");

  if (astraldarkDir) {
    for (const f of globAncestryFiles(astraldarkDir)) {
      const md = fs.readFileSync(f, "utf8");
      const e = parseAncestryFile(md, {
        origem: path.basename(f),
        fonte: "astraldark",
      });
      if (e) entradas.push(e);
    }
    console.log("Astraldark:", globAncestryFiles(astraldarkDir).length, "ficheiros");
  }

  if (homebrewsDir) {
    for (const f of globAncestryFiles(homebrewsDir)) {
      const md = fs.readFileSync(f, "utf8");
      const e = parseAncestryFile(md, {
        origem: `Homebrews/${path.basename(f)}`,
        fonte: "homebrew",
      });
      if (e) entradas.push(e);
    }
    console.log("Homebrews:", globAncestryFiles(homebrewsDir).length, "ficheiros");
  }

  const md = toCatalogMd(
    "Catálogo — Ancestralidades",
    "Fonte: Livro + Astraldark + Homebrews (mesa).",
    entradas,
  );
  fs.mkdirSync(path.dirname(path.resolve(outMd)), { recursive: true });
  fs.writeFileSync(path.resolve(outMd), md, "utf8");
  console.log("Total bruto:", entradas.length, "→", outMd);
}

if (require.main === module) main();
