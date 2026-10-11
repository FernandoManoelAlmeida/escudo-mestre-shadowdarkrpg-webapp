/**
 * Heurísticas partilhadas: extract + migrate + validate do catálogo de itens mágicos.
 */
const BAD_TITLE_PATTERNS = [
  /^MAGIAS DE BRUXA/i,
  /^ANTECEDENTE/i,
  /^FALHAS DIABÓLICAS/i,
  /^RUMORES$/i,
  /^ENCONTROS/i,
  /^VENENOS$/i,
  /^APOSTAS$/i,
  /^IDENTIFICADORES$/i,
  /^BENEFÍCIO$/i,
  /^REVÉS$/i,
  /^EVENTO DE FARRA$/i,
  /^RESULTADO DA FARRA$/i,
  /^CITY TRAVEL$/i,
  /^Entrando em hexágonos$/i,
  /^VAZIO DO SER$/i,
  /TALENTOS$/i,
  /servo de/i,
  /^-Lyonel Hirkos/i,
];

const EXPECTED_ITENS_MAGICOS_COUNT = 98;

function slug(nome) {
  return nome
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isItemTitle(nome) {
  const t = nome.trim();
  if (!t || t.length < 3) return false;
  if (/^[“"']/.test(t)) return false;
  if (/você já viu|santa terragnis usou/i.test(t)) return false;
  if (!/^[A-ZÁÉÍÓÚÃÕÇ0-9-]/.test(t)) return false;
  if (BAD_TITLE_PATTERNS.some((re) => re.test(t))) return false;
  if (/,/.test(t) && t.length > 40) return false;
  return true;
}

function isItemBody(body) {
  return /benefício|bonus|bônus|maldição|personalidade/i.test(body);
}

function isNonItemBody(body) {
  if (!body || !body.trim()) return true;
  if (/^# Classe:/m.test(body)) return true;
  if (/Pontos de Vida:/i.test(body)) return true;
  if (/Armaduras:/i.test(body)) return true;
  if (/Conjuração\.\s*Você pode conjurar/i.test(body)) return true;
  if (/####\s+.*@/.test(body)) return true;
  if (/\| --- \|/.test(body)) return true;
  if (/2d6Efeito/i.test(body)) return true;
  if (/\|\s*d6\s*\|/i.test(body) || /\|\s*d12\s*\|/i.test(body) || /\|\s*d20\s*\|/i.test(body))
    return true;
  if (/Rodrigo Avelino/i.test(body)) return true;
  return false;
}

function stripItemBody(body) {
  let out = body;
  out = out.replace(/^####\s+[^\n]*@[^\n]*\n?/gm, "");
  const classeIdx = out.search(/^# Classe:/m);
  if (classeIdx >= 0) out = out.slice(0, classeIdx);
  return out.trim();
}

function parseOrigemFromBody(body) {
  const origemMatch = body.match(/^\*Origem:\s*([^*]+)\*/);
  if (!origemMatch) return { origem: "livro", descricao: body.trim() };
  const origem = origemMatch[1].trim();
  const descricao = body.replace(/^\*Origem:[^*]+\*\s*\n?/, "").trim();
  return { origem, descricao };
}

function evaluateBlock(nome, rawBody, origemDefault = "livro") {
  const reasons = [];
  if (!nome.trim()) {
    return { accept: false, reasons: ["empty_title"] };
  }
  if (!isItemTitle(nome)) reasons.push("bad_title");
  const { origem, descricao } = parseOrigemFromBody(rawBody);
  const effectiveOrigem = origem === "livro" && origemDefault !== "livro" ? origemDefault : origem;
  const body = stripItemBody(descricao);
  if (!isItemBody(body)) reasons.push("no_item_marker");
  if (isNonItemBody(descricao) || isNonItemBody(body)) reasons.push("non_item_body");
  if (/@/.test(descricao) || /@/.test(body)) reasons.push("email_in_body");
  const accept = reasons.length === 0;
  return {
    accept,
    reasons,
    item: accept
      ? { nome: nome.trim(), descricao: body, origem: effectiveOrigem }
      : null,
  };
}

function parseItensFromMd(md, { origemDefault = "livro" } = {}) {
  const blocks = md.split(/\n###\s+/).slice(1);
  const itens = [];
  const skipped = [];
  const seen = new Set();

  for (const block of blocks) {
    const lines = block.split("\n");
    const nome = lines[0].trim();
    const rawBody = lines.slice(1).join("\n").trim();
    const { accept, reasons, item } = evaluateBlock(nome, rawBody, origemDefault);
    if (!accept) {
      skipped.push({ nome, reasons });
      continue;
    }
    const key = slug(item.nome);
    if (seen.has(key)) {
      skipped.push({ nome, reasons: ["duplicate_slug"] });
      continue;
    }
    seen.add(key);
    itens.push(item);
  }
  return { itens, skipped };
}

function validateItemEntry(entry) {
  const reasons = [];
  if (!isItemTitle(entry.nome)) reasons.push("bad_title");
  if (!isItemBody(entry.descricao)) reasons.push("no_item_marker");
  if (isNonItemBody(entry.descricao)) reasons.push("non_item_body");
  if (/@|Rodrigo Avelino/i.test(entry.descricao)) reasons.push("forbidden_attribution");
  return reasons;
}

/** Destino sugerido para blocos rejeitados (auditoria). */
function suggestPipeline(nome) {
  const n = nome.trim();
  if (/servo de|Lyonel Hirkos/i.test(n)) return "pnj";
  if (/MAGIAS DE BRUXA|CAVALEIRO|TALENTOS|KYTHEROS/i.test(n)) return "regras";
  if (/Entrando em hexágonos|VAZIO DO SER/i.test(n)) return "aventura";
  if (/RUMORES|ENCONTROS|VENENOS|APOSTAS|FALHAS|ANTECEDENTE|IDENTIFICADORES|FARRA|BENEFÍCIO|REVÉS|CITY TRAVEL/i.test(n))
    return "tabelas";
  return "descartar";
}

module.exports = {
  BAD_TITLE_PATTERNS,
  EXPECTED_ITENS_MAGICOS_COUNT,
  slug,
  isItemTitle,
  isItemBody,
  isNonItemBody,
  stripItemBody,
  parseOrigemFromBody,
  evaluateBlock,
  parseItensFromMd,
  validateItemEntry,
  suggestPipeline,
};
