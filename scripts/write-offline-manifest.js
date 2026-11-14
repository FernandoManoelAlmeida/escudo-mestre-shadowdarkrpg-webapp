#!/usr/bin/env node
/**
 * Gera public/offline-manifest.json (e out/ se existir) com paths relativos
 * para aquecer o cache offline no cliente. Exclui version.json e sourcemaps.
 *
 * Uso: node scripts/write-offline-manifest.js
 * Chamado por write-version.js após o build.
 */
const fs = require("fs");
const path = require("path");

const SKIP_NAMES = new Set([
  "version.json",
  ".DS_Store",
  "Thumbs.db",
]);

/**
 * @param {string} dir
 * @param {string} urlBase path URL sem trailing slash ("" = raiz)
 * @param {string[]} acc
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
    acc.push(urlPath.startsWith("/") ? urlPath : `/${urlPath}`);
    if (name === "index.html") {
      const dirUrl = urlBase === "" ? "/" : `${urlBase}/`;
      if (!acc.includes(dirUrl)) acc.push(dirUrl);
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
  const paths = [];

  if (fs.existsSync(outDir)) {
    walkFiles(outDir, "", paths);
  } else if (fs.existsSync(publicDir)) {
    walkFiles(publicDir, "", paths);
  }

  const unique = [...new Set(paths)].filter((p) => {
    const base = path.posix.basename(p);
    if (base === "version.json") return false;
    if (base.endsWith(".map")) return false;
    return true;
  });
  unique.sort();

  const payload = {
    generatedAt: (opts.now ?? (() => new Date().toISOString()))(),
    paths: unique,
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
    `write-offline-manifest: ${payload.paths.length} path(s) → public/offline-manifest.json`,
  );
}

module.exports = { writeOfflineManifest, walkFiles };
