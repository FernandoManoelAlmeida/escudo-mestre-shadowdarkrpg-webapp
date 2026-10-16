import { describe, it, expect, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  clearAmeacasTokensCache,
  getTokenByAmeacaId,
  type AmeacasTokensData,
} from "./ameacasTokens";

function loadSidecarTokens(): Record<string, { url: string; rotulo?: string; credito?: string }> {
  const raw = JSON.parse(
    readFileSync(
      join(__dirname, "../public/data/ameacas-tokens.json"),
      "utf8",
    ),
  ) as AmeacasTokensData;
  return raw.tokens ?? {};
}

function loadUsedFilenames(): string[] {
  return JSON.parse(
    readFileSync(
      join(__dirname, "../tests/fixtures/yst-token-filenames-used.json"),
      "utf8",
    ),
  ) as string[];
}

function fileOf(url: string): string {
  return decodeURIComponent(url.split("/").pop() ?? "").toLowerCase();
}

describe("ameacasTokens", () => {
  afterEach(() => {
    clearAmeacasTokensCache();
    vi.unstubAllGlobals();
  });

  it("getTokenByAmeacaId devolve entrada do mapa", () => {
    const data: AmeacasTokensData = {
      tokens: {
        goblin: {
          url: "https://example.com/goblin.png",
          credito: "You see this.",
          rotulo: "Goblin",
        },
      },
    };
    expect(getTokenByAmeacaId(data, "goblin")?.url).toContain("goblin");
    expect(getTokenByAmeacaId(data, "ausente")).toBeUndefined();
  });

  it("getAmeacasTokens faz fetch do sidecar", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          tokens: { esqueleto: { url: "https://cdn.example/skel.png" } },
        }),
      }),
    );
    clearAmeacasTokensCache();
    const { getAmeacasTokens } = await import("./ameacasTokens");
    const data = await getAmeacasTokens();
    expect(data.tokens.esqueleto?.url).toContain("skel");
  });

  it("Matriprole/Matrímpio mapeiam Githyanki; putaria sem token", () => {
    const tokens = loadSidecarTokens();
    const matri = [
      "guerreiro-matriprole",
      "cavaleiro-matriprole",
      "dragomante-matriprole",
      "monge-matrimpio",
      "zerth-matrimpio",
      "psion-matrimpio",
    ] as const;
    for (const id of matri) {
      expect(tokens[id]?.url).toMatch(/gith_\d_fbb\.png/);
      expect(tokens[id]?.rotulo).toBe("Githyanki");
      expect(tokens[id]?.credito).toBe("You see this.");
    }
    expect(tokens.putaria).toBeUndefined();
  });

  it("censo: bugs corrigidos (bat, beholder, rat, lobo, rust, orc, aranha)", () => {
    const tokens = loadSidecarTokens();
    expect(fileOf(tokens.morcegos.url)).toMatch(/^bat_/);
    expect(tokens.morcegos.rotulo).toBe("Bat");
    expect(fileOf(tokens["o-oraculo-de-dez-olhos"].url)).toMatch(/beholder/);
    expect(fileOf(tokens.rato.url)).toMatch(/^rat_/);
    expect(fileOf(tokens.lobo.url)).toMatch(/wolf_warg/);
    expect(fileOf(tokens.lobisomem.url)).toMatch(/werewolf/);
    expect(fileOf(tokens["monstro-da-ferrugem"].url)).toMatch(/rust_monster/);
    expect(fileOf(tokens.orc.url)).toMatch(/^orc_/);
    expect(fileOf(tokens["aranha-gigante"].url)).toMatch(/spider_giant/);
  });

  it("censo: remoções e LEAVE_BLANK obrigatórios", () => {
    const tokens = loadSidecarTokens();
    for (const id of [
      "hipopotamo",
      "arraia-gigante",
      "mastim",
      "oraculo",
      "putaria",
    ] as const) {
      expect(tokens[id], id).toBeUndefined();
    }
  });

  it("censo: nenhum Acrobat/Rusty/Wizard Caratacus em monstro errado", () => {
    const tokens = loadSidecarTokens();
    expect(fileOf(tokens.morcegos.url)).not.toMatch(/acrobat/);
    expect(fileOf(tokens["monstro-da-ferrugem"].url)).not.toMatch(/rusty/);
    expect(fileOf(tokens.rato.url)).not.toMatch(/caratacus/);
  });

  it("censo: URLs do sidecar estão na lista de ficheiros YST usados", () => {
    const tokens = loadSidecarTokens();
    const used = new Set(loadUsedFilenames());
    for (const [id, tok] of Object.entries(tokens)) {
      const f = fileOf(tok.url);
      expect(used.has(f), `${id} -> ${f}`).toBe(true);
      expect(tok.credito).toBe("You see this.");
    }
  });
});
