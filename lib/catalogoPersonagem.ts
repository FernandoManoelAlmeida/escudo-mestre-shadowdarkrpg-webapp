import type { OrdenarSentido } from "@/lib/sortOrder";

export type CatalogoPersonagemEntrada = {
  id: string;
  nome: string;
  descricao: string;
  origem?: string;
  fonte?: "livro" | "cursed-scroll" | "astraldark" | "homebrew" | string;
};

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** Nome na UI do catálogo de ancestralidades (livro usa caixa alta; homebrew/Astraldark alinham na exibição). */
export function ancestralidadeDisplayNome(nome: string): string {
  return nome.toLocaleUpperCase("pt-BR");
}

export function sortCatalogoPersonagem(
  entradas: CatalogoPersonagemEntrada[],
  ordenarSentido: OrdenarSentido,
): CatalogoPersonagemEntrada[] {
  const list = [...entradas];
  list.sort((a, b) => {
    const cmp = a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
    return ordenarSentido === "asc" ? cmp : -cmp;
  });
  return list;
}

export function fonteLabel(fonte?: string): string | null {
  switch (fonte) {
    case "livro":
      return "Livro";
    case "cursed-scroll":
      return "Cursed Scroll";
    case "astraldark":
      return "Astraldark";
    case "homebrew":
      return "Homebrew";
    default:
      if (!fonte) return null;
      return fonte.charAt(0).toUpperCase() + fonte.slice(1);
  }
}

export function cursedScrollNumber(origem?: string): number | null {
  if (!origem) return null;
  const m = origem.match(/Cursed Scroll\s+(\d+)/i);
  return m ? Number.parseInt(m[1], 10) : null;
}

function classeFonteSortKey(entrada: CatalogoPersonagemEntrada): number {
  if (entrada.fonte === "livro") return 0;
  const n = cursedScrollNumber(entrada.origem);
  if (entrada.fonte === "cursed-scroll" && n != null) return n;
  if (entrada.fonte === "homebrew") return 99;
  return 50;
}

export function sortCatalogoClasse(
  entradas: CatalogoPersonagemEntrada[],
  ordenarSentido: OrdenarSentido,
): CatalogoPersonagemEntrada[] {
  const list = [...entradas];
  list.sort((a, b) => {
    const cmpNome = a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
    if (cmpNome !== 0) {
      return ordenarSentido === "asc" ? cmpNome : -cmpNome;
    }
    const cmpFonte = classeFonteSortKey(a) - classeFonteSortKey(b);
    return ordenarSentido === "asc" ? cmpFonte : -cmpFonte;
  });
  return list;
}

export function classeListTitle(entrada: CatalogoPersonagemEntrada): string {
  return entrada.nome;
}

export function classeListBadge(entrada: CatalogoPersonagemEntrada): string | null {
  if (entrada.fonte === "homebrew") return "Homebrew";
  const n = cursedScrollNumber(entrada.origem);
  if (entrada.fonte === "cursed-scroll" && n != null) {
    return `Cursed Scroll ${n}`;
  }
  if (entrada.fonte === "livro") return null;
  return fonteLabel(entrada.fonte);
}

export function classeDetailSubtitle(entrada: CatalogoPersonagemEntrada): string | null {
  if (entrada.fonte === "homebrew") return "Homebrew";
  const n = cursedScrollNumber(entrada.origem);
  if (entrada.fonte === "cursed-scroll" && n != null) return `Cursed Scroll ${n}`;
  return null;
}

export async function fetchCatalogoJson<T>(path: string): Promise<T | null> {
  const res = await fetch(`${base}${path}`);
  if (!res.ok) return null;
  return (await res.json()) as T;
}
