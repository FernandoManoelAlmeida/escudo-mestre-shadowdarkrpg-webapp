#!/usr/bin/env node
/**
 * Sincroniza fichas do livro (Markdown) para Referências/Fichas/Ameaças.md.
 * Mantém blocos ## existentes; acrescenta apenas ameaças novas (match por slug).
 * Em seguida recalcula automaticamente ### Dados Médios em todas as fichas.
 *
 * Uso:
 *   node Apps/scripts/sync-ameacas-from-livro.mjs [--dry-run] [--livro path] [--ameacas path]
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");

function slug(nome) {
  return nome
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\u0300-\u036f/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");
}

function parseArgs(argv) {
  const out = {
    dryRun: false,
    livro: path.join(REPO_ROOT, "Referências/Livros/Ordem Paranormal RPG.md"),
    ameacas: path.join(REPO_ROOT, "Referências/Fichas/Ameaças.md"),
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") out.dryRun = true;
    else if (a === "--livro") out.livro = path.resolve(argv[++i]);
    else if (a === "--ameacas") out.ameacas = path.resolve(argv[++i]);
    else if (a === "-h" || a === "--help") {
      console.log(
        `Uso: node Apps/scripts/sync-ameacas-from-livro.mjs [--dry-run] [--livro caminho] [--ameacas caminho]`
      );
      process.exit(0);
    }
  }
  return out;
}

/** Divide linha de tabela MD em [col1, col2] (sem bold nas chaves). */
function splitTableRow(line) {
  const t = line.trim();
  if (!t.startsWith("|") || !t.endsWith("|")) return null;
  const inner = t.slice(1, -1);
  const parts = inner.split("|").map((c) => c.trim());
  if (parts.length < 2) return null;
  const key = parts[0].replace(/\*\*/g, "").trim();
  const value = parts.slice(1).join(" | ").replace(/\*\*/g, "").trim();
  return { key, value };
}

function isTableSeparatorRow(line) {
  return /^\|[\s\-:|]+\|\s*$/.test(line.trim()) || /^\|[-\s:|]+\|[-\s:|]+\|/.test(line.trim());
}

/** Normaliza • para - em Presença Perturbadora */
function formatPresenca(val) {
  return val.replace(/\s*•\s*/g, " - ").trim();
}

/**
 * O livro às vezes omite "NEX …%+ é imune" em criaturas de VD muito alto; a regra geral
 * (OPRPG) exige o valor na linha. Kerberos (VD 340) usa 99%+; VD 320–339 usam 95%+.
 */
function appendNexImunePresencaIfMissing(formattedLine, vdStr) {
  const line = formattedLine.trim();
  if (/NEX\s*\d+%\s*\+\s*é\s*imune/i.test(line)) return line;
  const vd = parseInt(String(vdStr || "").replace(/\D/g, ""), 10);
  if (!Number.isFinite(vd) || vd < 320) return line;
  const pct = vd >= 340 ? 99 : 95;
  return `${line} - NEX ${pct}%+ é imune`;
}

/** PV: "70 (35 machucado)" -> { total: 70, machucado: 35 } */
function parsePV(val) {
  const m = val.match(/(\d+)\s*\(\s*(\d+)\s*machucado\s*\)/i);
  if (m) return { total: m[1], machucado: m[2] };
  const m2 = val.match(/(\d+)/);
  if (m2) return { total: m2[1], machucado: null };
  return { total: val, machucado: null };
}

/** Defesa: "19; **Fortitude** 3d20+10, ..." ou sem ** após parse da tabela */
function parseDefesaCell(val) {
  const v = val.replace(/\*\*/g, "");
  const defM = v.match(/^([\d—–-]+)\s*;/);
  let defesa = defM ? defM[1].trim() : "";
  if (defesa === "—" || defesa === "–" || defesa === "-") defesa = "—";
  const fort = v.match(/Fortitude\s*([^,]+)/i)?.[1]?.trim();
  const ref = v.match(/Reflexos\s*([^,]+)/i)?.[1]?.trim();
  const von = v.match(/Vontade\s*(.+)$/i)?.[1]?.trim();
  return { defesa, fort, ref, von };
}

/** Sentidos: "Percepção X, Iniciativa Y; extras" */
function parseSentidos(val) {
  const extras = [];
  let main = val;
  const semi = val.indexOf(";");
  if (semi >= 0) {
    main = val.slice(0, semi).trim();
    const after = val.slice(semi + 1).trim();
    if (after) {
      for (const part of after.split(",").map((p) => p.trim())) {
        if (part) extras.push(part);
      }
    }
  }
  let percep = "";
  let iniciativa = "";
  const comma = main.indexOf(",");
  if (comma >= 0) {
    percep = main.slice(0, comma).trim();
    iniciativa = main.slice(comma + 1).trim();
    if (iniciativa.toLowerCase().startsWith("iniciativa")) iniciativa = iniciativa.replace(/^iniciativa\s*/i, "").trim();
    if (percep.toLowerCase().startsWith("percepção")) percep = percep.replace(/^percepção\s*/i, "").trim();
  } else {
    percep = main.replace(/^percepção\s*/i, "").trim();
  }
  return { percep, iniciativa, extras };
}

/** Deslocamento: "12m (8 quadrados)" | "Voo 24m (16 quadrados)" */
function formatDeslocamento(val) {
  const v = val.trim();
  const m = v.match(/^(.*?)\s*\(\s*(\d+)\s*quadrados?\s*\)\s*$/i);
  if (m) {
    const prefix = m[1].trim();
    const q = m[2];
    return `DESLOCAMENTO ${prefix} | ${q} ❏`;
  }
  return `DESLOCAMENTO ${v}`;
}

/** Atributos: "Agi 1, For 3" -> AGI 1 | FOR 3 */
function formatAtributos(val) {
  return val
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((pair) => {
      const m = pair.match(/^(Agi|For|Int|Pre|Vig)\s+(.+)$/i);
      if (m) return `${m[1].slice(0, 3).toUpperCase()} ${m[2].trim()}`;
      return pair;
    })
    .join(" | ");
}

function inferTamanhoFromIntro(intro) {
  const t = intro.toLowerCase();
  if (/\bcolossal\b/.test(t)) return "COLOSSAL";
  if (/\benorme\b/.test(t)) return "ENORME";
  if (/\bgrande\b/.test(t)) return "GRANDE";
  if (/\bpequen[oa]\b/.test(t)) return "PEQUENO";
  if (/\bm[ií]nuscul[oa]\b/.test(t)) return "MINÚSCULO";
  if (/\bm[eé]dio\b/.test(t)) return "MÉDIO";
  return "MÉDIA";
}

function inferElementoSegundoTipo(val) {
  const u = val.toUpperCase();
  if (/\bSANGUE\b/.test(u)) return "SANGUE";
  if (/\bMORTE\b/.test(u)) return "MORTE";
  if (/\bCONHECIMENTO\b/.test(u)) return "CONHECIMENTO";
  if (/\bENERGIA\b/.test(u)) return "ENERGIA";
  if (/\bMEDO\b/.test(u)) return "MEDO";
  return null;
}

function extractVDFromFirstRow(value, nameFallback) {
  const m = value.match(/VD\s*(\d+)/i);
  if (m) return m[1];
  const m2 = value.match(/\b(\d+)\s*$/);
  if (m2) return m2[1];
  return "";
}

/** Primeira linha de tabela pode ser | Nome | Sangue | VD 40 | */
function parseFirstTableRow(cells) {
  const parts = cells.map((c) => c.replace(/\*\*/g, "").trim());
  if (parts.length >= 3 && /VD\s*\d+/i.test(parts[2])) {
    const vd = (parts[2].match(/VD\s*(\d+)/i) || [])[1] || "";
    const elem = parts[1];
    return { nameHint: parts[0], elemento: elem, vd };
  }
  if (parts.length >= 3 && /VD\s*\d+/i.test(parts[parts.length - 1])) {
    const last = parts[parts.length - 1];
    const vd = (last.match(/VD\s*(\d+)/i) || [])[1] || "";
    return { nameHint: parts[0], elemento: parts[1], vd };
  }
  return null;
}

function parseTableToMap(tableLines) {
  const map = {};
  let firstRowMeta = null;
  for (const line of tableLines) {
    if (!line.trim().startsWith("|")) continue;
    if (isTableSeparatorRow(line)) continue;
    const parts = line
      .split("|")
      .map((c) => c.trim())
      .filter((c, i, arr) => i > 0 && i < arr.length - 1);
    const meta = parseFirstTableRow(parts);
    if (meta) {
      if (!firstRowMeta) firstRowMeta = meta;
      continue;
    }
    const row = splitTableRow(line);
    if (!row) continue;
    const normKey = row.key.replace(/\*\*/g, "").trim();
    map[normKey] = row.value;
  }
  return { map, firstRowMeta };
}

function normalizeCompactStatTokens(text) {
  return text
    .replace(/Percepção\s+O\+(\d+)/gi, "Percepção d20+$1")
    .replace(/Percepção\s+O(?=[,;.])/gi, "Percepção d20")
    .replace(/Iniciativa\s+O\+(\d+)/gi, "Iniciativa d20+$1")
    .replace(/Iniciativa\s+O(?=[,;.])/gi, "Iniciativa d20")
    .replace(/\bO\+(\d+)/gi, "d20+$1");
}

function inferTipoRealidade(desc) {
  const d = desc.toLowerCase();
  const criaturaKw =
    /\b(cão|gato|enxame|jacaré|javaporco|onça|cobra|sucuri|rato|abelha|animal|pombo|cavalo)\b/.test(d) ||
    /\bpequeno enxame\b/.test(d);
  return criaturaKw ? "CRIATURA" : "PESSOA";
}

function extractFromCompactDescription(desc) {
  const d = normalizeCompactStatTokens(desc);
  const out = { raw: desc };
  const def = d.match(/Defesa\s+(\d+)/i);
  if (def) out.defesa = def[1];
  const pv = d.match(/\bPV\s+(\d+)/i);
  if (pv) out.pv = pv[1];
  const mach = d.match(/Machucado\s+(\d+)/i);
  if (mach) out.machucado = mach[1];
  const per = d.match(/Percepção\s+([^.;]+?)(?=\.|;|,?\s*Iniciativa|$)/i);
  if (per) out.percepção = per[1].trim().replace(/,$/, "");
  const ini = d.match(/Iniciativa\s+([^.;]+?)(?=\.|;|,?\s*Defesa|$)/i);
  if (ini) out.iniciativa = ini[1].trim().replace(/,$/, "");
  return out;
}

function convertFullCreatureBlock(title, intro, tableAndRest) {
  const lines = tableAndRest.split("\n");
  const tableEnd = lines.findIndex((l) => l.trim().startsWith("**Habilidades") || l.trim().startsWith("**Ações"));
  const tableLines = tableEnd >= 0 ? lines.slice(0, tableEnd) : lines;
  const rest = tableEnd >= 0 ? lines.slice(tableEnd).join("\n") : "";

  const { map, firstRowMeta } = parseTableToMap(tableLines);
  const vd = firstRowMeta?.vd || extractVDFromFirstRow(Object.values(map).join(" "), title) || "";
  const elementoRaw = firstRowMeta?.elemento || "";
  const elemUpper = inferElementoSegundoTipo(elementoRaw + " " + title) || elementoRaw.toUpperCase() || "CRIATURA";
  const tamanho = inferTamanhoFromIntro(intro);
  const descritores = `${elemUpper} - CRIATURA - ${tamanho}`.replace(/\s*-\s*CRIATURA\s*-\s*CRIATURA/g, " - CRIATURA");

  const chunks = [];

  chunks.push(`## ${title}`);
  chunks.push(`VD ${vd}`);
  chunks.push(descritores);
  chunks.push("");

  const pp = map["Presença Perturbadora"];
  if (pp) {
    chunks.push("PRESENÇA PERTURBADORA");
    chunks.push(appendNexImunePresencaIfMissing(formatPresenca(pp), vd));
    chunks.push("");
  }

  const sent = map["Sentidos"] ? parseSentidos(map["Sentidos"]) : null;
  const defCell = map["Defesa"] || "";
  const saves = defCell ? parseDefesaCell(defCell) : {};

  chunks.push("### Perícias");
  if (sent?.percep) chunks.push(`Percepção ${sent.percep}`);
  if (sent?.iniciativa) chunks.push(`Iniciativa ${sent.iniciativa}`);
  if (saves.fort) chunks.push(`Fortitude ${saves.fort}`);
  if (saves.ref) chunks.push(`Reflexos ${saves.ref}`);
  if (saves.von) chunks.push(`Vontade ${saves.von}`);

  const periciasExtra = map["Perícias"];
  if (periciasExtra) {
    for (const bit of periciasExtra.split(",").map((b) => b.trim())) {
      if (bit) chunks.push(bit);
    }
  }
  if (sent?.extras?.length) {
    // Linha em branco entre perícias com rolagem e extras de sentidos (ex.: Percepção às cegas)
    const idxHeader = chunks.lastIndexOf("### Perícias");
    if (idxHeader >= 0 && chunks.length > idxHeader + 1) chunks.push("");
    for (const e of sent.extras) chunks.push(e);
  }
  chunks.push("");

  if (saves.defesa && saves.defesa !== "—") chunks.push(`DEFESA ${saves.defesa}`);
  else if (saves.defesa === "—") chunks.push("DEFESA —");

  const pvRaw = map["PV"];
  if (pvRaw) {
    const { total, machucado } = parsePV(pvRaw);
    if (machucado != null) chunks.push(`PONTOS DE VIDA ${total} | Machucado ${machucado}`);
    else chunks.push(`PONTOS DE VIDA ${total}`);
  }

  if (map["Resistências"]) chunks.push(`RESISTÊNCIAS ${map["Resistências"]}`);
  if (map["Imunidades"]) chunks.push(`IMUNIDADES ${map["Imunidades"]}`);
  if (map["Vulnerabilidades"]) chunks.push(`VULNERABILIDADES ${map["Vulnerabilidades"]}`);

  if (map["Atributos"]) chunks.push(formatAtributos(map["Atributos"]).replace(/\|\|/g, "|"));

  chunks.push("");
  if (map["Deslocamento"]) chunks.push(formatDeslocamento(map["Deslocamento"]));
  chunks.push("");

  const { habilidadesText, acoesText, enigmaText } = splitHabilidadesAcoesEnigma(rest);

  if (habilidadesText.trim()) {
    chunks.push("### Habilidades");
    chunks.push(habilidadesText.trim());
    chunks.push("");
  }

  if (acoesText.trim()) {
    chunks.push("### Ações");
    chunks.push(formatAcoes(acoesText));
    chunks.push("");
  }

  if (enigmaText.trim()) {
    chunks.push("### Enigma de Medo");
    chunks.push(enigmaText.trim());
    chunks.push("");
  }

  chunks.push("### Dados Médios");
  chunks.push("<!-- Calcular dados médios (não constam no livro) -->");
  chunks.push("");

  return chunks.join("\n").trim() + "\n";
}

function splitHabilidadesAcoesEnigma(rest) {
  let hab = "";
  let acoes = "";
  let enigma = "";

  const habM = rest.match(/\*\*Habilidades:\*\*\s*([\s\S]*?)(?=\*\*Ações)/i);
  if (habM) hab = habM[1];

  const acM = rest.match(/\*\*Ações[^*]*:\*\*\s*([\s\S]*?)$/i);
  if (acM) acoes = acM[1];

  const bullets = hab.split(/\n(?=- \*\*)/);
  const keptHab = [];
  for (const b of bullets) {
    if (/^\s*-\s*\*\*Enigma de Medo/i.test(b)) {
      enigma += b.replace(/^\s*-\s*\*\*Enigma de Medo:\*\*\s*/i, "").replace(/^\s*-\s*\*\*Enigma de Medo\*\*:\s*/i, "").trim();
    } else if (b.trim()) keptHab.push(b);
  }
  hab = keptHab.join("\n");

  return {
    habilidadesText: formatBulletSection(hab),
    acoesText: acoes,
    enigmaText: enigma.replace(/^\s*-\s*/, "").trim(),
  };
}

function formatBulletSection(text) {
  return text
    .split("\n")
    .map((line) => {
      const m = line.match(/^\s*-\s*\*\*(.+?)\*\*\s*(.*)$/);
      if (m) {
        const name = m[1].trim().replace(/:\s*$/, "").toUpperCase();
        const body = m[2].trim();
        return `${name}\n${body}`;
      }
      return line.trimEnd();
    })
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n");
}

/**
 * Títulos de ação no padrão de Ameaças.md: caixa alta; "PADRÃO - AGREDIR" com hífen ASCII;
 * demais tipos usam travessão (–) entre o tipo e o nome (ex.: LIVRE – ATAQUE FURTIVO).
 */
function formatActionHeaderFromBook(raw) {
  const norm = raw.replace(/\s*–\s*/g, " - ").replace(/\s+/g, " ").trim();
  const m = norm.match(/^(.+?)\s*-\s*(.+)$/i);
  if (!m) return raw.trim().toUpperCase().replace(/\s+/g, " ");
  const a = m[1].trim().toUpperCase();
  const b = m[2].trim().toUpperCase();
  if (a === "PADRÃO" && /^AGREDIR\b/i.test(b)) return "PADRÃO - AGREDIR";
  return `${a} – ${b}`;
}

/** Tenta converter linhas de ataque Agredir em blocos > (como Predador / Modelo em Ameaças.md) */
function formatAcoes(text) {
  const lines = text.split("\n");
  const out = [];
  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      out.push("");
      continue;
    }
    const m = line.match(/^\s*-\s*\*\*(.+?)\*\*\s*(.+)$/);
    if (!m) {
      out.push(line);
      continue;
    }
    const headerRaw = m[1].trim().replace(/:\s*$/, "");
    const body = m[2].trim();
    const headerOut = formatActionHeaderFromBook(headerRaw);
    const agg =
      /^PADRÃO\s*-\s*AGREDIR$/i.test(headerOut) ||
      /^Padrão\s*-\s*Agredir/i.test(headerRaw);

    if (agg) {
      out.push("PADRÃO - AGREDIR");
      out.push("");
      const attacks = splitAggredirAttacks(body);
      if (attacks.length) {
        for (const atk of attacks) {
          const fmt = formatOneAttack(atk);
          if (fmt) {
            out.push(fmt.block);
            out.push("");
          } else {
            out.push(atk.trim());
            out.push("");
          }
        }
      } else {
        out.push(body);
        out.push("");
      }
      continue;
    }

    out.push(headerOut);
    out.push(body);
    out.push("");
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** Separa por ". " entre ataques que têm " – Teste " */
function splitAggredirAttacks(body) {
  const parts = [];
  let buf = "";
  let depth = 0;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "." && body[i + 1] === " " && depth === 0) {
      const next = body.slice(i + 2);
      if (/\S/.test(buf) && /Teste\s+/i.test(next)) {
        parts.push(buf.trim());
        buf = "";
        i++;
        continue;
      }
    }
    buf += ch;
  }
  if (buf.trim()) parts.push(buf.trim());
  if (parts.length <= 1 && /[–-]\s*Teste\s+/i.test(body)) return [body];
  return parts.length ? parts : [body];
}

function formatOneAttack(segment) {
  const s = segment.replace(/\s+/g, " ").trim();
  const re =
    /^(.+?)\s*\(([^)]+)\)\s*[–-]\s*Teste\s+(.+?),\s*Dano\s+(.+)$/i;
  const m = s.match(re);
  if (!m) return null;
  const nome = m[1].trim().toUpperCase();
  let tipo = m[2].trim();
  tipo = tipo.charAt(0).toUpperCase() + tipo.slice(1);
  const teste = m[3].trim();
  const dano = m[4].replace(/\.$/, "").trim();
  const block = `> ${nome} ${tipo}\n> TESTE ${teste} | DANO ${dano}`;
  return { block };
}

function extractFullCreatureBlocks(livroText) {
  const startMarker = "## Criaturas de Sangue";
  const endMarker = "## Ameaças da Realidade";
  const s = livroText.indexOf(startMarker);
  const e = livroText.indexOf(endMarker);
  if (s < 0 || e < 0 || e <= s) {
    console.error("Não foi possível localizar o intervalo de criaturas no livro.");
    return [];
  }
  const chunk = livroText.slice(s, e);
  const lines = chunk.split("\n");
  const blocks = [];
  let i = 0;
  const sectionHeaders = /^## Criaturas de (Sangue|Morte|Conhecimento|Energia)\s*$/;

  while (i < lines.length) {
    const line = lines[i];
    if (sectionHeaders.test(line)) {
      i++;
      continue;
    }
    if (line.startsWith("## Degolificada")) {
      const title = "Degolificada";
      let j = i + 1;
      const intro = [];
      while (j < lines.length && lines[j].trim() && !lines[j].trim().startsWith("|")) {
        intro.push(lines[j]);
        j++;
      }
      const rest = collectUntilNextCreature(lines, j);
      blocks.push({
        title,
        intro: intro.join("\n"),
        body: rest.text,
      });
      i = rest.endLine;
      continue;
    }
    if (line.startsWith("### ")) {
      const title = line.replace(/^###\s+/, "").trim();
      let j = i + 1;
      const intro = [];
      while (j < lines.length && lines[j].trim() && !lines[j].trim().startsWith("|")) {
        intro.push(lines[j]);
        j++;
      }
      const rest = collectUntilNextCreature(lines, j);
      blocks.push({
        title,
        intro: intro.join("\n"),
        body: rest.text,
      });
      i = rest.endLine;
      continue;
    }
    i++;
  }
  return blocks;
}

function collectUntilNextCreature(lines, startJ) {
  let j = startJ;
  const buf = [];
  while (j < lines.length) {
    const L = lines[j];
    if (L.startsWith("### ") || L.startsWith("## Degolificada") || L.startsWith("## Criaturas de ")) {
      break;
    }
    buf.push(L);
    j++;
  }
  return { text: buf.join("\n"), endLine: j };
}

function extractCompactNPCBlocks(livroText) {
  const startMarker = "## Ameaças da Realidade";
  const endMarker = "## Perigos";
  const s = livroText.indexOf(startMarker);
  const e = livroText.indexOf(endMarker);
  if (s < 0 || e < 0 || e <= s) return [];
  const chunk = livroText.slice(s, e);
  const rows = [];
  for (const line of chunk.split("\n")) {
    const t = line.trim();
    if (!t.startsWith("|")) continue;
    if (isTableSeparatorRow(t)) continue;
    const row = splitTableRow(t);
    if (!row) continue;
    if (/^Ameaça$/i.test(row.key) && /^VD$/i.test(row.value.split("|")[0]?.trim() || "")) continue;
    if (/^Ameaça$/i.test(row.key)) continue;
    if (/^VD$/i.test(row.key)) continue;
    const parts = t
      .split("|")
      .map((c) => c.trim())
      .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
    if (parts.length >= 3) {
      const nome = parts[0].replace(/\*\*/g, "").trim();
      const vd = parts[1].replace(/\*\*/g, "").trim();
      const desc = parts.slice(2).join(" | ").replace(/\*\*/g, "").trim();
      if (/^Ameaça$/i.test(nome)) continue;
      if (/^\d+$/.test(vd) && nome && desc) rows.push({ nome, vd, desc });
    }
  }
  return rows;
}

function convertCompactNPC({ nome, vd, desc }) {
  const tipo = inferTipoRealidade(desc);
  const tamanho = inferTamanhoFromIntro(desc);
  const ex = extractFromCompactDescription(desc);
  const chunks = [];
  chunks.push(`## ${nome}`);
  chunks.push(`VD ${vd}`);
  chunks.push(`${tipo} - ${tamanho === "MÉDIA" || tamanho === "MÉDIO" ? "MÉDIA" : tamanho}`);
  chunks.push("");
  chunks.push("### Perícias");
  if (ex.percepção) chunks.push(`Percepção ${ex.percepção}`);
  if (ex.iniciativa) chunks.push(`Iniciativa ${ex.iniciativa}`);
  chunks.push("");
  if (ex.defesa) chunks.push(`DEFESA ${ex.defesa}`);
  if (ex.pv) {
    if (ex.machucado) chunks.push(`PONTOS DE VIDA ${ex.pv} | Machucado ${ex.machucado}`);
    else chunks.push(`PONTOS DE VIDA ${ex.pv}`);
  }
  chunks.push("");
  chunks.push("### Descrição (livro)");
  chunks.push(desc);
  chunks.push("");
  chunks.push("### Dados Médios");
  chunks.push("<!-- Calcular dados médios (ficha resumida no livro) -->");
  chunks.push("");
  return chunks.join("\n").trim() + "\n";
}

function parseAmeacasSections(md) {
  const parts = md.split(/^## /m);
  const sections = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (!p.trim()) continue;
    const firstLine = p.split("\n")[0];
    const title = firstLine.trim();
    const body = p.slice(firstLine.length + 1);
    sections.push({ title, full: `## ${p}` });
  }
  return sections;
}

function mergeAmeacas(existingMd, newBlocksBySlug) {
  const sections = parseAmeacasSections(existingMd);
  const modeloIdx = sections.findIndex((s) => slug(s.title) === "modelo");
  if (modeloIdx < 0) {
    console.error("Não encontrado ## Modelo em Ameaças.md — abortando escrita.");
    return null;
  }

  const existingSlugs = new Set(sections.map((s) => slug(s.title)));
  const toAdd = [];
  for (const [sl, content] of newBlocksBySlug) {
    if (!existingSlugs.has(sl)) toAdd.push({ slug: sl, content });
  }

  const before = sections.slice(0, modeloIdx).map((s) => s.full.trimEnd());
  const modeloAndAfter = sections.slice(modeloIdx).map((s) => s.full.trimEnd());

  const insertion = toAdd.length ? toAdd.map((t) => t.content.trim()).join("\n\n") : "";

  const newMd =
    before.join("\n\n") +
    (insertion ? "\n\n" + insertion + "\n\n" : "\n\n") +
    modeloAndAfter.join("\n\n");
  return {
    newMd: newMd.replace(/\n{5,}/g, "\n\n\n\n"),
    added: toAdd,
    skipped: [...newBlocksBySlug.keys()].filter((k) => existingSlugs.has(k)),
  };
}

// --- Dados médios (Ameaças.md): regras e recálculo de ### Dados Médios ---
// Iniciativa (Nd20+B): média = 10 + (N−1)×2 + B.

function downgradeDieSides(sides) {
  const chain = { 20: 12, 12: 10, 10: 8, 8: 6, 6: 4, 4: 3 };
  if (sides <= 3) return 3;
  return chain[sides] ?? 3;
}

function halfMaxDie(sides) {
  return Math.floor(sides / 2);
}

function parseDicePoolDM(raw) {
  const s = String(raw)
    .replace(/\s+/g, "")
    .replace(/^\+/, "")
    .replace(/×/g, "x")
    .toLowerCase();
  const m = s.match(/^(\d*)d(\d+)(\+(\d+))?$/);
  if (!m) return null;
  const n = m[1] ? parseInt(m[1], 10) : 1;
  const sides = parseInt(m[2], 10);
  const bonus = m[4] ? parseInt(m[4], 10) : 0;
  if (n < 1 || sides < 1 || !Number.isFinite(bonus)) return null;
  return { n, sides, bonus };
}

function physicalTripleDM(pool) {
  const { n, sides, bonus } = pool;
  const dicePart = n * halfMaxDie(sides);
  return [dicePart + bonus, 2 * dicePart + bonus, 3 * dicePart + bonus];
}

/** Igual ao primeiro valor da tríade física (dano médio base, sem progressão de crítico). */
function physicalMeanBaseDM(pool) {
  const { n, sides, bonus } = pool;
  return n * halfMaxDie(sides) + bonus;
}

function mentalSingleDM(pool) {
  const { n, sides, bonus } = pool;
  const ns = downgradeDieSides(sides);
  return n * halfMaxDie(ns) + bonus;
}

/**
 * Iniciativa média (d20): 1º d20 conta como 10; cada d20 extra +2; bônus soma direto.
 * Ex.: 2d20+15 → 10+2+15=27; 4d20+5 → 10+6+5=21; 1d20+7 → 10+7=17.
 */
function iniciativaMediaDM(nDice, bonus) {
  const n = Math.max(1, nDice);
  return 10 + (n - 1) * 2 + bonus;
}

function classifyDamageKindDM(tipo) {
  const t = (tipo || "").trim().toLowerCase();
  if (t === "mental") return "mental";
  return "physical";
}

/**
 * Tipo de dano em frases curtas ("… causando 2d6+5 impacto").
 * Evita capturar "de" em "… causando 1d12 de dano de impacto".
 */
function isOplProseDamageTipoTokenDM(word) {
  const t = (word || "").trim().replace(/[,;.]$/, "").toLowerCase();
  if (!t || t === "de" || t === "dano" || t === "dados") return false;
  if (/mental|sanidade/i.test(t)) return false;
  return /^(impacto|corte|perfura(ção)?|bal[ií]stico|sangue|morte|energia|fogo|frio|eletricidade|qu[ií]mico|luz|medo|paranormal|sacro|ácido|acido)$/i.test(
    t
  );
}

function humanizeActionHeaderDM(h) {
  return h
    .split(/\s*[-–]\s*/)
    .map((part) =>
      part
        .trim()
        .split(/\s+/)
        .map((w) => {
          const u = w.toLowerCase();
          return u ? u.charAt(0).toUpperCase() + u.slice(1) : "";
        })
        .join(" ")
    )
    .join(" - ");
}

function attackNameFromBlockFirstLineDM(line) {
  const inner = line.replace(/^>\s*/, "").trim();
  // Para "ESPINGARDA à distância curto", parar antes de "à distância" ou "distância" (não engolir o "à").
  const m = inner.match(
    /^(.+?)(?=\s+(?:Corpo a corpo|corpo a corpo|(?:à\s+)?distância|Médio|Longo|Extremo|\())/i
  );
  const raw = (m ? m[1] : inner).trim();
  return raw
    .split(/\s+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");
}

function entryLabelDM(actionHeader, attackName) {
  const ah = (actionHeader || "").trim();
  if (!ah || /AGREDIR/i.test(ah)) return `Agredir - ${attackName}`;
  return humanizeActionHeaderDM(ah);
}

function parseIniciativaFromPericiasDM(sectionText) {
  const m = sectionText.match(/Iniciativa\s+((?:(\d+)d20)|d20)(\s*\+(\d+))?\s*$/im);
  if (!m) return null;
  const nDice = m[2] ? parseInt(m[2], 10) : 1;
  const bonus = m[4] ? parseInt(m[4], 10) : 0;
  return iniciativaMediaDM(nDice, bonus);
}

function parsePresencaMentalDM(sectionText) {
  const m = sectionText.match(/PRESENÇA\s+PERTURBADORA\s*\n\s*DT\s+\d+\s*-\s*(\d+d\d+)\s*mental/i);
  if (!m) return null;
  const pool = parseDicePoolDM(m[1]);
  if (!pool) return null;
  return mentalSingleDM(pool);
}

/** Extrai pool + tipo(s) de dano após "DANO" / "dano" (incl. "corte, impacto ou perfurante"). */
function parseDanoFragmentDM(rest0) {
  const rest = String(rest0).trim();
  const diceM = rest.match(/(\d*d\d+(?:\s*\+\s*\d+)?)/i);
  if (!diceM) return null;
  const pool = parseDicePoolDM(diceM[1]);
  if (!pool) return null;
  let afterDice = rest.slice(diceM.index + diceM[0].length).trim();
  const paren = afterDice.indexOf("(");
  if (paren >= 0) afterDice = afterDice.slice(0, paren).trim();
  if (!afterDice) return { pool, tipo: null, tipoLabel: null };
  const firstWord = (afterDice.split(/\s+/)[0] || "").replace(/[,;.]$/, "");
  const tipo =
    firstWord && firstWord.length >= 3 && !/^cr[ií]tico$/i.test(firstWord) ? firstWord : null;
  const looksMultiDamage =
    /,/.test(afterDice) &&
    /\bou\b/i.test(afterDice) &&
    /\b(corte|impacto|perfura|bal[ií]stico|fogo|frio|energia|sangue)\b/i.test(afterDice);
  const tipoLabel = looksMultiDamage ? afterDice.replace(/\s+/g, " ").trim() : null;
  return { pool, tipo, tipoLabel };
}

/**
 * Blocos "> NOME ..." / "> TESTE | DANO ..." / "> TRUQUE: ... dano ..." (Caçadores).
 * O Truque é perfil alternativo da arma, não dano adicional (+NdM) — gera linha (Truque) nos dados médios.
 */
function extractDanoFromBlockquoteGroupDM(lines) {
  const joined = lines.join("\n");
  const attack = attackNameFromBlockFirstLineDM(lines[0] || "");
  const results = [];

  const danoM = joined.match(/\bDANO\s+([^|\n>]+)/i);
  if (danoM) {
    const parsed = parseDanoFragmentDM(danoM[1]);
    if (parsed) {
      const tipo = parsed.tipoLabel || parsed.tipo || "dano";
      results.push({
        pool: parsed.pool,
        tipo,
        kind: classifyDamageKindDM(parsed.tipo || tipo),
        attack,
      });
    }
  }

  const inheritTipo = results[0]?.tipo;
  const inheritTipoForTruque =
    inheritTipo && /,/.test(inheritTipo)
      ? (inheritTipo.split(",")[0] || "").trim().split(/\s+/)[0].replace(/[,;.]$/, "")
      : inheritTipo;
  for (const line of lines) {
    const inner = line.replace(/^>\s*/, "").trim();
    if (!/^TRUQUE:/i.test(inner)) continue;
    const dm = inner.match(/\bdano\s+([^,\n>]+)/i);
    if (!dm) continue;
    const parsed = parseDanoFragmentDM(dm[1]);
    if (!parsed) continue;
    const tipo = parsed.tipoLabel || parsed.tipo || inheritTipoForTruque || "dano";
    results.push({
      pool: parsed.pool,
      tipo,
      kind: classifyDamageKindDM(parsed.tipo || tipo),
      attack,
      variant: "truque",
    });
  }

  return results;
}

function formatPhysicalLineDM(label, pool, tipo, useCritTriple) {
  if (useCritTriple) {
    const t = physicalTripleDM(pool);
    return `${label}: ${t[0]}/${t[1]}/${t[2]} ${tipo}`;
  }
  return `${label}: ${physicalMeanBaseDM(pool)} ${tipo}`;
}

/** Cabeçalho de ação inclui AGREDIR → aplica tríade de crítico; demais ações só dano médio base. */
function isAgredirActionHeaderDM(hdr) {
  return /AGREDIR/i.test(hdr || "");
}

function formatMentalLineDM(label, v) {
  return `${label}: ${v} mental*`;
}

/**
 * Frases com dois danos ligados por "e", ex. Desperto-Sugador:
 * "sofre 2d6 dano mental e 2d6 dano de conhecimento".
 */
function extractTandemDanoMentalMaisFisicoDM(text) {
  const out = [];
  const re =
    /(\d*d\d+(?:\s*\+\s*\d+)?)\s+dano\s+mental\s+e\s+(\d*d\d+(?:\s*\+\s*\d+)?)\s+dano\s+de\s+([A-Za-zÀ-ÿáéíóúãõç]+)/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    const ctx = text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 20);
    if (/ex\.:|por exemplo/i.test(ctx)) continue;
    const p1 = parseDicePoolDM(m[1]);
    const p2 = parseDicePoolDM(m[2]);
    const t2 = m[3].replace(/[,;.]$/, "");
    if (p1) out.push({ pool: p1, kind: "mental", tipo: "mental" });
    if (p2) {
      const kind = classifyDamageKindDM(t2);
      out.push({ pool: p2, kind, tipo: t2 });
    }
  }
  return out;
}

function extractProseMentalDiceDM(text) {
  const out = [];
  const re =
    /(\d*d\d+(?:\s*\+\s*\d+)?)\s+[^.\n]{0,120}?(?:pontos\s+de\s+dano\s+mental|pontos\s+dano\s+mental|de\s+dano\s+mental)/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    const ctx = text.slice(Math.max(0, m.index - 40), m.index + 80);
    if (/ex\.:|por exemplo/i.test(ctx)) continue;
    const pool = parseDicePoolDM(m[1]);
    if (pool) out.push({ pool });
  }
  return out;
}

function extractProsePhysicalDiceDM(text) {
  const out = [];
  const skipCtx = (idx, len) => {
    const ctx = text.slice(Math.max(0, idx - 120), idx + len + 40);
    if (/ex\.:|por exemplo/i.test(ctx)) return true;
    if (/\+1d\d/.test(text.slice(idx, idx + len)) && /cr[ií]tico|acerto\s+cr[ií]tico/i.test(ctx)) return true;
    return false;
  };
  /** Dado explícito como extra (+NdM), ex. Ataque Furtivo +4d6 — não entra na média de dano base. */
  const isAdditiveDicePoolToken = (raw) => /^\s*\+\s*\d*d\d+/i.test(String(raw).trim());
  const re1 =
    /(\d*d\d+(?:\s*\+\s*\d+)?|\+\d*d\d+)\s+pontos?\s+de\s+dano\s+(?:de\s+)?([A-Za-zÀ-ÿáéíóúãõç]+)/gi;
  let m;
  while ((m = re1.exec(text)) !== null) {
    const tipo = m[2];
    if (/mental|sanidade/i.test(tipo)) continue;
    if (isAdditiveDicePoolToken(m[1])) continue;
    if (skipCtx(m.index, m[0].length)) continue;
    const pool = parseDicePoolDM(m[1]);
    if (pool) out.push({ pool, tipo });
  }
  const re2 = /(?:sofre|causam?|causa)\s+(\d*d\d+(?:\s*\+\s*\d+)?|\+\d*d\d+)\s+pontos?\s+de\s+dano\s+de\s+([A-Za-zÀ-ÿáéíóúãõç]+)/gi;
  while ((m = re2.exec(text)) !== null) {
    if (/mental|sanidade/i.test(m[2])) continue;
    if (isAdditiveDicePoolToken(m[1])) continue;
    if (skipCtx(m.index, m[0].length)) continue;
    const pool = parseDicePoolDM(m[1]);
    if (pool) out.push({ pool, tipo: m[2] });
  }
  const re3 =
    /(?:sofre|sofrem|causam|causa)\s+(\d*d\d+(?:\s*\+\s*\d+)?|\+\d*d\d+)\s+(?:de\s+)?dano\s+de\s+([A-Za-zÀ-ÿáéíóúãõç]+)/gi;
  while ((m = re3.exec(text)) !== null) {
    if (/mental|sanidade/i.test(m[2])) continue;
    if (isAdditiveDicePoolToken(m[1])) continue;
    if (skipCtx(m.index, m[0].length)) continue;
    const pool = parseDicePoolDM(m[1]);
    if (pool) out.push({ pool, tipo: m[2] });
  }
  const re4DeDano = /causando\s+(\d*d\d+(?:\s*\+\s*\d+)?)\s+de\s+dano\s+de\s+([A-Za-zÀ-ÿáéíóúãõç]+)/gi;
  while ((m = re4DeDano.exec(text)) !== null) {
    if (/mental|sanidade/i.test(m[2])) continue;
    if (isAdditiveDicePoolToken(m[1])) continue;
    if (skipCtx(m.index, m[0].length)) continue;
    const pool = parseDicePoolDM(m[1]);
    if (pool) out.push({ pool, tipo: m[2] });
  }
  const re4DanoDe = /causando\s+(\d*d\d+(?:\s*\+\s*\d+)?)\s+dano\s+de\s+([A-Za-zÀ-ÿáéíóúãõç]+)/gi;
  while ((m = re4DanoDe.exec(text)) !== null) {
    if (/mental|sanidade/i.test(m[2])) continue;
    if (isAdditiveDicePoolToken(m[1])) continue;
    if (skipCtx(m.index, m[0].length)) continue;
    const pool = parseDicePoolDM(m[1]);
    if (pool) out.push({ pool, tipo: m[2] });
  }
  const re4Curto = /causando\s+(\d*d\d+(?:\s*\+\s*\d+)?)\s+([A-Za-zÀ-ÿáéíóúãõç]+)/gi;
  while ((m = re4Curto.exec(text)) !== null) {
    if (!isOplProseDamageTipoTokenDM(m[2])) continue;
    if (/mental|sanidade/i.test(m[2])) continue;
    if (isAdditiveDicePoolToken(m[1])) continue;
    if (skipCtx(m.index, m[0].length)) continue;
    const pool = parseDicePoolDM(m[1]);
    if (pool) out.push({ pool, tipo: m[2] });
  }
  /** Luzídio / cristais: "curar em 2d8+2" (Cicatrização); só se "cristal" aparece perto (evita falsos positivos). */
  const reCuraEm = /curar\s+em\s+(\d*d\d+(?:\s*\+\s*\d+)?)/gi;
  while ((m = reCuraEm.exec(text)) !== null) {
    if (skipCtx(m.index, m[0].length)) continue;
    const ctx = text.slice(Math.max(0, m.index - 80), Math.min(text.length, m.index + m[0].length + 40));
    if (!/(?:cristal|crital|cristais)/i.test(ctx)) continue;
    const pool = parseDicePoolDM(m[1]);
    if (pool) out.push({ pool, tipo: "cura" });
  }
  return out;
}

function extractDescricaoLivroDamageDM(desc) {
  const entries = [];
  const reMordida = /Mordida\s*\([^,]+,\s*(\d*d\d+(?:\+\d+)?)\s+([A-Za-zÀ-ÿ]+)\)/gi;
  let m;
  while ((m = reMordida.exec(desc)) !== null) {
    const pool = parseDicePoolDM(m[1]);
    if (pool) entries.push({ label: "Agredir - Mordida", pool, tipo: m[2], kind: "physical" });
  }
  const reGarras = /Garras\s*\([^)]*?(\d*d\d+(?:\+\d+)?)\s+([A-Za-zÀ-ÿ]+)\)/gi;
  while ((m = reGarras.exec(desc)) !== null) {
    const pool = parseDicePoolDM(m[1]);
    if (pool) entries.push({ label: "Agredir - Garras", pool, tipo: m[2], kind: "physical" });
  }
  const reCauda = /Cauda\s*\([^)]*?(\d*d\d+(?:\+\d+)?)\s+([A-Za-zÀ-ÿ]+)\)/gi;
  while ((m = reCauda.exec(desc)) !== null) {
    const pool = parseDicePoolDM(m[1]);
    if (pool) entries.push({ label: "Agredir - Cauda", pool, tipo: m[2], kind: "physical" });
  }
  const reConst = /causa\s+(\d*d\d+(?:\+\d+)?)\s+dano\s+([A-Za-zÀ-ÿ]+)/gi;
  while ((m = reConst.exec(desc)) !== null) {
    const pool = parseDicePoolDM(m[1]);
    if (pool && /impacto|corte|perfura/i.test(m[2]))
      entries.push({ label: "Constrição", pool, tipo: m[2], kind: "physical" });
  }
  return entries;
}

function humanizeSkillTitleDM(t) {
  return t
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

function isSkillTitleLineDM(tr) {
  if (tr.length < 4 || tr.length > 90) return false;
  if (/^(PADRÃO|LIVRE|MOVIMENTO|COMPLETA|REAÇÃO|###|>|-\s)/i.test(tr)) return false;
  return /^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ0-9][A-Z0-9ÁÀÂÃÉÊÍÓÔÕÚÇ '\-]+$/u.test(tr);
}

function isActionHeaderLineDM(line) {
  return /^(PADRÃO|LIVRE|MOVIMENTO|COMPLETA|REAÇÃO)\s*[-–]\s*.+$/i.test(line.trim());
}

function buildDadosMediosSectionDM(sectionBody) {
  const lines = sectionBody.split("\n");
  const out = [];
  const seen = new Set();

  const perIdx = lines.findIndex((l) => l.trim() === "### Perícias");
  const habIdx = lines.findIndex((l) => l.trim() === "### Habilidades");
  const acIdx = lines.findIndex((l) => l.trim() === "### Ações");
  const descIdx = lines.findIndex((l) => l.trim() === "### Descrição (livro)");
  const enigmaIdx = lines.findIndex((l) => l.trim() === "### Enigma de Medo");

  const perEnd =
    [habIdx, acIdx, descIdx, enigmaIdx].filter((x) => x >= 0).sort((a, b) => a - b)[0] ?? lines.length;
  const perText =
    perIdx >= 0 ? lines.slice(perIdx, perEnd >= 0 ? perEnd : lines.length).join("\n") : "";

  let order = 0;
  const pushUnique = (key, textLine) => {
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ order: order++, line: textLine });
  };

  const ini = parseIniciativaFromPericiasDM(perText);
  if (ini != null) pushUnique("ini", `Iniciativa: ${ini}`);

  const pres = parsePresencaMentalDM(sectionBody);
  if (pres != null) pushUnique("pres", `Presença Perturbadora: ${pres} mental*`);

  function scanRangeDM(start, end, defaultActionHeader = "PADRÃO - AGREDIR") {
    let currentHeader = defaultActionHeader;
    let i = start;
    while (i < end) {
      const line = lines[i];
      const tr = line.trim();
      if (isActionHeaderLineDM(tr)) {
        currentHeader = tr;
        i++;
        continue;
      }
      if (tr.startsWith(">")) {
        const g = [];
        let j = i;
        while (j < end && lines[j].trimStart().startsWith(">")) {
          g.push(lines[j]);
          j++;
        }
        const extractions = extractDanoFromBlockquoteGroupDM(g);
        for (const ex of extractions) {
          const labelBase = entryLabelDM(currentHeader, ex.attack);
          const label = ex.variant === "truque" ? `${labelBase} (Truque)` : labelBase;
          const key = `bq:${label}:${ex.pool.n}d${ex.pool.sides}+${ex.pool.bonus}:${ex.kind}`;
          if (ex.kind === "mental")
            pushUnique(key, formatMentalLineDM(label, mentalSingleDM(ex.pool)));
          else
            pushUnique(
              key,
              formatPhysicalLineDM(label, ex.pool, ex.tipo, isAgredirActionHeaderDM(currentHeader))
            );
        }
        i = j;
        continue;
      }
      i++;
    }
  }

  if (habIdx >= 0) {
    const hEnd = [acIdx, enigmaIdx, lines.findIndex((l) => l.trim() === "### Dados Médios")]
      .filter((x) => x > habIdx)
      .sort((a, b) => a - b)[0];
    scanRangeDM(habIdx + 1, hEnd > habIdx ? hEnd : lines.length, "");
  }
  if (acIdx >= 0) {
    const aEnd = [enigmaIdx, lines.findIndex((l) => l.trim() === "### Dados Médios")]
      .filter((x) => x > acIdx)
      .sort((a, b) => a - b)[0];
    scanRangeDM(acIdx + 1, aEnd > acIdx ? aEnd : lines.length);
  }

  function scanProseDM(start, end, zone) {
    let currentHeader = zone === "acoes" ? "PADRÃO - AGREDIR" : "";
    let buf = [];
    const flush = () => {
      if (!buf.length) return;
      const text = buf.join("\n");
      const hdr = currentHeader;
      const baseLabel =
        zone === "habilidades" && hdr
          ? hdr
          : /AGREDIR/i.test(hdr)
            ? null
            : hdr
              ? humanizeActionHeaderDM(hdr)
              : null;

      for (const hit of extractTandemDanoMentalMaisFisicoDM(text)) {
        const label = baseLabel || "Agredir";
        const key = `tm:${label}:${hit.kind}:${hit.pool.n}d${hit.pool.sides}+${hit.pool.bonus}:${hit.tipo}`;
        if (hit.kind === "mental")
          pushUnique(key, formatMentalLineDM(label, mentalSingleDM(hit.pool)));
        else
          pushUnique(
            key,
            formatPhysicalLineDM(label, hit.pool, hit.tipo, isAgredirActionHeaderDM(hdr))
          );
      }
      for (const { pool } of extractProseMentalDiceDM(text)) {
        const label = baseLabel || "Agredir";
        const key = `pm:${label}:${text.slice(0, 40)}:${pool.n}d${pool.sides}`;
        pushUnique(key, formatMentalLineDM(label, mentalSingleDM(pool)));
      }
      for (const { pool, tipo } of extractProsePhysicalDiceDM(text)) {
        const label = baseLabel || "Agredir";
        const key = `pp:${label}:${pool.n}d${pool.sides}:${tipo}`;
        pushUnique(key, formatPhysicalLineDM(label, pool, tipo, isAgredirActionHeaderDM(hdr)));
      }
      buf = [];
    };

    for (let k = start; k < end; k++) {
      const tr = lines[k].trim();
      if (zone === "habilidades" && isSkillTitleLineDM(tr)) {
        flush();
        currentHeader = humanizeSkillTitleDM(tr);
        continue;
      }
      if (isActionHeaderLineDM(tr)) {
        flush();
        currentHeader = tr;
        continue;
      }
      if (tr.startsWith("###") || tr.startsWith("##")) {
        flush();
        continue;
      }
      if (tr.startsWith(">")) {
        flush();
        continue;
      }
      const bulletDm = tr.match(/^-\s*([^.]+)\.\s+(.+)$/);
      if (bulletDm && /\d+d\d+/i.test(tr) && !/recupere\s+\d+d\d+\s+pontos\s+de\s+sanidade/i.test(tr)) {
        flush();
        const bulletName = bulletDm[1].trim();
        const rest = bulletDm[2];
        const parent = currentHeader ? humanizeActionHeaderDM(currentHeader) : "Agredir";
        const label = `${parent} - ${humanizeSkillTitleDM(bulletName)}`;
        for (const { pool } of extractProseMentalDiceDM(rest)) {
          const key = `bul:${label}:${pool.n}d${pool.sides}m`;
          pushUnique(key, formatMentalLineDM(label, mentalSingleDM(pool)));
        }
        for (const { pool, tipo } of extractProsePhysicalDiceDM(rest)) {
          const key = `bul:${label}:${pool.n}d${pool.sides}p:${tipo}`;
          pushUnique(
            key,
            formatPhysicalLineDM(label, pool, tipo, isAgredirActionHeaderDM(currentHeader))
          );
        }
        continue;
      }
      buf.push(lines[k]);
    }
    flush();
  }

  if (habIdx >= 0) {
    const hEnd = [acIdx, enigmaIdx].filter((x) => x > habIdx).sort((a, b) => a - b)[0] ?? lines.length;
    scanProseDM(habIdx + 1, hEnd, "habilidades");
  }
  if (acIdx >= 0) {
    const aEnd = enigmaIdx > acIdx ? enigmaIdx : lines.length;
    scanProseDM(acIdx + 1, aEnd, "acoes");
  }

  if (descIdx >= 0) {
    const dEnd = lines.findIndex((l, ix) => ix > descIdx && l.trim() === "### Dados Médios");
    const desc = lines.slice(descIdx + 1, dEnd > descIdx ? dEnd : lines.length).join("\n");
    for (const e of extractDescricaoLivroDamageDM(desc)) {
      const key = `desc:${e.label}:${e.pool.n}d${e.pool.sides}`;
      if (e.kind === "mental")
        pushUnique(key, formatMentalLineDM(e.label, mentalSingleDM(e.pool)));
      else
        pushUnique(
          key,
          formatPhysicalLineDM(e.label, e.pool, e.tipo, /^Agredir\b/i.test(e.label))
        );
    }
  }

  out.sort((a, b) => a.order - b.order);
  const bodyLines = out.map((x) => x.line);
  if (bodyLines.length === 0) {
    return (
      "### Dados Médios\n\n<!-- Nenhum dano extraível automaticamente; preencher à mão se necessário -->\n"
    );
  }
  return `### Dados Médios\n\n${bodyLines.join("\n")}\n`;
}

function replaceDadosMediosInSectionDM(fullSection) {
  const titleLine = fullSection.split("\n")[0] || "";
  if (/^##\s+Modelo\s*$/i.test(titleLine.trim())) return fullSection;

  const m = fullSection.match(/\n### Dados Médios\s*\n/);
  if (!m) return fullSection;

  const idx = m.index;
  const before = fullSection.slice(0, idx);
  const afterHeader = fullSection.slice(idx + m[0].length);
  const nextH2 = (() => {
    let i = afterHeader.search(/\n## /);
    if (i < 0) i = afterHeader.search(/^## /m);
    return i;
  })();
  const tail = nextH2 >= 0 ? afterHeader.slice(nextH2) : "";
  const newBlock = buildDadosMediosSectionDM(before).trimEnd();
  const tailRest = tail.replace(/^\n+/, "");
  if (tailRest.startsWith("## ")) {
    return `${before}\n${newBlock}\n\n${tailRest}`;
  }
  return tail === "" ? `${before}\n${newBlock}` : `${before}\n${newBlock}${tail.startsWith("\n") ? "" : "\n"}${tail}`;
}

function processMarkdownAmeacasDados(md) {
  const parts = md.split(/^## /m);
  if (parts.length < 2) return md;
  const out = [parts[0]];
  for (let i = 1; i < parts.length; i++) {
    const chunk = parts[i];
    const full = `## ${chunk}`;
    out.push(replaceDadosMediosInSectionDM(full).replace(/^## /, ""));
  }
  // Entre fichas: sempre linha em branco antes do próximo ## (o split tira o próximo título do chunk atual).
  const trimmedBodies = out.slice(1).map((c) => c.replace(/\s+$/, ""));
  return out[0] + "## " + trimmedBodies.join("\n\n## ");
}

function main() {
  const args = parseArgs(process.argv);
  const livro = fs.readFileSync(args.livro, "utf8");
  const ameacasPath = args.ameacas;
  const ameacas = fs.readFileSync(ameacasPath, "utf8");

  const fullBlocks = extractFullCreatureBlocks(livro);
  const newBlocksBySlug = new Map();

  const errors = [];
  for (const b of fullBlocks) {
    try {
      const md = convertFullCreatureBlock(b.title, b.intro, b.body);
      const sl = slug(b.title);
      if (!sl) continue;
      if (!newBlocksBySlug.has(sl)) newBlocksBySlug.set(sl, md);
    } catch (err) {
      errors.push({ title: b.title, err });
    }
  }

  for (const row of extractCompactNPCBlocks(livro)) {
    try {
      const md = convertCompactNPC(row);
      const sl = slug(row.nome);
      if (!sl) continue;
      if (!newBlocksBySlug.has(sl)) newBlocksBySlug.set(sl, md);
    } catch (err) {
      errors.push({ title: row.nome, err });
    }
  }

  if (errors.length) {
    console.error("Avisos/erros na conversão:");
    for (const { title, err } of errors) console.error(` - ${title}: ${err.message || err}`);
  }

  const existingSlugs = new Set(parseAmeacasSections(ameacas).map((s) => slug(s.title)));
  const wouldAdd = [...newBlocksBySlug.keys()].filter((k) => !existingSlugs.has(k));
  const already = [...newBlocksBySlug.keys()].filter((k) => existingSlugs.has(k));

  console.log(`Fichas extraídas do livro (únicas por slug): ${newBlocksBySlug.size}`);
  console.log(`Já existentes em Ameaças.md (não sobrescritas): ${already.length}`);
  console.log(`Novas a acrescentar: ${wouldAdd.length}`);
  if (wouldAdd.length) console.log("Slugs novos:", wouldAdd.join(", "));

  const merged = mergeAmeacas(ameacas, newBlocksBySlug);
  if (!merged) process.exit(1);

  const finalMd = processMarkdownAmeacasDados(merged.newMd);

  if (args.dryRun) {
    const changed = finalMd !== ameacas;
    console.log("\n[--dry-run] Nenhum arquivo alterado.");
    if (changed) {
      console.log(
        `[--dry-run] O arquivo mudaria (${ameacas.length} → ${finalMd.length} bytes; fichas novas: ${wouldAdd.length}).`
      );
    } else console.log("[--dry-run] Conteúdo final idêntico ao atual.");
    return;
  }

  if (finalMd === ameacas) {
    console.log("\nNenhuma alteração (nada novo do livro e dados médios já alinhados).");
    return;
  }

  fs.writeFileSync(ameacasPath, finalMd, "utf8");
  const partes = [];
  if (merged.added.length) partes.push(`${merged.added.length} ficha(s) nova(s) antes de ## Modelo`);
  partes.push("### Dados Médios recalculado em todas as fichas");
  console.log(`\nGravado: ${ameacasPath}\n - ${partes.join("\n - ")}`);
}

function isRunAsMain() {
  try {
    const entry = process.argv[1];
    if (!entry) return false;
    return path.resolve(entry) === path.resolve(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isRunAsMain()) {
  main();
}
