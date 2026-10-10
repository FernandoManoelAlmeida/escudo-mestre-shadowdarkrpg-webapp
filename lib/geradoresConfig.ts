import type { TabelaIndexEntry } from "@/lib/tabelas";

export type GeradorModule = {
  slug: string;
  title: string;
  description: string;
  /** Filtra entradas do índice para este módulo (tabelas roláveis). */
  match: (entry: TabelaIndexEntry) => boolean;
  /** Se definido, só estas ids (além do match). */
  tableIds?: string[];
};

const DICE_HEADER = /^(d\d+|2d\d+)(\s*\+\s*mod\s*\w+)?$/i;

export const GERADOR_MODULES: GeradorModule[] = [
  {
    slug: "encontros",
    title: "Encontros",
    description:
      "Bioma → encontro; distância e atividade só nas linhas marcadas (selva/masmorra). Armadilha, tesouro e combinar quando aplicável.",
    match: (e) =>
      e.id.startsWith("encontro-") &&
      !["teste-encontro", "distancia-inicial-encontro", "atividade-criaturas", "nivel-perigo"].includes(
        e.id,
      ),
  },
  {
    slug: "armadilhas",
    title: "Armadilhas",
    description: "d12 ao sondar corredores e salas (Livro).",
    match: (e) => e.id === "armadilhas",
  },
  {
    slug: "perigos",
    title: "Perigos ambientais",
    description: "d12 em masmorra ou exploração selvagem.",
    match: (e) => e.id === "perigos-ambientais",
  },
  {
    slug: "reacao",
    title: "Reação",
    description: "Atitude inicial de criaturas encontradas · 2d6 + MOD CAR.",
    match: (e) => e.categoria === "reacao",
  },
  {
    slug: "falha-magica",
    title: "Falha mágica",
    description:
      "d12 ao rolar 1 natural: mago (Livro, por grau da magia) e bruxa / cavaleiro de São Ydris (Cursed Scroll 1). Sacerdote: penitência nas regras, sem tabela aqui.",
    match: (e) => e.categoria === "falha-magica",
  },
  {
    slug: "xp-tesouro",
    title: "XP por tesouro",
    description: "d4 de qualidade ao dividir pilhagem entre o grupo.",
    match: (e) => e.categoria === "xp",
  },
  {
    slug: "tesouros",
    title: "Tesouros",
    description: "d100 por faixa de nível do grupo (0–3, 4–6, 7–9, 10+).",
    match: (e) => e.categoria === "tesouros",
  },
  {
    slug: "solodark",
    title: "Oráculo",
    description: "d6 Astraldark: sim/não e tabela de detalhe para complicações.",
    match: (e) => e.categoria === "solodark",
  },
  {
    slug: "itens-mundanos",
    title: "Itens mundanos",
    description: "Sorteio de equipamento sem magia.",
    match: (e) => e.categoria === "itens" && e.subcategoria === "mundanos",
  },
  {
    slug: "itens-dadivas",
    title: "Dádivas",
    description: "Pequenos efeitos mágicos de dádiva (tabelas do Livro).",
    match: (e) => e.categoria === "itens" && e.subcategoria === "dadivas",
  },
  {
    slug: "itens-armaduras",
    title: "Armaduras",
    description: "Tipo e bônus de armadura aleatórios.",
    match: (e) => e.categoria === "itens" && e.subcategoria === "armaduras",
  },
  {
    slug: "itens-armas",
    title: "Armas",
    description: "Arma aleatória por categoria (corpo a corpo, à distância).",
    match: (e) => e.categoria === "itens" && e.subcategoria === "armas",
  },
  {
    slug: "itens-pergaminhos",
    title: "Pergaminhos",
    description: "Magia e nível do pergaminho encontrado.",
    match: (e) => e.categoria === "itens" && e.subcategoria === "pergaminhos",
  },
  {
    slug: "itens-pocoes",
    title: "Poções",
    description: "Efeito de poção sorteada.",
    match: (e) => e.categoria === "itens" && e.subcategoria === "pocoes",
  },
  {
    slug: "itens-magicos-aleatorios",
    title: "Itens mágicos aleatórios",
    description: "Primeiro passo do sorteio de item mágico (Livro / Cursed Scroll).",
    match: (e) =>
      e.categoria === "itens" &&
      (e.subcategoria === "magicos" || e.id.includes("magicos")),
  },
  {
    slug: "lojas",
    title: "Lojas",
    description:
      "Qualidade (precária, padrão ou refinada), tipo, nome em duas partes e «conhecida por»; clientes opcionais.",
    match: (e) => e.categoria === "lojas",
  },
  {
    slug: "assentamentos",
    title: "Assentamentos",
    description:
      "Tipo (vilarejo a metrópole), distritos, alinhamento, POIs por distrito e nome opcional.",
    match: (e) => e.categoria === "assentamentos",
  },
  {
    slug: "pnjs",
    title: "PNJs",
    description: "Traços rápidos e exploradores rivais (tabelas do Livro).",
    match: (e) => e.categoria === "pnjs",
  },
  {
    slug: "rumores",
    title: "Rumores",
    description: "d100 · fala de taverna e assentamento.",
    match: (e) => e.categoria === "rumores",
  },
  {
    slug: "algo-acontece",
    title: "Algo acontece",
    description: "d100 · evento ao viajar ou no tempo livre.",
    match: (e) => e.categoria === "algo-acontece",
  },
];

export function regrasTabelaHref(tableId: string): string {
  return `/regras/tabelas#tabela-${tableId}`;
}

export function parseRegrasTabelaHash(hash: string): string | null {
  const raw = hash.replace(/^#/, "");
  if (!raw.startsWith("tabela-")) return null;
  const id = raw.slice("tabela-".length);
  return id || null;
}

export function geradorHrefForTabela(tableId: string): string | null {
  if (
    tableId === "teste-encontro" ||
    tableId.startsWith("encontro-") ||
    tableId === "distancia-inicial-encontro" ||
    tableId === "atividade-criaturas"
  ) {
    return "/geradores/encontros";
  }
  const map: Record<string, string> = {
    armadilhas: "armadilhas",
    "perigos-ambientais": "perigos",
    reacao: "reacao",
    "falha-magica-mago-1-2": "falha-magica",
    "falha-magica-mago-3-4": "falha-magica",
    "falha-magica-mago-5": "falha-magica",
    "falha-magica-diabolica-1-3": "falha-magica",
    "falha-magica-diabolica-4-5": "falha-magica",
    "xp-tesouro": "xp-tesouro",
    "solodark-oraculo": "solodark",
    "solodark-oraculo-detalhe": "solodark",
  };
  const slug = map[tableId];
  if (slug) return `/geradores/${slug}`;
  if (tableId.startsWith("falha-magica-")) return "/geradores/falha-magica";
  if (tableId.startsWith("tesouros-")) return "/geradores/tesouros";
  if (tableId.startsWith("tesouro-")) return "/geradores/tesouros";
  if (tableId === "itens-magicos-aleatorios")
    return "/geradores/itens-magicos-aleatorios";
  if (tableId.startsWith("armas-") || tableId.startsWith("itens-"))
    return "/geradores/itens-armas";
  if (tableId.startsWith("assentamento-")) return "/geradores/assentamentos";
  if (tableId.startsWith("pnj-")) return "/geradores/pnjs";
  if (tableId.startsWith("loja-")) return "/geradores/lojas";
  if (tableId.startsWith("rumor-")) return "/geradores/rumores";
  if (tableId.startsWith("algo-acontece")) return "/geradores/algo-acontece";
  return null;
}

export function modulesWithData(index: TabelaIndexEntry[]): GeradorModule[] {
  return GERADOR_MODULES.filter((mod) => {
    if (
      mod.slug === "encontros" ||
      mod.slug === "lojas" ||
      mod.slug === "assentamentos"
    ) {
      return index.some((e) => mod.match(e));
    }
    return index.some((e) => mod.match(e));
  });
}

export function tablesForModule(
  mod: GeradorModule,
  index: TabelaIndexEntry[],
): TabelaIndexEntry[] {
  return index.filter((e) => mod.match(e));
}

export { DICE_HEADER };
