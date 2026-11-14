/** Escapa segmento de path para uso em RegExp (ex.: basePath do GitHub Pages). */
export function escapePathForRegExp(path: string): string {
  return path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Cache runtime partilhado pelo warm e pela rota CacheFirst de documentos. */
export const PAGES_SHELL_CACHE = "pages-shell-offline";

const JS_EXPIRATION = { maxEntries: 256, maxAgeSeconds: 86400 };
const SHELL_EXPIRATION = { maxEntries: 64, maxAgeSeconds: 30 * 24 * 60 * 60 };

/**
 * Rotas Workbox com prefixo de subpath — os defaults do next-pwa usam `/_next/` na raiz
 * do origin e não casam com `/repo/_next/` no GitHub Pages.
 */
export function subpathRuntimeCachingEntries(basePath: string) {
  if (!basePath) return [];
  const root = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  const esc = escapePathForRegExp(root);

  return [
    {
      urlPattern: new RegExp(`^${esc}/_next/static/.+\\.js$`, "i"),
      handler: "CacheFirst" as const,
      options: {
        cacheName: "next-static-js-assets-subpath",
        expiration: JS_EXPIRATION,
      },
    },
    {
      urlPattern: new RegExp(`^${esc}/_next/static/.+\\.css$`, "i"),
      handler: "StaleWhileRevalidate" as const,
      options: {
        cacheName: "static-style-assets-subpath",
        expiration: { maxEntries: 64, maxAgeSeconds: 86400 },
      },
    },
    {
      urlPattern: new RegExp(`^${esc}/?$`),
      handler: "NetworkFirst" as const,
      options: {
        cacheName: "start-url-subpath",
        plugins: [
          {
            cacheWillUpdate: async ({
              response,
            }: {
              response: Response | undefined;
            }) => {
              if (response && response.type === "opaqueredirect") {
                return new Response(response.body, {
                  status: 200,
                  statusText: "OK",
                  headers: response.headers,
                });
              }
              return response;
            },
          },
        ],
      },
    },
  ];
}

/**
 * HTML de export estático (termina em `/` ou `.html`), excluindo `/_next/`.
 */
export function pagesShellUrlPattern(basePath: string): RegExp {
  const root = basePath
    ? basePath.endsWith("/")
      ? basePath.slice(0, -1)
      : basePath
    : "";
  if (root) {
    const esc = escapePathForRegExp(root);
    return new RegExp(`^${esc}/(?!_next/)(?:.*\\/|.*\\.html)$`, "i");
  }
  return /^(?!\/_next\/)(?:\/.*\/|\/.*\.html|\/)$/i;
}

/**
 * Entradas prependidas aos defaults: JS com mais entradas + shell HTML CacheFirst
 * para hard reload offline de sub-rotas.
 */
export function offlineFriendlyRuntimeCaching(basePath: string) {
  const root = basePath
    ? basePath.endsWith("/")
      ? basePath.slice(0, -1)
      : basePath
    : "";
  const esc = root ? escapePathForRegExp(root) : "";

  const jsPattern = root
    ? new RegExp(`^${esc}/_next/static.+\\.js$`, "i")
    : /\/_next\/static.+\.js$/i;

  return [
    {
      urlPattern: jsPattern,
      handler: "CacheFirst" as const,
      options: {
        cacheName: "next-static-js-assets-offline",
        expiration: JS_EXPIRATION,
      },
    },
    {
      urlPattern: pagesShellUrlPattern(basePath),
      handler: "CacheFirst" as const,
      options: {
        cacheName: PAGES_SHELL_CACHE,
        expiration: SHELL_EXPIRATION,
      },
    },
  ];
}
