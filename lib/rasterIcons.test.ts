import { describe, it, expect, afterEach, vi } from "vitest";

describe("rasterIcons", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rasterIconHref monta URL com base path", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/prefix");
    vi.resetModules();
    const { rasterIconHref, RASTER_ICON_META } = await import("./rasterIcons");
    expect(rasterIconHref("home-icon")).toBe("/prefix/icons/home-icon.webp");
    expect(RASTER_ICON_META["regras-icon"]).toEqual({ w: 512, h: 512 });
  });

  it("COPYRIGHT_FREE mantém os mesmos ícones do app", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "");
    vi.stubEnv("NEXT_PUBLIC_COPYRIGHT_FREE", "1");
    vi.resetModules();
    const { rasterIconHref, pwaIconPath } = await import("./rasterIcons");
    expect(rasterIconHref("home-icon")).toBe("/icons/home-icon.webp");
    expect(rasterIconHref("ameacas-icon")).toBe("/icons/ameacas-icon.webp");
    expect(pwaIconPath("icon-192.png")).toBe("/icons/icon-192.png");
  });
});
