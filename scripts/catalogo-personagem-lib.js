/**
 * Parsing partilhado: classes e ancestralidades (extract + migrate).
 */
const { slug: slugItens } = require("./catalogo-itens-magicos-lib");

function slug(nome) {
  return slugItens(nome.trim());
}

function parseOrigemFromBody(body, defaultFonte = "livro") {
  let rest = body.trim();
  let origem = defaultFonte === "livro" ? "livro" : defaultFonte;
  let fonte = defaultFonte;

  const origemMatch = rest.match(/^\*Origem:\s*([^*]+)\*/);
  if (origemMatch) {
    origem = origemMatch[1].trim();
    rest = rest.replace(/^\*Origem:[^*]+\*\s*\n?/, "").trim();
  }
  const fonteMatch = rest.match(/^\*Fonte:\s*([^*]+)\*/);
  if (fonteMatch) {
    fonte = fonteMatch[1].trim();
    rest = rest.replace(/^\*Fonte:[^*]+\*\s*\n?/, "").trim();
  }
  return { origem, fonte, descricao: rest.trim() };
}

function stripPdfNoise(text) {
  let out = text;
  out = out.replace(/^####\s+[^\n]*@[^\n]*\n?/gm, "");
  out = out.replace(/\n---\n\s*$/g, "\n");
  const credits = out.search(/^## Créditos\s*$/m);
  if (credits >= 0) out = out.slice(0, credits);
  return out.trim();
}

function isValidClassBody(body) {
  const b = body.trim();
  if (b.length < 80) return false;
  return /Pontos de [Vv]ida|Armaduras?:|\*\*Armas|\*\*Armadura|Armas:/i.test(b);
}

function stripClassIntroMeta(text) {
  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const kept = paragraphs.filter((p) => {
    if (/^Homebrew para Shadowdark/i.test(p)) return false;
    if (/não é regra oficial da The Arcane Library/i.test(p)) return false;
    return true;
  });
  return kept.join("\n\n");
}

function parseClassFile(md, { origem, fonte }) {
  const h1Classe = md.match(/^#\s+Classe\s+(.+)$/im);
  const h1Legacy = md.match(/^#\s+Classe:\s*(.+)$/im);
  const nome = (h1Classe?.[1] ?? h1Legacy?.[1])?.trim();
  if (!nome) return null;

  let body = md.replace(/^#\s+.+$/m, "").trim();
  const hrParts = body.split(/\n---\n/);
  if (hrParts.length >= 2) {
    const before = stripClassIntroMeta(hrParts[0].trim());
    const after = hrParts.slice(1).join("\n---\n").trim();
    body = before ? `${before}\n\n${after}` : after;
  } else {
    body = stripClassIntroMeta(body);
  }
  body = stripPdfNoise(body);
  if (!isValidClassBody(body)) return null;
  return {
    id: slug(nome),
    nome,
    origem,
    fonte,
    descricao: finalizeClassDescricao(body, fonte),
  };
}

/** Último bloco Armas/Armaduras/PV no texto (PDF costuma colar stats antes do H1). */
function extractStatsBlockFromText(text) {
  const re =
    /Armas:[^\n]+\n+Armaduras?:[^\n]+\n+Pontos de Vida: 1d\d[^\n]*/gi;
  let last = null;
  let m;
  while ((m = re.exec(text))) last = m[0];
  return last;
}

/** Bloco de stats mais próximo do fim da janela (antes do H1 da classe). */
function extractStatsBlockBeforeHeader(text) {
  const re =
    /Armas:[^\n]+\n+Armaduras?:[^\n]+\n+Pontos de Vida: 1d\d[^\n]*/gi;
  let best = null;
  let bestEnd = -1;
  let m;
  while ((m = re.exec(text))) {
    const end = m.index + m[0].length;
    if (end > bestEnd) {
      bestEnd = end;
      best = m[0];
    }
  }
  return best;
}

function bodyHasLeadingStats(body) {
  const talentMark = body.search(/^###\s+TALENTOS/im);
  const head =
    talentMark >= 0 ? body.slice(0, talentMark) : body.slice(0, 800);
  return /Armas:[^\n]+\n+Armaduras?:[^\n]+\n+Pontos de Vida:/i.test(head);
}

function classOrphanWindow(md, headerIndex) {
  return md.slice(Math.max(0, headerIndex - 2500), headerIndex);
}

function mergeOrphanClassStats(md, headerIndex, _prevHeaderIndex, body) {
  if (bodyHasLeadingStats(body)) return body;
  const between = classOrphanWindow(md, headerIndex);
  const stats = extractStatsBlockBeforeHeader(between);
  if (!stats) return body;
  const statsStart = between.lastIndexOf(stats);
  const gapAfterStats = between.length - statsStart - stats.length;
  if (gapAfterStats > 1200) return body;
  return `${stats}\n\n${body}`.trim();
}

/** Última tabela GFM de talento (d12/d20/2d6) na janela antes do H1. */
function extractTalentTableFromText(text) {
  const lines = text.split("\n");
  let best = null;
  for (let i = 0; i < lines.length; i++) {
    if (!/^\| (?:d\d+|2d6) \|/i.test(lines[i].trim())) continue;
    const chunk = [];
    for (let j = i; j < lines.length; j++) {
      const line = lines[j];
      if (j > i && line.trim() === "" && chunk.length >= 2) break;
      if (j > i && line.trim() && !line.startsWith("|")) break;
      if (line.startsWith("|")) chunk.push(line);
    }
    if (chunk.length >= 2) best = chunk.join("\n");
  }
  return best;
}

function bodyHasTalentTable(body) {
  if (!/^###\s+TALENTOS|^##\s+Talentos/im.test(body)) {
    return /\| (?:d\d+|2d6) \|/i.test(body);
  }
  const talentIdx = body.search(/^###\s+TALENTOS|^##\s+Talentos/im);
  const after = body.slice(talentIdx);
  const cut = after.search(/\n\nArmas:/i);
  const talentRegion = cut >= 0 ? after.slice(0, cut) : after;
  return /\| (?:d\d+|2d6) \|/i.test(talentRegion);
}

function isClassFlavorParagraph(p) {
  const t = p.trim();
  if (!t || t.length < 35) return false;
  if (/^(?:#|###|\||Armas:|Armaduras?:|Pontos de)/i.test(t)) return false;
  if (/^Você conhece/i.test(t)) return false;
  if (/^####\s+Rodrigo/i.test(t)) return false;
  if (/^2d6Efeito/i.test(t)) return false;
  if (/^Magias Conhecidas/i.test(t)) return false;
  const ability = parseAbilityParagraph(t);
  if (ability && looksLikeClassAbility(t, ability)) return false;
  return true;
}

function extractOrphanClassFlavor(between, stats) {
  if (!stats) return null;
  const idx = between.lastIndexOf(stats);
  if (idx < 0) return null;
  const before = between.slice(0, idx).trim();
  const paragraphs = before.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const kept = [];
  for (let i = paragraphs.length - 1; i >= 0 && kept.length < 2; i--) {
    if (isClassFlavorParagraph(paragraphs[i])) kept.unshift(paragraphs[i]);
    else if (kept.length) break;
  }
  return kept.length ? kept.join("\n\n") : null;
}

function bodyHasLeadingFlavor(body) {
  const first = body.trim().split(/\n\n+/)[0] || "";
  return isClassFlavorParagraph(first);
}

function mergeOrphanClassFlavor(md, headerIndex, body) {
  if (bodyHasLeadingFlavor(body)) return body;
  const between = classOrphanWindow(md, headerIndex);
  const stats = extractStatsBlockFromText(between);
  const flavor = extractOrphanClassFlavor(between, stats);
  if (!flavor) return body;
  return `${flavor}\n\n${body}`.trim();
}

function insertOrphanTalentTable(body, table) {
  if (!table || bodyHasTalentTable(body)) return body;
  const headerRe = /^###\s+TALENTOS[^\n]*\n/im;
  if (!headerRe.test(body)) {
    return `${body.trim()}\n\n### TALENTOS\n\n${table}`.trim();
  }
  const split = body.split(headerRe);
  const head = split[0];
  let tail = (split[1] || "").trim();
  const contam = tail.search(/\n\nArmas:/i);
  if (contam >= 0) tail = tail.slice(0, contam).trim();
  const flavorContam = tail.search(
    /\n\n[A-ZÁÉÍÓÚÃÕÇ][^\n]{35,}\n\nArmas:/,
  );
  if (flavorContam >= 0) tail = tail.slice(0, flavorContam).trim();

  const epigraphs = [];
  while (tail.startsWith("###")) {
    const m = tail.match(/^###[^\n]+\n+/);
    if (!m) break;
    epigraphs.push(m[0].trim());
    tail = tail.slice(m[0].length).trim();
  }
  const orphanLine = tail.replace(/\| (?:d\d+|2d6) \|[\s\S]*/i, "").trim();
  const headerMatch = body.match(headerRe);
  const headerLine = headerMatch ? headerMatch[0].trim() : "### TALENTOS";
  const parts = [head.trim(), headerLine, ...epigraphs, table];
  if (orphanLine) parts.push(orphanLine);
  return parts.filter(Boolean).join("\n\n").trim();
}

function mergeOrphanClassTalentTable(md, headerIndex, body) {
  const between = classOrphanWindow(md, headerIndex);
  const table = extractTalentTableFromText(between);
  if (!table) return body;
  return insertOrphanTalentTable(body, table);
}

/** Habilidades entre stats e tabela de talentos na janela órfã (CS: Bardo, etc.). */
function mergeOrphanClassAbilities(md, headerIndex, body) {
  if (bodyHasLeadingStats(body)) return body;
  const between = classOrphanWindow(md, headerIndex);
  const stats = extractStatsBlockFromText(between);
  if (!stats) return body;
  const idx = between.lastIndexOf(stats);
  let mid = between.slice(idx + stats.length).trim();
  mid = trimNextClassFlavorContamination(mid);
  const tableIdx = mid.search(/^\| (?:d\d+|2d6) \|/im);
  if (tableIdx >= 0) mid = mid.slice(0, tableIdx).trim();
  const talentIdx = mid.search(/^###\s+TALENTOS/im);
  if (talentIdx >= 0) mid = mid.slice(0, talentIdx).trim();
  mid = mid.replace(/^2d6Efeito[^\n]*\n?/gim, "").trim();
  if (!mid || mid.length < 20) return body;
  const firstAbility = mid.split(/\n\n+/)[0] || "";
  if (firstAbility && body.includes(firstAbility.slice(0, 24))) return body;
  return `${mid}\n\n${body}`.trim();
}

/** Corpo da Bruxa colado no Cavaleiro de São Ydris (CS1). */
function fixYdrisMisplacedBody(md, headerIndex, body, nome) {
  if (!/São Ydris/i.test(nome)) return body;
  if (!/magias de bruxa/i.test(body)) return body;
  const between = classOrphanWindow(md, headerIndex);
  if (!/Possessão Demoníaca/i.test(between)) return body;
  const stats = extractStatsBlockFromText(between);
  if (!stats) return body;
  const flavor = extractOrphanClassFlavor(between, stats);
  const statsIdx = between.lastIndexOf(stats);
  let block = between.slice(statsIdx).trim();
  block = trimNextClassFlavorContamination(block);
  const table = extractTalentTableFromText(block);
  block = block.replace(/\| (?:d\d+|2d6) \|[\s\S]*/i, "").trim();
  block = block.replace(/^2d6Efeito[^\n]*\n?/gim, "").trim();
  const epigraph = body.match(/^###\s+TALENTOS[^\n]*/im);
  const parts = [];
  if (flavor) parts.push(flavor);
  if (block) parts.push(block);
  if (epigraph) parts.push(epigraph[0]);
  if (table) parts.push(table);
  return parts.join("\n\n").trim();
}

/** Corta bloco da próxima classe colado após talentos / magias (extract livro e CS). */
function trimNextClassFlavorContamination(body) {
  let text = body.trim();
  const talentMark = text.search(/^###\s+TALENTOS|^##\s+Talentos/im);
  if (talentMark < 0) return text;
  const markers = [
    /\n\nCavaleiros amaldiçoados/i,
    /\n\nGuerreiros uivantes/i,
    /\n\nAssassinos vestidos de preto/i,
    /\n\nAssassinos que se esgueiram/i,
    /\n\nAdeptos tatuados com runas/i,
    /\n\nTemplários cruzados/i,
    /\n\nVelhas recurvadas/i,
    /\n\nInvasores dos mares/i,
    /\n\nOráculos sinistros/i,
    /\n\nEsgrimistas e faladores/i,
    /\n\nBárbaros uivantes trovejando/i,
  ];
  const searchIn = text.slice(talentMark);
  const offset = talentMark;
  let cut = text.length;
  for (const re of markers) {
    const i = searchIn.search(re);
    if (i >= 0) cut = Math.min(cut, offset + i);
  }
  if (cut < text.length) text = text.slice(0, cut).trim();
  return text;
}

function trimAncestryBodyContamination(body) {
  const cuts = [
    body.search(/\n###\s+/),
    body.search(/\nArmas:/i),
    body.search(/\nArmaduras:/i),
    body.search(/\nPontos de Vida:/i),
    body.search(/\n\| d12 \|/i),
    body.search(/\n2d6Efeito/i),
  ].filter((n) => n >= 0);
  if (!cuts.length) return body.trim();
  return body.slice(0, Math.min(...cuts)).trim();
}

/** Remove parágrafos de lore/classe colados após o traço racial (livro). */
function trimAncestryLivroParagraphs(body) {
  let text = trimAncestryBodyContamination(body);
  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const kept = [];
  let sawTrait = false;
  for (const p of paragraphs) {
    if (/^Você conhece/i.test(p)) {
      kept.push(p);
      continue;
    }
    if (/^[A-ZÁÉÍÓÚÃÕÇ][^.]{1,60}\.\s+/.test(p)) {
      kept.push(p);
      sawTrait = true;
      continue;
    }
    if (!sawTrait) kept.push(p);
  }
  return kept.join("\n\n");
}

/** Títulos de cartão (Idiomas / traço); não flavor do livro colado como ##. */
function isMechanicalAncestrySectionTitle(title) {
  const t = title.trim();
  if (/^Idiomas$/i.test(t)) return true;
  if (t.includes(",")) return false;
  if (/^(Povo|Criaturas|Pequenos|Guerreiros)\b/i.test(t)) return false;
  if (t.length > 50) return false;
  return true;
}

function hoistMisplacedAncestryIntro(md) {
  let text = md.trim();
  const introParts = [];

  while (text.startsWith("## ")) {
    const m = text.match(
      /^## ([^\n]+)\n\n([\s\S]*?)(?=\n\n---\n\n## |\n\n## |$)/,
    );
    if (!m) break;
    const title = m[1].trim();
    const body = m[2].trim();
    if (isMechanicalAncestrySectionTitle(title)) break;
    introParts.push(body ? `${title}\n\n${body}` : title);
    text = text.slice(m[0].length).replace(/^\s*\n*---\s*\n*/m, "").trim();
  }

  if (!introParts.length) return md.trim();
  const intro = introParts.join("\n\n");
  if (!text) return intro;
  return `${intro}\n\n---\n\n${text}`;
}

/** Formato de ficha (## Idiomas / traços) alinhado a homebrew e Astraldark. */
function normalizeLivroAncestryDescricao(body) {
  const clean = trimAncestryLivroParagraphs(body);
  if (/\n## /m.test(clean) || /^## /m.test(clean)) {
    return hoistMisplacedAncestryIntro(clean);
  }

  const paragraphs = clean.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const intro = [];
  const sections = [];

  for (const p of paragraphs) {
    if (/^Você conhece/i.test(p)) {
      sections.push({ title: "Idiomas", body: p });
      continue;
    }
    const trait = p.match(/^([A-ZÁÉÍÓÚÃÕÇ][^.]{1,60})\.\s+(.+)$/s);
    if (trait) {
      sections.push({ title: trait[1].trim(), body: trait[2].trim() });
      continue;
    }
    intro.push(p);
  }

  if (!sections.length) return hoistMisplacedAncestryIntro(clean);

  const parts = [];
  if (intro.length) parts.push(intro.join("\n\n"));
  for (const s of sections) {
    parts.push(`## ${s.title}\n\n${s.body}`);
  }
  return hoistMisplacedAncestryIntro(parts.join("\n\n---\n\n"));
}

function stripAncestryCreditsSection(body) {
  const idx = body.search(/^## Créditos\s*$/m);
  if (idx >= 0) return body.slice(0, idx).trim();
  return body.trim();
}

/** Meta de design/mesa no topo das fichas — não vai para o Escudo. */
function stripAncestryIntroMeta(text) {
  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const kept = paragraphs.filter((p) => {
    if (/^\*\*Homebrew\*\*/i.test(p) || /^Homebrew para Shadowdark/i.test(p)) {
      return false;
    }
    if (/^Não concede visão na escuridão total/i.test(p)) return false;
    if (/^>\s*\*\*Uso privado/i.test(p)) return false;
    if (/^Versão de mesa:/i.test(p)) return false;
    return true;
  });
  return kept.join("\n\n");
}

/** Remove bloco da próxima classe colado após tabela de talentos (extract livro). */
function trimClassExtractContamination(body) {
  let text = trimNextClassFlavorContamination(body);
  const talentMark = text.search(/^###\s+TALENTOS/im);
  if (talentMark < 0) return text;

  const afterTalents = text.slice(talentMark);
  const contamArmas = afterTalents.search(/\n\nArmas:/i);
  if (contamArmas >= 0) {
    text = text.slice(0, talentMark + contamArmas).trim();
  } else {
    const contamFlavor = afterTalents.search(
      /\n\n[A-ZÁÉÍÓÚÃÕÇ][^\n]{40,}\n\nArmas:/,
    );
    if (contamFlavor >= 0) {
      text = text.slice(0, talentMark + contamFlavor).trim();
    }
  }
  return text;
}

function isProficiencyParagraph(p) {
  return /^(?:\*\*)?Armas(?:\*\*)?:/im.test(p)
    || /^(?:\*\*)?Armaduras?(?:\*\*)?:/im.test(p)
    || /^(?:\*\*)?Pontos de [Vv]ida(?:\*\*)?:/im.test(p);
}

function isClassBookCrossRefText(text) {
  const t = text.trim();
  if (!t) return false;
  if (/veja Conjuração/i.test(t)) return true;
  return /^Para conjurar magias\b/i.test(t) && /\bpág\.?\b/i.test(t);
}

function isClassBookCrossRefSection(title, body) {
  if (isClassBookCrossRefText(title)) return true;
  if (isClassBookCrossRefText(body) && /^\d+\.?\s*$/.test(body.trim())) return true;
  if (isClassBookCrossRefText(title) && /^\d+\.?\s*$/.test(body.trim())) return true;
  return false;
}

function stripClassBookCrossRefs(md) {
  const text = md.trim();
  if (!/^## /m.test(text)) return text;

  const parts = text.split(/(?=^## )/m).map((p) => p.trim()).filter(Boolean);
  const intro = parts[0].startsWith("## ") ? null : parts[0];
  const sectionBlocks = parts[0].startsWith("## ") ? parts : parts.slice(1);

  const keptSections = sectionBlocks.filter((block) => {
    const lines = block.split("\n");
    const title = lines[0].replace(/^##\s+/, "").trim();
    const body = lines.slice(1).join("\n").trim();
    return !isClassBookCrossRefSection(title, body);
  });

  const chunks = [];
  if (intro) chunks.push(intro);
  chunks.push(...keptSections);
  return chunks.join("\n\n---\n\n").trim();
}

function looksLikeClassAbility(paragraph, ability) {
  if (!ability) return false;
  if (ability.title.length > 52) return false;
  if (
    /^(Maestria|Bravura|Conjuração|Divindade|Ladroagem|Idiomas|Familiar|Montar|Patrono|Deuses Antigos|Muralha|Possessão|Fascinar|Inspirar|Predestinado|Presságio|Florescer|Implacável|Basilisco|Marinheiro|Artes Bárdicas|Amador Mágico|Parry|Tale Spinner|Provocação|Dádiva|Expulsar|Apunhalada|Aprendendo|Carregar|Charge)/i.test(
      ability.title,
    )
  ) {
    return true;
  }
  if (
    /^Você |^Escolha |^Se você |^\d+\/dia|^A cada |^Ao |^Independentemente|^Para conjurar|^Sempre que |^Se falhar|^Se você rolar/i.test(
      ability.body,
    )
  ) {
    return true;
  }
  if (isProficiencyParagraph(paragraph)) return false;
  return ability.title.length <= 35;
}

function parseAbilityParagraph(p) {
  if (isClassBookCrossRefText(p)) return null;
  const bold = p.match(/^\*\*([^*]+)\.\*\*\s*([\s\S]*)$/);
  if (bold) return { title: bold[1].trim(), body: bold[2].trim() };
  const plain = p.match(/^([A-ZÁÉÍÓÚÃÕÇ][^.]{1,52})\.\s+([\s\S]+)$/);
  if (plain && !/^Armas/i.test(plain[1])) {
    if (isClassBookCrossRefSection(plain[1].trim(), plain[2].trim())) return null;
    const ability = { title: plain[1].trim(), body: plain[2].trim() };
    if (!looksLikeClassAbility(p, ability)) return null;
    return ability;
  }
  return null;
}

function classDescricaoNeedsPlainNormalize(text) {
  if (!text || /^## /m.test(text)) return false;
  return (
    /(?:\*\*)?Armas(?:\*\*)?:/im.test(text)
    || /(?:\*\*)?Armaduras?(?:\*\*)?:/im.test(text)
    || /\*\*[^*]+\.\*\*/m.test(text)
  );
}

function normalizeClassTalentSectionTitle(title) {
  const t = title.trim();
  if (/^Talentos de Lótus Negra$/i.test(t)) return t;
  if (/^TALENTOS DE LÓTUS NEGRA$/i.test(t)) return "Talentos de Lótus Negra";
  if (/^Talentos\s+(?:de|do|del|da)\s+/i.test(t)) return "Talentos";
  if (/^TALENTOS\s+(?:DE|DO)\s+/i.test(t)) return "Talentos";
  return title;
}

function normalizeClassTalentHeadersInMarkdown(md) {
  return md.replace(/^##\s+(.+)$/gm, (_, title) => {
    const normalized = normalizeClassTalentSectionTitle(title.trim());
    return `## ${normalized}`;
  });
}

function normalizeClassDescricaoPlain(text) {
  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const intro = [];
  const prof = [];
  const abilities = [];
  let talentsParts = [];
  let inTalents = false;
  let pendingAbility = null;

  function flushAbility() {
    if (pendingAbility) {
      abilities.push(pendingAbility);
      pendingAbility = null;
    }
  }

  for (const p of paragraphs) {
    if (isClassBookCrossRefText(p)) continue;
    if (/^###\s+TALENTOS/i.test(p) || /^##\s+Talentos/i.test(p)) {
      flushAbility();
      inTalents = true;
      talentsParts.push(p.replace(/^###\s+/i, "## "));
      continue;
    }
    if (inTalents || /^\| d12 \|/i.test(p) || (p.includes("|") && p.includes("d12"))) {
      flushAbility();
      inTalents = true;
      talentsParts.push(p);
      continue;
    }
    if (isProficiencyParagraph(p)) {
      flushAbility();
      prof.push(p.replace(/\*\*/g, ""));
      continue;
    }
    const ability = parseAbilityParagraph(p);
    if (ability && (prof.length > 0 || abilities.length > 0 || inTalents)) {
      flushAbility();
      pendingAbility = ability;
      continue;
    }
    if (ability && looksLikeClassAbility(p, ability)) {
      flushAbility();
      pendingAbility = ability;
      continue;
    }
    if (pendingAbility) {
      pendingAbility.body = `${pendingAbility.body}\n\n${p}`;
      continue;
    }
    if (!inTalents && (isClassFlavorParagraph(p) || prof.length === 0)) {
      intro.push(p);
      continue;
    }
    if (prof.length === 0 && abilities.length === 0 && !inTalents) {
      intro.push(p);
    }
  }
  flushAbility();

  const parts = [];
  if (intro.length) parts.push(intro.join("\n\n"));
  if (prof.length) {
    parts.push(`## Proficiências\n\n${prof.join("\n\n")}`);
  }
  for (const a of abilities) {
    parts.push(`## ${a.title}\n\n${a.body}`);
  }
  if (talentsParts.length) {
    const block = talentsParts.join("\n\n");
    const titleMatch = block.match(/^##\s+(.+?)(?:\n|$)/);
    const rawTitle = titleMatch
      ? titleMatch[1].replace(/^TALENTOS\s+(?:DE|DO)\s+/i, "Talentos de ")
      : "Talentos";
    const title = normalizeClassTalentSectionTitle(rawTitle);
    const content = block.replace(/^##\s+[^\n]+\n?/i, "").trim();
    parts.push(`## ${title}\n\n${content}`);
  }

  if (!parts.length) return text;
  return parts.join("\n\n---\n\n");
}

function normalizeClassDescricao(body) {
  let text = trimClassExtractContamination(
    trimNextClassFlavorContamination(stripClassIntroMeta(body.trim())),
  );
  const firstH2 = text.search(/^## /m);
  if (firstH2 > 0) {
    const prefix = text.slice(0, firstH2).trim()
      .replace(/^\s*---\s*\n+/m, "")
      .replace(/\n+---\s*$/m, "")
      .trim();
    const suffix = text.slice(firstH2).trim().replace(/\n---\n+(?=## )/g, "\n\n");
    if (classDescricaoNeedsPlainNormalize(prefix)) {
      const norm = normalizeClassDescricaoPlain(prefix);
      return normalizeClassTalentHeadersInMarkdown(
        stripClassBookCrossRefs(
          norm ? `${norm}\n\n---\n\n${suffix}` : suffix,
        ),
      );
    }
    return normalizeClassTalentHeadersInMarkdown(
      stripClassBookCrossRefs(
        prefix ? `${prefix}\n\n---\n\n${suffix}` : suffix,
      ),
    );
  }
  if (/^## /m.test(text)) {
    return normalizeClassTalentHeadersInMarkdown(
      stripClassBookCrossRefs(
        text.replace(/\n---\n+(?=## )/g, "\n\n"),
      ),
    );
  }
  return normalizeClassTalentHeadersInMarkdown(
    stripClassBookCrossRefs(normalizeClassDescricaoPlain(text)),
  );
}

function finalizeClassDescricao(descricao, fonte) {
  let d = stripAncestryCreditsSection(descricao);
  if (fonte !== "livro" && fonte !== "cursed-scroll" && fonte !== "homebrew") {
    d = stripClassIntroMeta(d);
  }
  return stripClassBookCrossRefs(normalizeClassDescricao(d));
}

function finalizeAncestryDescricao(descricao, fonte) {
  let d = stripAncestryCreditsSection(descricao);
  if (fonte === "livro") {
    return normalizeLivroAncestryDescricao(d);
  }
  if (/\n## /m.test(d) || /^## /m.test(d)) {
    d = d.replace(/\n---\n+(?=## )/g, "\n\n");
    const firstH2 = d.search(/^## /m);
    if (firstH2 > 0) {
      const intro = stripAncestryIntroMeta(d.slice(0, firstH2).trim());
      const rest = d.slice(firstH2).trim();
      d = intro ? `${intro}\n\n${rest}` : rest;
    }
    return hoistMisplacedAncestryIntro(d);
  }
  return stripAncestryIntroMeta(d);
}

const ANCESTRY_LIVRO_NAMES = new Set([
  "ANÃO",
  "ELFO",
  "GOBLIN",
  "HALFLING",
  "HUMANO",
  "MEIO-ORC",
]);

function isAncestrySectionTitle(title) {
  const t = title.trim();
  return /^[A-ZÁÉÍÓÚÃÕÇ][A-ZÁÉÍÓÚÃÕÇ0-9 -]+$/.test(t) && t.length >= 3 && t.length < 40;
}

function isValidAncestryBody(body) {
  const b = body.trim();
  if (b.length < 40) return false;
  if (/Pontos de Vida:|Armaduras:|# Classe:/i.test(b)) return false;
  if (/\| d12 \|/i.test(b) || /2d6Efeito/i.test(b)) return false;
  return true;
}

function parseEntradasFromMd(
  md,
  { defaultFonte = "livro", entryDelimiter = null, catalogoKind = "ancestralidade" } = {},
) {
  const blocks = entryDelimiter
    ? md
        .split(/\n---\n## /)
        .slice(1)
        .map((b) => `## ${b.trim()}`)
    : md.split(/\n###\s+/).slice(1);
  const entradas = [];
  const skipped = [];
  const seen = new Set();

  for (const block of blocks) {
    const lines = block.split("\n");
    const nome = lines[0].replace(/^##\s+/, "").replace(/^###\s+/, "").trim();
    const rawBody = lines.slice(1).join("\n").trim();
    if (!nome) continue;
    const { origem, fonte, descricao: bodyRaw } = parseOrigemFromBody(rawBody, defaultFonte);
    const body = stripPdfNoise(bodyRaw);
    if (!body) {
      skipped.push({ nome, reasons: ["empty_body"] });
      continue;
    }
    const key = slug(nome);
    if (seen.has(key)) {
      skipped.push({ nome, reasons: ["duplicate"] });
      continue;
    }
    seen.add(key);
    const descricao =
      catalogoKind === "classe"
        ? finalizeClassDescricao(body, fonte)
        : finalizeAncestryDescricao(body, fonte);
    entradas.push({
      id: key,
      nome,
      origem,
      fonte,
      descricao,
    });
  }
  return { entradas, skipped };
}

function toCatalogMd(title, intro, entradas, { entryDelimiter = "---" } = {}) {
  const lines = [`# ${title}`, "", intro, ""];
  for (const e of entradas) {
    if (entryDelimiter) lines.push(entryDelimiter);
    lines.push(`## ${e.nome}`);
    if (e.fonte !== "livro" || e.origem !== "livro") {
      lines.push(`*Origem: ${e.origem}*`);
      lines.push(`*Fonte: ${e.fonte}*`);
      lines.push("");
    }
    lines.push(e.descricao);
    lines.push("");
  }
  return lines.join("\n");
}

function extractClassesFromText(md, { origem, fonte }) {
  const re = /^# Classe:\s*(.+)$/gm;
  const matches = [...md.matchAll(re)];
  const entradas = [];
  const skipped = [];

  for (let i = 0; i < matches.length; i++) {
    const nome = matches[i][1].trim();
    const headerIndex = matches[i].index;
    const prevHeaderIndex = i > 0 ? matches[i - 1].index : -1;
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : md.length;
    let body = md.slice(start, end).trim();
    body = body.replace(/^(?:# Classe:[^\n]+\n+)+/i, "");
    const nextH1 = body.search(/\n# [^#]/);
    if (nextH1 >= 0) body = body.slice(0, nextH1).trim();
    body = mergeOrphanClassStats(md, headerIndex, prevHeaderIndex, body);
    body = mergeOrphanClassFlavor(md, headerIndex, body);
    body = fixYdrisMisplacedBody(md, headerIndex, body, nome);
    body = mergeOrphanClassAbilities(md, headerIndex, body);
    body = trimClassExtractContamination(body);
    body = mergeOrphanClassTalentTable(md, headerIndex, body);
    body = stripPdfNoise(body);
    if (!isValidClassBody(body)) {
      skipped.push({ nome, reasons: ["invalid_class_body"] });
      continue;
    }
    entradas.push({
      id: slug(nome),
      nome,
      origem,
      fonte,
      descricao: finalizeClassDescricao(body, fonte),
    });
  }
  return { entradas, skipped };
}

function extractAncestryLivro(md) {
  const attrIdx = md.search(/^# Atributos\s*$/m);
  const classIdx = md.search(/^# Classe:\s*Guerreiro\s*$/m);
  if (attrIdx < 0 || classIdx < 0) return { entradas: [], skipped: [] };
  const slice = md.slice(attrIdx, classIdx);
  const re = /^## ([A-ZÁÉÍÓÚÃÕÇ][^\n]+)$/gm;
  const matches = [...slice.matchAll(re)];
  const entradas = [];
  const skipped = [];

  for (let i = 0; i < matches.length; i++) {
    const nome = matches[i][1].trim();
    if (!ANCESTRY_LIVRO_NAMES.has(nome) && !isAncestrySectionTitle(nome)) {
      continue;
    }
    if (!ANCESTRY_LIVRO_NAMES.has(nome)) {
      skipped.push({ nome, reasons: ["not_official_ancestry"] });
      continue;
    }
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : slice.length;
    let body = slice.slice(start, end).trim();
    const h1 = body.search(/\n# /);
    if (h1 >= 0) body = body.slice(0, h1).trim();
    body = trimAncestryLivroParagraphs(body);
    body = stripPdfNoise(body);
    if (!isValidAncestryBody(body)) {
      skipped.push({ nome, reasons: ["invalid_ancestry_body"] });
      continue;
    }
    entradas.push({
      id: slug(nome),
      nome,
      origem: "livro",
      fonte: "livro",
      descricao: normalizeLivroAncestryDescricao(body),
    });
  }
  return { entradas, skipped };
}

function classIntroText(descricao) {
  const d = descricao.trim();
  const firstH2 = d.search(/^## /m);
  const head = firstH2 >= 0 ? d.slice(0, firstH2) : d;
  return head.replace(/^\s*---\s*$/gm, "").trim();
}

function assertClassTalentTables(entradas) {
  const errors = [];
  for (const e of entradas) {
    const m = e.descricao.match(
      /##\s+Talentos[^\n]*\n([\s\S]*?)(?=\n## |\n---\n\n## |$)/i,
    );
    const block = m ? m[1] : e.descricao;
    if (!/\| (?:\d*d\d+|2d6) \|/i.test(block)) {
      errors.push(`${e.id}: sem tabela de talentos`);
    }
  }
  return errors;
}

function assertClassIntroParagraphs(entradas, { minLen = 40 } = {}) {
  const errors = [];
  for (const e of entradas) {
    const intro = classIntroText(e.descricao);
    if (intro.length < minLen || /^Armas:/i.test(intro)) {
      errors.push(`${e.id}: intro ausente ou curta (${intro.length} chars)`);
    }
  }
  return errors;
}

function parseAncestryFile(md, { origem, fonte, nomeFromH1 = true }) {
  const h1 = md.match(/^#\s+(.+)$/m);
  let nome = h1 ? h1[1].trim() : "Ancestralidade";
  if (nomeFromH1) {
    nome = nome.replace(/\s*-\s*Ancestralidade\s*$/i, "").trim();
  }
  let body = md.replace(/^#\s+.+$/m, "").trim();
  const hrParts = body.split(/\n---\n/);
  if (hrParts.length >= 2) {
    const intro = stripAncestryIntroMeta(hrParts[0].trim());
    const mechanics = hrParts.slice(1).join("\n---\n").trim();
    body = intro ? `${intro}\n\n${mechanics}` : mechanics;
  } else {
    body = stripAncestryIntroMeta(body);
  }
  body = stripPdfNoise(body);
  if (!isValidAncestryBody(body)) return null;
  return {
    id: slug(nome),
    nome,
    origem,
    fonte,
    descricao: finalizeAncestryDescricao(body, fonte),
  };
}

module.exports = {
  slug,
  parseOrigemFromBody,
  stripPdfNoise,
  isValidClassBody,
  isValidAncestryBody,
  parseEntradasFromMd,
  toCatalogMd,
  extractClassesFromText,
  extractStatsBlockFromText,
  mergeOrphanClassStats,
  mergeOrphanClassFlavor,
  mergeOrphanClassAbilities,
  fixYdrisMisplacedBody,
  mergeOrphanClassTalentTable,
  extractTalentTableFromText,
  bodyHasTalentTable,
  trimNextClassFlavorContamination,
  assertClassTalentTables,
  assertClassIntroParagraphs,
  classIntroText,
  trimAncestryBodyContamination,
  trimAncestryLivroParagraphs,
  normalizeLivroAncestryDescricao,
  hoistMisplacedAncestryIntro,
  isMechanicalAncestrySectionTitle,
  finalizeAncestryDescricao,
  stripAncestryCreditsSection,
  stripAncestryIntroMeta,
  extractAncestryLivro,
  parseAncestryFile,
  parseClassFile,
  stripClassIntroMeta,
  trimClassExtractContamination,
  normalizeClassDescricao,
  finalizeClassDescricao,
  ANCESTRY_LIVRO_NAMES,
};
