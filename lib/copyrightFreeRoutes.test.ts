import { describe, it, expect, afterEach, vi } from "vitest";

describe("copyrightFreeRoutes", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("com flag off todas as rotas ficam activas", async () => {
    vi.stubEnv("NEXT_PUBLIC_COPYRIGHT_FREE", "");
    vi.resetModules();
    const { isCopyrightFreeRouteEnabled, areGeradoresEnabled } = await import(
      "./copyrightFreeRoutes"
    );
    expect(isCopyrightFreeRouteEnabled("/regras/tabelas")).toBe(true);
    expect(isCopyrightFreeRouteEnabled("/geradores/encontros")).toBe(true);
    expect(areGeradoresEnabled()).toBe(true);
  });

  it("com flag on desliga tabelas, glossário e geradores", async () => {
    vi.stubEnv("NEXT_PUBLIC_COPYRIGHT_FREE", "1");
    vi.resetModules();
    const { isCopyrightFreeRouteEnabled, areGeradoresEnabled } = await import(
      "./copyrightFreeRoutes"
    );
    expect(isCopyrightFreeRouteEnabled("/regras/tabelas")).toBe(false);
    expect(isCopyrightFreeRouteEnabled("/regras/glossario")).toBe(false);
    expect(isCopyrightFreeRouteEnabled("/geradores")).toBe(false);
    expect(isCopyrightFreeRouteEnabled("/geradores/pnjs")).toBe(false);
    expect(isCopyrightFreeRouteEnabled("/regras")).toBe(true);
    expect(isCopyrightFreeRouteEnabled("/ameacas")).toBe(true);
    expect(areGeradoresEnabled()).toBe(false);
  });
});
