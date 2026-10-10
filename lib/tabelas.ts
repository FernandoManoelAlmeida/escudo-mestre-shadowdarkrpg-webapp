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
