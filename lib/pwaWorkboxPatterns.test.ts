import { describe, it, expect } from "vitest";
import {
  escapePathForRegExp,
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
    const entries = subpathRuntimeCachingEntries(
      "/escudo-mestre-shadowdarkrpg-webapp",
    );
    expect(entries).toHaveLength(3);
    const js = entries[0]!.urlPattern as RegExp;
    expect(
      js.test(
        "/escudo-mestre-shadowdarkrpg-webapp/_next/static/chunks/foo.js",
      ),
    ).toBe(true);
    expect(js.test("/_next/static/chunks/foo.js")).toBe(false);
  });
});
