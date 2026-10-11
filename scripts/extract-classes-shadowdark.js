#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const {
  extractClassesFromText,
  parseClassFile,
  toCatalogMd,
  slug,
} = require("./catalogo-personagem-lib");

function globClassFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /classe pt-BR\.md$/i.test(f))
    .map((f) => path.join(dir, f));
}

function main() {
  const args = process.argv.slice(2);
  let livroPath;
  let outMd;
  let homebrewsDir;
  const cursedScrolls = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--livro" && args[i + 1]) livroPath = args[++i];
    else if (args[i] === "--out" && args[i + 1]) outMd = args[++i];
    else if (args[i] === "--homebrews" && args[i + 1]) homebrewsDir = args[++i];
    else if (args[i] === "--cursed-scroll" && args[i + 1]) {
      cursedScrolls.push(path.resolve(args[++i]));
    } else if (!livroPath && !args[i].startsWith("--")) {
      livroPath = args[i];
      if (args[i + 1] && !args[i + 1].startsWith("--")) outMd = args[++i];
    }
  }

  if (!livroPath || !outMd) {
    console.error(
      "Uso: node extract-classes-shadowdark.js --livro <livro.md> --out <Classes.md> [--homebrews dir] [--cursed-scroll file.md ...]",
    );
    process.exit(1);
  }

  const livro = fs.readFileSync(path.resolve(livroPath), "utf8");
  let entradas = [];
  let skipped = [];

  const fromLivro = extractClassesFromText(livro, {
    origem: "livro",
    fonte: "livro",
  });
  entradas = entradas.concat(fromLivro.entradas);
  skipped = skipped.concat(fromLivro.skipped);
  console.log("Livro:", fromLivro.entradas.length, "classes");

  for (const csPath of cursedScrolls) {
    const id = path.basename(csPath, ".md");
    const cs = fs.readFileSync(csPath, "utf8");
    const fromCs = extractClassesFromText(cs, {
      origem: id,
      fonte: "cursed-scroll",
    });
    console.log(`CS ${id}: +${fromCs.entradas.length} classes`);
    entradas = entradas.concat(fromCs.entradas);
    skipped = skipped.concat(fromCs.skipped);
  }

  if (homebrewsDir) {
    const files = globClassFiles(homebrewsDir);
    for (const f of files) {
      const md = fs.readFileSync(f, "utf8");
      const e = parseClassFile(md, {
        origem: `Homebrews/${path.basename(f)}`,
        fonte: "homebrew",
      });
      if (e) entradas.push(e);
      else console.warn("Homebrew ignorado:", path.basename(f));
    }
    console.log("Homebrews:", files.length, "ficheiros");
  }

  const seen = new Set();
  const deduped = [];
  for (const e of entradas) {
    const key = slug(e.nome);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push({ ...e, id: key });
  }

  const md = toCatalogMd(
    "Catálogo — Classes",
    "Fonte: Livro de Regras Shadowdark pt-BR + Cursed Scrolls + Homebrews (mesa).",
    deduped,
  );
  fs.mkdirSync(path.dirname(path.resolve(outMd)), { recursive: true });
  fs.writeFileSync(path.resolve(outMd), md, "utf8");
  console.log(
    "Classes extraídas:",
    deduped.length,
    "ignoradas:",
    skipped.length,
    "→",
    outMd,
  );
}

if (require.main === module) main();
