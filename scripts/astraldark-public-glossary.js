/**
 * Glossário público Astraldark (pt-BR) — alinhado a Fantasia/Astraldark/README.md
 * Usado na migração de homebrew para public/data/ameacas.json (distribuição pública).
 */

/** Substituições (frases/longas primeiro). */
const REPLACEMENTS = [
  ["Monster Manual 2024", ""],
  ["Monster Manual", ""],
  ["D&D 5.5e", ""],
  ["D&D 5e", ""],
  ["Spelljammer", "navegação astral"],
  ["mind flayer", "Predador de Cérebros"],
  ["Mind Flayer", "Predador de Cérebros"],
  // Formas longas (incl. minúsculas) ANTES de substituições parciais de "gith",
  // senão "githyanki" vira "matriyanki".
  ["Githyanki", "Matriprole"],
  ["githyanki", "matriprole"],
  ["GITHYANKI", "MATRIPROLE"],
  ["Githzerai", "Matrímpio"],
  ["githzerai", "matrímpio"],
  ["GITHZERAI", "MATRÍMPIO"],
  ["Gith ", "Matri "],
  [" gith", " matri"],
  ["/ Gith", "/ Matri"],
  ["(Gith)", "(Matri)"],
  ["Vlaakith", "Matriarca"],
  ["vlaakith", "matriarca"],
  ["VLAAKITH", "MATRIARCA"],
  ["Elfo Astral", "Elfo Estelar"],
  ["illithid", "Predador de Cérebros"],
  ["Illithid", "Predador de Cérebros"],
  ["Hadar", "a Fome Sombria"],
  ["Neogi", "Escravagistas"],
  ["Kindori", "Baleia Astral"],
  ["Star Lancer", "Lança-Estelar"],
  ["vah'krel", "vah'krel"],
  ["Tiamat", "dragão vermelho"],
];

/** Termos proibidos no JSON homebrew após glossário (validador). */
const FORBIDDEN_HOMEBREW_PATTERNS = [
  /\bgithyanki\b/i,
  /\bgithzerai\b/i,
  /\bvlaakith\b/i,
  /\bspelljammer\b/i,
  /\bmonster\s+manual\b/i,
  /\bd&d\s*5\.?5/i,
  /\bmind\s+flayer\b/i,
  /\[\[/,
  /índice por nv/i,
  /dndbeyond\.com/i,
  /\bwizards of the coast\b/i,
];

function stripWikilinks(text) {
  if (!text) return text;
  return text
    .replace(/\[\[([^\]|#]+)(#[^\]|]+)?(\|([^\]]+))?\]\]/g, (_, _t, _a, _p, display) =>
      display ? display.trim() : "",
    )
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function collapseHorizontalSpaces(text) {
  return text
    .split("\n")
    .map((line) => line.replace(/[ \t]{2,}/g, " ").trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function applyPublicGlossary(text) {
  if (!text || typeof text !== "string") return text;
  let out = stripWikilinks(text);
  for (const [from, to] of REPLACEMENTS) {
    out = out.split(from).join(to);
  }
  return collapseHorizontalSpaces(out);
}

function collectHomebrewStrings(creature) {
  const parts = [
    creature.nome,
    creature.epitet,
    creature.flavor,
    creature.tipo,
    creature.fonte,
    ...(creature.tags ?? []),
  ];
  for (const t of creature.tracos ?? []) {
    parts.push(t.nome, t.descricao);
  }
  return parts.filter(Boolean).join("\n");
}

function findForbiddenInHomebrew(creature) {
  const blob = collectHomebrewStrings(creature);
  const hits = [];
  for (const re of FORBIDDEN_HOMEBREW_PATTERNS) {
    if (re.test(blob)) hits.push(re.source);
  }
  return hits;
}

function sanitizeHomebrewCreature(creature) {
  if (creature.origem !== "homebrew") return creature;
  const mapStr = (s) => (s ? applyPublicGlossary(s) : s);
  const c = {
    ...creature,
    nome: mapStr(creature.nome),
    epitet: creature.epitet ? mapStr(creature.epitet) : undefined,
    flavor: creature.flavor ? mapStr(creature.flavor) : undefined,
    tipo: creature.tipo ? mapStr(creature.tipo) : undefined,
    atq: creature.atq ? mapStr(creature.atq) : creature.atq,
    mv: creature.mv ? mapStr(creature.mv) : creature.mv,
    fonte: undefined,
    tracos: (creature.tracos ?? []).map((t) => ({
      nome: mapStr(t.nome),
      descricao: mapStr(t.descricao),
    })),
  };
  c.id = slugFromNome(c.nome);
  if (c.tipo) {
    c.tags = [c.tipo.split("(")[0].trim()];
  }
  return c;
}

function slugFromNome(nome) {
  return nome
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\u0300-\u036f/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");
}

module.exports = {
  REPLACEMENTS,
  FORBIDDEN_HOMEBREW_PATTERNS,
  applyPublicGlossary,
  stripWikilinks,
  sanitizeHomebrewCreature,
  findForbiddenInHomebrew,
  collectHomebrewStrings,
  slugFromNome,
};
