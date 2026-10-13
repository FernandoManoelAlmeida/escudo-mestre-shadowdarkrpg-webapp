function hasGitHubPagesBasePath(): boolean {
  const bp = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return bp.startsWith("/") && bp.length > 1;
}

/** GitHub Actions define `GITHUB_PAGES: true` (string "true"); builds locais usam `1`. */
export function isGitHubPagesBuild(): boolean {
  const v = process.env.GITHUB_PAGES;
  if (v === "1" || v === "true") return true;
  /** CI com subpath mas `GITHUB_PAGES` ausente até ao `configure-pages`. */
  if (process.env.GITHUB_ACTIONS === "true" && hasGitHubPagesBasePath()) {
    return true;
  }
  return false;
}
