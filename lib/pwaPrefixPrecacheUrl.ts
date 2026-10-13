/**
 * Prefixa URLs do precache Workbox com o basePath do GitHub Pages.
 * Paths na raiz do origin (`/data/…`) quebram PWAs em subpath.
 */
export function prefixPathname(pathname: string, root: string): string {
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (p === root || p.startsWith(`${root}/`)) return p;
  if (p.startsWith("/_next/") || p === "/_next" || p.startsWith("/static/")) {
    return `${root}${p}`;
  }
  if (p.startsWith("/")) return `${root}${p}`;
  return `${root}/${p}`;
}

export function prefixPrecacheUrl(url: string, basePath: string): string {
  if (!basePath) return url;
  const root = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  if (url === root || url.startsWith(`${root}/`)) return url;

  try {
    const u = new URL(url);
    const nextPath = prefixPathname(u.pathname, root);
    if (nextPath !== u.pathname) {
      u.pathname = nextPath;
      return u.href;
    }
    return url;
  } catch {
    /* path relativo */
  }

  if (url.startsWith("/")) {
    return prefixPathname(url, root);
  }
  if (url.startsWith("_next/") || url.startsWith("static/")) {
    return `${root}/${url}`;
  }
  if (
    url.startsWith("data/") ||
    url.startsWith("icons/") ||
    url.startsWith("branding/") ||
    url.startsWith("fonts/")
  ) {
    return `${root}/${url}`;
  }
  return url;
}
