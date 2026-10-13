import { describe, it, expect } from "vitest";
import { prefixPrecacheUrl, prefixPathname } from "./pwaPrefixPrecacheUrl";

const ROOT = "/escudo-mestre-shadowdarkrpg-webapp";

describe("prefixPathname", () => {
  it("prefixa paths na raiz do origin", () => {
    expect(prefixPathname("/data/ameacas.json", ROOT)).toBe(
      `${ROOT}/data/ameacas.json`,
    );
    expect(prefixPathname("/icons/icon-192.png", ROOT)).toBe(
      `${ROOT}/icons/icon-192.png`,
    );
  });

  it("não duplica prefixo", () => {
    expect(prefixPathname(`${ROOT}/data/x.json`, ROOT)).toBe(
      `${ROOT}/data/x.json`,
    );
  });
});

describe("prefixPrecacheUrl", () => {
  it("retorna URL inalterada sem basePath", () => {
    expect(prefixPrecacheUrl("/data/x.json", "")).toBe("/data/x.json");
  });

  it("prefixa paths relativos com barra", () => {
    expect(prefixPrecacheUrl("/data/ameacas.json", ROOT)).toBe(
      `${ROOT}/data/ameacas.json`,
    );
    expect(prefixPrecacheUrl("/branding/x.png", ROOT)).toBe(
      `${ROOT}/branding/x.png`,
    );
  });

  it("prefixa paths sem barra inicial", () => {
    expect(prefixPrecacheUrl("data/ameacas.json", ROOT)).toBe(
      `${ROOT}/data/ameacas.json`,
    );
    expect(prefixPrecacheUrl("icons/icon-192.webp", ROOT)).toBe(
      `${ROOT}/icons/icon-192.webp`,
    );
  });

  it("prefixa _next e URLs absolutas na raiz", () => {
    expect(prefixPrecacheUrl("/_next/static/chunks/a.js", ROOT)).toBe(
      `${ROOT}/_next/static/chunks/a.js`,
    );
    expect(
      prefixPrecacheUrl("https://example.github.io/data/x.json", ROOT),
    ).toBe("https://example.github.io/escudo-mestre-shadowdarkrpg-webapp/data/x.json");
  });
});
