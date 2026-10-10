import type { Magia, SpellLista } from "@/lib/magias";
import type { OrdenarSentido } from "@/lib/sortOrder";

export type OrdenarMagiasPor = "nome" | "grau";

export const CLASS_LABELS: Record<string, string> = {
  mago: "Mago",
  sacerdote: "Sacerdote",
  bruxa: "Bruxa",
  vidente: "Vidente",
  druida: "Druida",
  feiticeiro: "Feiticeiro",
};

const LIST_ORDER: SpellLista[] = [
  "mago",
  "sacerdote",
  "bruxa",
  "vidente",
  "druida",
  "feiticeiro",
];

export function formatMagiaClassesGrau(m: Magia): string {
  const listas = m.listas || [];
  const grau = m.grau || {};
  const ordered = [
    ...LIST_ORDER.filter((k) => listas.includes(k)),
    ...listas.filter((k) => !LIST_ORDER.includes(k)).sort(),
  ];
  return ordered
    .map((slug) => {
      const label = CLASS_LABELS[slug] ?? slug;
      const n = grau[slug as keyof typeof grau];
      return n != null ? `${label} ${n}` : label;
    })
    .join(" · ");
}

export function formatMagiaOrigemLabel(origem: string): string {
  if (origem === "livro") return "Livro de Regras";
  if (origem === "astraldark") return "Astraldark";
  if (/^Cursed Scroll/i.test(origem)) {
    return origem.replace(/\.md$/i, "");
  }
  return origem;
}

export function formatMagiaOrigensBlock(m: Magia): string {
  if (m.origens?.length) {
    return m.origens.map(formatMagiaOrigemLabel).join(" · ");
  }
  return formatMagiaOrigemLabel(m.origem);
}

export function formatMagiaRowMeta(m: Magia): string {
  const parts: string[] = [];
  const cg = formatMagiaClassesGrau(m);
  if (cg) parts.push(cg);
  const orig = formatMagiaOrigensBlock(m);
  if (orig) parts.push(orig);
  return parts.join(" · ");
}

export function magiaOrigemSlugs(m: Magia): string[] {
  if (m.origens?.length) return m.origens;
  return m.origem ? [m.origem] : [];
}

export function collectClassSlugs(magias: Magia[]): SpellLista[] {
  const set = new Set<SpellLista>();
  for (const m of magias) {
    for (const l of m.listas || []) set.add(l);
  }
  return [...set].sort((a, b) => {
    const ia = LIST_ORDER.indexOf(a);
    const ib = LIST_ORDER.indexOf(b);
    if (ia >= 0 && ib >= 0) return ia - ib;
    if (ia >= 0) return -1;
    if (ib >= 0) return 1;
    return a.localeCompare(b, "pt-BR");
  });
}

function grauSortKey(m: Magia, classeFiltro?: string, sentido?: OrdenarSentido): number {
  const grau = m.grau || {};
  if (classeFiltro) {
    const n = grau[classeFiltro as SpellLista];
    if (n == null) return sentido === "desc" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
    return n;
  }
  const values = Object.values(grau).filter((n): n is number => typeof n === "number");
  if (values.length === 0) {
    return sentido === "desc" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
  }
  return Math.min(...values);
}

export function sortMagias(
  magias: Magia[],
  options: {
    ordenarPor: OrdenarMagiasPor;
    ordenarSentido: OrdenarSentido;
    classeFiltro?: string;
  },
): Magia[] {
  const { ordenarPor, ordenarSentido, classeFiltro } = options;
  const list = [...magias];
  list.sort((a, b) => {
    if (ordenarPor === "nome") {
      const cmp = a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
      return ordenarSentido === "asc" ? cmp : -cmp;
    }
    const ga = grauSortKey(a, classeFiltro, ordenarSentido);
    const gb = grauSortKey(b, classeFiltro, ordenarSentido);
    if (ga !== gb) {
      const cmp = ga - gb;
      return ordenarSentido === "asc" ? cmp : -cmp;
    }
    const tie = a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
    return tie;
  });
  return list;
}

export function collectGrauNumbers(magias: Magia[]): number[] {
  const set = new Set<number>();
  for (const m of magias) {
    for (const n of Object.values(m.grau || {})) {
      if (typeof n === "number") set.add(n);
    }
  }
  return [...set].sort((a, b) => a - b);
}
