#!/usr/bin/env node
/**
 * Extrai itens mágicos do capítulo # Itens Mágicos do Livro de Regras pt-BR.
 * Uso: node scripts/extract-itens-magicos-livro-shadowdark.js <livro.md> <Itens Mágicos.md> [--append-cursed-scroll <file.md>]
 */
const fs = require("fs");
const path = require("path");
const { parseItensFromMd, slug } = require("./catalogo-itens-magicos-lib");

function extractChapter(livro) {
  const start = livro.search(/^# Itens Mágicos\s*$/m);
  if (start < 0) return { itens: [], skipped: [] };
  const rest = livro.slice(start);
  const end = rest.slice(1).search(/^# [^#]/m);
  const chapter = end >= 0 ? rest.slice(0, end + 1) : rest;
  return parseItensFromMd(chapter, { origemDefault: "livro" });
}

function extractFromCursedScroll(md, scrollId) {
  const { itens, skipped } = parseItensFromMd(md, { origemDefault: scrollId });
  const tagged = itens.map((it) => ({
    ...it,
    origem: scrollId,
  }));
  return { itens: tagged, skipped };
}

function toCatalogMd(items) {
  const lines = [
    "# Catálogo — Itens mágicos",
    "",
    "Fonte: Livro de Regras Shadowdark pt-BR (+ Cursed Scrolls quando indicado).",
    "",
  ];
  const seen = new Set();
  for (const it of items) {
    const key = slug(it.nome);
    if (seen.has(key)) continue;
    seen.add(key);
    lines.push(`### ${it.nome}`);
    if (it.origem !== "livro") {
      lines.push(`*Origem: ${it.origem}*`);
      lines.push("");
    }
    lines.push(it.descricao);
    lines.push("");
  }
  return lines.join("\n");
}

function main() {
  const args = process.argv.slice(2);
  const livroPath = args[0];
  const outMd = args[1];
  if (!livroPath || !outMd) {
    console.error(
      "Uso: node extract-itens-magicos-livro-shadowdark.js <livro.md> <Itens Mágicos.md> [--append-cursed-scroll file.md ...]",
    );
    process.exit(1);
  }
  const livro = fs.readFileSync(path.resolve(livroPath), "utf8");
  let items = [];
  let skippedTotal = [];

  const fromLivro = extractChapter(livro);
  items = items.concat(fromLivro.itens);
  skippedTotal = skippedTotal.concat(fromLivro.skipped);

  for (let i = 2; i < args.length; i++) {
    if (args[i] === "--append-cursed-scroll" && args[i + 1]) {
      const csPath = path.resolve(args[i + 1]);
      const cs = fs.readFileSync(csPath, "utf8");
      const id = path.basename(args[i + 1], ".md");
      const { itens, skipped } = extractFromCursedScroll(cs, id);
      console.log(`CS ${id}: +${itens.length} itens, ${skipped.length} ignorados`);
      items = items.concat(itens);
      skippedTotal = skippedTotal.concat(skipped);
      i++;
    }
  }

  const seen = new Set();
  const deduped = [];
  for (const it of items) {
    const key = slug(it.nome);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(it);
  }

  fs.mkdirSync(path.dirname(path.resolve(outMd)), { recursive: true });
  fs.writeFileSync(path.resolve(outMd), toCatalogMd(deduped), "utf8");
  console.log("Itens extraídos:", deduped.length, "ignorados:", skippedTotal.length, "→", outMd);
}

if (require.main === module) main();

module.exports = { extractChapter, extractFromCursedScroll, toCatalogMd };
