#!/usr/bin/env node
/**
 * Valida artefactos PWA após build GitHub Pages (subpath).
 * Uso: GITHUB_PAGES=1 NEXT_PUBLIC_BASE_PATH=/repo node scripts/verify-pwa-github-pages.js
 */
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

function fail(msg) {
  console.error(`verify-pwa-github-pages: ${msg}`);
  process.exit(1);
}

function readSwUrls(swContent) {
  return [...swContent.matchAll(/url:"([^"]+)"/g)].map((m) => m[1]);
}

function assertPrecachePrefixed(swPath, label) {
  if (!fs.existsSync(swPath)) {
    fail(`ficheiro em falta: ${label} (${swPath})`);
  }
  const urls = readSwUrls(fs.readFileSync(swPath, "utf8"));
  const rootRelative = urls.filter((u) =>
    /^\/(data|icons|branding|fonts)\//.test(u),
  );
  if (rootRelative.length > 0) {
    fail(
      `${label}: ${rootRelative.length} URL(s) de precache sem basePath (ex.: ${rootRelative[0]})`,
    );
  }
  const expectedPrefix = `${basePath}/`;
  const publicAssets = urls.filter(
    (u) =>
      u.includes("/data/") ||
      u.includes("/icons/") ||
      u.includes("/branding/"),
  );
  for (const u of publicAssets) {
    if (!u.startsWith(expectedPrefix) && !u.startsWith(`http`)) {
      fail(`${label}: URL de asset sem prefixo esperado: ${u}`);
    }
  }
}

function main() {
  const pagesBuild =
    process.env.GITHUB_PAGES === "1" || Boolean(basePath);
  if (!pagesBuild) {
    console.log("verify-pwa-github-pages: SKIP (sem GITHUB_PAGES / basePath)");
    return;
  }
  if (!basePath || !basePath.startsWith("/")) {
    fail("NEXT_PUBLIC_BASE_PATH inválido para GitHub Pages");
  }

  const manifestPath = path.join(projectRoot, "out", "manifest.webmanifest");
  if (!fs.existsSync(manifestPath)) {
    fail("out/manifest.webmanifest em falta");
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const wantStart = `${basePath}/`;
  if (manifest.start_url !== wantStart || manifest.scope !== wantStart) {
    fail(
      `manifest start_url/scope esperado ${wantStart}, obtido start=${manifest.start_url} scope=${manifest.scope}`,
    );
  }

  const nojekyll = path.join(projectRoot, "out", ".nojekyll");
  if (!fs.existsSync(nojekyll)) {
    fail("out/.nojekyll em falta (GitHub Pages ignora _next/ sem isto)");
  }

  assertPrecachePrefixed(path.join(projectRoot, "out", "sw.js"), "out/sw.js");
  assertPrecachePrefixed(
    path.join(projectRoot, "public", "sw.js"),
    "public/sw.js",
  );

  console.log(
    `verify-pwa-github-pages: OK (basePath=${basePath}, precache alinhado)`,
  );
}

if (require.main === module) {
  main();
}

module.exports = { main, readSwUrls };
