#!/usr/bin/env node
/**
 * Gera public/version.json após o build de produção.
 * Lê .next/BUILD_ID quando existir; caso contrário usa timestamp.
 * Usado para detecção de nova versão no cliente (cache vs servidor).
 *
 * Uso: node scripts/write-version.js
 * Chamado pelo script de build: next build --webpack && node scripts/write-version.js
 */
const fs = require("fs");
const path = require("path");

/**
 * @param {string} [projectRoot]
 * @param {{ now?: () => string }} [opts]
 */
function writeVersion(projectRoot = path.resolve(__dirname, ".."), opts = {}) {
  const BUILD_ID_PATH = path.join(projectRoot, ".next", "BUILD_ID");
  const VERSION_PATH = path.join(projectRoot, "public", "version.json");

  let buildId;
  try {
    if (fs.existsSync(BUILD_ID_PATH)) {
      buildId = fs.readFileSync(BUILD_ID_PATH, "utf8").trim();
    }
  } catch {
    // ignore
  }
  if (!buildId) {
    buildId = `build-${Date.now()}`;
  }

  const payload = {
    buildId,
    generatedAt: (opts.now ?? (() => new Date().toISOString()))(),
  };

  const body = JSON.stringify(payload, null, 2) + "\n";

  const publicDir = path.dirname(VERSION_PATH);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(VERSION_PATH, body, "utf8");

  /**
   * `next build` com export estático já copiou `public/version.json` antigo para `out/`
   * antes deste script correr. Sem regravar `out/version.json`, o deploy (ex.: GitHub Pages)
   * continua com o buildId da build anterior e o banner de atualização nunca alinha com o bundle.
   */
  const outVersionPath = path.join(projectRoot, "out", "version.json");
  if (fs.existsSync(path.dirname(outVersionPath))) {
    fs.writeFileSync(outVersionPath, body, "utf8");
  }

  syncPwaArtifactsToOut(projectRoot);

  if (!opts.skipPagesSwCheck) {
    assertPagesServiceWorker(projectRoot);
  }

  return payload;
}

/**
 * Falha o build Pages se o export existir mas o next-pwa não gerou SW.
 * @param {string} projectRoot
 * @param {string} [basePath]
 */
function assertPagesServiceWorker(
  projectRoot,
  basePath = process.env.NEXT_PUBLIC_BASE_PATH,
) {
  const { isGitHubPagesBuildEnv } = require("./pages-build-env.js");
  const {
    findExistingSwPath,
    formatSwDiagnostic,
  } = require("./pwa-artifact-paths.js");
  if (!isGitHubPagesBuildEnv(basePath)) return;
  const outDir = path.join(projectRoot, "out");
  if (!fs.existsSync(outDir)) return;

  if (!findExistingSwPath(projectRoot, basePath)) {
    console.error(
      "write-version: sw.js em falta após build GitHub Pages (next build --webpack + @ducanh2912/next-pwa).",
    );
    console.error(
      "  Dica: o log do build deve incluir linhas «(pwa)»; sem elas, confirme --webpack, devDependency webpack e que configure-pages não usa static_site_generator: next.",
    );
    console.error(formatSwDiagnostic(projectRoot, basePath));
    process.exit(1);
  }
}

/**
 * O export estático pode copiar `public/sw.js` para `out/` antes do next-pwa
 * regenerar o SW com precache prefixado. Garantir que o deploy usa o SW final.
 */
function syncPwaArtifactsToOut(projectRoot, basePath = process.env.NEXT_PUBLIC_BASE_PATH) {
  const {
    findExistingSwPath,
    listPublicWorkboxFiles,
  } = require("./pwa-artifact-paths.js");
  const outDir = path.join(projectRoot, "out");
  if (!fs.existsSync(outDir)) return;

  const swSource = findExistingSwPath(projectRoot, basePath);
  const swOut = path.join(outDir, "sw.js");
  if (swSource && swSource !== swOut) {
    fs.copyFileSync(swSource, swOut);
  }

  for (const wb of listPublicWorkboxFiles(projectRoot, basePath)) {
    fs.copyFileSync(wb, path.join(outDir, path.basename(wb)));
  }
}

if (require.main === module) {
  writeVersion();
}

module.exports = {
  writeVersion,
  syncPwaArtifactsToOut,
  assertPagesServiceWorker,
};
