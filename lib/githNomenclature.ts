import { isCopyrightFree } from "@/lib/copyrightFree";
import type { Criatura } from "@/lib/ameacas";
import type { CatalogoPersonagemEntrada } from "@/lib/catalogoPersonagem";

/**
 * Glossário de apresentação Gith ↔ Matri (alinhado a astraldark-public-glossary).
 * JSON canónico usa Matri*; com COPYRIGHT_FREE off reverte para nomes de mesa D&D.
 * Formas longas primeiro para não gerar «matriyanki» / «githprole».
 */

/** Gith/Vlaakith → Matri* (modo COPYRIGHT_FREE). */
const TO_PUBLIC: ReadonlyArray<readonly [string, string]> = [
  ["Githyanki", "Matriprole"],
  ["githyanki", "matriprole"],
  ["GITHYANKI", "MATRIPROLE"],
  ["Githzerai", "Matrímpio"],
  ["githzerai", "matrímpio"],
  ["GITHZERAI", "MATRÍMPIO"],
  ["Vlaakith", "Matriarca"],
  ["vlaakith", "matriarca"],
  ["VLAAKITH", "MATRIARCA"],
  ["Gith ", "Matri "],
  [" gith", " matri"],
  ["/ Gith", "/ Matri"],
  ["(Gith)", "(Matri)"],
];

/** Matri* → Gith/Vlaakith (modo mesa, flag off). */
const TO_MESA: ReadonlyArray<readonly [string, string]> = [
  ["Matriprole", "Githyanki"],
  ["matriprole", "githyanki"],
  ["MATRIPROLE", "GITHYANKI"],
  ["Matrímpio", "Githzerai"],
  ["matrímpio", "githzerai"],
  ["MATRÍMPIO", "GITHZERAI"],
  // slug/ASCII sem acento (ids e alguns textos)
  ["Matrimpio", "Githzerai"],
  ["matrimpio", "githzerai"],
  ["MATRIMPIO", "GITHZERAI"],
  ["Matriarca", "Vlaakith"],
  ["matriarca", "vlaakith"],
  ["MATRIARCA", "VLAAKITH"],
  ["Matri ", "Gith "],
  [" matri", " gith"],
  ["/ Matri", "/ Gith"],
  ["(Matri)", "(Gith)"],
];

function applyPairs(
  text: string,
  pairs: ReadonlyArray<readonly [string, string]>,
): string {
  let out = text;
  for (const [from, to] of pairs) {
    if (out.includes(from)) out = out.split(from).join(to);
  }
  return out;
}

/** Força nomenclatura pública (Matri*). */
export function applyPublicNomenclature(text: string): string {
  return applyPairs(text, TO_PUBLIC);
}

/** Força nomenclatura de mesa (Gith*). */
export function applyMesaNomenclature(text: string): string {
  return applyPairs(text, TO_MESA);
}

/**
 * Texto para UI: Matri* com COPYRIGHT_FREE=1; Gith* com a flag off.
 */
export function applyNomenclatureForDisplay(text: string): string {
  if (!text) return text;
  return isCopyrightFree()
    ? applyPublicNomenclature(text)
    : applyMesaNomenclature(text);
}

function mapStr(s: string | undefined): string | undefined {
  if (s == null) return s;
  return applyNomenclatureForDisplay(s);
}

/** Aplica nomenclatura aos campos de texto; `id` permanece intacto. */
export function mapCriaturaNomenclature(c: Criatura): Criatura {
  return {
    ...c,
    nome: applyNomenclatureForDisplay(c.nome),
    epitet: mapStr(c.epitet),
    flavor: mapStr(c.flavor),
    tipo: mapStr(c.tipo),
    atq: applyNomenclatureForDisplay(c.atq),
    mv: applyNomenclatureForDisplay(c.mv),
    fonte: mapStr(c.fonte),
    tags: c.tags?.map((t) => applyNomenclatureForDisplay(t)),
    tracos: (c.tracos ?? []).map((t) => ({
      nome: applyNomenclatureForDisplay(t.nome),
      descricao: applyNomenclatureForDisplay(t.descricao),
    })),
  };
}

export function mapCatalogoEntradaNomenclature<
  T extends CatalogoPersonagemEntrada,
>(e: T): T {
  return {
    ...e,
    nome: applyNomenclatureForDisplay(e.nome),
    descricao: applyNomenclatureForDisplay(e.descricao),
    origem: mapStr(e.origem),
  };
}

export function mapTokenNomenclature<
  T extends { url: string; credito?: string; rotulo?: string },
>(token: T): T {
  if (!token.rotulo) return token;
  return {
    ...token,
    rotulo: applyNomenclatureForDisplay(token.rotulo),
  };
}
