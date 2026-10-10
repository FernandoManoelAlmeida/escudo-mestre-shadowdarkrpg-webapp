/**
 * Tudo sob `/_next/` no export estático é frágil para precache:
 * - `static/chunks/*` muda de hash a cada build;
 * - `build-manifest.json`, `server/*`, etc. **nem sequer** vão para `out/` no `output: "export"`,
 *   mas o Workbox ainda os lista → 404 e `bad-precaching-response`.
 *
 * O plugin @ducanh2912/next-pwa corre os nossos `manifestTransforms` **antes** do transform
 * interno; nessa fase as URLs podem ser `static/chunks/...` (sem `/_next/`). Filtramos também.
 * O runtime Workbox já cobre `/_next/static/*.js` e restantes assets.
 */
export function includeUrlInPrecacheManifest(url: string): boolean {
  const pathOnly = (url.split("?")[0] ?? url).replace(/^https?:\/\/[^/]+/i, "");
  const n = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  if (n.includes("/_next/")) return false;
  if (/\/static\/chunks\//.test(n)) return false;
  return true;
}
