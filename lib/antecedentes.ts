import {
  fetchCatalogoJson,
  groupAntecedentesPorLista,
  type AntecedenteEntrada,
} from "@/lib/catalogoPersonagem";
import { keepCatalogoPersonagemForCopyrightFree } from "@/lib/copyrightFreeFilter";

export type { AntecedenteEntrada };

export { groupAntecedentesPorLista };

export async function getAntecedentes(): Promise<AntecedenteEntrada[]> {
  const data = await fetchCatalogoJson<{ entradas: AntecedenteEntrada[] }>(
    "/data/catalogo/antecedentes.json",
  );
  return (data?.entradas ?? []).filter((e) =>
    keepCatalogoPersonagemForCopyrightFree(e),
  );
}
