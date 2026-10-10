#!/usr/bin/env node
/**
 * Extrai tabelas TESOUROS 0–3, 4–6, 7–9, 10+ do Livro para MD d100.
 * Uso: node scripts/extract-tesouros-livro-shadowdark.js <Livro.md> <Tabelas/tesouros/>
 */
const fs = require("fs");
const path = require("path");

const BANDS = [
  { key: "0–3", id: "tesouros-0-3", titulo: "Tesouros 0–3" },
  { key: "4–6", id: "tesouros-4-6", titulo: "Tesouros 4–6" },
  { key: "7–9", id: "tesouros-7-9", titulo: "Tesouros 7–9" },
  { key: "10+", id: "tesouros-10-mais", titulo: "Tesouros 10+" },
];

function normalizeRange(cell) {
  return cell.replace(/\u2013|\u2014/g, "–").trim();
}

function parseSectionRows(sectionText) {
  const rows = [];
  const tableRe =
    /\|[^\n]+\|\n\|[-\s:|]+\|\n(?:\|[^\n]+\|\n?)+/g;
  let m;
  while ((m = tableRe.exec(sectionText)) !== null) {
    const lines = m[0].trim().split("\n").filter(Boolean);
    for (let i = 2; i < lines.length; i++) {
      const cells = lines[i]
        .split("|")
        .map((c) => c.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (cells.length >= 2) {
        rows.push([normalizeRange(cells[0]), cells.slice(1).join(" — ")]);
      }
    }
  }
  const lineRe =
    /^(\d{2}(?:\s*[–-]\s*\d{2})?|\d{2}|00)\s*([^\n|].+)$/gm;
  while ((m = lineRe.exec(sectionText)) !== null) {
    const range = normalizeRange(m[1]);
    const text = m[2].trim().replace(/^\*|\*$/g, "");
    if (text.length > 2 && !rows.some((r) => r[0] === range && r[1] === text)) {
      rows.push([range, text]);
    }
  }
  return rows;
}

function writeMd(outDir, band, rows) {
  const dedup = [];
  const seen = new Set();
  for (const r of rows) {
    const key = `${r[0]}|${r[1]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    dedup.push(r);
  }
  dedup.sort((a, b) => {
    const na = parseInt(a[0].replace(/[^\d]/g, "").slice(0, 2) || "0", 10);
    const nb = parseInt(b[0].replace(/[^\d]/g, "").slice(0, 2) || "0", 10);
    return na - nb;
  });
  const lines = [
    "---",
    `id: ${band.id}`,
    `titulo: ${band.titulo}`,
    `categoria: tesouros`,
    `subcategoria: ${band.id.replace("tesouros-", "")}`,
    `rolagem: d100`,
    "---",
    "",
    `# ${band.titulo}`,
    "",
    "## Tabela",
    "",
    "| d100 | Resultado |",
    "| --- | --- |",
    ...dedup.map((r) => `| ${r[0]} | ${r[1]} |`),
    "",
  ];
  const outPath = path.join(outDir, `${band.id}.md`);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, lines.join("\n"), "utf8");
  console.log(band.id, "linhas:", dedup.length, "→", outPath);
}

function main() {
  const [livroPath, outDir] = process.argv.slice(2);
  if (!livroPath || !outDir) {
    console.error(
      "Uso: node extract-tesouros-livro-shadowdark.js <livro.md> <Tabelas/tesouros/>",
    );
    process.exit(1);
  }
  const livro = fs.readFileSync(path.resolve(livroPath), "utf8");
  const start = livro.indexOf("## TABELAS DE TESOUROS");
  const chunk = start >= 0 ? livro.slice(start) : livro;

  for (const band of BANDS) {
    const re = new RegExp(
      `### TESOUROS ${band.key.replace("+", "\\+")}([\\s\\S]*?)(?=### TESOUROS|# [^#]|$)`,
      "i",
    );
    const m = chunk.match(re);
    const section = m ? m[1] : "";
    const rows = parseSectionRows(section);
    writeMd(path.resolve(outDir), band, rows);
  }
}

if (require.main === module) main();
