export type EscudoMeta = {
  title: string;
  description: string;
  sources: string[];
};

export type EscudoIndexItem = {
  id: string;
  title: string;
  anchor: string;
  /** Número exibido na listagem (ex.: homebrew após cap. 6 do livro). */
  chapter?: string;
};

export type EscudoSubsection = {
  id: string;
  title: string;
  content?: string;
  formulas?: string[];
  tableRef?: string;
};

export type EscudoSection = {
  id: string;
  title: string;
  subsections: EscudoSubsection[];
  chapter?: string;
  /** Regra de mesa (ex.: multiclasse) — exibir aviso na ficha. */
  homebrew?: boolean;
};

export type TableRow = Record<string, string | number>;

export type EscudoTable = {
  headers: string[];
  rows: TableRow[] | { [key: string]: string | number }[];
};

export type GlossaryItem = {
  term: string;
  fullName: string;
  description: string;
};

import type { OrdenarSentido } from "@/lib/sortOrder";

export type EscudoData = {
  meta: EscudoMeta;
  index: EscudoIndexItem[];
  sections: EscudoSection[];
  tables: Record<string, EscudoTable>;
  glossary: GlossaryItem[];
};

const ESCUDO_URL =
  (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/data/escudo-shadowdark.json";

let cached: EscudoData | null = null;

export async function getEscudo(): Promise<EscudoData> {
  if (cached) return cached;
  const res = await fetch(ESCUDO_URL);
  if (!res.ok) throw new Error("Falha ao carregar Escudo");
  cached = (await res.json()) as EscudoData;
  return cached;
}

/** Limpa cache (testes). */
export function clearEscudoCache(): void {
  cached = null;
}

export function getSection(
  escudo: EscudoData,
  sectionId: string,
): EscudoSection | undefined {
  return escudo.sections.find((s) => s.id === sectionId);
}

/** Título de lista/ficha: capítulos numéricos do livro vs. seções por slug (homebrew). */
export function formatEscudoSectionHeading(section: {
  id: string;
  title: string;
  chapter?: string;
}): string {
  const num =
    section.chapter ?? (/^\d+$/.test(section.id) ? section.id : undefined);
  if (num) return `§ ${num} — ${section.title}`;
  return `§ ${section.title}`;
}

export function getTable(
  escudo: EscudoData,
  tableRef: string,
): EscudoTable | undefined {
  return escudo.tables[tableRef];
}

/** Monta um texto único com todo o conteúdo da seção para busca. */
function textoParaBuscaSection(section: EscudoSection): string {
  const partes: string[] = [section.id, section.title];
  for (const sub of section.subsections) {
    partes.push(sub.id, sub.title, sub.content ?? "", sub.tableRef ?? "");
    if (sub.formulas) partes.push(...sub.formulas);
  }
  return partes.filter(Boolean).join(" ").toLowerCase();
}

/** Filtra o índice de regras por texto; busca em seções, tabelas e glossário. */
export function filterRegrasIndex(
  data: EscudoData,
  filters: { texto?: string },
): EscudoIndexItem[] {
  const q = filters.texto?.trim();
  if (!q) return data.index;

  const busca = q.toLowerCase();
  const matching: EscudoIndexItem[] = [];

  for (const item of data.index) {
    const section = data.sections.find((s) => s.id === item.id);
    if (section && textoParaBuscaSection(section).includes(busca)) {
      matching.push(item);
    }
  }

  const glossaryMatch = (data.glossary ?? []).some(
    (g) =>
      g.term.toLowerCase().includes(busca) ||
      g.fullName.toLowerCase().includes(busca) ||
      g.description.toLowerCase().includes(busca),
  );
  const tablesMatch = Object.entries(data.tables ?? {}).some(([key, table]) => {
    const headerText = table.headers.join(" ").toLowerCase();
    if (headerText.includes(busca)) return true;
    for (const row of Array.isArray(table.rows) ? table.rows : []) {
      if (
        Object.values(row).some((v) => String(v).toLowerCase().includes(busca))
      )
        return true;
    }
    return key.toLowerCase().includes(busca);
  });

  const result = [...matching];
  if (glossaryMatch && !result.some((i) => i.id === "glossario")) {
    result.push({ id: "glossario", title: "Glossário", anchor: "glossario" });
  }
  if (tablesMatch && !result.some((i) => i.id === "tabelas")) {
    result.push({ id: "tabelas", title: "Tabelas", anchor: "tabelas" });
  }

  return result;
}

export function sortGlossary(
  items: GlossaryItem[],
  ordenarSentido: OrdenarSentido,
): GlossaryItem[] {
  const list = [...items];
  list.sort((a, b) => {
    const cmp = a.term.localeCompare(b.term, "pt-BR", { sensitivity: "base" });
    return ordenarSentido === "asc" ? cmp : -cmp;
  });
  return list;
}
