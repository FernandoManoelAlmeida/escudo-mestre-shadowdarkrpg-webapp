import { describe, it, expect, vi, afterEach } from "vitest";

describe("getPwaServiceWorkerUrls", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("usa raiz do origin sem basePath", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "");
    const { getPwaServiceWorkerUrls } = await import("./pwaServiceWorkerUrls");
    const { scopeUrl, swScriptUrl } = getPwaServiceWorkerUrls(
      "https://example.com",
    );
    expect(scopeUrl).toBe("https://example.com/");
    expect(swScriptUrl).toBe("https://example.com/sw.js");
  });

  it("prefixa scope e sw com basePath do GitHub Pages", async () => {
    vi.stubEnv(
      "NEXT_PUBLIC_BASE_PATH",
      "/escudo-mestre-shadowdarkrpg-webapp",
    );
    const { getPwaServiceWorkerUrls } = await import("./pwaServiceWorkerUrls");
    const { scopeUrl, swScriptUrl } = getPwaServiceWorkerUrls(
      "https://ferandomanoelalmeida.github.io",
    );
    expect(scopeUrl).toBe(
      "https://ferandomanoelalmeida.github.io/escudo-mestre-shadowdarkrpg-webapp/",
    );
    expect(swScriptUrl).toBe(
      "https://ferandomanoelalmeida.github.io/escudo-mestre-shadowdarkrpg-webapp/sw.js",
    );
  });
});

describe("isPwaDebugEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("só activa com NEXT_PUBLIC_DEBUG_PWA=1", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEBUG_PWA", "");
    const { isPwaDebugEnabled } = await import("./pwaServiceWorkerUrls");
    expect(isPwaDebugEnabled()).toBe(false);
    vi.stubEnv("NEXT_PUBLIC_DEBUG_PWA", "1");
    vi.resetModules();
    const mod = await import("./pwaServiceWorkerUrls");
    expect(mod.isPwaDebugEnabled()).toBe(true);
  });
});
