#!/usr/bin/env node
/**
 * Extrai itens mágicos do capítulo # Itens Mágicos do Livro de Regras pt-BR.
 * Uso: node scripts/extract-itens-magicos-livro-shadowdark.js <livro.md> <Itens Mágicos.md> [--append-cursed-scroll <file.md>]
 */
const fs = require("fs");
const path = require("path");

function isItemTitle(title) {
  const t = title.trim();
  if (!t || t.length < 3) return false;
  if (/^[“"']/.test(t)) return false;
  if (/você já viu|santa terragnis usou/i.test(t)) return false;
  if (!/^[A-ZÁÉÍÓÚÃÕÇ0-9]/.test(t)) return false;
  return true;
}

function slug(nome) {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/\u0300-\u036f/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractChapter(livro) {
  const start = livro.search(/^# Itens Mágicos\s*$/m);
  if (start < 0) return [];
  const rest = livro.slice(start);
  const end = rest.slice(1).search(/^# [^#]/m);
  const chapter = end >= 0 ? rest.slice(0, end + 1) : rest;
  const parts = chapter.split(/\n###\s+/).slice(1);
  const items = [];
  for (const part of parts) {
    const lines = part.split("\n");
    const nome = lines[0].trim();
    if (!isItemTitle(nome)) continue;
    const body = lines.slice(1).join("\n").trim();
    if (!/benefício|bonus|bônus|maldição|personalidade/i.test(body)) continue;
    items.push({ nome, descricao: body, origem: "livro" });
  }
  return items;
}

function extractFromCursedScroll(md, scrollId) {
  const parts = md.split(/\n###\s+/).slice(1);
  const items = [];
  for (const part of parts) {
    const lines = part.split("\n");
    const nome = lines[0].trim();
    if (!isItemTitle(nome)) continue;
    const body = lines.slice(1).join("\n").trim();
    if (!/benefício|bonus|bônus|maldição|personalidade/i.test(body)) continue;
    items.push({ nome, descricao: body, origem: scrollId });
  }
  return items;
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
  let items = extractChapter(livro);
  for (let i = 2; i < args.length; i++) {
    if (args[i] === "--append-cursed-scroll" && args[i + 1]) {
      const cs = fs.readFileSync(path.resolve(args[i + 1]), "utf8");
      const id = path.basename(args[i + 1], ".md");
      items = items.concat(extractFromCursedScroll(cs, id));
      i++;
    }
  }
  fs.mkdirSync(path.dirname(path.resolve(outMd)), { recursive: true });
  fs.writeFileSync(path.resolve(outMd), toCatalogMd(items), "utf8");
  console.log("Itens extraídos:", items.length, "→", outMd);
}

if (require.main === module) main();
