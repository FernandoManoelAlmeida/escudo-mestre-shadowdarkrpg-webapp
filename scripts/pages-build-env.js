/**
 * Detecção de build GitHub Pages (scripts Node; espelha lib/githubPagesEnv.ts).
 * @param {string} [basePathFromEnv]
 */
function isGitHubPagesBuildEnv(basePathFromEnv = process.env.NEXT_PUBLIC_BASE_PATH) {
  const v = process.env.GITHUB_PAGES;
  if (v === "1" || v === "true") return true;
  const bp = (basePathFromEnv || "").replace(/\/$/, "");
  if (process.env.GITHUB_ACTIONS === "true" && bp.startsWith("/") && bp.length > 1) {
    return true;
  }
  return false;
}

module.exports = { isGitHubPagesBuildEnv };
