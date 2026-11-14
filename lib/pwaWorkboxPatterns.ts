/** Escapa segmento de path para uso em RegExp (ex.: basePath do GitHub Pages). */
export function escapePathForRegExp(path: string): string {
  return path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const JS_EXPIRATION = { maxEntries: 256, maxAgeSeconds: 86400 };
const NAV_EXPIRATION = { maxEntries: 64, maxAgeSeconds: 86400 };

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
        networkTimeoutSeconds: 3,
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
 * Entradas prependidas aos defaults do next-pwa: mais entradas JS e
 * navegação com timeout curto para hard reload offline.
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

  const navigatePattern = root
    ? ({
        request,
        sameOrigin,
        url,
      }: {
        request: Request;
        sameOrigin: boolean;
        url: URL;
      }) =>
        sameOrigin &&
        request.mode === "navigate" &&
        url.pathname.startsWith(`${root}/`)
    : ({
        request,
        sameOrigin,
      }: {
        request: Request;
        sameOrigin: boolean;
      }) => sameOrigin && request.mode === "navigate";

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
      urlPattern: navigatePattern,
      handler: "NetworkFirst" as const,
      options: {
        cacheName: "pages-navigate-offline",
        networkTimeoutSeconds: 3,
        expiration: NAV_EXPIRATION,
      },
    },
  ];
}
