#!/usr/bin/env node
/**
 * Migra criaturas Shadowdark (Bestiário.md + fichas avulsas) para public/data/ameacas.json.
 */
const fs = require("fs");
const path = require("path");
const { writeVersion } = require("./write-version");
const {
  sanitizeHomebrewCreature,
  slugFromNome,
} = require("./astraldark-public-glossary");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUT_PATH = path.join(PROJECT_ROOT, "public/data/ameacas.json");

const SKIP_FILES = new Set([
  "ameacamodelo.md",
  "bestiário.md",
  "bestiario.md",
]);

function slug(nome) {
  return slugFromNome(nome);
}

function normalizeMd(text) {
  return text.replace(/\r\n/g, "\n").replace(/Adja-\s*\n\s*cente/gi, "Adjacente");
}

function parseStatsLine(line) {
  const cleaned = line.replace(/\s+/g, " ").trim();
  const caNum = cleaned.match(/CA\s+(\d+)/i);
  const pv = cleaned.match(/PV\s+(\d+)/i);
  const atq = cleaned.match(/ATQ\s+([^,]+?)(?=,\s*MV)/i);
  const mv = cleaned.match(/MV\s+([^,]+?)(?=,\s*F)/i);
  const attrs = cleaned.match(
    /F\s*([+-]?\d+)\s*,\s*D\s*([+-]?\d+)\s*,\s*C\s*([+-]?\d+)\s*,\s*I\s*([+-]?\d+)\s*,\s*S\s*([+-]?\d+)\s*,\s*Car\s*([+-]?\d+)/i,
  );
  const al = cleaned.match(/AL\s+([ONC])/i);
  const nv = cleaned.match(/NV\s+(\d+)/i);
  if (!caNum || !pv || !nv) return null;
  return {
    ca: parseInt(caNum[1], 10),
    pv: parseInt(pv[1], 10),
    atq: atq ? atq[1].trim() : "",
    mv: mv ? mv[1].trim() : "",
    atributos: attrs
      ? {
          F: parseInt(attrs[1], 10),
          D: parseInt(attrs[2], 10),
          C: parseInt(attrs[3], 10),
          I: parseInt(attrs[4], 10),
          S: parseInt(attrs[5], 10),
          Car: parseInt(attrs[6], 10),
        }
      : { F: 0, D: 0, C: 0, I: 0, S: 0, Car: 0 },
    al: al ? al[1] : "N",
    nv: parseInt(nv[1], 10),
  };
}

function parseFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([\w-]+):\s*(.+)$/);
    if (kv) out[kv[1].toLowerCase()] = kv[2].trim();
  }
  return out;
}

function extractTipo(lines, statsIdx, options = {}) {
  const { origem } = options;
  for (let i = 0; i < statsIdx; i++) {
    const line = lines[i].trim();
    const m = line.match(/^\*\*([^*]+)\*\*\.?\s*(.*)$/);
    if (!m) continue;
    const label = m[1].trim();
    if (/^(Tesouro|Comportamento)$/i.test(label)) continue;
    if (/^índice por nv/i.test(label)) continue;
    const cleanLabel = label.replace(/\.+$/, "").trim();
    if (origem === "homebrew") {
      return cleanLabel;
    }
    const rest = m[2]?.trim();
    return rest ? `${cleanLabel}. ${rest}` : cleanLabel;
  }
  return undefined;
}

function parseTracos(lines, statsIdx) {
  const tracos = [];
  let i = statsIdx + 1;
  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();
    if (line === "---") break;
    if (line.startsWith("**Tesouro:**") || line.startsWith("**Comportamento:**"))
      break;
    if (
      line.startsWith("*Fonte:") ||
      line.startsWith("[[") ||
      line.startsWith("#") ||
      /^\*Adaptação do hub/i.test(line) ||
      /dndbeyond\.com/i.test(line)
    )
      break;
    if (!line) {
      i++;
      continue;
    }
    const traitMatch = line.match(/^(.+?)\.\s+(.+)$/);
    if (traitMatch && traitMatch[1].length < 120) {
      tracos.push({
        nome: traitMatch[1].trim(),
        descricao: traitMatch[2].trim(),
      });
    } else if (tracos.length > 0 && line && !line.startsWith("**")) {
      const last = tracos[tracos.length - 1];
      last.descricao = `${last.descricao} ${line}`.trim();
    }
    i++;
  }
  return tracos;
}

function parseCreatureBlock(block, defaults) {
  const lines = block.split("\n");
  const head = lines.find((l) => l.startsWith("### "));
  if (!head) return null;
  const titleRaw = head.replace(/^###\s+/, "").trim();
  if (!titleRaw || /modelo/i.test(titleRaw)) return null;

  let nome = titleRaw;
  let epitet;
  if (titleRaw.includes(",")) {
    const parts = titleRaw.split(",").map((p) => p.trim());
    nome = parts[0];
    epitet = parts.slice(1).join(", ");
  }

  const flavorMatch = block.match(/\n\*([^*]+)\*\s*\n/);
  const flavor = flavorMatch ? flavorMatch[1].trim() : undefined;

  const statsLine = lines.find((l) => /^CA\s+\d/i.test(l.trim()));
  if (!statsLine) return null;
  const stats = parseStatsLine(statsLine);
  if (!stats) return null;

  const statsIdx = lines.findIndex((l) => l.trim() === statsLine.trim());
  const fm = defaults.frontmatter || {};
  const origem =
    fm.origem === "oficial" || fm.origem === "homebrew"
      ? fm.origem
      : defaults.origem;

  const tipo = extractTipo(lines, statsIdx, { origem });
  const tracos = parseTracos(lines, statsIdx);
  const fonteItalic = block.match(/\*Fonte:\s*([^*]+)\*/i)?.[1]?.trim();
  const fonte = fm.fonte || fonteItalic || defaults.fonte;

  let creature = {
    id: slug(nome),
    nome,
    epitet,
    flavor,
    tipo,
    ...stats,
    tracos,
    fonte,
    origem,
    tags: tipo ? [tipo.split("(")[0].trim()] : [],
  };

  if (origem === "homebrew") {
    creature = sanitizeHomebrewCreature(creature);
  }

  return creature;
}

function splitCreatureBlocksFromBody(body) {
  const normalized = normalizeMd(body);
  const parts = normalized.split(/\n(?=###\s+)/);
  const blocks = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed.startsWith("### ")) continue;
    if (!/^CA\s+\d/im.test(trimmed)) continue;
    blocks.push(trimmed);
  }
  return blocks;
}

function parseBestiario(md) {
  const normalized = normalizeMd(md);
  const parts = normalized.split(/\n###\s+/);
  const creatures = [];
  for (let i = 1; i < parts.length; i++) {
    const c = parseCreatureBlock("### " + parts[i], {
      origem: "oficial",
      fonte: "Bestiário",
    });
    if (c) creatures.push(c);
  }
  return creatures;
}

function stripAttributionFooter(body) {
  const idx = body.lastIndexOf("\n---\n");
  if (idx === -1) return body;
  const tail = body.slice(idx + 5);
  if (
    tail.length < 700 &&
    /dndbeyond|Monster Manual|Wizards of the Coast|Adaptação do hub/i.test(tail)
  ) {
    return body.slice(0, idx);
  }
  return body;
}

function parseAvulsaFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const fm = parseFrontmatter(raw);
  let body = raw.replace(/^---\n[\s\S]*?\n---\n/, "");
  body = stripAttributionFooter(body);

  const blocks = splitCreatureBlocksFromBody(body);
  const defaults = {
    origem: fm.origem === "oficial" ? "oficial" : "homebrew",
    fonte:
      blocks.length === 1 ? fm.fonte?.trim() || undefined : undefined,
    frontmatter: fm,
  };
  if (blocks.length === 0) {
    const block = body.includes("### ")
      ? body
      : `### ${path.basename(filePath, ".md")}\n${body}`;
    const single = parseCreatureBlock(block, defaults);
    return single ? [single] : [];
  }

  const creatures = [];
  for (const block of blocks) {
    const c = parseCreatureBlock(block, defaults);
    if (c) creatures.push(c);
  }
  return creatures;
}

function uniqueId(map, creature) {
  let id = creature.id;
  let n = 2;
  while (map.has(id) && map.get(id).nome !== creature.nome) {
    id = `${creature.id}-${n}`;
    n++;
  }
  return { ...creature, id };
}

function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error("Uso: node scripts/migrate-ameacas-shadowdark.js <pasta Ameaças>");
    process.exit(1);
  }
  const ameacasDir = path.resolve(arg);
  const bestiarioPath = path.join(ameacasDir, "Bestiário.md");
  const map = new Map();

  if (fs.existsSync(bestiarioPath)) {
    const list = parseBestiario(fs.readFileSync(bestiarioPath, "utf8"));
    for (const c of list) map.set(c.id, c);
    console.log("Bestiário:", list.length, "verbetes");
  }

  if (fs.statSync(ameacasDir).isDirectory()) {
    for (const name of fs.readdirSync(ameacasDir)) {
      if (!name.endsWith(".md")) continue;
      const base = name.toLowerCase();
      if (SKIP_FILES.has(base) || base === "bestiário.md") continue;
      const list = parseAvulsaFile(path.join(ameacasDir, name));
      for (const c of list) {
        const entry = uniqueId(map, c);
        map.set(entry.id, entry);
      }
      if (list.length) {
        console.log(
          "Avulsa:",
          name,
          "→",
          list.map((c) => c.id).join(", "),
          `(${list[0].origem})`,
        );
      }
    }
  }

  const ameacas = [...map.values()].sort(
    (a, b) => a.nv - b.nv || a.nome.localeCompare(b.nome, "pt-BR"),
  );

  const emptyTraits = ameacas.filter((a) => a.tracos.length === 0).length;
  if (emptyTraits > 0) {
    console.warn("Aviso:", emptyTraits, "criaturas sem traços no JSON");
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify({ ameacas }, null, 2), "utf8");
  console.log("Total:", ameacas.length, "→", OUT_PATH);
  writeVersion(PROJECT_ROOT);
}

if (require.main === module) main();

module.exports = {
  parseStatsLine,
  parseCreatureBlock,
  slug,
  parseTracos,
  splitCreatureBlocksFromBody,
  parseAvulsaFile,
  extractTipo,
  stripAttributionFooter,
};
