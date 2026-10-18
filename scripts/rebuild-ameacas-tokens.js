#!/usr/bin/env node
/**
 * Regenera public/data/ameacas-tokens.json:
 * 1) baseline You See This (scripts/data/ameacas-tokens-yst-fallback.json)
 * 2) sobrescreve com retratos Community Tokens (mapa EN→id)
 *
 * Uso: node scripts/rebuild-ameacas-tokens.js
 */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const MAP_PATH = path.join(__dirname, "data/community-tokens-ameaca-map.json");
const STEMS_PATH = path.join(__dirname, "data/community-tokens-stems.json");
const YST_PATH = path.join(__dirname, "data/ameacas-tokens-yst-fallback.json");
const AMEACAS_PATH = path.join(ROOT, "public/data/ameacas.json");
const OUT_PATH = path.join(ROOT, "public/data/ameacas-tokens.json");

const COMMUNITY_CREDITO = "Shadowdark Community Tokens (Delgore)";
const COMMUNITY_CREDITO_URL =
  "https://foundryvtt.com/packages/shadowdark-community-tokens";
const YST_CREDITO = "You see this.";
const YST_CREDITO_URL = "https://youseethis.blog/tokens/";

function encodePathSegments(relPath) {
  return relPath
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

function communityUrl(repo, ref, portraitRel) {
  return `https://cdn.jsdelivr.net/gh/${repo}@${ref}/${encodePathSegments(portraitRel)}`;
}

function main() {
  const mapDoc = JSON.parse(fs.readFileSync(MAP_PATH, "utf8"));
  const stemsDoc = JSON.parse(fs.readFileSync(STEMS_PATH, "utf8"));
  const ystDoc = JSON.parse(fs.readFileSync(YST_PATH, "utf8"));
  const ameacasDoc = JSON.parse(fs.readFileSync(AMEACAS_PATH, "utf8"));
  const ameacaIds = new Set(
    (ameacasDoc.ameacas ?? []).map((a) => a.id).filter(Boolean),
  );

  const repo = mapDoc.repo;
  const ref = mapDoc.ref;
  const stemToId = mapDoc.map ?? {};
  const stems = stemsDoc.stems ?? {};

  /** @type {Record<string, { url: string; credito?: string; creditoUrl?: string; rotulo?: string; fonte?: string }>} */
  const tokens = {};

  for (const [id, tok] of Object.entries(ystDoc.tokens ?? {})) {
    if (!ameacaIds.has(id)) continue;
    tokens[id] = {
      url: tok.url,
      credito: tok.credito ?? YST_CREDITO,
      creditoUrl: tok.creditoUrl ?? YST_CREDITO_URL,
      rotulo: tok.rotulo,
      fonte: "yst",
    };
  }

  let communityWrites = 0;
  let skippedUnknownId = 0;
  let skippedMissingStem = 0;
  for (const [stem, ameacaId] of Object.entries(stemToId)) {
    if (!ameacaIds.has(ameacaId)) {
      skippedUnknownId += 1;
      console.warn(`skip: id desconhecido "${ameacaId}" (stem ${stem})`);
      continue;
    }
    const meta = stems[stem];
    const artRel = meta?.token || meta?.portrait;
    if (!artRel) {
      skippedMissingStem += 1;
      console.warn(`skip: stem ausente em stems.json: ${stem}`);
      continue;
    }
    tokens[ameacaId] = {
      url: communityUrl(repo, ref, artRel),
      credito: COMMUNITY_CREDITO,
      creditoUrl: COMMUNITY_CREDITO_URL,
      rotulo: meta.nome,
      fonte: "community-tokens",
    };
    communityWrites += 1;
  }

  const ordered = {};
  for (const id of Object.keys(tokens).sort()) {
    ordered[id] = tokens[id];
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify({ tokens: ordered }, null, 2) + "\n", "utf8");

  const communityUnique = Object.values(ordered).filter(
    (t) => t.fonte === "community-tokens",
  ).length;
  const ystRemain = Object.values(ordered).filter((t) => t.fonte === "yst").length;
  console.log(
    `Wrote ${OUT_PATH}: ${Object.keys(ordered).length} tokens ` +
      `(${communityUnique} community / ${communityWrites} writes, ${ystRemain} yst` +
      (skippedUnknownId ? `, ${skippedUnknownId} id skip` : "") +
      (skippedMissingStem ? `, ${skippedMissingStem} stem skip` : "") +
      `)`,
  );
}

main();
