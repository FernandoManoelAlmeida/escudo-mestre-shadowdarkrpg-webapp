import type { OrdenarSentido } from "@/lib/sortOrder";

export type CatalogoPersonagemEntrada = {
  id: string;
  nome: string;
  descricao: string;
  origem?: string;
  fonte?: "livro" | "cursed-scroll" | "astraldark" | "homebrew" | string;
};

export type AntecedenteEntrada = CatalogoPersonagemEntrada & {
  lista: string;
  rolagem?: string;
  numero?: number;
};

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** Nome na UI do catálogo de ancestralidades (livro usa caixa alta; homebrew/Astraldark alinham na exibição). */
export function ancestralidadeDisplayNome(nome: string): string {
  return nome.toLocaleUpperCase("pt-BR");
}

export function sortAntecedentesPorNumero(
  entradas: AntecedenteEntrada[],
  ordenarSentido: OrdenarSentido,
): AntecedenteEntrada[] {
  const list = [...entradas];
  list.sort((a, b) => {
    const cmpNum = (a.numero ?? 0) - (b.numero ?? 0);
    if (cmpNum !== 0) {
      return ordenarSentido === "asc" ? cmpNum : -cmpNum;
    }
    const cmpNome = a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
    return ordenarSentido === "asc" ? cmpNome : -cmpNome;
  });
  return list;
}

export function sortCatalogoPersonagem<T extends CatalogoPersonagemEntrada>(
  entradas: T[],
  ordenarSentido: OrdenarSentido,
): T[] {
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

const LISTA_ANTECEDENTES_ORDER = [
  "Livro de Regras (d20)",
  "Antecedentes diabólicos",
  "Antecedentes nórdicos",
  "Antecedentes a bordo (d8)",
];

export function antecedenteLinhaTitulo(entrada: AntecedenteEntrada): string {
  if (entrada.numero != null) {
    return `${entrada.numero} — ${entrada.nome}`;
  }
  return entrada.nome;
}

/** Rótulo curto no filtro «Lista» (sem sufixo de rolagem). */
export function antecedenteListaFiltroLabel(lista: string): string {
  return lista.replace(/\s*\(d\d+\)\s*$/i, "").trim();
}

export function groupAntecedentesPorLista(
  entradas: AntecedenteEntrada[],
): { lista: string; entradas: AntecedenteEntrada[] }[] {
  const map = new Map<string, AntecedenteEntrada[]>();
  for (const e of entradas) {
    const key = e.lista || "Outros";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  const keys = [...map.keys()].sort((a, b) => {
    const ia = LISTA_ANTECEDENTES_ORDER.indexOf(a);
    const ib = LISTA_ANTECEDENTES_ORDER.indexOf(b);
    const ra = ia >= 0 ? ia : 99;
    const rb = ib >= 0 ? ib : 99;
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b, "pt-BR");
  });
  return keys.map((lista) => {
    const list = map.get(lista) ?? [];
    list.sort((a, b) => (a.numero ?? 0) - (b.numero ?? 0));
    return { lista, entradas: list };
  });
}
