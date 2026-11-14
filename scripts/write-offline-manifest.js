#!/usr/bin/env node
/**
 * Gera public/offline-manifest.json (e out/ se existir) com ficheiros e
 * revision (hash do conteúdo) para warm offline incremental. Exclui
 * version.json e sourcemaps.
 *
 * Uso: node scripts/write-offline-manifest.js
 * Chamado por write-version.js após o build.
 */
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const SKIP_NAMES = new Set(["version.json", ".DS_Store", "Thumbs.db"]);

/**
 * @param {string} filePath
 * @returns {string}
 */
function fileRevision(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16);
}

/**
 * @typedef {{ path: string, revision: string }} OfflineFileEntry
 */

/**
 * @param {string} dir
 * @param {string} urlBase path URL sem trailing slash ("" = raiz)
 * @param {Map<string, string>} acc path → revision
 */
function walkFiles(dir, urlBase, acc) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_NAMES.has(name)) continue;
    if (name.endsWith(".map")) continue;
    const full = path.join(dir, name);
    let st;
    try {
      st = fs.statSync(full);
    } catch {
      continue;
    }
    const urlPath = `${urlBase}/${name}`.replace(/\/+/g, "/");
    if (st.isDirectory()) {
      walkFiles(full, urlPath, acc);
      continue;
    }
    const url = urlPath.startsWith("/") ? urlPath : `/${urlPath}`;
    const revision = fileRevision(full);
    acc.set(url, revision);
    if (name === "index.html") {
      const dirUrl = urlBase === "" ? "/" : `${urlBase}/`;
      if (!acc.has(dirUrl)) acc.set(dirUrl, revision);
    }
  }
}

/**
 * @param {string} [projectRoot]
 * @param {{ now?: () => string }} [opts]
 */
function writeOfflineManifest(
  projectRoot = path.resolve(__dirname, ".."),
  opts = {},
) {
  const outDir = path.join(projectRoot, "out");
  const publicDir = path.join(projectRoot, "public");
  /** @type {Map<string, string>} */
  const map = new Map();

  if (fs.existsSync(outDir)) {
    walkFiles(outDir, "", map);
  } else if (fs.existsSync(publicDir)) {
    walkFiles(publicDir, "", map);
  }

  map.delete("/version.json");
  map.delete("/offline-manifest.json");

  const files = [...map.entries()]
    .filter(([p]) => !p.endsWith(".map") && path.posix.basename(p) !== "version.json")
    .map(([p, revision]) => ({ path: p, revision }))
    .sort((a, b) => a.path.localeCompare(b.path));

  const payload = {
    generatedAt: (opts.now ?? (() => new Date().toISOString()))(),
    files,
    /** @deprecated prefer files; mantido para leituras antigas */
    paths: files.map((f) => f.path),
  };
  const body = JSON.stringify(payload, null, 2) + "\n";

  const publicPath = path.join(publicDir, "offline-manifest.json");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(publicPath, body, "utf8");

  const outPath = path.join(outDir, "offline-manifest.json");
  if (fs.existsSync(outDir)) {
    fs.writeFileSync(outPath, body, "utf8");
  }

  return payload;
}

if (require.main === module) {
  const payload = writeOfflineManifest();
  console.log(
    `write-offline-manifest: ${payload.files.length} file(s) → public/offline-manifest.json`,
  );
}

module.exports = { writeOfflineManifest, walkFiles, fileRevision };
