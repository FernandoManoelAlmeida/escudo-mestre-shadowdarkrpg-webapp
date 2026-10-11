#!/usr/bin/env node
/**
 * Valida public/data após migrate:from-fantasia
 * Uso: node scripts/validate-migrated-data.js [--strict]
 */
const fs = require("fs");
const path = require("path");
const { findForbiddenInHomebrew } = require("./astraldark-public-glossary");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const TABELAS_DIR = path.join(PROJECT_ROOT, "public/data/tabelas");
const AMEACAS_PATH = path.join(PROJECT_ROOT, "public/data/ameacas.json");

const REQUIRED_TABLE_IDS = [
  "assentamento-tipo",
  "assentamento-distrito",
  "assentamento-alinhamento",
  "assentamento-nome-exemplos",
  "assentamento-poi-periferia",
  "assentamento-poi-baixo",
  "assentamento-poi-artesao",
  "assentamento-poi-comercial",
  "assentamento-poi-alto",
  "assentamento-poi-religioso",
  "assentamento-poi-academico",
  "assentamento-poi-castelo",
  "loja-precaria",
  "loja-padrao",
  "loja-refinada",
  "loja-nome-conhecida",
  "loja-clientes-interessantes",
  "reacao",
  "rumores-taverna",
  "algo-acontece",
  "armadilhas",
  "teste-encontro",
];

const GITH_PUBLIC_IDS = [
  "monge-matrimpio",
  "guerreiro-matriprole",
  "lanca-estelar",
  "zerth-matrimpio",
  "cavaleiro-matriprole",
  "psion-matrimpio",
  "dragomante-matriprole",
];

function fail(msg) {
  console.error("VALIDATE FAIL:", msg);
  return false;
}

function validateTabelas() {
  const indexPath = path.join(TABELAS_DIR, "tabelas-index.json");
  if (!fs.existsSync(indexPath)) {
    return fail("tabelas-index.json ausente");
  }
  const { tabelas } = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  const ids = new Set(tabelas.map((t) => t.id));
  let ok = true;
  for (const id of REQUIRED_TABLE_IDS) {
    if (!ids.has(id)) {
      ok = fail(`tabela obrigatória ausente no índice: ${id}`) && ok;
    }
    const jsonPath = path.join(TABELAS_DIR, `${id}.json`);
    if (!fs.existsSync(jsonPath)) {
      ok = fail(`JSON ausente: tabelas/${id}.json`) && ok;
    }
  }
  for (const entry of tabelas) {
    const jsonPath = path.join(TABELAS_DIR, `${entry.id}.json`);
    if (!fs.existsSync(jsonPath)) {
      ok = fail(`índice referencia ${entry.id} sem ficheiro`) && ok;
    }
  }
  const orphans = fs
    .readdirSync(TABELAS_DIR)
    .filter((f) => f.endsWith(".json") && f !== "tabelas-index.json")
    .map((f) => f.replace(/\.json$/, ""))
    .filter((id) => !ids.has(id));
  if (orphans.length) {
    ok = fail(`JSON órfãos em tabelas/: ${orphans.join(", ")}`) && ok;
  }
  return ok;
}

function validateAmeacas() {
  if (!fs.existsSync(AMEACAS_PATH)) {
    return fail("ameacas.json ausente");
  }
  const { ameacas } = JSON.parse(fs.readFileSync(AMEACAS_PATH, "utf8"));
  let ok = true;
  const byId = new Map(ameacas.map((a) => [a.id, a]));

  for (const id of GITH_PUBLIC_IDS) {
    if (!byId.has(id)) {
      ok = fail(`ameaça Gith/Matri ausente: ${id}`) && ok;
    }
  }

  const githCount = GITH_PUBLIC_IDS.filter((id) => byId.has(id)).length;
  if (githCount !== 7) {
    ok = fail(`esperadas 7 fichas Matri genéricas, encontradas ${githCount}`) && ok;
  }

  for (const a of ameacas) {
    if (a.origem !== "homebrew") continue;
    if (a.tipo && /índice por nv|\[\[/i.test(a.tipo)) {
      ok = fail(`${a.id}: tipo homebrew inválido (${a.tipo.slice(0, 40)}…)`) && ok;
    }
    if (a.tipo && /\.\.\s*[^.]/.test(a.tipo)) {
      ok = fail(`${a.id}: tipo contém notas GM (..)`) && ok;
    }
    const forbidden = findForbiddenInHomebrew(a);
    if (forbidden.length) {
      ok =
        fail(`${a.id}: termos proibidos após glossário: ${forbidden.join(", ")}`) &&
        ok;
    }
  }
  return ok;
}

function main() {
  const strict = process.argv.includes("--strict");
  console.log("=== validate-migrated-data ===");
  const t = validateTabelas();
  const a = validateAmeacas();
  if (t && a) {
    console.log("OK: tabelas + ameaças");
    process.exit(0);
  }
  if (strict) process.exit(1);
  console.warn("Aviso: validação com falhas (sem --strict)");
  process.exit(1);
}

if (require.main === module) main();

module.exports = {
  validateTabelas,
  validateAmeacas,
  REQUIRED_TABLE_IDS,
  GITH_PUBLIC_IDS,
};
