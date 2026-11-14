import { describe, it, expect } from "vitest";
import {
  escapePathForRegExp,
  offlineFriendlyRuntimeCaching,
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

  it("inclui padrões _next sob o subpath", () => {
    const entries = subpathRuntimeCachingEntries("/escudo-mestre-oprpg-webapp");
    expect(entries).toHaveLength(3);
    const js = entries[0]!.urlPattern as RegExp;
    expect(
      js.test("/escudo-mestre-oprpg-webapp/_next/static/chunks/foo.js"),
    ).toBe(true);
    expect(js.test("/_next/static/chunks/foo.js")).toBe(false);
    expect(entries[0]!.options.expiration?.maxEntries).toBe(256);
  });
});

describe("offlineFriendlyRuntimeCaching", () => {
  it("expõe CacheFirst JS com maxEntries 256 e NetworkFirst navigate", () => {
    const entries = offlineFriendlyRuntimeCaching("");
    expect(entries).toHaveLength(2);
    expect(entries[0]!.handler).toBe("CacheFirst");
    expect(entries[0]!.options.expiration?.maxEntries).toBe(256);
    expect(entries[1]!.handler).toBe("NetworkFirst");
    expect(entries[1]!.options.networkTimeoutSeconds).toBe(3);
  });
});
