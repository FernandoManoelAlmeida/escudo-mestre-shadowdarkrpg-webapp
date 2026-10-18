import { describe, it, expect, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  clearAmeacasTokensCache,
  getTokenByAmeacaId,
  type AmeacasTokensData,
} from "./ameacasTokens";

function loadSidecarTokens(): Record<
  string,
  {
    url: string;
    rotulo?: string;
    credito?: string;
    creditoUrl?: string;
    fonte?: string;
  }
> {
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

const COMMUNITY_HOST = "cdn.jsdelivr.net/gh/PrototypeESBU/foundryvtt-shadowdark-community-tokens";
const YST_HOST = "youseethis.blog";

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
          credito: "Shadowdark Community Tokens (Delgore)",
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
      expect(tokens[id]?.fonte).toBe("yst");
    }
    expect(tokens.putaria).toBeUndefined();
  });

  it("Community Tokens primário em ids core (goblin, abolete, morcegos)", () => {
    const tokens = loadSidecarTokens();
    for (const id of ["goblin", "abolete", "morcegos"] as const) {
      expect(tokens[id]?.url, id).toContain(COMMUNITY_HOST);
      expect(tokens[id]?.fonte).toBe("community-tokens");
      expect(tokens[id]?.credito).toMatch(/Community Tokens/i);
      expect(tokens[id]?.creditoUrl).toContain("shadowdark-community-tokens");
    }
    expect(fileOf(tokens.morcegos.url)).toMatch(/bat-swarm/);
    expect(fileOf(tokens.abolete.url)).toMatch(/aboleth/);
  });

  it("censo: bugs corrigidos (beholder, rat, lobo, rust, orc, aranha)", () => {
    const tokens = loadSidecarTokens();
    expect(fileOf(tokens["o-oraculo-de-dez-olhos"].url)).toMatch(
      /the-ten-eyed-oracle|beholder/,
    );
    expect(fileOf(tokens.rato.url)).toMatch(/^rat/);
    expect(fileOf(tokens.lobo.url)).toMatch(/wolf/);
    expect(fileOf(tokens.lobisomem.url)).toMatch(/werewolf/);
    expect(fileOf(tokens["monstro-da-ferrugem"].url)).toMatch(/rust-monster/);
    expect(fileOf(tokens.orc.url)).toMatch(/^orc/);
    expect(fileOf(tokens["aranha-gigante"].url)).toMatch(/spider-giant/);
  });

  it("censo: remoções e LEAVE_BLANK obrigatórios", () => {
    const tokens = loadSidecarTokens();
    for (const id of ["oraculo", "putaria"] as const) {
      expect(tokens[id], id).toBeUndefined();
    }
  });

  it("censo: nenhum Acrobat/Rusty/Wizard Caratacus em monstro errado", () => {
    const tokens = loadSidecarTokens();
    expect(fileOf(tokens.morcegos.url)).not.toMatch(/acrobat/);
    expect(fileOf(tokens["monstro-da-ferrugem"].url)).not.toMatch(/rusty/);
    expect(fileOf(tokens.rato.url)).not.toMatch(/caratacus/);
  });

  it("censo: tokens YST usam ficheiros da lista; Community usa jsDelivr", () => {
    const tokens = loadSidecarTokens();
    const used = new Set(loadUsedFilenames());
    let community = 0;
    let yst = 0;
    for (const [id, tok] of Object.entries(tokens)) {
      if (tok.url.includes(YST_HOST)) {
        yst += 1;
        const f = fileOf(tok.url);
        expect(used.has(f), `${id} -> ${f}`).toBe(true);
        expect(tok.credito).toBe("You see this.");
        expect(tok.fonte ?? "yst").toBe("yst");
      } else {
        community += 1;
        expect(tok.url, id).toContain(COMMUNITY_HOST);
        expect(tok.fonte).toBe("community-tokens");
      }
    }
    expect(community).toBeGreaterThan(200);
    expect(yst).toBeGreaterThan(0);
  });
});
