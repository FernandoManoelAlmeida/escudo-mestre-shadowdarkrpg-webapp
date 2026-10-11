const {
  applyPublicGlossary,
  stripWikilinks,
  findForbiddenInHomebrew,
  slugFromNome,
} = require("./astraldark-public-glossary");

const FONTE_PRIORITY = {
  livro: 0,
  "cursed-scroll": 1,
  homebrew: 2,
  astraldark: 3,
};

function sanitizeEntryText(text) {
  if (!text) return text;
  return applyPublicGlossary(stripWikilinks(text));
}

function sanitizeCatalogEntry(entry) {
  const nome = sanitizeEntryText(entry.nome);
  const descricao = sanitizeEntryText(entry.descricao);
  const out = {
    ...entry,
    nome,
    descricao,
    id: slugFromNome(nome) || entry.id,
  };
  return out;
}

function dedupeEntradas(entradas) {
  const byId = new Map();
  for (const raw of entradas) {
    const e = sanitizeCatalogEntry(raw);
    const prev = byId.get(e.id);
    if (!prev) {
      byId.set(e.id, e);
      continue;
    }
    const pPrev = FONTE_PRIORITY[prev.fonte] ?? 0;
    const pNew = FONTE_PRIORITY[e.fonte] ?? 0;
    if (pNew >= pPrev) byId.set(e.id, e);
  }
  return [...byId.values()];
}

function findForbiddenInCatalogEntry(entry) {
  const blob = [entry.nome, entry.descricao, entry.origem].filter(Boolean).join("\n");
  return findForbiddenInHomebrew({ nome: blob, tracos: [] });
}

function sanitizeAndDedupeEntradas(entradas) {
  return dedupeEntradas(entradas);
}

module.exports = {
  sanitizeCatalogEntry,
  dedupeEntradas,
  sanitizeAndDedupeEntradas,
  findForbiddenInCatalogEntry,
  FONTE_PRIORITY,
};
