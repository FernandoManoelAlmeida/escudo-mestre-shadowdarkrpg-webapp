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
});
