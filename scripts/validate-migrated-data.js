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
const ITENS_MAGICOS_PATH = path.join(
  PROJECT_ROOT,
  "public/data/catalogo/itens-magicos.json",
);
const {
  EXPECTED_ITENS_MAGICOS_COUNT,
  isItemTitle,
  isItemBody,
  isNonItemBody,
  validateItemEntry,
} = require("./catalogo-itens-magicos-lib");
const {
  assertClassTalentTables,
  assertClassIntroParagraphs,
} = require("./catalogo-personagem-lib");
const { findForbiddenInCatalogEntry } = require("./sanitize-catalogo-astraldark");

const CLASSES_PATH = path.join(PROJECT_ROOT, "public/data/catalogo/classes.json");
const ANCESTRALIDADES_PATH = path.join(
  PROJECT_ROOT,
  "public/data/catalogo/ancestralidades.json",
);
const ANTECEDENTES_PATH = path.join(
  PROJECT_ROOT,
  "public/data/catalogo/antecedentes.json",
);
const REGRAS_HOMEBREW_PATH = path.join(
  PROJECT_ROOT,
  "public/data/catalogo/regras-homebrew.json",
);

const EXPECTED_ANCESTRALIDADES_COUNT = 10;
const EXPECTED_ANTECEDENTES_COUNT = 68;
const EXPECTED_ANTECEDENTES_BY_LISTA = {
  "Livro de Regras (d20)": 20,
  "Antecedentes diabólicos": 20,
  "Antecedentes nórdicos": 20,
  "Antecedentes a bordo (d8)": 8,
};
const EXPECTED_CLASSES_MIN = 17;
const EXPECTED_CLASSES_MAX = 20;

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

function validateItensMagicos() {
  if (!fs.existsSync(ITENS_MAGICOS_PATH)) {
    return fail("itens-magicos.json ausente");
  }
  const { itens } = JSON.parse(fs.readFileSync(ITENS_MAGICOS_PATH, "utf8"));
  if (!Array.isArray(itens) || itens.length === 0) {
    return fail("itens-magicos.json vazio ou inválido");
  }
  let ok = true;
  if (itens.length !== EXPECTED_ITENS_MAGICOS_COUNT) {
    ok =
      fail(
        `itens mágicos: esperados ${EXPECTED_ITENS_MAGICOS_COUNT}, encontrados ${itens.length}`,
      ) && ok;
  }
  for (const entry of itens) {
    const reasons = validateItemEntry(entry);
    if (reasons.length) {
      ok = fail(`item inválido "${entry.nome}": ${reasons.join(", ")}`) && ok;
    }
    if (!isItemTitle(entry.nome)) {
      ok = fail(`item título inválido: ${entry.nome}`) && ok;
    }
    if (!isItemBody(entry.descricao) || isNonItemBody(entry.descricao)) {
      ok = fail(`item corpo inválido: ${entry.nome}`) && ok;
    }
    if (/@|Rodrigo Avelino|# Classe:|\| --- \|/.test(entry.descricao)) {
      ok = fail(`item com conteúdo proibido: ${entry.nome}`) && ok;
    }
    if (entry.origem && entry.origem !== "livro" && !entry.origem.trim()) {
      ok = fail(`item sem origem CS: ${entry.nome}`) && ok;
    }
  }
  const livroCount = itens.filter((i) => i.origem === "livro" || !i.origem).length;
  const csCount = itens.length - livroCount;
  if (livroCount !== 95 || csCount !== 3) {
    ok =
      fail(
        `itens mágicos: esperados 95 livro + 3 CS, encontrados ${livroCount} livro + ${csCount} CS`,
      ) && ok;
  }
  return ok;
}

function validateCatalogoEntradas(pathJson, label, { min, max, exact }) {
  if (!fs.existsSync(pathJson)) return fail(`${label} ausente`);
  const { entradas } = JSON.parse(fs.readFileSync(pathJson, "utf8"));
  if (!Array.isArray(entradas) || entradas.length === 0) {
    return fail(`${label} vazio`);
  }
  let ok = true;
  const n = entradas.length;
  if (exact != null && n !== exact) {
    ok = fail(`${label}: esperados ${exact}, encontrados ${n}`) && ok;
  } else if (min != null && n < min) {
    ok = fail(`${label}: mínimo ${min}, encontrados ${n}`) && ok;
  } else if (max != null && n > max) {
    ok = fail(`${label}: máximo ${max}, encontrados ${n}`) && ok;
  }
  for (const e of entradas) {
    if (!e.id || !e.nome || !e.descricao) {
      ok = fail(`${label}: entrada incompleta ${e.id || e.nome}`) && ok;
    }
    const forbidden = findForbiddenInCatalogEntry(e);
    if (forbidden.length) {
      ok = fail(`${label} ${e.id}: termos proibidos: ${forbidden.join(", ")}`) && ok;
    }
    if (/githyanki|githzerai|vlaakith/i.test(`${e.nome}\n${e.descricao}`)) {
      ok = fail(`${label} ${e.id}: termo WotC não glossado`) && ok;
    }
  }
  return ok;
}

function validateAncestralidades() {
  let ok = validateCatalogoEntradas(ANCESTRALIDADES_PATH, "ancestralidades", {
    exact: EXPECTED_ANCESTRALIDADES_COUNT,
  });
  const { entradas } = JSON.parse(fs.readFileSync(ANCESTRALIDADES_PATH, "utf8"));
  const ids = new Set(entradas.map((e) => e.id));
  if (!ids.has("matriprole")) ok = fail("ancestralidade matriprole ausente") && ok;
  if (!ids.has("elfo-estelar")) ok = fail("ancestralidade elfo-estelar ausente") && ok;
  const fontes = { livro: 0, astraldark: 0, homebrew: 0 };
  for (const e of entradas) {
    if (fontes[e.fonte] != null) fontes[e.fonte]++;
  }
  if (fontes.livro !== 6) ok = fail(`ancestralidades livro: esperadas 6, ${fontes.livro}`) && ok;
  if (fontes.astraldark < 2) ok = fail("ancestralidades astraldark < 2") && ok;
  if (fontes.homebrew < 2) ok = fail("ancestralidades homebrew < 2") && ok;
  return ok;
}

function validateClasses() {
  let ok = validateCatalogoEntradas(CLASSES_PATH, "classes", {
    min: EXPECTED_CLASSES_MIN,
    max: EXPECTED_CLASSES_MAX,
  });
  if (!fs.existsSync(CLASSES_PATH)) return ok;
  const { entradas } = JSON.parse(fs.readFileSync(CLASSES_PATH, "utf8"));
  for (const msg of assertClassTalentTables(entradas)) {
    ok = fail(`classes: ${msg}`) && ok;
  }
  for (const msg of assertClassIntroParagraphs(entradas)) {
    ok = fail(`classes: ${msg}`) && ok;
  }
  return ok;
}

function validateAntecedentes() {
  if (!fs.existsSync(ANTECEDENTES_PATH)) {
    return fail("antecedentes.json ausente");
  }
  const { entradas } = JSON.parse(fs.readFileSync(ANTECEDENTES_PATH, "utf8"));
  let ok = true;
  if (!Array.isArray(entradas) || entradas.length !== EXPECTED_ANTECEDENTES_COUNT) {
    ok =
      fail(
        `antecedentes: esperados ${EXPECTED_ANTECEDENTES_COUNT}, encontrados ${entradas?.length ?? 0}`,
      ) && ok;
  }
  const ids = new Set();
  const byLista = {};
  for (const e of entradas) {
    if (!e.id || !e.nome || !e.descricao || !e.lista) {
      ok = fail(`antecedentes: entrada incompleta ${e.id || e.nome}`) && ok;
    }
    if (ids.has(e.id)) ok = fail(`antecedentes: id duplicado ${e.id}`) && ok;
    ids.add(e.id);
    byLista[e.lista] = (byLista[e.lista] || 0) + 1;
    const forbidden = findForbiddenInCatalogEntry(e);
    if (forbidden.length) {
      ok = fail(`antecedentes ${e.id}: termos proibidos: ${forbidden.join(", ")}`) && ok;
    }
  }
  for (const [lista, count] of Object.entries(EXPECTED_ANTECEDENTES_BY_LISTA)) {
    if (byLista[lista] !== count) {
      ok =
        fail(`antecedentes "${lista}": esperados ${count}, encontrados ${byLista[lista] ?? 0}`) &&
        ok;
    }
  }
  return ok;
}

function validateRegrasHomebrew() {
  if (!fs.existsSync(REGRAS_HOMEBREW_PATH)) return fail("regras-homebrew.json ausente");
  const { regras } = JSON.parse(fs.readFileSync(REGRAS_HOMEBREW_PATH, "utf8"));
  let ok = true;
  if (!regras?.length) ok = fail("regras-homebrew vazio") && ok;
  const mc = regras.find((r) => r.id === "multiclasse-simples");
  if (!mc) ok = fail("multiclasse-simples ausente") && ok;
  else if (!/Duas classes fixas/i.test(mc.descricao)) {
    ok = fail("multiclasse-simples sem conteúdo esperado") && ok;
  }
  for (const r of regras) {
    const forbidden = findForbiddenInCatalogEntry(r);
    if (forbidden.length) ok = fail(`regra ${r.id}: termos proibidos`) && ok;
  }
  return ok;
}

function main() {
  const strict = process.argv.includes("--strict");
  console.log("=== validate-migrated-data ===");
  const t = validateTabelas();
  const a = validateAmeacas();
  const i = validateItensMagicos();
  const c = validateClasses();
  const an = validateAncestralidades();
  const ant = validateAntecedentes();
  const rh = validateRegrasHomebrew();
  if (t && a && i && c && an && ant && rh) {
    console.log("OK: tabelas + ameaças + catálogos");
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
  validateItensMagicos,
  validateClasses,
  validateAncestralidades,
  validateAntecedentes,
  validateRegrasHomebrew,
  REQUIRED_TABLE_IDS,
  GITH_PUBLIC_IDS,
  EXPECTED_ANCESTRALIDADES_COUNT,
};
