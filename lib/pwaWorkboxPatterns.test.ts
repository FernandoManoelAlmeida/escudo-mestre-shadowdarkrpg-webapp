import { describe, it, expect } from "vitest";
import {
  escapePathForRegExp,
  offlineFriendlyRuntimeCaching,
  pagesShellUrlPattern,
  PAGES_SHELL_CACHE,
  subpathRuntimeCachingEntries,
} from "./pwaWorkboxPatterns";

describe("escapePathForRegExp", () => {
  it("escapa caracteres especiais de regex", () => {
    expect(escapePathForRegExp("/repo-name.test")).toBe("/repo-name\\.test");
  });
});

describe("subpathRuntimeCachingEntries", () => {
  it("retorna vazio sem basePath", () => {
    expect(subpathRuntimeCachingEntries("")).toEqual([]);
  });

  it("inclui padrões _next sob o subpath sem timeout no start-url", () => {
    const entries = subpathRuntimeCachingEntries("/escudo-mestre-oprpg-webapp");
    expect(entries).toHaveLength(3);
    const js = entries[0]!.urlPattern as RegExp;
    expect(
      js.test("/escudo-mestre-oprpg-webapp/_next/static/chunks/foo.js"),
    ).toBe(true);
    expect(js.test("/_next/static/chunks/foo.js")).toBe(false);
    expect(entries[0]!.options.expiration?.maxEntries).toBe(256);
    expect(entries[2]!.options.networkTimeoutSeconds).toBeUndefined();
  });
});

describe("pagesShellUrlPattern", () => {
  it("casa HTML e pastas sob basePath, exclui _next", () => {
    const re = pagesShellUrlPattern("/escudo-mestre-oprpg-webapp");
    expect(re.test("/escudo-mestre-oprpg-webapp/regras/")).toBe(true);
    expect(re.test("/escudo-mestre-oprpg-webapp/regras/index.html")).toBe(true);
    expect(re.test("/escudo-mestre-oprpg-webapp/_next/static/x.js")).toBe(
      false,
    );
  });

  it("casa rotas na raiz sem basePath", () => {
    const re = pagesShellUrlPattern("");
    expect(re.test("/regras/")).toBe(true);
    expect(re.test("/")).toBe(true);
    expect(re.test("/_next/static/x.js")).toBe(false);
  });
});

describe("offlineFriendlyRuntimeCaching", () => {
  it("expõe CacheFirst JS e shell HTML sem timeout de navigate", () => {
    const entries = offlineFriendlyRuntimeCaching("");
    expect(entries).toHaveLength(2);
    expect(entries[0]!.handler).toBe("CacheFirst");
    expect(entries[0]!.options.expiration?.maxEntries).toBe(256);
    expect(entries[1]!.handler).toBe("CacheFirst");
    expect(entries[1]!.options.cacheName).toBe(PAGES_SHELL_CACHE);
    expect(entries[1]!.options.networkTimeoutSeconds).toBeUndefined();
  });
});
