import type { OrdenarSentido } from "@/lib/sortOrder";

export type ItemMagico = {
  nome: string;
  descricao: string;
  origem?: string;
};

export function sortCatalogoItens(
  itens: ItemMagico[],
  ordenarSentido: OrdenarSentido,
): ItemMagico[] {
  const list = [...itens];
  list.sort((a, b) => {
    const cmp = a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
    return ordenarSentido === "asc" ? cmp : -cmp;
  });
  return list;
}
