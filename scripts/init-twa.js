#!/usr/bin/env node
/**
 * Inicializa o projeto TWA (Bubblewrap) na pasta android-twa.
 * Uso: MANIFEST_URL=https://seu-dominio.com/manifest.json node scripts/init-twa.js
 * Ou: node scripts/init-twa.js  (o Bubblewrap pedirá a URL interativamente)
 */
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

/**
 * @param {{ execSyncImpl?: typeof execSync, env?: NodeJS.ProcessEnv, rootDir?: string }} deps
 */
function runInitTwa(deps = {}) {
  const exec = deps.execSyncImpl ?? execSync;
  const env = deps.env ?? process.env;
  const rootDir = deps.rootDir ?? path.join(__dirname, "..");
  const androidTwaDir = path.join(rootDir, "android-twa");

  if (!fs.existsSync(androidTwaDir)) {
    fs.mkdirSync(androidTwaDir, { recursive: true });
  }

  const manifestUrl = env.MANIFEST_URL;
  const args = ["@bubblewrap/cli", "init"];
  if (manifestUrl) {
    args.push("--manifest=" + manifestUrl);
  }

  exec("npx " + args.join(" "), {
    cwd: androidTwaDir,
    stdio: "inherit",
    shell: true,
  });
}

if (require.main === module) {
  runInitTwa();
}

module.exports = { runInitTwa };
