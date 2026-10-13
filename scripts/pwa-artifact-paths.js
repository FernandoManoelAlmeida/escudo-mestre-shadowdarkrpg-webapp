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

/** @param {string} dir @param {number} [maxDepth] */
function findSwJsUnder(dir, maxDepth = 4) {
  const found = [];
  if (!fs.existsSync(dir)) return found;
  function walk(current, depth) {
    if (depth > maxDepth) return;
    for (const name of fs.readdirSync(current)) {
      const full = path.join(current, name);
      let st;
      try {
        st = fs.statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) walk(full, depth + 1);
      else if (name === "sw.js") found.push(full);
    }
  }
  walk(dir, 0);
  return found;
}

/** Diagnóstico quando o SW não foi gerado no build Pages. */
function formatSwDiagnostic(projectRoot, basePath) {
  const root = path.resolve(projectRoot);
  const { isGitHubPagesBuildEnv } = require("./pages-build-env.js");
  const bp = normalizeBasePath(basePath);
  const lines = [
    `  pagesBuild=${isGitHubPagesBuildEnv(bp)} GITHUB_PAGES=${process.env.GITHUB_PAGES ?? "(unset)"} GITHUB_ACTIONS=${process.env.GITHUB_ACTIONS ?? "(unset)"}`,
    `  NEXT_PUBLIC_BASE_PATH=${bp || "(unset)"}`,
    `  .next/BUILD_ID=${fs.existsSync(path.join(root, ".next", "BUILD_ID"))}`,
  ];
  for (const sub of ["public", "out"]) {
    const hits = findSwJsUnder(path.join(root, sub));
    lines.push(
      `  ${sub}/**/sw.js: ${hits.length ? hits.map((p) => path.relative(root, p)).join(", ") : "(nenhum)"}`,
    );
  }
  return lines.join("\n");
}

module.exports = {
  normalizeBasePath,
  listSwCandidates,
  findExistingSwPath,
  listPublicWorkboxFiles,
  findSwJsUnder,
  formatSwDiagnostic,
};
