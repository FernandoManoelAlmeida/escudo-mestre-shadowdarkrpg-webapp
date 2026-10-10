import { describe, it, expect, vi, afterEach } from "vitest";
import { pwaInstallSolidColors } from "@/lib/pwaColors";

describe("app/manifest", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("retorna manifest PWA com ícones prefixados pelo base path", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/meu-repo");
    const mod = await import("@/app/manifest");
    const m = mod.default();
    expect(m.name).toContain("Escudo do Mestre");
    expect(m.start_url).toBe("/meu-repo/");
    expect(m.scope).toBe("/meu-repo/");
    expect(m.icons).toHaveLength(4);
    expect(
      m.icons?.filter((i) => i.purpose === "any").map((i) => i.src),
    ).toEqual([
      "/meu-repo/icons/icon-192.webp",
      "/meu-repo/icons/icon-512.webp",
    ]);
    expect(m.theme_color).toBe(pwaInstallSolidColors.themeColor);
    expect(m.background_color).toBe(pwaInstallSolidColors.backgroundColor);
  });

  it("com base path vazio usa URLs na raiz", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "");
    vi.resetModules();
    const mod = await import("@/app/manifest");
    const m = mod.default();
    expect(m.start_url).toBe("/");
    expect(m.icons?.[0]?.src).toBe("/icons/icon-192.webp");
  });
});
