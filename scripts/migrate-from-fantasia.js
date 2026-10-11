#!/usr/bin/env node
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const { resolveVaultPath, shadowdarkRoot } = require("./vault-paths");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const defaultFantasia = path.resolve(PROJECT_ROOT, "..", "shadowdarkrpg-fantasia");
const vault = process.env.FANTASIA_VAULT
  ? path.resolve(process.env.FANTASIA_VAULT)
  : defaultFantasia;

const sd = shadowdarkRoot(vault);
const regrasMd = resolveVaultPath(
  vault,
  "Referências",
  "shadowdark",
  "Escudo do Mestre Shadowdark.md",
);
const ameacasDir = resolveVaultPath(
  vault,
  "Referências",
  "shadowdark",
  "Ameaças",
);
const tabelasDir = resolveVaultPath(
  vault,
  "Referências",
  "shadowdark",
  "Tabelas",
);
const catalogoMd = resolveVaultPath(
  vault,
  "Referências",
  "shadowdark",
  "Catálogos",
  "Itens Mágicos.md",
);
const grimorioMd = resolveVaultPath(
  vault,
  "Referências",
  "shadowdark",
  "Catálogos",
  "Grimório.md",
);
const classesMd = resolveVaultPath(
  vault,
  "Referências",
  "shadowdark",
  "Catálogos",
  "Classes.md",
);
const ancestralidadesMd = resolveVaultPath(
  vault,
  "Referências",
  "shadowdark",
  "Catálogos",
  "Ancestralidades.md",
);
const regrasHomebrewMd = resolveVaultPath(
  vault,
  "Referências",
  "shadowdark",
  "Catálogos",
  "Regras Homebrew.md",
);

const args = process.argv.slice(2);
const noUpdate = args.includes("--no-update");

function run(script, scriptArgs) {
  const r = spawnSync(process.execPath, [path.join(__dirname, script), ...scriptArgs], {
    cwd: PROJECT_ROOT,
    stdio: "inherit",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

if (!fs.existsSync(vault)) {
  console.error("Vault Fantasia não encontrado:", vault);
  process.exit(1);
}

console.log("=== migrate:from-fantasia ===");
console.log("Vault:", vault);
console.log("Shadowdark root:", sd);

if (fs.existsSync(regrasMd)) {
  const regrasArgs = [regrasMd];
  if (!noUpdate) regrasArgs.push("--update");
  run("migrate-regras-shadowdark.js", regrasArgs);
} else {
  console.warn("Aviso: regras MD ausente:", regrasMd);
}

if (fs.existsSync(ameacasDir)) {
  run("migrate-ameacas-shadowdark.js", [ameacasDir]);
}

if (fs.existsSync(tabelasDir)) {
  run("migrate-tabelas-shadowdark.js", [tabelasDir]);
}

if (fs.existsSync(catalogoMd)) {
  run("migrate-catalogo-itens-magicos-shadowdark.js", [catalogoMd]);
}

if (fs.existsSync(grimorioMd)) {
  run("migrate-catalogo-magias-shadowdark.js", [grimorioMd]);
} else {
  console.warn("Aviso: Grimório MD ausente:", grimorioMd);
}

if (fs.existsSync(classesMd)) {
  run("migrate-catalogo-classes-shadowdark.js", [classesMd]);
}

if (fs.existsSync(ancestralidadesMd)) {
  run("migrate-catalogo-ancestralidades-shadowdark.js", [ancestralidadesMd]);
}

if (fs.existsSync(regrasHomebrewMd)) {
  run("migrate-regras-homebrew-shadowdark.js", [regrasHomebrewMd]);
}

console.log("\n--- validate-migrated-data ---");
run("validate-migrated-data.js", ["--strict"]);

console.log("\n=== Migração Fantasia concluída ===");
