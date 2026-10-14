import { describe, it, expect, vi } from "vitest";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const require = createRequire(import.meta.url);

describe("scripts/write-version", () => {
  const {
    writeVersion,
    assertPagesServiceWorker,
  } = require("../scripts/write-version.js");

  it("grava version.json com buildId fallback", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "em-wv-"));
    const payload = writeVersion(dir, {
      now: () => "2020-01-01T00:00:00.000Z",
    });
    expect(payload.generatedAt).toBe("2020-01-01T00:00:00.000Z");
    expect(payload.buildId).toMatch(/^build-/);
    const raw = fs.readFileSync(
      path.join(dir, "public", "version.json"),
      "utf8",
    );
    expect(JSON.parse(raw).buildId).toBe(payload.buildId);
  });

  it("usa BUILD_ID quando .next/BUILD_ID existe", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "em-wv2-"));
    const nextDir = path.join(dir, ".next");
    fs.mkdirSync(nextDir, { recursive: true });
    fs.writeFileSync(path.join(nextDir, "BUILD_ID"), "abc123\n", "utf8");
    const payload = writeVersion(dir);
    expect(payload.buildId).toBe("abc123");
  });

  it("atualiza out/version.json quando a pasta out/ existe (export estático)", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "em-wv3-"));
    fs.mkdirSync(path.join(dir, "public"), { recursive: true });
    fs.mkdirSync(path.join(dir, "out"), { recursive: true });
    fs.writeFileSync(
      path.join(dir, "out", "version.json"),
      '{"buildId":"velho"}\n',
      "utf8",
    );
    const payload = writeVersion(dir, {
      now: () => "2021-01-01T00:00:00.000Z",
    });
    const outRaw = fs.readFileSync(
      path.join(dir, "out", "version.json"),
      "utf8",
    );
    expect(JSON.parse(outRaw).buildId).toBe(payload.buildId);
    expect(JSON.parse(outRaw).generatedAt).toBe("2021-01-01T00:00:00.000Z");
  });

  it("copia public/<basePath>/sw.js para out/sw.js quando aplicável", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "em-wv5-"));
    fs.mkdirSync(path.join(dir, "public", "repo"), { recursive: true });
    fs.mkdirSync(path.join(dir, "out"), { recursive: true });
    fs.writeFileSync(
      path.join(dir, "public", "repo", "sw.js"),
      'precacheAndRoute([{url:"/repo/data/x.json"}])',
      "utf8",
    );
    const { syncPwaArtifactsToOut } = require("../scripts/write-version.js");
    syncPwaArtifactsToOut(dir, "/repo");
    expect(fs.readFileSync(path.join(dir, "out", "sw.js"), "utf8")).toContain(
      "/repo/data/x.json",
    );
  });

  it("assertPagesServiceWorker termina build Pages sem sw.js", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "em-wv6-"));
    fs.mkdirSync(path.join(dir, "out"), { recursive: true });
    vi.stubEnv("GITHUB_PAGES", "1");
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/repo");
    const exit = vi
      .spyOn(process, "exit")
      .mockImplementation((code: number | null | undefined) => {
        throw new Error(`exit:${code}`);
      });
    expect(() => assertPagesServiceWorker(dir)).toThrow("exit:1");
    exit.mockRestore();
    vi.unstubAllEnvs();
  });

  it("copia public/sw.js para out/ após o build PWA", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "em-wv4-"));
    fs.mkdirSync(path.join(dir, "public"), { recursive: true });
    fs.mkdirSync(path.join(dir, "out"), { recursive: true });
    fs.writeFileSync(
      path.join(dir, "public", "sw.js"),
      'precacheAndRoute([{url:"/repo/data/x.json"}])',
      "utf8",
    );
    fs.writeFileSync(
      path.join(dir, "out", "sw.js"),
      'precacheAndRoute([{url:"/data/x.json"}])',
      "utf8",
    );
    writeVersion(dir);
    expect(fs.readFileSync(path.join(dir, "out", "sw.js"), "utf8")).toContain(
      "/repo/data/x.json",
    );
  });
});

describe("scripts/migrate-ameacas-shadowdark", () => {
  const {
    slug,
    parseStatsLine,
    parseCreatureBlock,
    splitCreatureBlocksFromBody,
    stripAttributionFooter,
  } = require("../scripts/migrate-ameacas-shadowdark.js");
  const {
    sanitizeHomebrewCreature,
    findForbiddenInHomebrew,
  } = require("../scripts/astraldark-public-glossary.js");

  it("slug", () => {
    expect(slug("Olá Mundo!")).toBe("ola-mundo");
  });

  it("parseStatsLine lê CA/PV/NV", () => {
    const s = parseStatsLine(
      "CA 11, PV 1, ATQ 2 mordida +1 (1), MV Perto, F -4, D +1, C +0, I -4, S +0, Car -4, AL N, NV 0",
    );
    expect(s?.ca).toBe(11);
    expect(s?.nv).toBe(0);
  });

  it("parseCreatureBlock extrai ARANHA com traço", () => {
    const block = `### ARANHA

*Flavor.*

CA 11, PV 1, ATQ 2 mordida, MV Perto, F -4, D +1, C +0, I -4, S +0, Car -4, AL N, NV 0

Veneno. CON CD 9.

---
`;
    const c = parseCreatureBlock(block, { origem: "oficial" });
    expect(c?.nome).toBe("ARANHA");
    expect(c?.tracos.length).toBe(1);
    expect(c?.tracos[0].nome).toBe("Veneno");
  });

  it("parseCreatureBlock homebrew ignora linha vazia após stats", () => {
    const block = `### PUT'ARIA, CAVALEIRA

*Flavor longo.*

**Humanóide (Githyanki).** Patrono teste.

CA 16, PV 24, ATQ 2 espada +5 (1d8), MV Perto, F +0, D +3, C +3, I +1, S -1, Car +5, AL C, NV 5

Rajada Mística. Dano 1d6.

Fascinar. CD 12 CAR.

---

**Tesouro:** normal.

**Comportamento:** tenta fascinar antes do combate.

*Notas de calibração aqui.*
`;
    const c = parseCreatureBlock(block, { origem: "homebrew" });
    expect(c?.tracos.length).toBe(2);
    expect(c?.tipo).toContain("Humanóide");
    expect(c).not.toHaveProperty("tesouro");
    expect(c).not.toHaveProperty("comportamento");
    expect(c).not.toHaveProperty("notas");
  });

  it("stripAttributionFooter preserva --- internos de documento multi-ficha", () => {
    const body = `# Intro\n\n---\n\n### MONGE GITHZERAI\n\nCA 14, PV 12, ATQ 2 golpe, MV Perto, F +1, D +2, C +1, I +1, S +2, Car +0, AL L, NV 2\n\n---\n\n*Adaptação do hub a partir do Monster Manual 2024 (dndbeyond.com).*`;
    const trimmed = stripAttributionFooter(body);
    expect(trimmed).toContain("MONGE GITHZERAI");
    expect(trimmed).not.toMatch(/dndbeyond/i);
  });

  it("splitCreatureBlocksFromBody conta blocos ### com CA", () => {
    const body = `## NV 2\n\n### MONGE GITHZERAI\n\nCA 14, PV 12, ATQ 2 golpe, MV Perto, F +1, D +2, C +1, I +1, S +2, Car +0, AL L, NV 2\n\n## NV 3\n\n### GUERREIRO GITHYANKI\n\nCA 15, PV 16, ATQ 2 lâmina, MV Perto, F +2, D +2, C +1, I +1, S +1, Car +0, AL C, NV 3\n`;
    expect(splitCreatureBlocksFromBody(body).length).toBe(2);
  });

  it("sanitizeHomebrewCreature renomeia Gith e aplica glossário nos traços", () => {
    const c = sanitizeHomebrewCreature({
      origem: "homebrew",
      nome: "GUERREIRO GITHYANKI",
      nv: 3,
      ca: 15,
      pv: 16,
      tracos: [{ nome: "Telepatia", descricao: "Longe (Celestial / Gith)." }],
      tags: [],
    });
    expect(c.nome).toBe("GUERREIRO MATRIPROLE");
    expect(c.id).toBe("guerreiro-matriprole");
    expect(findForbiddenInHomebrew(c)).toHaveLength(0);
  });

  it("sanitizeHomebrewCreature: githyanki minúsculo → matriprole (não matriyanki); Vlaakith → Matriarca; atq sanitizado", () => {
    const { applyPublicGlossary } = require("../scripts/astraldark-public-glossary.js");
    expect(applyPublicGlossary("cota de malha githyanki")).toBe(
      "cota de malha matriprole",
    );
    expect(applyPublicGlossary("Vlaakith")).toBe("Matriarca");
    const c = sanitizeHomebrewCreature({
      origem: "homebrew",
      nome: "PUT'ARIA",
      nv: 5,
      ca: 16,
      pv: 24,
      atq: "2 espada astral gith +5 (1d8 + 1d4)",
      flavor:
        "Cavaleira-artista githyanki. Marcada pela Rainha-Lich Vlaakith.",
      tipo: "Humanóide (Githyanki).",
      tracos: [],
      tags: [],
    });
    expect(c.flavor).not.toMatch(/matriyanki|githyanki|Vlaakith/i);
    expect(c.flavor).toContain("matriprole");
    expect(c.flavor).toContain("Matriarca");
    expect(c.tipo).toContain("Matriprole");
    expect(c.atq).toBe("2 espada astral matri +5 (1d8 + 1d4)");
    expect(findForbiddenInHomebrew(c)).toHaveLength(0);
  });
});

describe("scripts/migrate-tabelas buildRollRows", () => {
  const { buildRollRows } = require("../scripts/migrate-tabelas-shadowdark.js");

  it("encontro-* produz objetos com faixa, texto e followUp", () => {
    const table = {
      headers: ["d100", "Resultado", "Cadeia"],
      rows: [["01", "Um lobo", "criatura"]],
    };
    const rows = buildRollRows("encontro-floresta", {}, table);
    expect(rows[0]).toMatchObject({
      faixa: "01",
      texto: "Um lobo",
      followUp: "criatura",
    });
  });

  it("tabela simples mantém string[][]", () => {
    const table = {
      headers: ["d6", "Efeito"],
      rows: [["1", "Nada"]],
    };
    const rows = buildRollRows("reacao", {}, table);
    expect(rows).toEqual([["1", "Nada"]]);
  });
});

describe("scripts/validate-migrated-data IDs geradores", () => {
  const projectRoot = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "..",
  );
  const { REQUIRED_TABLE_IDS, GITH_PUBLIC_IDS } = require(
    "../scripts/validate-migrated-data.js",
  );
  const { findForbiddenInHomebrew } = require(
    "../scripts/astraldark-public-glossary.js",
  );

  it("índice de tabelas contém IDs dos geradores de assentamento e loja", () => {
    const indexPath = path.join(
      projectRoot,
      "public/data/tabelas/tabelas-index.json",
    );
    if (!fs.existsSync(indexPath)) return;
    const { tabelas } = JSON.parse(fs.readFileSync(indexPath, "utf8"));
    const ids = new Set(tabelas.map((t: { id: string }) => t.id));
    for (const id of REQUIRED_TABLE_IDS) {
      expect(ids.has(id)).toBe(true);
    }
  });

  it("ameacas.json expõe as 7 fichas Gith com glossário público", () => {
    const ameacasPath = path.join(projectRoot, "public/data/ameacas.json");
    if (!fs.existsSync(ameacasPath)) return;
    const { ameacas } = JSON.parse(fs.readFileSync(ameacasPath, "utf8"));
    const byId = new Map(ameacas.map((a: { id: string }) => [a.id, a]));
    for (const id of GITH_PUBLIC_IDS) {
      expect(byId.has(id)).toBe(true);
      const c = byId.get(id);
      expect(findForbiddenInHomebrew(c)).toHaveLength(0);
    }
    expect(byId.has("githyanki-githzerai")).toBe(false);
  });
});

describe("scripts/migrate-regras-shadowdark", () => {
  const {
    slug,
    anchor,
    parseMeta,
    parseMarkdownTable,
    extractFirstTableBlock,
    extractTableRefFromBody,
  } = require("../scripts/migrate-regras-shadowdark.js");

  it("slug e anchor", () => {
    expect(slug("Teste A")).toBe("teste-a");
    expect(anchor("1", "Nome")).toBe("1-nome");
  });

  it("parseMeta lê título e descrição", () => {
    const md = "# Meu Escudo\n\nDescrição curta.\n\n## 1. Seção";
    const meta = parseMeta(md);
    expect(meta.title).toBe("Meu Escudo");
    expect(meta.description).toContain("Descrição");
  });

  it("parseMeta lê Fontes e sources:", () => {
    const md = "# T\n\nFontes: A, B\n\n## 1. X";
    const meta = parseMeta(md);
    expect(meta.sources).toEqual(["A", "B"]);
    const md2 = "# T\n\nsources: X; Y\n\n## 1. X";
    expect(parseMeta(md2).sources).toEqual(["X", "Y"]);
  });

  it("parseMarkdownTable valida separador e parseia linhas", () => {
    expect(parseMarkdownTable("| a |\n")).toBeNull();
    const t = parseMarkdownTable("| Col | DT |\n| --- | --- |\n| x | 12 |\n");
    expect(t?.headers).toEqual(["Col", "DT"]);
    expect(t?.rows[0]).toMatchObject({ col: "x", dt: 12 });
  });

  it("parseMarkdownTable rejeita separador inválido", () => {
    expect(parseMarkdownTable("| a | b |\n| x | y |\n")).toBeNull();
  });

  it("extractFirstTableBlock extrai e rest", () => {
    const text = "Antes\n| a | b |\n| - | - |\n| 1 | 2 |\nDepois";
    const ex = extractFirstTableBlock(text);
    expect(ex?.tableBlock).toContain("| a | b |");
    expect(ex?.rest).toContain("Depois");
    expect(extractFirstTableBlock("sem tabela")).toBeNull();
  });

  it("extractTableRefFromBody aceita tableRef no início do corpo", () => {
    const only = extractTableRefFromBody("tableRef: distancias");
    expect(only.tableRef).toBe("distancias");
    expect(only.body).toBe("");

    const after = extractTableRefFromBody("Texto.\n\ntableRef: testes_e_cds");
    expect(after.tableRef).toBe("testes_e_cds");
    expect(after.body).toBe("Texto.");
  });
});

describe("scripts/migrate-ameacas-shadowdark", () => {
  const { parseCreatureBlock } = require("../scripts/migrate-ameacas-shadowdark.js");

  it("parseCreatureBlock extrai ARANHA com traço", () => {
    const block = `### ARANHA

*Flavor.*

CA 11, PV 1, ATQ 2 mordida, MV Perto, F -4, D +1, C +0, I -4, S +0, Car -4, AL N, NV 0

Veneno. CON CD 9.

---
`;
    const c = parseCreatureBlock(block, { origem: "oficial" });
    expect(c?.nome).toBe("ARANHA");
    expect(c?.tracos.length).toBe(1);
    expect(c?.tracos[0].nome).toBe("Veneno");
  });

  it("parseCreatureBlock homebrew ignora linha vazia após stats", () => {
    const block = `### PUT'ARIA, CAVALEIRA

*Flavor longo.*

**Humanóide (Githyanki).** Patrono teste.

CA 16, PV 24, ATQ 2 espada +5 (1d8), MV Perto, F +0, D +3, C +3, I +1, S -1, Car +5, AL C, NV 5

Rajada Mística. Dano 1d6.

Fascinar. CD 12 CAR.

---

**Tesouro:** normal

**Comportamento:** tenta fascinar antes do combate.
`;
    const c = parseCreatureBlock(block, { origem: "homebrew" });
    expect(c?.tracos.length).toBe(2);
    expect(c?.tipo).toContain("Humanóide");
    expect(c).not.toHaveProperty("tesouro");
    expect(c).not.toHaveProperty("comportamento");
  });
});

describe("scripts/migrate-tabelas parity", () => {
  const projectRoot = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "..",
  );

  it("cada entrada do índice tem JSON com linhas", () => {
    const indexPath = path.join(
      projectRoot,
      "public/data/tabelas/tabelas-index.json",
    );
    if (!fs.existsSync(indexPath)) return;
    const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
    expect(index.tabelas.length).toBeGreaterThanOrEqual(10);
    for (const entry of index.tabelas) {
      const jsonPath = path.join(
        projectRoot,
        `public/data/tabelas/${entry.id}.json`,
      );
      expect(fs.existsSync(jsonPath)).toBe(true);
      const json = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      expect(json.rows?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("tabelas de tesouro por nível migradas do livro", () => {
    const read = (id: string) =>
      JSON.parse(
        fs.readFileSync(
          path.join(projectRoot, `public/data/tabelas/${id}.json`),
          "utf8",
        ),
      );
    expect(read("tesouros-0-3").rolagem).toBe("d100");
    expect(read("tesouros-0-3").rows.length).toBeGreaterThanOrEqual(40);
  });

  it("tabelas sociais usam rolagem d100 ou d4 onde aplicável", () => {
    const read = (id: string) =>
      JSON.parse(
        fs.readFileSync(
          path.join(projectRoot, `public/data/tabelas/${id}.json`),
          "utf8",
        ),
      );
    expect(read("rumores-taverna").rolagem).toBe("d100");
    expect(read("xp-tesouro").rolagem).toBe("d4");
    expect(read("reacao").rolagem).toMatch(/2d6/);
  });

  it("normalizeSpellName ignora espaços e acentos", () => {
    const { normalizeSpellName } = require("../scripts/magias-shadowdark-parse.js");
    expect(normalizeSpellName("Detectar Pensamentos")).toBe(
      normalizeSpellName("DETECTARPENSAMENTOS"),
    );
  });

  it("migrate-catalogo-magias parseia Grimório MD", () => {
    const { migrateFromMd } = require("../scripts/migrate-catalogo-magias-shadowdark.js");
    const md = `# Catálogo — Grimório

### ALARME
*Grau: Sacerdote 1*
*Origem: livro*
*Duração: 1 dia*

Duração: 1 dia

Você toca um objeto.
`;
    const { magias } = migrateFromMd(md);
    expect(magias).toHaveLength(1);
    expect(magias[0].id).toBe("alarme");
    expect(magias[0].nome).toBe("ALARME");
    expect(magias[0].grau.sacerdote).toBe(1);
    expect(magias[0].descricao).toContain("Você toca um objeto");
    expect(magias[0].descricao).not.toMatch(/^Duração:/);
  });

  it("stripSpellBodyArtifacts remove rodapé PDF com e-mail", () => {
    const { stripSpellBodyArtifacts } = require("../scripts/magias-shadowdark-parse.js");
    const raw =
      "Texto da magia.\n\n#### Rodrigo Avelino Rosa , rodrigo.avelino.rosa@hotmail.com\n";
    expect(stripSpellBodyArtifacts(raw)).toBe("Texto da magia.");
    expect(stripSpellBodyArtifacts(raw)).not.toMatch(/@/);
  });

  it("stripRedundantSpellLead remove lead duplicado", () => {
    const { stripRedundantSpellLead } = require("../scripts/magias-shadowdark-parse.js");
    const out = stripRedundantSpellLead(
      "Duração: 1 dia\n\nVocê toca um objeto.",
      { duracao: "1 dia", alcance: null, listas: [], grau: {} },
    );
    expect(out).toBe("Você toca um objeto.");
    const tier = stripRedundantSpellLead(
      "*Nível 2, mago (L)*\n\nDuração: 5 rodadas\n\nTexto.",
      {
        duracao: "5 rodadas",
        alcance: null,
        listas: ["mago"],
        grau: { mago: 2 },
      },
    );
    expect(tier).toBe("Texto.");
  });

  it("dedupeSpellsByCanonicalName funde listas e origens", () => {
    const { dedupeSpellsByCanonicalName } = require("../scripts/magias-shadowdark-parse.js");
    const merged = dedupeSpellsByCanonicalName([
      {
        nome: "ALTERAR-SE",
        descricao: "Corpo livro.",
        origem: "livro",
        listas: ["mago"],
        grau: { mago: 2 },
        duracao: "5 rodadas",
      },
      {
        nome: "ALTERAR-SE",
        descricao: "Corpo CS.",
        origem: "Cursed Scroll 1 - Diabruras pt-BR",
        listas: ["bruxa"],
        grau: { bruxa: 2 },
      },
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe("alterar-se");
    expect(merged[0].listas).toEqual(expect.arrayContaining(["mago", "bruxa"]));
    expect(merged[0].origens?.length).toBeGreaterThanOrEqual(2);
    expect(merged[0].descricao).toBe("Corpo livro.");
  });

  it("resolveSpellTitle traduz títulos EN conhecidos", () => {
    const { resolveSpellTitle, EN_TITLE_KEYS, normalizeSpellName } = require(
      "../scripts/magias-shadowdark-parse.js",
    );
    expect(resolveSpellTitle("Barkskin")).toBe("PELE DE CORTIÇA");
    expect(resolveSpellTitle("Banish")).toBe("BANIR");
    for (const key of EN_TITLE_KEYS) {
      expect(normalizeSpellName(resolveSpellTitle(key))).not.toBe(key);
    }
  });

  it("magias-shadowdark-parse filtra CS e parseia Tier/Nível", () => {
    const {
      extractCursedScrollMagias,
      isQuoteTitle,
      parseTierMeta,
      parseSpellGradeListsFromMd,
    } = require("../scripts/magias-shadowdark-parse.js");
    expect(isQuoteTitle("-Reginald o sábio")).toBe(true);
    expect(isQuoteTitle("“Deixe este lugar")).toBe(true);
    expect(isQuoteTitle("Barlin Boro, Humano")).toBe(true);
    const tier = parseTierMeta("*Tier 3, wizard (N)*\n\nDuration: 1 round");
    expect(tier.grau.mago).toBe(3);
    const nivel = parseTierMeta("*Nível 2, mago (L)*\n\nDuração: 5 rodadas");
    expect(nivel.grau.mago).toBe(2);
    const csMd = `# Lista de Magias de Bruxa

## GRAU 1

- Luz de bruxa

# Magias

### LUZ DE BRUXA

*Tier 1, witch*

Duração: 1 hora

Uma luz suave.

### -Reginald sussurra

Flavor only sem tier.

### “Citação longa que não é magia neste zine de teste”

Só narrativa.

### BARLIN BORO, HUMANO

CA 10, PV 4, ATQ 1 espada +0 (1d6)

Um PNJ.
`;
    const gradeMap = parseSpellGradeListsFromMd(csMd);
    const { spells, ignored } = extractCursedScrollMagias(
      csMd,
      "Cursed Scroll Test",
    );
    expect(spells.some((s) => s.nome === "LUZ DE BRUXA")).toBe(true);
    const luz = spells.find((s) => s.nome === "LUZ DE BRUXA");
    expect(luz?.listas).toContain("bruxa");
    expect(luz?.grau.bruxa).toBe(1);
    expect(ignored.some((i) => /Reginald|Citação|BARLIN/i.test(i.nome))).toBe(
      true,
    );
  });

  it("catálogo magias tem volume e golden substrings", () => {
    const magPath = path.join(
      projectRoot,
      "public/data/catalogo/magias.json",
    );
    if (!fs.existsSync(magPath)) return;
    const { magias } = JSON.parse(fs.readFileSync(magPath, "utf8"));
    expect(magias.length).toBeGreaterThanOrEqual(80);
    const alarme = magias.find((m: { id: string }) => m.id === "alarme");
    expect(alarme?.nome).toBe("ALARME");
    expect(alarme?.listas?.length).toBeGreaterThan(0);
    expect(alarme?.grau?.sacerdote ?? alarme?.grau?.mago).toBeDefined();
    expect(alarme?.descricao).toMatch(/sino mágico soará em sua mente/i);
    expect(alarme?.descricao).not.toMatch(/^Duração:/);
    const nomes = magias.map((m: { nome: string }) => m.nome);
    const dup = nomes.filter(
      (n: string, i: number) => nomes.indexOf(n) !== i,
    );
    expect(dup).toHaveLength(0);
    const alterar = magias.filter((m: { nome: string }) => m.nome === "ALTERAR-SE");
    expect(alterar).toHaveLength(1);
    expect(alterar[0]?.grau?.mago).toBe(2);
    expect(alterar[0]?.grau?.bruxa).toBe(2);
    const enTitles = ["BARKSKIN", "BANISH", "ABSORB", "BEFRIEND", "CLEANSE"];
    const enLeft = magias.filter((m: { nome: string }) =>
      enTitles.includes(m.nome),
    );
    expect(enLeft).toHaveLength(0);
    const semLista = magias.filter(
      (m: { listas: string[] }) => !m.listas?.length,
    );
    expect(semLista).toHaveLength(0);
    const bruxa = magias.find((m: { listas: string[] }) =>
      m.listas?.includes("bruxa"),
    );
    expect(bruxa).toBeTruthy();
    const bola = magias.find((m: { nome: string }) =>
      /bola de fogo/i.test(m.nome),
    );
    expect(bola?.descricao?.length ?? 0).toBeGreaterThan(40);
    const criarAr = magias.find(
      (m: { id: string }) => m.id === "criar-ar",
    );
    expect(criarAr?.origem).toBe("astraldark");
    expect(criarAr?.descricao).toMatch(/Renova ar fresco/i);
    const csOrigins = new Set(
      magias
        .filter((m: { origem: string }) => /^Cursed Scroll \d/i.test(m.origem))
        .map((m: { origem: string }) => m.origem),
    );
    expect(csOrigins.size).toBeGreaterThanOrEqual(5);
  });

  it("catálogo itens mágicos tem volume do livro base", () => {
    const catPath = path.join(
      projectRoot,
      "public/data/catalogo/itens-magicos.json",
    );
    if (!fs.existsSync(catPath)) return;
    const { itens } = JSON.parse(fs.readFileSync(catPath, "utf8"));
    expect(itens.length).toBeGreaterThanOrEqual(50);
    const anel = itens.find((i: { nome: string }) =>
      /invisibilidade/i.test(i.nome),
    );
    expect(anel?.descricao?.length ?? 0).toBeGreaterThan(20);
  });

  it("putaria migrada mantém traços do MD", () => {
    const ameacasPath = path.join(projectRoot, "public/data/ameacas.json");
    if (!fs.existsSync(ameacasPath)) return;
    const { ameacas } = JSON.parse(fs.readFileSync(ameacasPath, "utf8"));
    const putaria = ameacas.find((a: { id: string }) => a.id === "putaria");
    expect(putaria?.tracos?.length ?? 0).toBeGreaterThanOrEqual(3);
  });
});

describe("scripts/init-twa", () => {
  const { runInitTwa } = require("../scripts/init-twa.js");

  it("chama npx bubblewrap com MANIFEST_URL", () => {
    const execSync = vi.fn();
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "em-twa-"));
    runInitTwa({
      execSyncImpl: execSync,
      env: { MANIFEST_URL: "https://exemplo.com/manifest.json" },
      rootDir: dir,
    });
    expect(execSync).toHaveBeenCalledWith(
      expect.stringContaining("@bubblewrap/cli"),
      expect.objectContaining({ cwd: path.join(dir, "android-twa") }),
    );
  });
});
