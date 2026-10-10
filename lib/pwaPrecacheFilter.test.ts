import { describe, it, expect } from "vitest";
import { includeUrlInPrecacheManifest } from "./pwaPrecacheFilter";

describe("includeUrlInPrecacheManifest", () => {
  it("exclui qualquer URL sob /_next/ (export estático não publica build-manifest nem server/)", () => {
    expect(
      includeUrlInPrecacheManifest("/repo/_next/static/chunks/main-abc.js"),
    ).toBe(false);
    expect(
      includeUrlInPrecacheManifest("/repo/_next/build-manifest.json"),
    ).toBe(false);
    expect(
      includeUrlInPrecacheManifest(
        "/repo/_next/server/middleware-build-manifest.js",
      ),
    ).toBe(false);
  });

  it("exclui caminhos static/chunks/ do Webpack (antes do transform interno do next-pwa)", () => {
    expect(includeUrlInPrecacheManifest("static/chunks/511-abc.js")).toBe(
      false,
    );
    expect(
      includeUrlInPrecacheManifest("/static/chunks/framework-dead.js"),
    ).toBe(false);
  });

  it("mantém dados, ícones e assets públicos", () => {
    expect(includeUrlInPrecacheManifest("/repo/data/ameacas.json")).toBe(true);
    expect(includeUrlInPrecacheManifest("/repo/icons/icon-192.webp")).toBe(
      true,
    );
    expect(includeUrlInPrecacheManifest("/repo/version.json")).toBe(true);
    expect(includeUrlInPrecacheManifest("/repo/swe-worker-abc.js")).toBe(true);
  });

  it("ignora query string e origem absoluta", () => {
    expect(
      includeUrlInPrecacheManifest(
        "https://x.github.io/repo/_next/static/chunks/a.js?v=1",
      ),
    ).toBe(false);
    expect(
      includeUrlInPrecacheManifest("https://x.github.io/repo/icons/a.webp"),
    ).toBe(true);
  });
});
