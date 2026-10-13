const fs = require("fs");
const path = require("path");

/** @param {string} [basePath] */
function normalizeBasePath(basePath) {
  return (basePath || "").replace(/\/$/, "");
}

/**
 * Caminhos possíveis do SW após `next build` (next-pwa + export).
 * Com basePath, o plugin pode emitir em `public/<repo>/sw.js`.
 * @param {string} projectRoot
 * @param {string} [basePath]
 */
function listSwCandidates(projectRoot, basePath) {
  const root = path.resolve(projectRoot);
  const bp = normalizeBasePath(basePath);
  const paths = [
    path.join(root, "public", "sw.js"),
    path.join(root, "out", "sw.js"),
  ];
  if (bp) {
    const seg = bp.replace(/^\//, "");
    paths.unshift(
      path.join(root, "public", seg, "sw.js"),
      path.join(root, "out", seg, "sw.js"),
    );
  }
  return paths;
}

/** @returns {string | null} */
function findExistingSwPath(projectRoot, basePath) {
  for (const p of listSwCandidates(projectRoot, basePath)) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/** Ficheiros workbox-*.js em public/ (raiz ou subpasta do basePath). */
function listPublicWorkboxFiles(projectRoot, basePath) {
  const root = path.resolve(projectRoot);
  const dirs = [path.join(root, "public")];
  const bp = normalizeBasePath(basePath);
  if (bp) {
    dirs.push(path.join(root, "public", bp.replace(/^\//, "")));
  }
  const files = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (name.startsWith("workbox-") && name.endsWith(".js")) {
        files.push(path.join(dir, name));
      }
    }
  }
  return files;
}

module.exports = {
  normalizeBasePath,
  listSwCandidates,
  findExistingSwPath,
  listPublicWorkboxFiles,
};
