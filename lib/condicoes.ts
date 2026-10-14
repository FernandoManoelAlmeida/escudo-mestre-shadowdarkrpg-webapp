import type { EscudoSection, EscudoSubsection } from "@/lib/escudo";

export type CondicaoEntrada = {
  id: string;
  nome: string;
  descricao: string;
};

/** Extrai condições a partir das subsecções §7 (cada ### 7.N Nome). */
export function condicoesFromSection(
  section: EscudoSection | undefined | null,
): CondicaoEntrada[] {
  if (!section?.subsections?.length) return [];
  return section.subsections
    .map((sub) => condicaoFromSubsection(sub))
    .filter((e): e is CondicaoEntrada => e != null);
}

function condicaoFromSubsection(
  sub: EscudoSubsection,
): CondicaoEntrada | null {
  const nome = sub.title.trim();
  if (!nome || /^lista$/i.test(nome)) {
    return null;
  }
  const descricao = (sub.content ?? "").trim();
  if (!descricao) return null;
  return { id: sub.id, nome, descricao };
}
