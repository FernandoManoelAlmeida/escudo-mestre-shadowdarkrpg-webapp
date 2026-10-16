import { keepMagiaForCopyrightFree } from "@/lib/copyrightFreeFilter";

export type SpellLista =
  | "mago"
  | "sacerdote"
  | "bruxa"
  | "vidente"
  | "druida"
  | "feiticeiro";

export type MagiaGrau = Partial<Record<SpellLista, number>>;

export type Magia = {
  id: string;
  nome: string;
  descricao: string;
  origem: string;
  origens?: string[];
  listas: SpellLista[];
  grau: MagiaGrau;
  duracao?: string;
  alcance?: string;
  ritual?: boolean;
};

export type MagiasData = { magias: Magia[] };

let cache: MagiasData | null = null;

export async function getMagias(): Promise<MagiasData> {
  if (cache) return cache;
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const res = await fetch(`${base}/data/catalogo/magias.json`);
  if (!res.ok) throw new Error(`magias.json: ${res.status}`);
  const raw = (await res.json()) as MagiasData;
  cache = {
    magias: raw.magias.filter((m) => keepMagiaForCopyrightFree(m)),
  };
  return cache;
}

export function getMagiaById(data: MagiasData, id: string): Magia | undefined {
  return data.magias.find((m) => m.id === id);
}
