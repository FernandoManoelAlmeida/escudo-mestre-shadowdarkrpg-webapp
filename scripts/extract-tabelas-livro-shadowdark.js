#!/usr/bin/env node
/**
 * Extrai tabelas roláveis do Livro de Regras pt-BR para MD em Referências/shadowdark/Tabelas/.
 * Uso: node scripts/extract-tabelas-livro-shadowdark.js <Livro de Regras pt-BR.md> <Tabelas/out/>
 */
const fs = require("fs");
const path = require("path");
const { inferRolagemFromTable } = require("./infer-rolagem");

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

function parseMdTables(block) {
  const tables = [];
  const re =
    /(\|[^\n]+\|\n\|[-\s:|]+\|\n(?:\|[^\n]+\|\n?)+)/g;
  let m;
  while ((m = re.exec(block)) !== null) {
    const lines = m[1].trim().split("\n").filter(Boolean);
    if (lines.length < 3) continue;
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
      if (cells.length && cells.some((c) => c)) rows.push(cells);
    }
    if (rows.length) tables.push({ headers, rows });
  }
  return tables;
}

function writeTableMd(outPath, meta, headers, rows) {
  const lines = [
    "---",
    `id: ${meta.id}`,
    `titulo: ${meta.titulo}`,
    `categoria: ${meta.categoria}`,
    `subcategoria: ${meta.subcategoria || ""}`,
    `rolagem: ${meta.rolagem}`,
    "---",
    "",
    `# ${meta.titulo}`,
    "",
    `**Nome:** ${meta.id}`,
    "",
    `**Rolagem:** \`${meta.rolagem}\``,
    "",
    "## Tabela",
    "",
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((r) => `| ${r.join(" | ")} |`),
    "",
  ];
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, lines.join("\n"), "utf8");
}

function mergeTables(tables) {
  if (!tables.length) return null;
  const headers = tables[0].headers;
  const rows = [];
  for (const t of tables) {
    if (t.headers.join() !== headers.join()) continue;
    rows.push(...t.rows);
  }
  return { headers, rows };
}

function extractEncontros(livro, outRoot) {
  const re = /### ENCONTROS (?:EM|NO|NA) ([^\n]+)\n([\s\S]*?)(?=\n### ENCONTROS |\n# |\n## [A-Z]|$)/gi;
  const byBiome = new Map();
  let m;
  while ((m = re.exec(livro)) !== null) {
    const biome = m[1].trim();
    const block = m[2];
    const tables = parseMdTables(block).filter((t) =>
      /resultado/i.test(t.headers.join(" ")),
    );
    const merged = mergeTables(tables);
    if (!merged || merged.rows.length < 2) continue;
    const key = slug(biome);
    const existing = byBiome.get(key);
    if (existing) {
      existing.rows.push(...merged.rows);
    } else {
      byBiome.set(key, { biome, ...merged });
    }
  }
  for (const [key, data] of byBiome) {
    const id = `encontro-${key}`;
    const out = path.join(outRoot, "encontros", "locais", `${id}.md`);
    const rolagem = inferRolagemFromTable(data.headers, data.rows);
    writeTableMd(out, {
      id,
      titulo: `Encontros — ${data.biome}`,
      categoria: "encontro",
      subcategoria: key,
      rolagem,
    }, data.headers, data.rows);
    console.log("Encontro:", id, data.rows.length, "linhas");
  }
}

function extractNamedSectionsAll(livro, headingRe, meta, outFile) {
  const re = new RegExp(headingRe.source, headingRe.flags.includes("g") ? headingRe.flags : `${headingRe.flags}g`);
  let merged = null;
  let m;
  while ((m = re.exec(livro)) !== null) {
    const block = m[1] ?? m[0];
    const tables = parseMdTables(block);
    const part = mergeTables(
      tables.filter((t) => /resultado/i.test(t.headers.join(" "))),
    );
    if (!part) continue;
    if (!merged) {
      merged = { headers: part.headers, rows: [...part.rows] };
    } else if (part.headers.join() === merged.headers.join()) {
      merged.rows.push(...part.rows);
    }
  }
  if (!merged || !merged.rows.length) return;
  const headers = merged.headers[0]?.toLowerCase().includes("d20")
    ? ["d100", merged.headers[1] || "Resultado"]
    : merged.headers;
  const rolagem = inferRolagemFromTable(headers, merged.rows);
  writeTableMd(outFile, { ...meta, rolagem }, headers, merged.rows);
  console.log("OK:", meta.id, merged.rows.length, "linhas", rolagem);
}

function extractNamedSection(livro, headingRe, meta, outFile) {
  extractNamedSectionsAll(livro, headingRe, meta, outFile);
}

function main() {
  const [livroPath, outRoot] = process.argv.slice(2);
  if (!livroPath || !outRoot) {
    console.error(
      "Uso: node scripts/extract-tabelas-livro-shadowdark.js <livro.md> <Tabelas/>",
    );
    process.exit(1);
  }
  const livro = fs.readFileSync(path.resolve(livroPath), "utf8");
  const root = path.resolve(outRoot);
  extractEncontros(livro, root);

  extractNamedSectionsAll(
    livro,
    /### ALGO ACONTECE!\s*([\s\S]*?)(?=\n### |\n# )/i,
    {
      id: "algo-acontece",
      titulo: "Algo acontece",
      categoria: "algo-acontece",
      subcategoria: "geral",
    },
    path.join(root, "algo-acontece", "algo-acontece.md"),
  );

  extractNamedSection(
    livro,
    /### LOJA PADRÃO\s*([\s\S]*?)(?=### LOJA REFINADA)/i,
    {
      id: "loja-padrao",
      titulo: "Loja padrão",
      categoria: "lojas",
      subcategoria: "padrao",
    },
    path.join(root, "lojas", "loja-padrao.md"),
  );

  extractNamedSection(
    livro,
    /### LOJA REFINADA\s*([\s\S]*?)(?=### GERADOR)/i,
    {
      id: "loja-refinada",
      titulo: "Loja refinada",
      categoria: "lojas",
      subcategoria: "refinada",
    },
    path.join(root, "lojas", "loja-refinada.md"),
  );

  extractNamedSectionsAll(
    livro,
    /### RUMORES\s*([\s\S]*?)(?=\n### |\n# )/i,
    {
      id: "rumores-taverna",
      titulo: "Rumores",
      categoria: "rumores",
      subcategoria: "taverna",
    },
    path.join(root, "rumores", "rumores-taverna.md"),
  );
}

if (require.main === module) main();
