#!/usr/bin/env node
/**
 * Remove `out/` e artefactos PWA gerados em `public/` antes de um build Pages limpo.
 * Uso: NEXT_PUBLIC_BASE_PATH=/repo node scripts/clean-pwa-export-artifacts.js
 */
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");

function rmSafe(target) {
  try {
    fs.rmSync(target, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

function main() {
  rmSafe(path.join(projectRoot, "out"));

  const publicDir = path.join(projectRoot, "public");
  if (!fs.existsSync(publicDir)) return;

  const bp = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/^\//, "");
  if (bp) {
    rmSafe(path.join(publicDir, bp));
  }

  for (const name of fs.readdirSync(publicDir)) {
    if (name === "sw.js") {
      rmSafe(path.join(publicDir, name));
    } else if (name.startsWith("workbox-") && name.endsWith(".js")) {
      rmSafe(path.join(publicDir, name));
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
