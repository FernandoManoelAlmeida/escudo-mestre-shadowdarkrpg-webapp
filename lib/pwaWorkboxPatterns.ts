/** Escapa segmento de path para uso em RegExp (ex.: basePath do GitHub Pages). */
export function escapePathForRegExp(path: string): string {
  return path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Rotas Workbox com prefixo de subpath — os defaults do next-pwa usam `/_next/` na raiz
 * do origin e não casam com `/repo/_next/` no GitHub Pages.
 */
export function subpathRuntimeCachingEntries(basePath: string) {
  if (!basePath) return [];
  const root = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  const esc = escapePathForRegExp(root);

  const expiration = { maxEntries: 64, maxAgeSeconds: 86400 };

  return [
    {
      urlPattern: new RegExp(`^${esc}/_next/static/.+\\.js$`, "i"),
      handler: "CacheFirst" as const,
      options: { cacheName: "next-static-js-assets-subpath", expiration },
    },
    {
      urlPattern: new RegExp(`^${esc}/_next/static/.+\\.css$`, "i"),
      handler: "StaleWhileRevalidate" as const,
      options: { cacheName: "static-style-assets-subpath", expiration },
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
