import { describe, it, expect, afterEach, vi } from "vitest";

describe("assetUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefixa path com NEXT_PUBLIC_BASE_PATH", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/app");
    vi.resetModules();
    const { assetUrl } = await import("./basePath");
    expect(assetUrl("/icons/x.webp")).toBe("/app/icons/x.webp");
  });

  it("com base vazia mantém path absoluto", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "");
    vi.resetModules();
    const { assetUrl } = await import("./basePath");
    expect(assetUrl("/x")).toBe("/x");
  });

  it("path sem barra inicial recebe barra antes do sufixo", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "");
    vi.resetModules();
    const { assetUrl } = await import("./basePath");
    expect(assetUrl("icons/a.webp")).toBe("/icons/a.webp");
  });
});
