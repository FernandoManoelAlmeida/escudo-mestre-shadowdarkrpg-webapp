import {
  fetchCatalogoJson,
  sortCatalogoPersonagem,
  type CatalogoPersonagemEntrada,
} from "@/lib/catalogoPersonagem";
import type { OrdenarSentido } from "@/lib/sortOrder";

export type Classe = CatalogoPersonagemEntrada;

export async function getClasses(): Promise<Classe[]> {
  const data = await fetchCatalogoJson<{ entradas: Classe[] }>(
    "/data/catalogo/classes.json",
  );
  return data?.entradas ?? [];
}

export async function getClasseById(id: string): Promise<Classe | null> {
  const entradas = await getClasses();
  return entradas.find((e) => e.id === id) ?? null;
}

export function sortClasses(entradas: Classe[], sentido: OrdenarSentido): Classe[] {
  return sortCatalogoPersonagem(entradas, sentido);
}
