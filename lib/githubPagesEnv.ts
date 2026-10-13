/** GitHub Actions define `GITHUB_PAGES: true` (string "true"); builds locais usam `1`. */
export function isGitHubPagesBuild(): boolean {
  const v = process.env.GITHUB_PAGES;
  return v === "1" || v === "true";
}
