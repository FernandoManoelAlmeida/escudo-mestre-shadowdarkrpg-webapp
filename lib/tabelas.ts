import type { OrdenarSentido } from "@/lib/sortOrder";
import type { RollTableData } from "@/lib/rollTable";

export type TabelaIndexEntry = {
  id: string;
  titulo: string;
  categoria: string;
  subcategoria?: string;
  rolagem: string;
};

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export async function getTabelasIndex(): Promise<TabelaIndexEntry[]> {
  const res = await fetch(`${base}/data/tabelas/tabelas-index.json`);
  if (!res.ok) return [];
  const data = (await res.json()) as { tabelas: TabelaIndexEntry[] };
  return data.tabelas ?? [];
}

export async function getTabelaById(id: string): Promise<RollTableData | null> {
  const res = await fetch(`${base}/data/tabelas/${id}.json`);
  if (!res.ok) return null;
  return (await res.json()) as RollTableData;
}

export function tabelaEntrySearchText(entry: TabelaIndexEntry): string {
  return [
    entry.titulo,
    entry.categoria,
    entry.subcategoria ?? "",
    entry.id,
    entry.rolagem,
  ]
    .join(" ")
    .toLowerCase();
}

export function matchesTabelaIndexEntry(
  entry: TabelaIndexEntry,
  q: string,
): boolean {
  const busca = q.trim().toLowerCase();
  if (!busca) return true;
  return tabelaEntrySearchText(entry).includes(busca);
}

export function sortTabelaIndexEntries(
  entries: TabelaIndexEntry[],
  ordenarSentido: OrdenarSentido,
): TabelaIndexEntry[] {
  const list = [...entries];
  list.sort((a, b) => {
    const cmp = a.titulo.localeCompare(b.titulo, "pt-BR", {
      sensitivity: "base",
    });
    return ordenarSentido === "asc" ? cmp : -cmp;
  });
  return list;
}

export function escudoTableDisplayName(key: string): string {
  return key.replace(/_/g, " ");
}

/** Só apresentação na UI de /regras/tabelas. */
export function formatTabelaTituloExibicao(titulo: string): string {
  return titulo.toLocaleUpperCase("pt-BR");
}

export function matchesEscudoTableKey(key: string, q: string): boolean {
  const busca = q.trim().toLowerCase();
  if (!busca) return true;
  const label = escudoTableDisplayName(key).toLowerCase();
  return label.includes(busca) || key.toLowerCase().includes(busca);
}

export function sortEscudoTableKeys(
  keys: string[],
  ordenarSentido: OrdenarSentido,
): string[] {
  const list = [...keys];
  list.sort((a, b) => {
    const cmp = escudoTableDisplayName(a).localeCompare(
      escudoTableDisplayName(b),
      "pt-BR",
      { sensitivity: "base" },
    );
    return ordenarSentido === "asc" ? cmp : -cmp;
  });
  return list;
}

/** Mantém âncora visível mesmo com filtro de busca ativo. */
export function ensureTabelaIndexEntry(
  entries: TabelaIndexEntry[],
  fullIndex: TabelaIndexEntry[],
  id: string | null,
): TabelaIndexEntry[] {
  if (!id || entries.some((e) => e.id === id)) return entries;
  const target = fullIndex.find((e) => e.id === id);
  if (!target) return entries;
  return [...entries, target];
}
