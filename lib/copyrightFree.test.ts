import { describe, it, expect, afterEach, vi } from "vitest";

describe("isCopyrightFree", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("é false por defeito", async () => {
    vi.stubEnv("NEXT_PUBLIC_COPYRIGHT_FREE", "");
    const { isCopyrightFree } = await import("./copyrightFree");
    expect(isCopyrightFree()).toBe(false);
  });

  it("é true com NEXT_PUBLIC_COPYRIGHT_FREE=1", async () => {
    vi.stubEnv("NEXT_PUBLIC_COPYRIGHT_FREE", "1");
    const { isCopyrightFree } = await import("./copyrightFree");
    expect(isCopyrightFree()).toBe(true);
  });
});

describe("copyrightFreeFilter", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function filtersWithFlag(flag: string) {
    vi.stubEnv("NEXT_PUBLIC_COPYRIGHT_FREE", flag);
    vi.resetModules();
    return import("./copyrightFreeFilter");
  }

  it("com flag off mantém tudo", async () => {
    const f = await filtersWithFlag("");
    expect(f.keepMagiaForCopyrightFree({ origem: "Cursed Scroll 1" })).toBe(
      true,
    );
    expect(
      f.keepCatalogoPersonagemForCopyrightFree({ origem: "Livro" }),
    ).toBe(true);
    expect(f.keepAmeacaForCopyrightFree({ fonte: "Cursed Scroll 2." })).toBe(
      true,
    );
    expect(f.keepTabelaIndexForCopyrightFree()).toBe(true);
  });

  it("com flag on omite CS e classes do livro; mantém magia/item/ameaça core", async () => {
    const f = await filtersWithFlag("1");
    expect(f.keepMagiaForCopyrightFree({ origem: "Cursed Scroll 1" })).toBe(
      false,
    );
    expect(f.keepMagiaForCopyrightFree({ origem: "Livro" })).toBe(true);
    expect(f.keepMagiaForCopyrightFree({ origem: "Astraldark" })).toBe(true);
    expect(
      f.keepCatalogoPersonagemForCopyrightFree({ origem: "Livro" }),
    ).toBe(false);
    expect(
      f.keepCatalogoPersonagemForCopyrightFree({
        origem: "Astraldark",
        fonte: "astraldark",
      }),
    ).toBe(true);
    expect(f.keepItemMagicoForCopyrightFree({ origem: "Livro" })).toBe(true);
    expect(
      f.keepItemMagicoForCopyrightFree({ origem: "Cursed Scroll 3" }),
    ).toBe(false);
    expect(f.keepAmeacaForCopyrightFree({ fonte: "Bestiário" })).toBe(true);
    expect(f.keepAmeacaForCopyrightFree({ fonte: "Cursed Scroll 1." })).toBe(
      false,
    );
    expect(f.keepAmeacaForCopyrightFree({ origem: "homebrew" })).toBe(true);
    expect(f.keepTabelaIndexForCopyrightFree()).toBe(false);
    expect(f.keepEscudoProsaForCopyrightFree()).toBe(false);
  });
});
