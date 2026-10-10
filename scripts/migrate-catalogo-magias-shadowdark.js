#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { writeVersion } = require("./write-version");
const {
  spellId,
  formatSpellDisplayName,
  resolveSpellTitle,
  stripRedundantSpellLead,
  stripSpellBodyArtifacts,
} = require("./magias-shadowdark-parse");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUT_PATH = path.join(PROJECT_ROOT, "public/data/catalogo/magias.json");

function parseGrauLine(line) {
  const listas = [];
  const grau = {};
  const m = line.match(/^\*Grau:\s*(.+)\*$/i);
  if (!m) return { listas, grau };
  const raw = m[1];
  const pairRe =
    /(Mago|Sacerdote|Bruxa|Vidente|Druida|Feiticeiro|mago|sacerdote|bruxa|vidente|druida|feiticeiro)\s+(\d+)/gi;
  let pm;
  while ((pm = pairRe.exec(raw)) !== null) {
    const slug = pm[1].toLowerCase();
    const n = parseInt(pm[2], 10);
    if (!listas.includes(slug)) listas.push(slug);
    grau[slug] = n;
  }
  return { listas, grau };
}

function parseListaLine(line) {
  const listas = [];
  const grau = {};
  const m = line.match(/^\*Lista:\s*(.+)\*$/i);
  if (!m) return { listas, grau };
  const raw = m[1];
  const fromGrau = parseGrauLine(`*Grau: ${raw.replace(/^Grau\s+/i, "")}*`);
  if (fromGrau.listas.length) return fromGrau;
  const lower = raw.toLowerCase();
  if (lower.includes("mago")) listas.push("mago");
  if (lower.includes("sacerdote")) listas.push("sacerdote");
  if (lower.includes("bruxa")) listas.push("bruxa");
  if (lower.includes("vidente")) listas.push("vidente");
  if (lower.includes("druida")) listas.push("druida");
  if (lower.includes("feiticeiro")) listas.push("feiticeiro");
  const magoG = raw.match(/mago\s+(\d+)/i);
  const sacG = raw.match(/sacerdote\s+(\d+)/i);
  const grauOnly = raw.match(/Grau\s+(\d+)/i);
  if (magoG) grau.mago = parseInt(magoG[1], 10);
  if (sacG) grau.sacerdote = parseInt(sacG[1], 10);
  if (!magoG && !sacG && grauOnly && listas.length === 1) {
    grau[listas[0]] = parseInt(grauOnly[1], 10);
  }
  if (!magoG && !sacG && grauOnly && listas.length === 2) {
    grau[listas[0]] = parseInt(grauOnly[1], 10);
    grau[listas[1]] = parseInt(grauOnly[1], 10);
  }
  return { listas, grau };
}

function parseMetaLine(line, key) {
  const re = new RegExp(`^\\*${key}:\\s*(.+)\\*$`, "i");
  const m = line.trim().match(re);
  return m ? m[1].trim() : null;
}

function migrateFromMd(md) {
  const magias = [];
  const blocks = md.split(/\n###\s+/).slice(1);
  for (const block of blocks) {
    const lines = block.split("\n");
    const nome = resolveSpellTitle(lines[0].trim());
    if (!nome) continue;

    let origem = "livro";
    let origens = [];
    let listas = [];
    let grau = {};
    let duracao = null;
    let alcance = null;
    let ritual = false;
    const bodyLines = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const o = parseMetaLine(line, "Origem");
      if (o) {
        origem = o;
        origens = [o];
        continue;
      }
      const os = parseMetaLine(line, "Origens");
      if (os) {
        origens = os
          .split(/\s*·\s*|\s*,\s*/)
          .map((s) => s.trim())
          .filter(Boolean);
        origem = origens[0] || origem;
        continue;
      }
      if (/^\*Grau:/i.test(line.trim())) {
        const parsed = parseGrauLine(line.trim());
        listas = parsed.listas;
        grau = parsed.grau;
        continue;
      }
      if (/^\*Lista:/i.test(line.trim())) {
        const parsed = parseListaLine(line.trim());
        listas = parsed.listas;
        grau = parsed.grau;
        continue;
      }
      const d = parseMetaLine(line, "Duração");
      if (d) {
        duracao = d;
        continue;
      }
      const a = parseMetaLine(line, "Alcance");
      if (a) {
        alcance = a;
        continue;
      }
      const r = parseMetaLine(line, "Ritual");
      if (r) {
        ritual = /^sim$/i.test(r);
        continue;
      }
      bodyLines.push(line);
    }

    let descricao = bodyLines.join("\n").trim();
    descricao = descricao.replace(/^\n+/, "");
    const spellMeta = { duracao, alcance, ritual, listas, grau };
    descricao = stripSpellBodyArtifacts(
      stripRedundantSpellLead(descricao, spellMeta),
    );

    const entry = {
      id: spellId(nome, origem),
      nome,
      descricao,
      origem,
      listas,
      grau,
    };
    if (origens.length > 1) entry.origens = origens;
    if (duracao) entry.duracao = duracao;
    if (alcance) entry.alcance = alcance;
    if (ritual) entry.ritual = true;
    magias.push(entry);
  }

  magias.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  return { magias };
}

function main() {
  const mdPath = process.argv[2];
  if (!mdPath || !fs.existsSync(mdPath)) {
    console.error(
      "Uso: node scripts/migrate-catalogo-magias-shadowdark.js <Grimório.md>",
    );
    process.exit(1);
  }
  const md = fs.readFileSync(mdPath, "utf8");
  const data = migrateFromMd(md);
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(data, null, 2));
  console.log("Magias:", data.magias.length, "→", OUT_PATH);
  writeVersion(PROJECT_ROOT);
}

if (require.main === module) main();

module.exports = { migrateFromMd, parseListaLine, parseGrauLine };
