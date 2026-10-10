#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const {
  extractLivroMagias,
  extractAstraldarkMagias,
  extractCursedScrollMagias,
  spellsToCatalogMd,
  buildReport,
  listCursedScrollFiles,
  dedupeSpellsByCanonicalName,
} = require("./magias-shadowdark-parse");
const { resolveVaultPath, shadowdarkRoot } = require("./vault-paths");

function parseArgs(argv) {
  const out = {
    livro: null,
    outMd: null,
    astraldark: null,
    cursedScrolls: [],
    sdRoot: null,
  };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--astraldark" && argv[i + 1]) {
      out.astraldark = argv[++i];
    } else if (a === "--append-cursed-scroll" && argv[i + 1]) {
      out.cursedScrolls.push(argv[++i]);
    } else if (a === "--cursed-scrolls-dir" && argv[i + 1]) {
      out.sdRoot = argv[++i];
    } else if (!a.startsWith("-")) {
      positional.push(a);
    }
  }
  if (positional[0]) out.livro = positional[0];
  if (positional[1]) out.outMd = positional[1];
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.livro || !args.outMd) {
    console.error(
      "Uso: node scripts/extract-magias-shadowdark.js <Livro.md> <Grimório.md> [--astraldark path] [--append-cursed-scroll file.md ...] [--cursed-scrolls-dir shadowdarkRoot]",
    );
    process.exit(1);
  }

  const livroMd = fs.readFileSync(path.resolve(args.livro), "utf8");
  const livro = extractLivroMagias(livroMd);

  let astral = { spells: [], ignored: [] };
  if (args.astraldark && fs.existsSync(args.astraldark)) {
    astral = extractAstraldarkMagias(
      fs.readFileSync(path.resolve(args.astraldark), "utf8"),
    );
  }

  const scrollResults = [];
  const scrollPaths = [...args.cursedScrolls];
  if (args.sdRoot) {
    for (const p of listCursedScrollFiles(args.sdRoot)) {
      if (!scrollPaths.includes(p)) scrollPaths.push(p);
    }
  }

  for (const csPath of scrollPaths) {
    if (!fs.existsSync(csPath)) {
      console.warn("Aviso: CS ausente:", csPath);
      continue;
    }
    const origem = path.basename(csPath, ".md");
    const csMd = fs.readFileSync(path.resolve(csPath), "utf8");
    const result = extractCursedScrollMagias(csMd, origem);
    scrollResults.push({ origem, ...result });
  }

  const mergeWarnings = [];
  const allSpells = dedupeSpellsByCanonicalName(
    [
      ...livro.spells,
      ...astral.spells,
      ...scrollResults.flatMap((r) => r.spells),
    ],
    mergeWarnings,
  );
  for (const w of mergeWarnings) console.warn("Merge:", w);

  const md = spellsToCatalogMd(allSpells);
  fs.mkdirSync(path.dirname(path.resolve(args.outMd)), { recursive: true });
  fs.writeFileSync(path.resolve(args.outMd), md, "utf8");

  const report = buildReport({
    livro,
    astral,
    scrolls: scrollResults,
    allSpells,
    gradeMap: livro.gradeMap,
  });

  console.log("Grimório MD:", args.outMd);
  console.log("Total magias:", report.total);
  console.log("Livro:", report.livro);
  console.log("Astraldark:", report.astraldark);
  for (const cs of report.cursedScrolls) {
    console.log(`CS ${cs.origem}:`, cs.extraidas, "extraídas");
  }
  if (report.warnings.length) {
    console.warn("Avisos:", report.warnings.length);
    report.warnings.slice(0, 30).forEach((w) => console.warn(" -", w));
    if (report.warnings.length > 30) {
      console.warn(` ... +${report.warnings.length - 30} avisos`);
    }
  }
}

if (require.main === module) main();

module.exports = { main, parseArgs };
