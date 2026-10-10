/**
 * Parse e extração de magias Shadowdark (Livro, Astraldark, Cursed Scrolls).
 * Exportado para testes e para extract-magias-shadowdark.js.
 */
const fs = require("fs");
const path = require("path");

const CLASS_LABELS_PT = {
  mago: "Mago",
  sacerdote: "Sacerdote",
  bruxa: "Bruxa",
  vidente: "Vidente",
  druida: "Druida",
  feiticeiro: "Feiticeiro",
};

const LIST_ORDER = ["mago", "sacerdote", "bruxa", "vidente", "druida", "feiticeiro"];

/** Nomes EN nas listas CS6 → chave normalizada da ficha pt-BR. */
const GRADE_KEY_ALIASES = {
  absorb: "absorver",
  reveal: "revelar",
  banish: "banir",
  cleanse: "purificar",
  flare: "clarão",
  ward: "proteção",
  meld: "fundir",
  pacify: "pacificar",
  forbid: "proibir",
  identify: "identificar",
  glyph: "glifo",
  stasis: "estase",
  abjure: "abjurar",
  alchemy: "alquimia",
  anima: "animar",
  barkskin: "peledecortica",
  befriend: "cativar",
  earthquake: "terremoto",
  instill: "instilar",
  locusts: "gafanhoto",
  magnetize: "magnetizar",
  mycelium: "micelio",
  naming: "nomear",
  oxidize: "oxidizar",
  summonstorm: "invocartempestade",
  treeshape: "formadearvore",
  truespeech: "falaverdadeira",
  whisperwind: "ventosussurrante",
  sopro: "sopro",
};

/** Título EN → nome de exibição pt-BR (antes de CAIXA ALTA). */
const SPELL_TITLE_PT = {
  alchemy: "Alquimia",
  anima: "Animar",
  barkskin: "Pele de Cortiça",
  befriend: "Cativar",
  earthquake: "Terremoto",
  instill: "Instilar",
  locusts: "Gafanhoto",
  magnetize: "Magnetizar",
  mycelium: "Micélio",
  naming: "Nomear",
  oxidize: "Oxidar",
  summonstorm: "Invocar Tempestade",
  treeshape: "Forma de Árvore",
  truespeech: "Fala Verdadeira",
  whisperwind: "Vento Sussurrante",
  absorb: "Absorver",
  banish: "Banir",
  cleanse: "Purificar",
  reveal: "Revelar",
  ward: "Guarda",
  pacify: "Apaziguar",
  stasis: "Estase",
  flare: "Clarão",
  meld: "Fundir",
  forbid: "Proibir",
  identify: "Identificar",
  glyph: "Glifo",
  abjure: "Abjurar",
};

const EN_TITLE_KEYS = new Set(Object.keys(SPELL_TITLE_PT));

function gradeMapKey(name) {
  const k = normalizeSpellName(name);
  return GRADE_KEY_ALIASES[k] || k;
}

function resolveSpellTitle(rawTitle) {
  const key = normalizeSpellName(rawTitle);
  const mapped = SPELL_TITLE_PT[key];
  if (mapped) return formatSpellDisplayName(mapped);
  return formatSpellDisplayName(rawTitle.trim());
}

function canonicalSpellKey(nome) {
  return normalizeSpellName(nome);
}

function catalogSpellId(nome) {
  return slugify(resolveSpellTitle(nome));
}

function normalizeSpellName(name) {
  return name
    .normalize("NFD")
    .replace(/\u0300-\u036f/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function formatSpellDisplayName(name) {
  return name.toLocaleUpperCase("pt-BR");
}

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/\u0300-\u036f/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function spellId(nome, origem) {
  return catalogSpellId(nome);
}

function isQuoteTitle(title) {
  const t = title.trim();
  if (/^[-–—]/.test(t)) return true;
  if (/^[""'\u201c\u201d\u00ab\u201e]/.test(t)) return true;
  if (/[""']\s*$/.test(t) && t.length > 3) return true;
  if (/você já viu|santa terragnis|este mundo ainda/i.test(t)) return true;
  if (t.length > 60) return true;
  if (/,\s*Humano\b/i.test(t)) return true;
  if (/\bMendigo\b/i.test(t)) return true;
  if (/\bduelist\b/i.test(t)) return true;
  if (/^Reginald/i.test(t)) return true;
  return false;
}

function hasCsSpellMarker(body) {
  const head = body.slice(0, 220);
  if (/\*?\*?(?:Tier|Grau|TIER|GRAU|Nível|Nivel|NÍVEL)\s*\d+/i.test(head))
    return true;
  if (/\*\*Duração\*\*|^Duração:/im.test(head)) return true;
  if (/\*\*Duration\*\*|^Duration:/im.test(head)) return true;
  if (/\(ritual\)/i.test(head)) return true;
  if (/^Alcance:/im.test(head)) return true;
  if (/^\*\*Alcance\*\*/im.test(head)) return true;
  return false;
}

function looksLikeSpellBody(body) {
  const b = body.trim();
  if (!b || b.length < 20) return false;
  if (/^CA\s+\d+/m.test(b)) return false;
  if (/^#\s/m.test(b)) return false;
  if (/^TALENTOS?\b/i.test(b)) return false;
  if (/^NV\s+\d+/m.test(b) && /ATQ\s+/m.test(b)) return false;
  return true;
}

function isLivroSpellTitle(title, body) {
  if (!title || title.length < 2) return false;
  if (isQuoteTitle(title)) return false;
  if (!looksLikeSpellBody(body)) return false;
  return true;
}

function sliceChapter(md, heading) {
  const re = new RegExp(`^# ${heading}\\s*$`, "m");
  const start = md.search(re);
  if (start < 0) return "";
  const rest = md.slice(start);
  const end = rest.slice(1).search(/^# [^#]/m);
  return end >= 0 ? rest.slice(0, end + 1) : rest;
}

function sliceSection(md, heading) {
  const re = new RegExp(`^## ${heading}\\s*$`, "m");
  const start = md.search(re);
  if (start < 0) return "";
  const rest = md.slice(start);
  const end = rest.slice(1).search(/^## [^#]/m);
  return end >= 0 ? rest.slice(0, end + 1) : rest;
}

function parseBlocksH3(sectionMd) {
  const parts = sectionMd.split(/\n###\s+/).slice(1);
  const blocks = [];
  for (const part of parts) {
    const lines = part.split("\n");
    const nome = lines[0].trim();
    const body = lines.slice(1).join("\n").trim();
    blocks.push({ nome, body });
  }
  return blocks;
}

function classNameToListKey(name) {
  const n = name.normalize("NFD").replace(/\u0300-\u036f/g, "").toLowerCase();
  if (n.includes("sacerdote") || n.includes("cleric")) return "sacerdote";
  if (n.includes("bruxa") || n.includes("witch")) return "bruxa";
  if (n.includes("vidente") || n.includes("seer")) return "vidente";
  if (n.includes("druida") || n.includes("druid")) return "druida";
  if (n.includes("feiticeiro") || n.includes("sorcerer")) return "feiticeiro";
  if (n.includes("mago") || n.includes("wizard")) return "mago";
  return slugify(name).replace(/-/g, "");
}

function ingestGradeChapter(text, listKey, map) {
  const gradeRe = /^## (?:GRAU|Grau|TIER|Tier)\s*(\d+)\s*$/gim;
  const indices = [];
  let match;
  while ((match = gradeRe.exec(text)) !== null) {
    indices.push({ grade: parseInt(match[1], 10), index: match.index });
  }
  for (let i = 0; i < indices.length; i++) {
    const { grade, index } = indices[i];
    const nextIndex =
      i + 1 < indices.length ? indices[i + 1].index : text.length;
    const chunk = text.slice(index, nextIndex);
    const bullets = chunk.match(/^\s*-\s+(.+)$/gm) || [];
    for (const line of bullets) {
      const name = line.replace(/^\s*-\s+/, "").trim();
      const key = gradeMapKey(name);
      if (!key) continue;
      let entry = map.get(key);
      if (!entry) {
        entry = { displayName: formatSpellDisplayName(name), listas: [], grau: {} };
        map.set(key, entry);
      }
      if (!entry.listas.includes(listKey)) entry.listas.push(listKey);
      entry.grau[listKey] = grade;
    }
  }
}

function parseSpellGradeListsFromMd(md) {
  const map = new Map();
  const chapterHeadings = [];
  const re = /^# (Lista de Magias de .+|Magias de .+)\s*$/gim;
  let m;
  while ((m = re.exec(md)) !== null) {
    chapterHeadings.push(m[1].trim());
  }
  for (const heading of chapterHeadings) {
    const listKey = classNameToListKey(
      heading.replace(/^Lista de Magias de\s+/i, "").replace(/^Magias de\s+/i, ""),
    );
    const chapter = sliceChapter(md, heading);
    if (!chapter) continue;
    ingestGradeChapter(chapter, listKey, map);
    if (/^Magias de /i.test(heading)) {
      const idx = md.search(new RegExp(`^# ${heading}\\s*$`, "m"));
      if (idx > 0) {
        const before = md.slice(0, idx);
        const lastTop = before.search(/\n# [^#][^\n]*\n(?!#)/);
        let preambleStart = 0;
        if (lastTop >= 0) {
          const tail = before.slice(lastTop + 1);
          const inner = tail.search(/^# /m);
          preambleStart = lastTop + 1 + (inner >= 0 ? inner : 0);
        }
        const preamble = before.slice(preambleStart, idx);
        const preSecs = collectGradeSections(preamble);
        if (preSecs.length) ingestGradeSections(preSecs, listKey, map);
      }
    }
  }
  return map;
}

function collectGradeSections(text) {
  const gradeRe = /^## (?:GRAU|Grau|TIER|Tier)\s*(\d+)\s*$/gim;
  const indices = [];
  let match;
  while ((match = gradeRe.exec(text)) !== null) {
    indices.push({ grade: parseInt(match[1], 10), index: match.index });
  }
  const sections = [];
  for (let i = 0; i < indices.length; i++) {
    const { grade, index } = indices[i];
    const nextIndex =
      i + 1 < indices.length ? indices[i + 1].index : text.length;
    const chunk = text.slice(index, nextIndex);
    const bullets = chunk.match(/^\s*-\s+(.+)$/gm) || [];
    sections.push({ grade, bullets });
  }
  return sections;
}

function ingestGradeSections(sections, listKey, map) {
  for (const { grade, bullets } of sections) {
    for (const line of bullets) {
      const name = line.replace(/^\s*-\s+/, "").trim();
      const key = gradeMapKey(name);
      if (!key) continue;
      let entry = map.get(key);
      if (!entry) {
        entry = {
          displayName: formatSpellDisplayName(name),
          listas: [],
          grau: {},
        };
        map.set(key, entry);
      }
      if (!entry.listas.includes(listKey)) entry.listas.push(listKey);
      entry.grau[listKey] = grade;
    }
  }
}

function parseSpellGradeLists(livroMd) {
  const map = new Map();

  const sacHeading = /^# Lista de Magias de Sacerdote\s*$/m;
  const sacIdx = livroMd.search(sacHeading);
  if (sacIdx >= 0) {
    const before = livroMd.slice(0, sacIdx);
    const propIdx = before.search(/^# Propriedades das Magias\s*$/m);
    if (propIdx >= 0) {
      const early = collectGradeSections(before.slice(propIdx)).filter(
        (s) => s.grade <= 3,
      );
      ingestGradeSections(early, "sacerdote", map);
    }
    const sacChapter = sliceChapter(livroMd, "Lista de Magias de Sacerdote");
    const sacSections = [];
    let seenHigh = false;
    for (const sec of collectGradeSections(sacChapter)) {
      if (sec.grade >= 4) {
        seenHigh = true;
        sacSections.push(sec);
        continue;
      }
      if (seenHigh && sec.grade <= 3) break;
      if (sec.grade <= 3) sacSections.push(sec);
    }
    ingestGradeSections(sacSections, "sacerdote", map);
  }

  const sacChapter = sliceChapter(livroMd, "Lista de Magias de Sacerdote");
  const mageFromSac = [];
  let pastSac45 = false;
  let mageTail = false;
  for (const sec of collectGradeSections(sacChapter)) {
    if (sec.grade >= 4 && !mageTail) pastSac45 = true;
    if (pastSac45 && sec.grade === 1) mageTail = true;
    if (mageTail) mageFromSac.push(sec);
  }
  if (mageFromSac.length) ingestGradeSections(mageFromSac, "mago", map);

  const magoChapter = sliceChapter(livroMd, "Lista de Magias de Mago");
  if (magoChapter) {
    ingestGradeSections(collectGradeSections(magoChapter), "mago", map);
  }

  return map;
}

const TIER_CLASS_TOKENS = [
  { re: /\bbruxa\b|\bwitch\b/i, slug: "bruxa" },
  { re: /\bvidente\b|\bseer\b/i, slug: "vidente" },
  { re: /\bdruida\b|\bdruid\b/i, slug: "druida" },
  { re: /\bfeiticeiro\b|\bsorcerer\b/i, slug: "feiticeiro" },
  { re: /\bsacerdote\b|\bpriest\b|\bcleric\b/i, slug: "sacerdote" },
  { re: /\bmago\b|\bwizard\b/i, slug: "mago" },
];

function parseTierMeta(body, options = {}) {
  const defaultList = options.defaultList || null;
  const head = body.slice(0, 500);
  const line =
    head
      .split("\n")
      .find((l) =>
        /(?:Tier|Grau|TIER|GRAU|Nível|Nivel|NÍVEL)\s*\d+/i.test(l),
      ) || "";
  if (!line) return { listas: [], grau: {} };

  const tierM = line.match(
    /(?:Tier|Grau|TIER|GRAU|Nível|Nivel|NÍVEL)\s*(\d+)/i,
  );
  const grauNum = tierM ? parseInt(tierM[1], 10) : null;
  const listas = [];
  for (const { re, slug } of TIER_CLASS_TOKENS) {
    if (re.test(line) && !listas.includes(slug)) listas.push(slug);
  }
  if (listas.length === 0 && defaultList) listas.push(defaultList);
  if (
    listas.length === 1 &&
    listas[0] === "mago" &&
    defaultList &&
    defaultList !== "mago" &&
    /wizard/i.test(line)
  ) {
    listas[0] = defaultList;
  }
  const grau = {};
  if (grauNum) {
    for (const l of listas) grau[l] = grauNum;
  }
  return { listas, grau };
}

function mergeGradeMeta(spell, gradeMap) {
  const key = gradeMapKey(spell.nome);
  const meta = gradeMap.get(key);
  if (meta) {
    spell.listas = [...new Set([...(spell.listas || []), ...meta.listas])];
    spell.grau = { ...(spell.grau || {}), ...meta.grau };
    if (meta.displayName) spell.nome = meta.displayName;
  }
}

function applyTierMeta(spell, tier) {
  if (!tier.listas.length) return;
  spell.listas = [...new Set([...(spell.listas || []), ...tier.listas])];
  spell.grau = { ...(spell.grau || {}), ...tier.grau };
}

function finalizeSpell(spell, warnings) {
  spell.nome = formatSpellDisplayName(spell.nome);
  spell.listas = spell.listas || [];
  spell.grau = spell.grau || {};
  if (!spell.origem) {
    warnings.push(`origem_ausente: ${spell.nome}`);
  }
  if (spell.listas.length === 0) {
    warnings.push(`lista_ausente: ${spell.nome} (${spell.origem})`);
  }
  for (const l of spell.listas) {
    if (spell.grau[l] == null) {
      warnings.push(`grau_ausente: ${spell.nome} (${spell.origem}) [${l}]`);
    }
  }
  return spell;
}

function parseDurationRange(body) {
  let duracao = null;
  let alcance = null;
  let ritual = false;

  const durLine = body.match(
    /^(?:\*\*)?Duração(?:\*\*)?:\s*(.+?)(?:\.|$)/im,
  );
  if (durLine) duracao = durLine[1].trim().replace(/\.$/, "");

  const durEn = body.match(/^(?:\*\*)?Duration(?:\*\*)?:\s*(.+?)(?:\.|$)/im);
  if (durEn && !duracao) duracao = durEn[1].trim().replace(/\.$/, "");

  const alcLine = body.match(
    /^(?:\*\*)?Alcance(?:\*\*)?:\s*(.+?)(?:\.|$)/im,
  );
  if (alcLine) alcance = alcLine[1].trim().replace(/\.$/, "");

  const alcEn = body.match(/^(?:\*\*)?Range(?:\*\*)?:\s*(.+?)(?:\.|$)/im);
  if (alcEn && !alcance) alcance = alcEn[1].trim().replace(/\.$/, "");

  const metaGrau = body.match(/^\*Grau\s+\d+[^*]*\*/im);
  if (metaGrau && /ritual/i.test(metaGrau[0])) ritual = true;
  if (/\(ritual\)/i.test(body.slice(0, 200))) ritual = true;

  return { duracao, alcance, ritual };
}

function stripRedundantSpellLead(body, spell) {
  const lines = body.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();
    if (!t) {
      i++;
      continue;
    }
    if (
      /^\*?\*?(?:Tier|Grau|TIER|GRAU|Nível|Nivel|NÍVEL)\s*\d+/i.test(t) ||
      /^\*Grau\s+\d+[^*]*\*$/i.test(t)
    ) {
      i++;
      continue;
    }
    if (
      /^(?:\*\*)?Duração(?:\*\*)?:\s*/i.test(t) ||
      /^(?:\*\*)?Duration(?:\*\*)?:\s*/i.test(t)
    ) {
      if (spell.duracao) {
        i++;
        continue;
      }
    }
    if (
      /^(?:\*\*)?Alcance(?:\*\*)?:\s*/i.test(t) ||
      /^(?:\*\*)?Range(?:\*\*)?:\s*/i.test(t)
    ) {
      if (spell.alcance) {
        i++;
        continue;
      }
    }
    if (spell.ritual && /^\(ritual\)\s*$/i.test(t)) {
      i++;
      continue;
    }
    break;
  }
  return lines.slice(i).join("\n").trim();
}

/** Rodapés de conversão PDF (nome + e-mail em linha isolada). */
const PDF_WATERMARK_LINE =
  /^(?:#{1,6}\s*)?[^@\n]{0,120},\s*[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\s*$/i;

function stripSpellBodyArtifacts(body) {
  if (!body) return body;
  const lines = body.split("\n").filter((line) => {
    const t = line.trim();
    if (!t) return true;
    return !PDF_WATERMARK_LINE.test(t);
  });
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function assignSpellBody(spell, rawBody) {
  spell.descricao = stripSpellBodyArtifacts(
    stripRedundantSpellLead(rawBody, spell),
  );
}

const ORIGEM_RANK = { livro: 0, astraldark: 1 };

function origemRank(origem) {
  if (origem === "livro") return 0;
  if (origem === "astraldark") return 1;
  return 2;
}

function sortOrigens(origens) {
  return [...new Set(origens)].sort((a, b) => {
    const ra = origemRank(a);
    const rb = origemRank(b);
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b, "pt-BR");
  });
}

function mergeSpellEntries(target, incoming, warnings) {
  for (const l of incoming.listas || []) {
    if (!target.listas.includes(l)) target.listas.push(l);
    const gIn = incoming.grau?.[l];
    const gT = target.grau?.[l];
    if (gIn != null) {
      if (gT != null && gT !== gIn) {
        warnings.push(
          `grau_conflito: ${target.nome} [${l}] ${gT} vs ${gIn}`,
        );
      } else {
        target.grau[l] = gIn;
      }
    }
  }
  if (!target.duracao && incoming.duracao) target.duracao = incoming.duracao;
  if (!target.alcance && incoming.alcance) target.alcance = incoming.alcance;
  if (!target.ritual && incoming.ritual) target.ritual = incoming.ritual;

  const preferIncomingDesc =
    incoming.origem === "livro" && target.origem !== "livro";
  const preferTargetDesc = target.origem === "livro";
  if (preferIncomingDesc) {
    if (
      target.descricao &&
      incoming.descricao &&
      target.descricao.trim() !== incoming.descricao.trim()
    ) {
      warnings.push(`corpo_divergente: ${target.nome}`);
    }
    target.descricao = incoming.descricao;
  } else if (!preferTargetDesc && incoming.descricao) {
    if (
      !target.descricao ||
      incoming.descricao.length > target.descricao.length
    ) {
      target.descricao = incoming.descricao;
    }
  }

  target.origens = sortOrigens([
    ...(target.origens || [target.origem]),
    ...(incoming.origens || [incoming.origem]),
  ]);
  if (origemRank(incoming.origem) < origemRank(target.origem)) {
    target.origem = incoming.origem;
  }
}

function dedupeSpellsByCanonicalName(spells, warnings = []) {
  const map = new Map();
  for (const spell of spells) {
    const nome = resolveSpellTitle(spell.nome);
    const key = canonicalSpellKey(nome);
    const normalized = {
      ...spell,
      nome,
      origens: sortOrigens(spell.origens?.length ? spell.origens : [spell.origem]),
      origem: spell.origem,
      listas: [...(spell.listas || [])],
      grau: { ...(spell.grau || {}) },
    };
    const existing = map.get(key);
    if (!existing) {
      map.set(key, normalized);
      continue;
    }
    mergeSpellEntries(existing, normalized, warnings);
  }
  const out = [...map.values()];
  for (const s of out) {
    s.id = catalogSpellId(s.nome);
    s.origem = s.origens[0] || s.origem;
  }
  out.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  return out;
}

function mergeListMeta(spell, gradeMap) {
  mergeGradeMeta(spell, gradeMap);
  spell.listas = spell.listas || [];
  spell.grau = spell.grau || {};
  return spell;
}

function extractLivroMagias(livroMd) {
  const chapter = sliceChapter(livroMd, "Magias");
  const gradeMap = parseSpellGradeLists(livroMd);
  const blocks = parseBlocksH3(chapter);
  const spells = [];
  const ignored = [];

  for (const { nome, body } of blocks) {
    if (!isLivroSpellTitle(nome, body)) {
      ignored.push({ nome, reason: "titulo_ou_corpo_invalido" });
      continue;
    }
    const { duracao, alcance, ritual } = parseDurationRange(body);
    const spell = {
      nome: resolveSpellTitle(nome),
      origem: "livro",
      listas: [],
      grau: {},
      duracao,
      alcance,
      ritual: ritual || undefined,
    };
    mergeListMeta(spell, gradeMap);
    assignSpellBody(spell, body);
    spells.push(spell);
  }

  return { spells, ignored, gradeMap };
}

function parseAstraldarkMetaLine(body) {
  const line = body.split("\n").find((l) => /^\*Grau\s+/i.test(l.trim()));
  if (!line) return { listas: ["mago", "sacerdote"], grau: {} };
  const m = line.match(/Grau\s+(\d+)/i);
  const grauNum = m ? parseInt(m[1], 10) : null;
  const listas = [];
  if (/mago/i.test(line)) listas.push("mago");
  if (/sacerdote/i.test(line)) listas.push("sacerdote");
  if (listas.length === 0) listas.push("mago", "sacerdote");
  const grau = {};
  for (const l of listas) {
    if (grauNum) grau[l] = grauNum;
  }
  return { listas, grau };
}

function extractAstraldarkMagias(astralMd) {
  const section = sliceSection(astralMd, "Magias astrais");
  const blocks = parseBlocksH3(section);
  const spells = [];
  const ignored = [];

  for (const { nome, body } of blocks) {
    if (isQuoteTitle(nome) || !looksLikeSpellBody(body)) {
      ignored.push({ nome, reason: "astral_invalido" });
      continue;
    }
    const { duracao, alcance, ritual } = parseDurationRange(body);
    const { listas, grau } = parseAstraldarkMetaLine(body);
    const spell = {
      nome: resolveSpellTitle(nome),
      origem: "astraldark",
      listas,
      grau,
      duracao,
      alcance,
      ritual: ritual || undefined,
    };
    assignSpellBody(spell, body);
    spells.push(spell);
  }
  return { spells, ignored };
}

const CS_SKIP_TITLE =
  /^(TALENTOS|TÍTULOS|MAGIAS DE|FALHAS|ANTECEDENTE|Maldição|Todo o conteúdo|As próximas|Um aviso|SHUNE|TITÂNIA|ALMAZZAT|MUGDULBLUB|KYTHEROS|HOMEM-SALGUEIRO|Rodrigo Avelino)/i;

function extractCsSpellSectionsMd(csMd) {
  const parts = [];
  const re = /^# (Magias(?: de [^\n]+)?|Lista de Magias de [^\n]+)\s*$/gim;
  let match;
  const starts = [];
  while ((match = re.exec(csMd)) !== null) {
    const heading = match[1].trim();
    if (/^Lista de Magias de/i.test(heading)) continue;
    starts.push({ index: match.index, heading });
  }
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i].index;
    const end =
      i + 1 < starts.length ? starts[i + 1].index : csMd.length;
    parts.push(csMd.slice(start, end));
  }
  if (parts.length === 0) return "";
  return parts.join("\n\n");
}

function defaultListForScroll(origem) {
  if (/Scroll 1/i.test(origem)) return "bruxa";
  if (/Scroll 3/i.test(origem)) return "vidente";
  if (/Scroll 4/i.test(origem)) return "druida";
  if (/Scroll 5/i.test(origem)) return "feiticeiro";
  if (/Scroll 6/i.test(origem)) return "mago";
  return null;
}

function extractCursedScrollMagias(csMd, origem, fileGradeMap) {
  const sectionMd = extractCsSpellSectionsMd(csMd);
  const gradeMap = fileGradeMap || parseSpellGradeListsFromMd(csMd);
  const blocks = parseBlocksH3(sectionMd || csMd);
  const spells = [];
  const ignored = [];
  const seen = new Set();
  const defaultList = defaultListForScroll(origem);

  for (const { nome, body } of blocks) {
    if (CS_SKIP_TITLE.test(nome.trim())) {
      ignored.push({ nome, reason: "cs_secao" });
      continue;
    }
    if (isQuoteTitle(nome)) {
      ignored.push({ nome, reason: "cs_citacao" });
      continue;
    }
    if (!looksLikeSpellBody(body)) {
      ignored.push({ nome, reason: "cs_corpo" });
      continue;
    }
    const resolvedNome = resolveSpellTitle(nome);
    if (
      !hasCsSpellMarker(body) &&
      !gradeMap.has(gradeMapKey(resolvedNome))
    ) {
      ignored.push({ nome, reason: "cs_sem_marcador" });
      continue;
    }
    if (/^CA\s+\d+/m.test(body) || /\bATQ\s+\d+/m.test(body)) {
      ignored.push({ nome, reason: "cs_ameaca" });
      continue;
    }
    const key = `${origem}::${canonicalSpellKey(resolvedNome)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const { duracao, alcance, ritual } = parseDurationRange(body);
    const spell = {
      nome: resolvedNome,
      origem,
      listas: [],
      grau: {},
      duracao,
      alcance,
      ritual: ritual || undefined,
    };
    mergeGradeMeta(spell, gradeMap);
    applyTierMeta(spell, parseTierMeta(body, { defaultList }));
    assignSpellBody(spell, body);
    spells.push(spell);
  }
  return { spells, ignored, gradeMap };
}

function formatGrauMetaLine(spell) {
  const listas = spell.listas || [];
  const grau = spell.grau || {};
  const ordered = [
    ...LIST_ORDER.filter((k) => listas.includes(k)),
    ...listas.filter((k) => !LIST_ORDER.includes(k)).sort(),
  ];
  const parts = ordered.map((slug) => {
    const label = CLASS_LABELS_PT[slug] || slug;
    const n = grau[slug];
    return n != null ? `${label} ${n}` : label;
  });
  return parts.join(" · ");
}

function spellToMd(spell) {
  const lines = [`### ${spell.nome}`];
  const grauLine = formatGrauMetaLine(spell);
  if (grauLine) lines.push(`*Grau: ${grauLine}*`);
  const origens = spell.origens?.length
    ? spell.origens
    : spell.origem
      ? [spell.origem]
      : [];
  if (origens.length > 1) {
    lines.push(`*Origens: ${origens.join(" · ")}*`);
  } else if (origens[0]) {
    lines.push(`*Origem: ${origens[0]}*`);
  }
  if (spell.duracao) lines.push(`*Duração: ${spell.duracao}*`);
  if (spell.alcance) lines.push(`*Alcance: ${spell.alcance}*`);
  if (spell.ritual) lines.push(`*Ritual: sim*`);
  lines.push("");
  lines.push(spell.descricao);
  lines.push("");
  return lines.join("\n");
}

function spellsToCatalogMd(spells) {
  const header = [
    "# Catálogo — Grimório",
    "",
    "Fonte: Livro de Regras Shadowdark pt-BR, Astraldark, Cursed Scrolls (gerado por extract-magias-shadowdark.js).",
    "",
  ];
  return header.concat(spells.map(spellToMd)).join("\n");
}

function buildReport({
  livro,
  astral,
  scrolls,
  allSpells,
  gradeMap,
}) {
  const warnings = [];
  const livroKeys = new Set(
    livro.spells.map((s) => normalizeSpellName(s.nome)),
  );
  for (const [key, meta] of gradeMap.entries()) {
    if (!livroKeys.has(key)) {
      warnings.push(`lista_sem_ficha: ${meta.displayName} (${key})`);
    }
  }
  for (const s of livro.spells) {
    const key = normalizeSpellName(s.nome);
    if (!gradeMap.has(key) && s.listas.length === 0) {
      warnings.push(`ficha_sem_lista: ${s.nome}`);
    }
  }

  for (const spell of allSpells) {
    finalizeSpell(spell, warnings);
  }

  return {
    livro: {
      extraidas: livro.spells.length,
      ignoradas: livro.ignored.length,
    },
    astraldark: {
      extraidas: astral.spells.length,
      ignoradas: astral.ignored.length,
    },
    cursedScrolls: scrolls.map((s) => ({
      origem: s.origem,
      extraidas: s.spells.length,
      ignoradas: s.ignored.length,
    })),
    total: allSpells.length,
    warnings,
  };
}

function listCursedScrollFiles(sdRoot) {
  const dir = path.join(sdRoot, "Livros de Regras", "cursed-scrolls");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /^Cursed Scroll \d+/i.test(f) && f.endsWith(".md"))
    .sort()
    .map((f) => path.join(dir, f));
}

function validateSpellsCatalog(magias) {
  const issues = [];
  for (const m of magias) {
    finalizeSpell({ ...m, listas: m.listas || [], grau: m.grau || {} }, issues);
  }
  return issues;
}

module.exports = {
  normalizeSpellName,
  slugify,
  spellId,
  catalogSpellId,
  formatSpellDisplayName,
  resolveSpellTitle,
  stripRedundantSpellLead,
  stripSpellBodyArtifacts,
  assignSpellBody,
  dedupeSpellsByCanonicalName,
  canonicalSpellKey,
  parseSpellGradeLists,
  parseSpellGradeListsFromMd,
  parseTierMeta,
  extractLivroMagias,
  extractAstraldarkMagias,
  extractCursedScrollMagias,
  spellsToCatalogMd,
  buildReport,
  listCursedScrollFiles,
  isLivroSpellTitle,
  looksLikeSpellBody,
  isQuoteTitle,
  hasCsSpellMarker,
  formatGrauMetaLine,
  validateSpellsCatalog,
  CLASS_LABELS_PT,
  EN_TITLE_KEYS,
};
