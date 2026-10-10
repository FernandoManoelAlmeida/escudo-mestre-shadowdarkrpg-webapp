#!/usr/bin/env node
/**
 * Migra regras Shadowdark de um arquivo Markdown para public/data/escudo-shadowdark.json.
 * Use --update para mesclar com o JSON existente (preserva meta/tables/glossary não presentes no MD).
 *
 * Formato do Markdown:
 *   # Título do documento
 *   Descrição (opcional). Fontes: A, B (opcional).
 *
 *   ## 1. Nome da seção
 *   ### 1.1 Nome da subseção
 *   Conteúdo em parágrafos...
 *   tableRef: id_da_tabela   (opcional)
 *   formulas:                (opcional)
 *   - Fórmula 1
 *   - Fórmula 2
 *
 *   ## Tabelas
 *   ### id_tabela
 *   | Col1   | Col2   |
 *   | ---    | ---    |
 *   | val1   | val2   |
 *
 *   ## Glossário
 *   | term | fullName | description |
 *   | ---  | ---      | ---          |
 *   | AGI  | Agilidade | ...         |
 *
 * Uso:
 *   node scripts/migrate-regras.js <caminho/para/regras.md>
 *   node scripts/migrate-regras.js <caminho/para/regras.md> --update
 */
const fs = require("fs");
const path = require("path");
const { writeVersion } = require("./write-version");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUT_PATH = path.join(PROJECT_ROOT, "public/data/escudo-shadowdark.json");

function slug(text) {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\u0300-\u036f/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");
}

function anchor(id, title) {
  return id + "-" + slug(title);
}

/** Parse meta do início do MD: # Título, descrição, Fontes: */
function parseMeta(md) {
  const lines = md.split("\n").map((l) => l.trim());
  let title = "Escudo do Mestre Shadowdark";
  let description = "";
  const sources = [];

  const firstH1 = lines.find((l) => l.startsWith("# ") && !l.startsWith("## "));
  if (firstH1) title = firstH1.replace(/^#+\s*/, "").trim();

  let i = lines.findIndex((l) => l.startsWith("# "));
  if (i >= 0) {
    i++;
    while (i < lines.length && !lines[i].startsWith("## ")) {
      const line = lines[i];
      if (line.startsWith("Fontes:") || line.startsWith("sources:")) {
        const part = line.replace(/^(Fontes|sources):\s*/i, "").trim();
        sources.push(
          ...part
            .split(/[,;]/)
            .map((s) => s.trim())
            .filter(Boolean),
        );
      } else if (line && !line.startsWith("#")) {
        if (description) description += " ";
        description += line;
      }
      i++;
    }
  }

  return {
    title,
    description: description || "Referência das regras.",
    sources: sources.length
      ? sources
      : [
          "Livro de Regras Shadowdark pt-BR",
          "Referências shadowdarkrpg-fantasia",
        ],
  };
}

/** Parse uma tabela em markdown (| a | b |). Retorna { headers, rows }. */
function parseMarkdownTable(tableBlock) {
  const lines = tableBlock
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return null;
  const sep = lines[1];
  if (!/^\|?[\s\-:]+\|/.test(sep)) return null;

  const toCells = (line) =>
    line
      .split("|")
      .map((c) => c.trim())
      .filter((c, i, arr) => i > 0 && i < arr.length - 1);
  const headerLabels = toCells(lines[0]);
  const headerKeys = headerLabels.map((h) => (slug(h) || h).toLowerCase());
  const rows = [];
  for (let i = 2; i < lines.length; i++) {
    const cells = toCells(lines[i]);
    const row = {};
    headerKeys.forEach((k, j) => {
      let val = cells[j] ?? "";
      if (k === "dt" && /^\d+$/.test(val)) val = parseInt(val, 10);
      row[k] = val;
    });
    const allEmpty = Object.values(row).every(
      (v) => String(v ?? "").trim() === "",
    );
    if (!allEmpty) rows.push(row);
  }
  return { headers: headerLabels, rows };
}

/** Extrai tableRef: id do corpo da subseção (início ou após newline). */
function extractTableRefFromBody(body) {
  let rest = body;
  let tableRef = null;
  const m = rest.match(/(?:^|\n)tableRef:\s*(\S+)/i);
  if (m) {
    tableRef = m[1].trim();
    rest = rest.replace(/(?:^|\n)tableRef:\s*\S+.*/i, "").trim();
  }
  return { tableRef, body: rest };
}

/** Encontra o primeiro bloco de tabela markdown no texto. Retorna { tableBlock, rest } ou null. */
function extractFirstTableBlock(text) {
  const re = /(?:^|\n+)(\|[^\n]+\|\n\|[^\n]+\|\n(?:\|[^\n]+\|\n?)*)/;
  const m = text.match(re);
  if (!m) return null;
  const tableBlock = m[1].trim();
  const rest = text
    .replace(m[0], "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { tableBlock, rest };
}

/** Glossário padrão quando o MD não tem seção Glossário nem tabela Termos importantes. */
const GLOSSARIO_PADRAO = [
  {
    term: "CD",
    fullName: "Classe de Dificuldade",
    description: "Número que o teste d20 + modificadores deve igualar ou superar.",
  },
  {
    term: "CA",
    fullName: "Classe de Armadura",
    description: "Dificuldade para acertar a criatura em combate.",
  },
  {
    term: "PV",
    fullName: "Pontos de Vida",
    description: "Saúde. A 0 PV, testes de morte ou inconsciência conforme as regras.",
  },
  {
    term: "NV",
    fullName: "Nível",
    description: "Nível da criatura ou faixa de poder na mesa.",
  },
  {
    term: "AL",
    fullName: "Alinhamento",
    description: "Ordeiro (O), Neutro (N) ou Caótico (C).",
  },
  {
    term: "FOR",
    fullName: "Força",
    description: "Atributo físico; ataques corpo a corpo e testes de força.",
  },
  {
    term: "DES",
    fullName: "Destreza",
    description: "Agilidade; CA, iniciativa e ataques à distância.",
  },
];

function main() {
  const args = process.argv.slice(2).filter((a) => a && a !== "");
  const updateFlag = args.includes("--update");
  const mdPathArg = args.find((a) => !a.startsWith("--"));

  if (!mdPathArg) {
    console.error(
      "Uso: node scripts/migrate-regras.js <caminho/para/regras.md> [--update]",
    );
    console.error(
      "  --update  mescla com o JSON existente (preserva meta/tabelas/glossário não presentes no MD)",
    );
    process.exit(1);
  }

  const mdPath = path.isAbsolute(mdPathArg)
    ? mdPathArg
    : path.resolve(process.cwd(), mdPathArg);

  if (!fs.existsSync(mdPath)) {
    console.error("Arquivo não encontrado:", mdPath);
    process.exit(1);
  }

  let existing = null;
  if (updateFlag && fs.existsSync(OUT_PATH)) {
    try {
      existing = JSON.parse(fs.readFileSync(OUT_PATH, "utf8"));
    } catch (e) {
      console.error("Erro ao ler JSON existente:", e.message);
      process.exit(1);
    }
  }

  const md = fs.readFileSync(mdPath, "utf8");
  const meta = parseMeta(md);

  const sections = [];
  const tables = {};
  let glossary = [];

  const topBlocks = md.split(/\n##\s+/).filter(Boolean);

  for (const block of topBlocks) {
    const firstLine = block.split("\n")[0] || "";
    const sectionMatch = firstLine.match(/^(\d+)(?:\.|)\s*(.+)$/);
    const isTabelas = /^Tabelas\s*$/i.test(firstLine.trim());
    const isGlossario = /^Glossário\s*$/i.test(firstLine.trim());

    if (isTabelas) {
      const subBlocks = block.split(/\n###\s+/);
      for (let i = 1; i < subBlocks.length; i++) {
        const sub = subBlocks[i];
        const idMatch = sub.match(/^([a-z0-9_]+)\s*\n([\s\S]*)/i);
        if (!idMatch) continue;
        const tableId = idMatch[1].trim().toLowerCase().replace(/\s+/g, "_");
        const rest = idMatch[2];
        const parsed = parseMarkdownTable(rest);
        if (parsed)
          tables[tableId] = { headers: parsed.headers, rows: parsed.rows };
      }
      continue;
    }

    if (isGlossario) {
      const tableMatch = block.match(/\n([\s\S]*)/);
      if (tableMatch) {
        const parsed = parseMarkdownTable(tableMatch[1]);
        if (parsed && parsed.rows.length) {
          const keys = Object.keys(parsed.rows[0] || {});
          glossary = parsed.rows.map((r) => ({
            term: (r.term ?? r.termo ?? r[keys[0]] ?? "").toString(),
            fullName: (r.fullname ?? r.fullName ?? r[keys[1]] ?? "").toString(),
            description: (r.description ?? r[keys[2]] ?? "").toString(),
          }));
        }
      }
      continue;
    }

    if (!sectionMatch) continue;

    const sectionId = sectionMatch[1];
    const sectionTitle = sectionMatch[2].trim();
    const sectionBody = block.slice(block.indexOf("\n") + 1);
    const subBlocks = sectionBody.split(/\n###\s+/);
    const subsections = [];

    for (let i = 0; i < subBlocks.length; i++) {
      const sub = subBlocks[i];
      const subMatch = sub.match(/^(\d+\.\d+)(?:\.|)\s*([^\n]+)\n?([\s\S]*)/);
      if (!subMatch) continue;
      const subId = subMatch[1];
      const subTitle = subMatch[2].trim();
      let body = (subMatch[3] || "").trim();

      let content = "";
      let tableRef = null;
      const formulas = [];

      const extractedRef = extractTableRefFromBody(body);
      tableRef = extractedRef.tableRef;
      body = extractedRef.body;

      const formulasBlock = body.match(/\nformulas:\s*\n((?:\s*-\s*.+\n?)+)/i);
      if (formulasBlock) {
        formulasBlock[1].split("\n").forEach((line) => {
          const m = line.match(/^\s*-\s*(.+)/);
          if (m) formulas.push(m[1].trim());
        });
        body = body.replace(/\nformulas:\s*\n(?:\s*-\s*.+\n?)+/i, "").trim();
      }

      // Remove tabelas markdown do corpo (não promover subsecções a escudo.tables)
      let extracted = extractFirstTableBlock(body);
      while (extracted) {
        body = extracted.rest;
        extracted = extractFirstTableBlock(body);
      }

      // Preserva quebras de linha: \n\n = parágrafo no Markdown; só colapsa 3+ newlines em 2
      content = body.replace(/\n{3,}/g, "\n\n").trim();

      subsections.push({
        id: subId,
        title: subTitle,
        ...(content && { content }),
        ...(formulas.length && { formulas }),
        ...(tableRef && { tableRef }),
      });
    }

    if (subsections.length) {
      sections.push({ id: sectionId, title: sectionTitle, subsections });
    }
  }

  const index = sections.map((s) => ({
    id: s.id,
    title: s.title,
    anchor: anchor(s.id, s.title),
  }));

  // Glossário: da tabela "Termos importantes" (termo/significado) ou padrão
  if (glossary.length === 0 && tables.termos_importantes) {
    const rows = Array.isArray(tables.termos_importantes.rows)
      ? tables.termos_importantes.rows
      : [];
    glossary = rows
      .map((r) => ({
        term: String(r.termo ?? r.term ?? Object.values(r)[0] ?? "")
          .replace(/\*\*/g, "")
          .trim(),
        fullName: String(r.termo ?? r.term ?? Object.values(r)[0] ?? "")
          .replace(/\*\*/g, "")
          .trim(),
        description: String(
          r.significado ?? r.description ?? Object.values(r)[1] ?? "",
        ).trim(),
      }))
      .filter((g) => g.term && g.description);
  }
  glossary = glossary.filter(
    (g) =>
      !/astraldark|matri|elmo\s*\(nave\)/i.test(
        `${g.term} ${g.fullName} ${g.description}`,
      ),
  );
  if (glossary.length === 0) {
    glossary = [...GLOSSARIO_PADRAO];
  }

  let outMeta = meta;
  let outTables = tables;
  let outGlossary = glossary;

  if (existing && updateFlag) {
    if (Object.keys(tables).length === 0) outTables = existing.tables || {};
    else outTables = tables;
    if (!meta.description || meta.description === "Referência das regras.") {
      outMeta = { ...(existing.meta || {}), ...outMeta };
    }
  }

  const output = {
    meta: outMeta,
    index,
    sections,
    tables: outTables,
    glossary: outGlossary,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2), "utf8");

  console.log("Migração de regras concluída.");
  console.log("  Seções:", sections.length);
  console.log("  Tabelas:", Object.keys(outTables).length);
  console.log("  Glossário:", outGlossary.length, "termos");

  writeVersion(PROJECT_ROOT);
}

if (require.main === module) {
  main();
}

module.exports = {
  slug,
  anchor,
  parseMeta,
  parseMarkdownTable,
  extractFirstTableBlock,
  extractTableRefFromBody,
};
