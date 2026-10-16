import {
  fetchCatalogoJson,
  sortCatalogoPersonagem,
  type CatalogoPersonagemEntrada,
} from "@/lib/catalogoPersonagem";
import { keepCatalogoPersonagemForCopyrightFree } from "@/lib/copyrightFreeFilter";
import { mapCatalogoEntradaNomenclature } from "@/lib/githNomenclature";
import type { OrdenarSentido } from "@/lib/sortOrder";

export type Ancestralidade = CatalogoPersonagemEntrada;

export async function getAncestralidades(): Promise<Ancestralidade[]> {
  const data = await fetchCatalogoJson<{ entradas: Ancestralidade[] }>(
    "/data/catalogo/ancestralidades.json",
  );
  return (data?.entradas ?? [])
    .filter((e) => keepCatalogoPersonagemForCopyrightFree(e))
    .map(mapCatalogoEntradaNomenclature);
}

export async function getAncestralidadeById(
  id: string,
): Promise<Ancestralidade | null> {
  const entradas = await getAncestralidades();
  return entradas.find((e) => e.id === id) ?? null;
}

export function sortAncestralidades(
  entradas: Ancestralidade[],
  sentido: OrdenarSentido,
): Ancestralidade[] {
  return sortCatalogoPersonagem(entradas, sentido);
}
