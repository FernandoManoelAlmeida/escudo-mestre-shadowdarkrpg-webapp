import type { NextConfig } from "next";
import { isGitHubPagesBuild } from "./lib/githubPagesEnv";
import { includeUrlInPrecacheManifest } from "./lib/pwaPrecacheFilter";
import { prefixPrecacheUrl } from "./lib/pwaPrefixPrecacheUrl";
import { subpathRuntimeCachingEntries } from "./lib/pwaWorkboxPatterns";

const buildForCapacitor = process.env.BUILD_ANDROID_CAPACITOR === "1";
const buildForGitHubPages = isGitHubPagesBuild();
const basePath = buildForGitHubPages
  ? process.env.NEXT_PUBLIC_BASE_PATH || "/escudo-mestre-shadowdarkrpg-webapp"
  : "";

const dataCachePattern =
  basePath !== ""
    ? new RegExp(`^${basePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/data/`)
    : /^\/data\//;

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development" || buildForCapacitor,
  register: false,
  /** Não precachear version.json — senão o SW devolve buildId antigo e o banner falha. */
  publicExcludes: ["!noprecache/**/*", "!version.json"],
  scope: basePath ? `${basePath}/` : "/",
  sw: "sw.js",
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    disableDevLogs: true,
    /**
     * Mesmos defaults do next-pwa + exclusão de chunks (se omitirmos `exclude`, perdem-se os
     * defaults do plugin). Isto remove entradas do manifest **antes** dos transforms.
     */
    exclude: [
      /\/_next\/static\/.*(?<!\.p)\.woff2/,
      /\.map$/,
      /^manifest.*\.js$/,
      /^static\/chunks\//,
      ({ asset }: { asset: { name?: string } }) =>
        Boolean(
          asset?.name?.includes("static/chunks") ||
          asset?.name?.includes("static\\chunks"),
        ),
    ],
    manifestTransforms: [
      async (manifestEntries: { url: string; revision?: string | null }[]) => {
        const manifest = manifestEntries
          .map((m) => {
            m.url = prefixPrecacheUrl(m.url, basePath);
            return m;
          })
          .filter((m) => includeUrlInPrecacheManifest(m.url));
        return { manifest, warnings: [] };
      },
    ],
    runtimeCaching: [
      ...subpathRuntimeCachingEntries(basePath),
      {
        urlPattern: dataCachePattern,
        handler: "CacheFirst",
        options: {
          cacheName: "data-cache",
          expiration: {
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/itens-magicos", destination: "/arcanos", permanent: true },
      {
        source: "/itens-magicos/:path*",
        destination: "/arcanos/:path*",
        permanent: true,
      },
    ];
  },
  compiler: {
    styledComponents: true,
  },
  /**
   * Em build GitHub Pages, injeta o mesmo basePath do Next no cliente (evita SW em `/sw.js` na raiz).
   * Fora disso, repassa NEXT_PUBLIC_BASE_PATH do ambiente para não quebrar testes locais com subpath.
   */
  env: {
    NEXT_PUBLIC_BASE_PATH: buildForGitHubPages
      ? basePath
      : (process.env.NEXT_PUBLIC_BASE_PATH ?? ""),
    NEXT_PUBLIC_DEBUG_PWA: process.env.NEXT_PUBLIC_DEBUG_PWA ?? "",
  },
  ...((buildForCapacitor || buildForGitHubPages) && {
    output: "export",
    images: { unoptimized: true },
    trailingSlash: true,
  }),
  ...(basePath && {
    basePath,
  }),
  // Silencia o aviso Turbopack vs webpack no dev (PWA está desativado em desenvolvimento)
  turbopack: {},
};

export default withPWA(nextConfig);
