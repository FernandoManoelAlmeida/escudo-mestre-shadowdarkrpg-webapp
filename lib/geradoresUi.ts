import type { TabelaIndexEntry } from "@/lib/tabelas";

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

export function rollButtonLabel(rolagem: string): string {
  const base = rolagem.replace(/\s*\+\s*MOD\s+\w+/i, "").trim();
  return `Rolar (${base})`;
}

const CHIP_LABEL_BY_ID: Record<string, string> = {
  "solodark-oraculo": "Sim/não",
  "solodark-oraculo-detalhe": "Detalhe",
};

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
  tableTitulo?: string,
  singleTable: boolean,
): string | undefined {
  if (singleTable || !tableTitulo) return undefined;
  const t = normalizeLabel(moduleTitle);
  const tt = normalizeLabel(tableTitulo);
  if (tt === t || tt.startsWith(`${t} `)) return undefined;
  return tableTitulo;
}
