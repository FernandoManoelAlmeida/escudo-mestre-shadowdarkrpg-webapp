#!/usr/bin/env node
/**
 * Auditoria do catálogo de itens mágicos (MD vault + JSON migrado).
 * Uso: node scripts/audit-catalogo-itens-magicos.js <Itens Mágicos.md> [--json path] [--write report.md]
 */
const fs = require("fs");
const path = require("path");
const {
  evaluateBlock,
  parseOrigemFromBody,
  isItemBody,
  isNonItemBody,
  isItemTitle,
  suggestPipeline,
  EXPECTED_ITENS_MAGICOS_COUNT,
} = require("./catalogo-itens-magicos-lib");

function auditMd(mdPath) {
  const md = fs.readFileSync(mdPath, "utf8");
  const blocks = md.split(/\n###\s+/).slice(1);
  return blocks.map((block) => {
    const lines = block.split("\n");
    const nome = lines[0].trim();
    const rawBody = lines.slice(1).join("\n").trim();
    const { origem, descricao } = parseOrigemFromBody(rawBody);
    const { accept, reasons } = evaluateBlock(nome, rawBody);
    return {
      nome,
      origem,
      verdict: accept ? "ok" : "reject",
      reasons,
      flags: {
        item_marker: isItemBody(descricao),
        bad_title: !isItemTitle(nome),
        markdown_table: /\| --- \|/.test(descricao),
        classe: /^# Classe:/m.test(descricao),
        email: /@|Rodrigo Avelino/i.test(descricao),
      },
      excerpt: descricao.slice(0, 120).replace(/\n/g, " "),
      suggestedPipeline: accept ? null : suggestPipeline(nome),
    };
  });
}

function formatReport(mdPath, jsonPath, mdRows) {
  const ok = mdRows.filter((r) => r.verdict === "ok");
  const reject = mdRows.filter((r) => r.verdict === "reject");
  const lines = [
    "# Auditoria — catálogo itens mágicos",
    "",
    `Gerado: ${new Date().toISOString()}`,
    "",
    `- MD: \`${mdPath}\``,
    jsonPath ? `- JSON: \`${jsonPath}\`` : "",
    "",
    "## Resumo",
    "",
    `| Métrica | Valor |`,
    `|---------|-------|`,
    `| Blocos ### no MD | ${mdRows.length} |`,
    `| OK | ${ok.length} |`,
    `| Reject | ${reject.length} |`,
    `| Alvo esperado | ${EXPECTED_ITENS_MAGICOS_COUNT} |`,
    "",
  ];

  if (jsonPath && fs.existsSync(jsonPath)) {
    const { itens } = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    lines.push(`| Entradas JSON | ${itens.length} |`, "");
    const jsonNames = new Set(itens.map((i) => i.nome));
    const mdNames = new Set(ok.map((r) => r.nome));
    const onlyJson = itens.filter((i) => !mdNames.has(i.nome)).map((i) => i.nome);
    const onlyMd = ok.filter((r) => !jsonNames.has(r.nome)).map((r) => r.nome);
    if (onlyJson.length) lines.push(`- Só no JSON: ${onlyJson.join(", ")}`, "");
    if (onlyMd.length) lines.push(`- Só no MD (ok): ${onlyMd.join(", ")}`, "");
  }

  if (reject.length) {
    lines.push("## Rejeitados (órfãos)", "", "| Nome | Origem | Motivos | Destino sugerido |", "|------|--------|---------|------------------|");
    for (const r of reject) {
      lines.push(
        `| ${r.nome} | ${r.origem} | ${r.reasons.join(", ")} | ${r.suggestedPipeline || ""} |`,
      );
    }
    lines.push("");
  }

  return lines.filter(Boolean).join("\n");
}

function main() {
  const args = process.argv.slice(2);
  const mdPath = args[0];
  if (!mdPath || !fs.existsSync(mdPath)) {
    console.error("Uso: node audit-catalogo-itens-magicos.js <Itens Mágicos.md> [--json itens-magicos.json] [--write report.md]");
    process.exit(1);
  }
  let jsonPath = null;
  let writePath = null;
  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--json" && args[i + 1]) {
      jsonPath = path.resolve(args[++i]);
    } else if (args[i] === "--write" && args[i + 1]) {
      writePath = path.resolve(args[++i]);
    }
  }
  const rows = auditMd(path.resolve(mdPath));
  const ok = rows.filter((r) => r.verdict === "ok").length;
  const reject = rows.length - ok;
  console.log("Auditoria MD:", rows.length, "blocos | ok:", ok, "| reject:", reject, "| alvo:", EXPECTED_ITENS_MAGICOS_COUNT);
  const report = formatReport(path.resolve(mdPath), jsonPath, rows);
  if (writePath) {
    fs.mkdirSync(path.dirname(writePath), { recursive: true });
    fs.writeFileSync(writePath, report, "utf8");
    console.log("Relatório:", writePath);
  } else {
    console.log(report);
  }
  if (reject > 0) process.exit(2);
}

if (require.main === module) main();

module.exports = { auditMd, formatReport };
