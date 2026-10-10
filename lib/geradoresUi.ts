import type { TabelaIndexEntry } from "@/lib/tabelas";
import { ariaLabelForRoll } from "@/lib/diceDisplay";

function normalizeLabel(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\u0300-\u036f/g, "");
}

/** Título do módulo e descrição dizem a mesma coisa (ex. Rumores / Rumores de taverna). */
export function isRedundantDescription(
  moduleTitle: string,
  description?: string,
): boolean {
  if (!description?.trim()) return true;
  const t = normalizeLabel(moduleTitle);
  const d = normalizeLabel(description);
  if (d === t) return true;
  if (d.startsWith(`${t} de `) || d.startsWith(`${t} `)) return true;
  if (t && d.includes(t) && d.length <= t.length + 24) return true;
  return false;
}

export function moduleDescriptionForDisplay(
  moduleTitle: string,
  description?: string,
): string | undefined {
  if (isRedundantDescription(moduleTitle, description)) return undefined;
  return description;
}

export function isPlaceholderRolagem(rolagem?: string): boolean {
  if (!rolagem?.trim()) return true;
  return /ver tabela/i.test(rolagem);
}

/** Texto visível do botão de rolagem de tabela (ícones mostram o dado). */
export function rollButtonLabel(_rolagem?: string): string {
  return "Rolar";
}

export function rollButtonAriaLabel(rolagem: string): string {
  return ariaLabelForRoll(rolagem, "rolagem");
}

const CHIP_LABEL_BY_ID: Record<string, string> = {
  "solodark-oraculo": "Sim/não",
  "solodark-oraculo-detalhe": "Detalhe",
};

/** Ordem do Livro — nível médio do grupo → tabela d100 de tesouro. */
export const TESOUROS_FAIXA_TABLE_IDS = [
  "tesouros-0-3",
  "tesouros-4-6",
  "tesouros-7-9",
  "tesouros-10-mais",
] as const;

const TESOUROS_FAIXA_LABEL: Record<string, string> = {
  "tesouros-0-3": "0–3",
  "tesouros-4-6": "4–6",
  "tesouros-7-9": "7–9",
  "tesouros-10-mais": "10+",
};

export function isTesourosFaixaModule(tables: TabelaIndexEntry[]): boolean {
  const byId = new Set(tables.map((t) => t.id));
  return TESOUROS_FAIXA_TABLE_IDS.every((id) => byId.has(id));
}

/** Tabelas roláveis do gerador Tesouros, na ordem do livro (sem guia de PO). */
export function tesourosFaixaTables(
  tables: TabelaIndexEntry[],
): TabelaIndexEntry[] {
  return TESOUROS_FAIXA_TABLE_IDS.flatMap((id) => {
    const row = tables.find((t) => t.id === id);
    return row ? [row] : [];
  });
}

export function tesourosFaixaSelectLabel(tables: TabelaIndexEntry[]): string {
  return (
    tables.find((t) => t.id === "tesouro-encontro-po")?.titulo ??
    "Nível médio do grupo"
  );
}

export function labelForTesourosFaixa(entry: TabelaIndexEntry): string {
  return TESOUROS_FAIXA_LABEL[entry.id] ?? entry.titulo;
}

/** Ordem do Livro + Cursed Scroll 1 — classe e faixa de grau da magia. */
export const FALHA_MAGICA_TABLE_IDS = [
  "falha-magica-mago-1-2",
  "falha-magica-mago-3-4",
  "falha-magica-mago-5",
  "falha-magica-diabolica-1-3",
  "falha-magica-diabolica-4-5",
] as const;

const FALHA_MAGICA_LABEL: Record<string, string> = {
  "falha-magica-mago-1-2": "Mago — graus 1–2",
  "falha-magica-mago-3-4": "Mago — graus 3–4",
  "falha-magica-mago-5": "Mago — grau 5",
  "falha-magica-diabolica-1-3":
    "Bruxa / Cavaleiro de São Ydris — graus 1–3",
  "falha-magica-diabolica-4-5":
    "Bruxa / Cavaleiro de São Ydris — graus 4–5",
};

export function isFalhaMagicaModule(tables: TabelaIndexEntry[]): boolean {
  const byId = new Set(tables.map((t) => t.id));
  return FALHA_MAGICA_TABLE_IDS.every((id) => byId.has(id));
}

export function falhaMagicaTables(
  tables: TabelaIndexEntry[],
): TabelaIndexEntry[] {
  return FALHA_MAGICA_TABLE_IDS.flatMap((id) => {
    const row = tables.find((t) => t.id === id);
    return row ? [row] : [];
  });
}

export function falhaMagicaSelectLabel(): string {
  return "Classe e grau da magia";
}

export function labelForFalhaMagica(entry: TabelaIndexEntry): string {
  return FALHA_MAGICA_LABEL[entry.id] ?? entry.titulo;
}

export function chipLabelForTable(
  entry: TabelaIndexEntry,
  moduleTitle: string,
): string {
  const mapped = CHIP_LABEL_BY_ID[entry.id];
  if (mapped) return mapped;

  const tNorm = normalizeLabel(moduleTitle);
  const tituloNorm = normalizeLabel(entry.titulo);
  if (tituloNorm === tNorm || tituloNorm.startsWith(`${tNorm} `)) {
    const slug = entry.id.replace(/^[a-z]+-/, "").replace(/-/g, " ");
    if (slug && slug !== tituloNorm) {
      return slug.charAt(0).toUpperCase() + slug.slice(1);
    }
  }
  return entry.titulo;
}

export function resultCardTitle(
  moduleTitle: string,
  singleTable: boolean,
  tableTitulo?: string,
): string | undefined {
  if (singleTable || !tableTitulo) return undefined;
  const t = normalizeLabel(moduleTitle);
  const tt = normalizeLabel(tableTitulo);
  if (tt === t || tt.startsWith(`${t} `)) return undefined;
  return tableTitulo;
}
