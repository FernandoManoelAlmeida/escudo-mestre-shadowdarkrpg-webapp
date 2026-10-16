import { isCopyrightFree } from "@/lib/copyrightFree";

/** Origem/fonte fora da TPL (Cursed Scroll reprint). */
export function isCursedScrollOrigem(origem?: string): boolean {
  if (!origem) return false;
  return /cursed\s*scroll/i.test(origem);
}

/** Conteúdo do livro core (reprint limitado pela TPL). */
export function isLivroOrigem(origem?: string, fonte?: string): boolean {
  const o = (origem ?? "").toLowerCase();
  const f = (fonte ?? "").toLowerCase();
  if (f === "livro") return true;
  if (o === "livro") return true;
  if (/guia de jogo/i.test(origem ?? "")) return true;
  return false;
}

export function isAstraldarkOrHomebrew(
  origem?: string,
  fonte?: string,
): boolean {
  const blob = `${origem ?? ""} ${fonte ?? ""}`.toLowerCase();
  if (fonte === "astraldark" || fonte === "homebrew") return true;
  if (blob.includes("astraldark")) return true;
  if (blob.includes("homebrew")) return true;
  if (blob.includes("matriprole") || blob.includes("matrímpio")) return true;
  if (blob.includes("elfo estelar")) return true;
  return false;
}

/**
 * Magias: TPL permite reprint do core + obra própria.
 * Com COPYRIGHT_FREE: keep livro + astraldark/homebrew; drop Cursed Scroll.
 */
export function keepMagiaForCopyrightFree(item: {
  origem?: string;
  fonte?: string;
}): boolean {
  if (!isCopyrightFree()) return true;
  if (isCursedScrollOrigem(item.origem)) return false;
  if (isAstraldarkOrHomebrew(item.origem, item.fonte)) return true;
  if (isLivroOrigem(item.origem, item.fonte)) return true;
  return false;
}

/**
 * Classes / ancestralidades / antecedentes: TPL não autoriza reprint de classes
 * nem material CS. Keep só obra própria (homebrew/Astraldark).
 */
export function keepCatalogoPersonagemForCopyrightFree(item: {
  origem?: string;
  fonte?: string;
}): boolean {
  if (!isCopyrightFree()) return true;
  if (isCursedScrollOrigem(item.origem)) return false;
  if (isLivroOrigem(item.origem, item.fonte)) return false;
  return isAstraldarkOrHomebrew(item.origem, item.fonte);
}

/** Itens mágicos: keep livro + homebrew/Astraldark; drop CS. */
export function keepItemMagicoForCopyrightFree(item: {
  origem?: string;
}): boolean {
  if (!isCopyrightFree()) return true;
  if (isCursedScrollOrigem(item.origem)) return false;
  if (isAstraldarkOrHomebrew(item.origem)) return true;
  if (isLivroOrigem(item.origem)) return true;
  return false;
}

/**
 * Ameaças: TPL permite monstros do core + obra própria.
 * Drop Cursed Scroll (fonte). Keep oficial (Bestiário) e homebrew.
 */
export function keepAmeacaForCopyrightFree(item: {
  origem?: string;
  fonte?: string;
}): boolean {
  if (!isCopyrightFree()) return true;
  if (isCursedScrollOrigem(item.fonte) || isCursedScrollOrigem(item.origem)) {
    return false;
  }
  return true;
}

/** Tabelas de rolagem do livro: GATE inteiro no modo COPYRIGHT_FREE. */
export function keepTabelaIndexForCopyrightFree(): boolean {
  return !isCopyrightFree();
}

/** Prosa de regras do escudo (fora monstro/magia/item): GATE no COPYRIGHT_FREE. */
export function keepEscudoProsaForCopyrightFree(): boolean {
  return !isCopyrightFree();
}
