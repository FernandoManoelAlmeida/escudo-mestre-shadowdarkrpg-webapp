#!/usr/bin/env node
/**
 * Preenche coluna Cadeia e cadeia_default nos MD de encontros no vault Fantasia.
 * Uso: node scripts/apply-encounter-cadeia-vault.js [path/Tabelas]
 */
const fs = require("fs");
const path = require("path");
const {
  inferCadeiaForRow,
  defaultCadeiaForTable,
  normalizeCadeiaCell,
  URBAN_TABLE_IDS,
} = require("./encounter-cadeia-lib");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const defaultVault = path.resolve(PROJECT_ROOT, "..", "shadowdarkrpg-fantasia");
const tabelasRoot = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(
      defaultVault,
      "Referências",
      "shadowdark",
      "Tabelas",
    );

const encontrosDir = path.join(tabelasRoot, "encontros");

function parseFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return { body: md, metaLines: [] };
  const metaLines = m[1].split("\n");
  const meta = {};
  for (const line of metaLines) {
    const kv = line.match(/^([\w-]+):\s*(.+)$/);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  return { ...meta, body: md.slice(m[0].length), metaLines, fmRaw: m[1] };
}

function parseTableRows(body) {
  const section = body.split(/##\s*Tabela/i)[1] || body;
  const lines = section.split("\n");
  const tableLines = [];
  let inTable = false;
  for (const line of lines) {
    if (line.trim().startsWith("|")) {
      inTable = true;
      tableLines.push(line);
    } else if (inTable && !line.trim()) {
      break;
    } else if (inTable) {
      break;
    }
  }
  if (tableLines.length < 2) return null;

  const headers = tableLines[0]
    .split("|")
    .map((c) => c.trim())
    .filter(Boolean);
  const cadeiaCol = headers.findIndex((h) => /^cadeia$/i.test(h));
  const rows = [];
  for (let i = 2; i < tableLines.length; i++) {
    const cells = tableLines[i]
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
  return { headers, rows, tableLines, cadeiaCol };
}

function rebuildTable(headers, rows) {
  const sep = "| " + headers.map(() => "---").join(" | ") + " |";
  const headerLine = "| " + headers.join(" | ") + " |";
  const dataLines = rows.map((cells) => "| " + cells.join(" | ") + " |");
  return [headerLine, sep, ...dataLines].join("\n");
}

function walkMd(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walkMd(p, acc);
    else if (name.endsWith(".md")) acc.push(p);
  }
  return acc;
}

function updateFrontmatterCadeiaDefault(fmRaw, tableId) {
  const def = defaultCadeiaForTable(tableId);
  const lines = fmRaw.split("\n").filter((l) => !/^cadeia_default:/.test(l));
  if (def === "cena") {
    lines.push("cadeia_default: cena");
  }
  return lines.join("\n");
}

function processFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const fm = parseFrontmatter(raw);
  const id = fm.id || path.basename(filePath, ".md");
  if (!id.startsWith("encontro-")) return null;
  if (
    [
      "teste-encontro",
      "distancia-inicial-encontro",
      "atividade-criaturas",
      "nivel-perigo",
    ].includes(id)
  ) {
    return null;
  }

  const parsed = parseTableRows(fm.body);
  if (!parsed) return null;

  let headers = [...parsed.headers];
  let cadeiaCol = parsed.cadeiaCol;
  if (cadeiaCol < 0) {
    headers = [...headers, "Cadeia"];
    cadeiaCol = headers.length - 1;
  }

  const textCol = headers.findIndex((h) => /resultado/i.test(h));
  const rangeCol = textCol > 0 ? 0 : 0;
  const resultadoCol = textCol >= 0 ? textCol : 1;

  const newRows = parsed.rows.map((cells) => {
    const range = cells[rangeCol] ?? cells[0];
    let texto = cells[resultadoCol] ?? cells[1] ?? "";
    const cadeia = inferCadeiaForRow(id, texto);
    const out = [range, texto, cadeia];
    return out;
  });

  const newTable = rebuildTable(
    headers.length >= 3 ? headers : ["d100", "Resultado", "Cadeia"],
    newRows,
  );

  const bodyParts = fm.body.split(/##\s*Tabela/i);
  const before = bodyParts[0];
  const afterTable = (bodyParts[1] || "").split("\n");
  let afterRest = "";
  let skipped = 0;
  for (const line of afterTable) {
    if (skipped < 2 + parsed.rows.length && line.trim().startsWith("|")) {
      skipped++;
      continue;
    }
    if (skipped > 0) {
      afterRest += line + "\n";
    }
  }

  const newBody = `${before}## Tabela\n\n${newTable}\n${afterRest}`.trimEnd() + "\n";

  const newFm =
    fm.fmRaw != null
      ? updateFrontmatterCadeiaDefault(fm.fmRaw, id)
      : "";
  const outMd = `---\n${newFm}\n---\n${newBody}`;
  fs.writeFileSync(filePath, outMd);
  return { id, rows: newRows.length };
}

function main() {
  if (!fs.existsSync(encontrosDir)) {
    console.error("Pasta encontros não encontrada:", encontrosDir);
    process.exit(1);
  }
  const files = walkMd(encontrosDir);
  const done = [];
  for (const f of files) {
    const r = processFile(f);
    if (r) done.push(r);
  }
  console.log("Tabelas atualizadas:", done.length);
  for (const d of done) console.log(" ", d.id, d.rows, "linhas");
}

if (require.main === module) main();
