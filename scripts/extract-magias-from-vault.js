#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { resolveVaultPath, shadowdarkRoot } = require("./vault-paths");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const defaultFantasia = path.resolve(PROJECT_ROOT, "..", "shadowdarkrpg-fantasia");
const vault = process.env.FANTASIA_VAULT
  ? path.resolve(process.env.FANTASIA_VAULT)
  : defaultFantasia;

const sd = shadowdarkRoot(vault);
const livro = resolveVaultPath(
  vault,
  "Referências",
  "shadowdark",
  "Livros de Regras",
  "Livro de Regras pt-BR.md",
);
const grimorio = resolveVaultPath(
  vault,
  "Referências",
  "shadowdark",
  "Catálogos",
  "Grimório.md",
);
const astralCandidates = [
  path.join(vault, "Astraldark", "Astraldark pt-BR.md"),
  path.join(vault, "Astraldark", "Astraldark privado pt-BR.md"),
];
const astraldark = astralCandidates.find((p) => fs.existsSync(p));

if (!fs.existsSync(vault) || !fs.existsSync(livro)) {
  console.error("Vault ou Livro não encontrado:", livro);
  process.exit(1);
}

const args = [
  livro,
  grimorio,
  "--cursed-scrolls-dir",
  sd,
];
if (astraldark) args.push("--astraldark", astraldark);

const r = spawnSync(
  process.execPath,
  [path.join(__dirname, "extract-magias-shadowdark.js"), ...args],
  { cwd: PROJECT_ROOT, stdio: "inherit" },
);
process.exit(r.status ?? 1);
