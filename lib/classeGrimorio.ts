import type { SpellLista } from "@/lib/magias";
import { CLASS_LABELS } from "@/lib/magiasFormat";

/** ID do catálogo de classes → lista no grimório (`magias.json`). */
const CLASSE_ID_SPELL_LISTA: Record<string, SpellLista> = {
  mago: "mago",
  sacerdote: "sacerdote",
  bruxa: "bruxa",
  vidente: "vidente",
  "cavaleiro-de-sao-ydris": "bruxa",
};

export function spellListaForClasseId(classeId: string): SpellLista | null {
  return CLASSE_ID_SPELL_LISTA[classeId] ?? null;
}

export function grimorioPathForClasse(classeId: string): string | null {
  const lista = spellListaForClasseId(classeId);
  if (!lista) return null;
  return `/arcanos/grimorio?classe=${encodeURIComponent(lista)}`;
}

export function grimorioLinkLabelForClasse(classeId: string): string | null {
  const lista = spellListaForClasseId(classeId);
  if (!lista) return null;
  const nome = CLASS_LABELS[lista] ?? lista;
  return `Magias de ${nome}`;
}
