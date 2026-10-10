#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { writeVersion } = require("./write-version");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(PROJECT_ROOT, "public/data/tabelas");

function slug(text) {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\u0300-\u036f/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function parseFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return { body: md };
  const meta = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([\w-]+):\s*(.+)$/);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  return { ...meta, body: md.slice(m[0].length) };
}

function parseTableFromBody(body) {
  const section = body.split(/##\s*Tabela/i)[1] || body;
  const lines = section.split("\n").filter((l) => l.trim().startsWith("|"));
  if (lines.length < 2) return null;
  const headers = lines[0]
    .split("|")
    .map((c) => c.trim())
    .filter(Boolean);
  const rows = [];
  for (let i = 2; i < lines.length; i++) {
    const cells = lines[i]
      .split("|")
      .map((c) => c.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
    if (
      cells.length &&
      !cells.every((c) => /^-+$/.test(c) || String(c).trim() === "")
    ) {
      rows.push(cells);
    }
  }
  return { headers, rows };
}

function metaFromSkillBody(body, filePath) {
  const nome = body.match(/\*\*Nome:\*\*\s*(\S+)/)?.[1];
  const titulo = body.match(/^#\s+(.+)/m)?.[1]?.trim();
  const rolagem = body.match(/\*\*Rolagem:\*\*\s*`?([^`\n]+)`?/)?.[1]?.trim();
  const parent = path.basename(path.dirname(filePath));
  return {
    id: nome || slug(path.basename(filePath, ".md")),
    titulo: titulo || nome || path.basename(filePath, ".md"),
    categoria: parent,
    rolagem: rolagem || "d6",
  };
}

function walkMd(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walkMd(p, acc);
    else if (name.endsWith(".md")) acc.push(p);
  }
  return acc;
}

function main() {
  const root = process.argv[2];
  if (!root || !fs.existsSync(root)) {
    console.error("Uso: node scripts/migrate-tabelas-shadowdark.js <Tabelas/>");
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const index = [];
  for (const file of walkMd(path.resolve(root))) {
    const raw = fs.readFileSync(file, "utf8");
    const fm = parseFrontmatter(raw);
    const table = parseTableFromBody(fm.body);
    if (!table || table.rows.length === 0) continue;

    const skillMeta = metaFromSkillBody(fm.body, file);
    const id = fm.id || skillMeta.id;
    const categoria =
      fm.categoria || skillMeta.categoria || path.basename(path.dirname(file));
    const subcategoria =
      fm.subcategoria ||
      (categoria === "encontros" ? path.basename(path.dirname(file)) : undefined);
    const entry = {
      id,
      titulo: fm.titulo || skillMeta.titulo,
      categoria,
      subcategoria,
      rolagem: fm.rolagem || skillMeta.rolagem,
      headers: table.headers,
      rows: table.rows,
    };
    const outFile = path.join(OUT_DIR, `${id}.json`);
    fs.writeFileSync(outFile, JSON.stringify(entry, null, 2));
    index.push({
      id,
      titulo: entry.titulo,
      categoria,
      subcategoria: entry.subcategoria,
      rolagem: entry.rolagem,
    });
  }
  index.sort((a, b) =>
    a.categoria.localeCompare(b.categoria, "pt-BR") ||
    a.titulo.localeCompare(b.titulo, "pt-BR"),
  );
  fs.writeFileSync(
    path.join(OUT_DIR, "tabelas-index.json"),
    JSON.stringify({ tabelas: index }, null, 2),
  );
  console.log("Tabelas:", index.length);
  writeVersion(PROJECT_ROOT);
}

if (require.main === module) main();

module.exports = { parseTableFromBody, metaFromSkillBody };
