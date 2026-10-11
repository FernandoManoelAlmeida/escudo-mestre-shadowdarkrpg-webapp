export type CatalogoMarkdownSection = {
  id: string;
  title: string;
  body: string;
};

const TABLE_PLACEHOLDER = "\u0000TBL";

/** Repara markdown colapsado em uma linha (legado do migrate). */
export function repairCollapsedMarkdown(text: string): string {
  const tables: string[] = [];
  let out = text.trim();
  out = out.replace(/(?:^\|[^\n]+\|\s*$\n?)+/gm, (block) => {
    tables.push(block.trimEnd());
    return `${TABLE_PLACEHOLDER}${tables.length - 1}\u0000`;
  });
  out = out.replace(/\s+---\s+(?=## )/g, "\n\n---\n\n");
  out = out.replace(/\s+---\s+/g, "\n\n---\n\n");
  out = out.replace(/\s+(?=## )/g, "\n\n");
  out = out.replace(/([.!?])\s+(\| )/g, "$1\n\n$2");
  out = out.replace(
    new RegExp(`${TABLE_PLACEHOLDER}(\\d+)\\u0000`, "g"),
    (_, i) => `${tables[Number(i)]}\n\n`,
  );
  return out.trimEnd();
}

const COLLAPSED_BODY_START =
  /\s(Você|Após|Sob|Seu|Sua|Ganha|Durante|Quando|Cada|Em)\s/u;

function splitCollapsedSectionHead(
  head: string,
): { title: string; body: string } | null {
  const match = head.match(COLLAPSED_BODY_START);
  if (!match || match.index === undefined || match.index < 1) return null;
  const title = head.slice(0, match.index).trim();
  const body = head.slice(match.index).trim();
  if (!title || !body) return null;
  return { title, body };
}

function slugSection(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/\u0300-\u036f/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Converte texto plano do livro (sem ##) para seções, como no migrate. */
export function normalizeLivroPlainAncestry(raw: string): string {
  const text = raw.trim();
  if (/^## |\n## /m.test(text)) return text;

  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const intro: string[] = [];
  const sections: { title: string; body: string }[] = [];

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

  if (!sections.length) return text;

  const parts: string[] = [];
  if (intro.length) parts.push(intro.join("\n\n"));
  for (const s of sections) {
    parts.push(`## ${s.title}\n\n${s.body}`);
  }
  return parts.join("\n\n---\n\n");
}

function trimClassExtractContamination(body: string): string {
  let text = body.trim();
  const talentMark = text.search(/^###\s+TALENTOS/im);
  if (talentMark < 0) return text;

  const firstArmas = text.search(/\n\nArmas:/i);
  if (firstArmas < 0) return text;
  const secondArmas = text.indexOf("\n\nArmas:", firstArmas + 1);
  if (secondArmas > talentMark) {
    text = text.slice(0, secondArmas).trim();
  }
  const orphanFlavor = text.search(/\n\n[A-ZÁÉÍÓÚÃÕÇ][^\n]{40,}\n\nArmas:/);
  if (orphanFlavor > talentMark && orphanFlavor >= 0) {
    text = text.slice(0, orphanFlavor).trim();
  }
  return text;
}

function isProficiencyParagraph(p: string): boolean {
  return (
    /^(?:\*\*)?Armas(?:\*\*)?:/im.test(p)
    || /^(?:\*\*)?Armaduras?(?:\*\*)?:/im.test(p)
    || /^(?:\*\*)?Pontos de [Vv]ida(?:\*\*)?:/im.test(p)
  );
}

function isClassBookCrossRefText(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (/veja Conjuração/i.test(t)) return true;
  return /^Para conjurar magias\b/i.test(t) && /\bpág\.?\b/i.test(t);
}

function isClassBookCrossRefSection(title: string, body: string): boolean {
  if (isClassBookCrossRefText(title)) return true;
  if (isClassBookCrossRefText(body) && /^\d+\.?\s*$/.test(body.trim())) return true;
  if (isClassBookCrossRefText(title) && /^\d+\.?\s*$/.test(body.trim())) return true;
  return false;
}

export function stripClassBookCrossRefs(md: string): string {
  const text = md.trim();
  if (!/^## /m.test(text)) return text;

  const parts = text.split(/(?=^## )/m).map((p) => p.trim()).filter(Boolean);
  const intro = parts[0].startsWith("## ") ? null : parts[0];
  const sectionBlocks = parts[0].startsWith("## ") ? parts : parts.slice(1);

  const keptSections = sectionBlocks.filter((block) => {
    const lines = block.split("\n");
    const title = lines[0]?.replace(/^##\s+/, "").trim() ?? "";
    const body = lines.slice(1).join("\n").trim();
    return !isClassBookCrossRefSection(title, body);
  });

  const chunks: string[] = [];
  if (intro) chunks.push(intro);
  chunks.push(...keptSections);
  return chunks.join("\n\n---\n\n").trim();
}

function parseAbilityParagraph(p: string): { title: string; body: string } | null {
  if (isClassBookCrossRefText(p)) return null;
  const bold = p.match(/^\*\*([^*]+)\.\*\*\s*([\s\S]*)$/);
  if (bold) return { title: bold[1].trim(), body: bold[2].trim() };
  const plain = p.match(/^([A-ZÁÉÍÓÚÃÕÇ][^.]{1,80})\.\s+([\s\S]+)$/);
  if (plain && !/^Armas/i.test(plain[1])) {
    if (isClassBookCrossRefSection(plain[1].trim(), plain[2].trim())) return null;
    return { title: plain[1].trim(), body: plain[2].trim() };
  }
  return null;
}

function classDescricaoNeedsPlainNormalize(text: string): boolean {
  if (!text || /^## /m.test(text)) return false;
  return (
    /(?:\*\*)?Armas(?:\*\*)?:/im.test(text)
    || /(?:\*\*)?Armaduras?(?:\*\*)?:/im.test(text)
    || /\*\*[^*]+\.\*\*/m.test(text)
  );
}

function normalizeClassDescricaoPlain(text: string): string {
  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const intro: string[] = [];
  const prof: string[] = [];
  const abilities: { title: string; body: string }[] = [];
  const talentsParts: string[] = [];
  let inTalents = false;
  let pendingAbility: { title: string; body: string } | null = null;

  const flushAbility = () => {
    if (pendingAbility) {
      abilities.push(pendingAbility);
      pendingAbility = null;
    }
  };

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
    if (ability) {
      flushAbility();
      pendingAbility = ability;
      continue;
    }
    if (pendingAbility) {
      pendingAbility.body = `${pendingAbility.body}\n\n${p}`;
      continue;
    }
    if (prof.length === 0 && abilities.length === 0 && !inTalents) {
      intro.push(p);
    }
  }
  flushAbility();

  const parts: string[] = [];
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

/** Espelho de `normalizeClassDescricao` no migrate (fichas legadas sem ##). */
export function normalizeClassDescricao(body: string): string {
  const text = trimClassExtractContamination(body.trim());
  const firstH2 = text.search(/^## /m);
  if (firstH2 > 0) {
    const prefix = cleanCatalogoIntro(text.slice(0, firstH2).trim());
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

export type CatalogoDescricaoKind = "ancestralidade" | "classe";

export function prepareCatalogoDescricao(
  raw: string,
  kind: CatalogoDescricaoKind = "ancestralidade",
): string {
  if (kind === "classe") return normalizeClassDescricao(raw);
  return normalizeLivroPlainAncestry(raw);
}

/** `---` entre intro e `##` não deve ir para o Markdown do intro (evita `<hr>` duplicado antes do cartão). */
export function cleanCatalogoIntro(intro: string): string {
  return intro
    .replace(/^\s*---\s*\n+/m, "")
    .replace(/\n+---\s*$/m, "")
    .trim();
}

/** Remove separadores temáticos `---` no fim do body de um cartão (não mexe em `| --- |` de tabelas). */
export function cleanCatalogoSectionBody(body: string): string {
  return body.replace(/(\n+---\s*)+$/g, "").trim();
}

function isTalentSectionTitle(title: string): boolean {
  return /talentos/i.test(title) && !/^dádivas\s*[—-]/i.test(title.trim());
}

/** SD2-01: cartão de talentos de classe sem sufixo do nome da classe. */
export function normalizeClassTalentSectionTitle(title: string): string {
  const t = title.trim();
  if (/^Talentos de Lótus Negra$/i.test(t)) return t;
  if (/^TALENTOS DE LÓTUS NEGRA$/i.test(t)) return "Talentos de Lótus Negra";
  if (/^Talentos\s+(?:de|do|del|da)\s+/i.test(t)) return "Talentos";
  if (/^TALENTOS\s+(?:DE|DO)\s+/i.test(t)) return "Talentos";
  return title;
}

function normalizeClassTalentHeadersInMarkdown(md: string): string {
  return md.replace(/^##\s+(.+)$/gm, (_, title) => {
    const normalized = normalizeClassTalentSectionTitle(title.trim());
    return `## ${normalized}`;
  });
}

/** SD2-02: remove epígrafes `###` antes da primeira tabela em seções de talentos. */
export function stripTalentEpigraphs(body: string): string {
  const firstTable = body.search(/^\|/m);
  if (firstTable < 0) return body;

  const before = body.slice(0, firstTable);
  const after = body.slice(firstTable);
  const kept = before.split("\n").filter((line) => {
    const t = line.trim();
    if (!/^###\s+/.test(t)) return true;
    const text = t.replace(/^###\s+/, "").trim();
    if (/^["“«][^"”»]+["”»]\s*$/.test(text)) return false;
    if (/^-ditado de/i.test(text)) return false;
    return true;
  });

  const prefix = kept.join("\n").trimEnd();
  return prefix ? `${prefix}\n${after.trimStart()}` : after.trimStart();
}

function isConjuracaoSectionTitle(title: string): boolean {
  return /^conjuração$/i.test(title.trim());
}

/** Linhas de tabela GFM com coluna única ou pipes faltando. */
export function repairTalentTableMarkdown(markdown: string): string {
  let text = markdown;
  text = text.replace(
    /^\|\s*((?:\d+[–-]\d+|\d+))\s+([^|\n]+?)\s*\|?\s*$/gm,
    "| $1 | $2 |",
  );
  text = text.replace(
    /^\|\s*((?:\d+[–-]\d+|\d+))\s*\|\s*([^|\n]+)$/gm,
    "| $1 | $2 |",
  );
  text = text.replace(
    /^(\d+[–-]\d+)([A-ZÁÉÍÓÚÃÕÇa-záéíóúãõç])/gm,
    "$1 | $2",
  );
  text = text.replace(
    /^\|\s*12\s+([^|]+)$/gm,
    "| 12 | $1 |",
  );
  return text;
}

const MAGIAS_CONHECIDAS_HEAD =
  /^(?:#{1,3}\s*)?MAGIAS\s+DE\s+.+?\s+CONHECIDAS/im;

/** Resgata linhas de talento coladas antes do bloco MAGIAS DE … CONHECIDAS. */
export function rescueTalentRowsFromMagiasBlock(body: string): string {
  const idx = body.search(MAGIAS_CONHECIDAS_HEAD);
  if (idx < 0) return body;

  const before = body.slice(0, idx).trimEnd();
  const after = body.slice(idx);
  const rescued: string[] = [];

  const glued10 = before.match(/(\d+[–-]\d+)(Aprenda[\s\S]+?)(?=\n|$)/);
  if (glued10) {
    rescued.push(`| ${glued10[1]} | ${glued10[2].trim()} |`);
  }
  const dayTeleport = before.match(
    /(\d+)\s*\/\s*dia,?\s*(teleporte[\s\S]+?)(?=\n\d+[–-]|$)/i,
  );
  if (dayTeleport) {
    rescued.push(`| 2 | ${dayTeleport[2].trim()} |`);
  }

  const cleanedBefore = before
    .replace(/(\d+[–-]\d+)(Aprenda[\s\S]+?)(?=\n|$)/, "")
    .replace(/(\d+)\s*\/\s*dia,?\s*teleporte[\s\S]+?(?=\n|$)/i, "")
    .trimEnd();

  if (!rescued.length) return body;
  return `${cleanedBefore}\n${rescued.join("\n")}\n${after}`;
}

export function stripKnownSpellsBlockFromClassSection(body: string): string {
  const idx = body.search(MAGIAS_CONHECIDAS_HEAD);
  if (idx >= 0) return body.slice(0, idx).trim();
  if (body.includes("| Nível | 1º grau |")) {
    return body.replace(/\nMagias Conhecidas por Grau de Magia\s*\n*/gi, "\n").trim();
  }
  return body;
}

const TITULOS_BLOCK =
  /(?:\n|^)(?:#{1,3}\s*)?TÍTULOS\s+DE\s+[^\n]+[\s\S]*$/i;

export function stripClassTitlesBlock(body: string): string {
  const m = body.match(TITULOS_BLOCK);
  if (!m || m.index === undefined) {
    if (/NívelOrdeiroCaóticoNeutro/.test(body)) {
      return body.split(/NívelOrdeiroCaóticoNeutro/)[0].trim();
    }
    return body;
  }
  return body.slice(0, m.index).trim();
}

const ILLUSTRATION_CAPTION =
  /^###\s+(?:[“"«][^"”»]+[""»]\s*)?(?:-ditado de\s+)?[A-ZÁÉÍÓÚ][^,\n]{0,40},\s+[^.\n]+$/im;

export function stripClassIllustrationCaptions(body: string): string {
  let text = body;
  text = text.replace(/\n###\s+Jorbin, guerreiro anão\s*/gi, "\n");
  text = text.replace(/\n###\s+"[^"]+"\s*-\s*Markesh[^\n]*\n/gi, "\n");
  text = text.replace(/\n###\s+[“"][^"”]+[""]\s*$/gm, "\n");
  text = text.replace(/\n###\s+-ditado de[^\n]+\n/gi, "\n");
  const lines = text.split("\n");
  const kept = lines.filter((line) => !ILLUSTRATION_CAPTION.test(line.trim()));
  return kept.join("\n").trim();
}

export function trimTalentSectionSuffix(body: string): string {
  const tableEnd = body.lastIndexOf("\n|");
  if (tableEnd < 0) return stripClassIllustrationCaptions(body);

  const lastRow = body.lastIndexOf("\n| 12 |");
  const cutAt = lastRow >= 0 ? body.indexOf("\n", lastRow + 6) : tableEnd;
  if (cutAt < 0) return stripClassIllustrationCaptions(body);

  const main = body.slice(0, cutAt).trimEnd();
  const rest = body.slice(cutAt);
  if (/^\s*###\s+/m.test(rest) || /^(Olhar Petrificante|Implacável|Última Resistência|Pele de pedra)/m.test(rest)) {
    return stripClassIllustrationCaptions(main);
  }
  return stripClassIllustrationCaptions(
    stripClassTitlesBlock(stripKnownSpellsBlockFromClassSection(body)),
  );
}

export function repairSpellProgressionCollapsedLines(body: string): string {
  const hasFiveTier = /Nível12345/.test(body) || /\n\d{7,}-/.test(body);
  const hasThreeTier = /Nível123/.test(body) || /\n\d[\d-]{3}\s*$/.test(body);
  if (!hasFiveTier && !hasThreeTier) return body;

  const rowsFive: string[] = [];
  const rowsThree: string[] = [];
  const lines = body.split("\n");
  for (const line of lines) {
    const m5 = line.trim().match(/^(\d)([\d-])([\d-])([\d-])([\d-])([\d-])$/);
    if (m5) {
      const level = Number(m5[1]);
      const counts = [m5[2], m5[3], m5[4], m5[5], m5[6]].map((c) =>
        c === "-" ? "—" : c,
      );
      rowsFive.push(`| ${level} | ${counts.join(" | ")} |`);
      continue;
    }
    const m3 = line.trim().match(/^(\d)([\d-])([\d-])([\d-])$/);
    if (m3) {
      const level = Number(m3[1]);
      const counts = [m3[2], m3[3], m3[4]].map((c) => (c === "-" ? "—" : c));
      rowsThree.push(`| ${level} | ${counts.join(" | ")} |`);
    }
  }

  let out = body
    .replace(/Magias Conhecidas por Grau de Magia\s*\n*/gi, "")
    .replace(/Nível12345\s*\n*/g, "")
    .replace(/Nível123\s*\n*/g, "")
    .replace(/^\d{7,}-+\s*$/gm, "")
    .replace(/^\d[\d-]{3}\s*$/gm, "");

  if (rowsFive.length && !out.includes("| Nível | 1º grau |")) {
    const header = `| Nível | 1º grau | 2º grau | 3º grau | 4º grau | 5º grau |
| --- | --- | --- | --- | --- | --- |`;
    out = `${out.trim()}\n\n${header}\n${rowsFive.join("\n")}`;
  } else if (rowsThree.length && !out.includes("| Nível | 1º grau |")) {
    const header = `| Nível | 1º grau | 2º grau | 3º grau |
| --- | --- | --- | --- |`;
    out = `${out.trim()}\n\n${header}\n${rowsThree.join("\n")}`;
  }
  return out.trim();
}

function sanitizeClassSectionBody(title: string, body: string): string {
  let b = cleanCatalogoSectionBody(body);
  b = stripClassIllustrationCaptions(b);

  if (isTalentSectionTitle(title)) {
    b = stripTalentEpigraphs(b);
    b = rescueTalentRowsFromMagiasBlock(b);
    b = repairTalentTableMarkdown(b);
    b = stripKnownSpellsBlockFromClassSection(b);
    b = stripClassTitlesBlock(b);
    b = trimTalentSectionSuffix(b);
    b = repairTalentTableMarkdown(b);
  } else if (isConjuracaoSectionTitle(title)) {
    b = repairSpellProgressionCollapsedLines(b);
    b = stripKnownSpellsBlockFromClassSection(b);
  } else if (/^idiomas$/i.test(title.trim()) && /^Você conhece dois idiomas/i.test(b)) {
    const lines = b.split("\n");
    const kept = lines.filter(
      (l) => !/^\s*-\s+(Escalar|Nadar|Forragear|Compreender idiomas)/i.test(l),
    );
    b = kept.join("\n").trim();
  }

  return cleanCatalogoSectionBody(b);
}

export function splitCatalogoMarkdownSections(
  raw: string,
  kind: CatalogoDescricaoKind = "ancestralidade",
): { intro: string | null; sections: CatalogoMarkdownSection[] } {
  const text = repairCollapsedMarkdown(prepareCatalogoDescricao(raw, kind));
  const parts = text.split(/(?=^## )/m).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) {
    return { intro: text || null, sections: [] };
  }
  const filterClassSections = (sections: CatalogoMarkdownSection[]) =>
    kind === "classe"
      ? sections.filter((s) => !isClassBookCrossRefSection(s.title, s.body))
      : sections;

  if (!parts[0].startsWith("## ")) {
    const sections = filterClassSections(
      parts
        .filter((p) => p.startsWith("## "))
        .map((block) => parseSection(block, kind)),
    );
    const intro = cleanCatalogoIntro(parts[0]);
    return { intro: intro || null, sections };
  }
  if (parts.length === 1 && parts[0].startsWith("## ")) {
    const sections = filterClassSections([parseSection(parts[0], kind)]);
    return { intro: null, sections };
  }
  const sections = filterClassSections(
    parts
      .filter((p) => p.startsWith("## "))
      .map((block) => parseSection(block, kind)),
  );
  return { intro: null, sections };
}

function parseSection(
  block: string,
  kind: CatalogoDescricaoKind = "ancestralidade",
): CatalogoMarkdownSection {
  const trimmedBlock = block.replace(/\n+---\s*$/m, "").trim();
  const lines = trimmedBlock.split("\n");
  const head = lines[0]?.replace(/^##\s+/, "").trim() ?? "";
  const sectionTitle =
    kind === "classe" ? normalizeClassTalentSectionTitle(head) : head;
  let bodyFromLines = lines.slice(1).join("\n").trim();
  if (kind === "classe" && bodyFromLines) {
    bodyFromLines = sanitizeClassSectionBody(sectionTitle, bodyFromLines);
  }

  if (bodyFromLines) {
    return {
      id: slugSection(sectionTitle) || "secao",
      title: sectionTitle,
      body: bodyFromLines,
    };
  }

  const collapsed = splitCollapsedSectionHead(head);
  if (collapsed) {
    return {
      id: slugSection(collapsed.title) || "secao",
      title: collapsed.title,
      body: collapsed.body,
    };
  }

  const embedded = head.match(/^(.+?)\s+---\s+##\s+(.+)$/);
  if (embedded) {
    return {
      id: slugSection(embedded[1]) || "secao",
      title: embedded[1].trim(),
      body: "",
    };
  }

  const titleOnly = head.replace(/\s+---.*$/, "").trim();
  const shortTitle =
    titleOnly.length > 48 && titleOnly.includes(" ")
      ? titleOnly.split(/\s+/).slice(0, 2).join(" ")
      : titleOnly;

  return {
    id: slugSection(shortTitle) || "secao",
    title: shortTitle,
    body: titleOnly.length > shortTitle.length
      ? titleOnly.slice(shortTitle.length).replace(/^[\s.:—-]+/, "").trim()
      : "",
  };
}
