import type { RollTableData, RollTableRow } from "./rollTable";
import {
  rowAsCells,
  rollOnTable,
  rollDie,
  rollDiceFormula,
  parseDiceFormula,
} from "./rollTable";

export const TABLE_IDS = {
  tipo: "assentamento-tipo",
  distrito: "assentamento-distrito",
  alinhamento: "assentamento-alinhamento",
  nomeExemplos: "assentamento-nome-exemplos",
} as const;

export const POI_TABLE_BY_DISTRITO: Record<string, string> = {
  Periferia: "assentamento-poi-periferia",
  "Distrito Baixo": "assentamento-poi-baixo",
  "Distrito Artesão": "assentamento-poi-artesao",
  "Distrito Comercial": "assentamento-poi-comercial",
  "Distrito Alto": "assentamento-poi-alto",
  "Distrito Religioso": "assentamento-poi-religioso",
  "Distrito Acadêmico": "assentamento-poi-academico",
  "Distrito do Castelo": "assentamento-poi-castelo",
};

export type TipoAssentamento = {
  valor: number;
  faixa: string;
  tipo: string;
  diceFormula: string;
  diceCount: number;
};

export type DistritoRolado = {
  index: number;
  valor: number;
  faixa: string;
  nome: string;
  face: number;
};

export type PoiRolado = {
  texto: string;
  valor: number;
  faixa?: string;
  linkHref: string | null;
  linkLabel: string | null;
};

export type DistritoCompleto = DistritoRolado & {
  alinhamento?: string;
  pois: PoiRolado[];
};

export type AssentamentoGerado = {
  tipo: TipoAssentamento;
  nome?: string;
  alinhamentoGeral?: string;
  distritos: DistritoCompleto[];
  governoIndex: number;
};

export function parseDicePool(formula: string): {
  diceFormula: string;
  diceCount: number;
} {
  const parsed = parseDiceFormula(formula.trim());
  if (!parsed) {
    return { diceFormula: formula, diceCount: 1 };
  }
  const m = parsed.match(/^(\d+)d(\d+)$/i);
  const diceCount = m ? parseInt(m[1], 10) : 1;
  return { diceFormula: parsed, diceCount };
}

export function parseTipoFromRow(
  row: RollTableRow,
  rollValor: number,
  faixa?: string,
): TipoAssentamento {
  const cells = rowAsCells(row);
  const tipo = (cells[1] ?? cells[0] ?? "").trim();
  const poolCell = (cells[2] ?? "").trim();
  const { diceFormula, diceCount } = parseDicePool(poolCell);
  return {
    valor: rollValor,
    faixa: faixa ?? cells[0] ?? String(rollValor),
    tipo,
    diceFormula,
    diceCount,
  };
}

export function rollTipoAssentamento(tipoTable: RollTableData): TipoAssentamento {
  const r = rollOnTable(tipoTable);
  const row = tipoTable.rows[r.linha];
  if (!row) {
    return {
      valor: r.valor,
      faixa: r.faixa ?? String(r.valor),
      tipo: r.texto,
      diceFormula: "d4",
      diceCount: 1,
    };
  }
  return parseTipoFromRow(row, r.valor, r.faixa);
}

export function poiTableIdForDistrito(nomeDistrito: string): string | null {
  return POI_TABLE_BY_DISTRITO[nomeDistrito] ?? null;
}

export function pickGovernmentIndex(distritos: DistritoRolado[]): number {
  if (!distritos.length) return -1;
  let best = 0;
  for (let i = 1; i < distritos.length; i++) {
    if (distritos[i].face > distritos[best].face) best = i;
  }
  return best;
}

export function poiDeepLink(texto: string): {
  href: string | null;
  label: string | null;
} {
  const t = texto.toLowerCase();
  if (/loja\s+precária/.test(t)) {
    return { href: "/geradores/lojas", label: "Gerar loja (precária)" };
  }
  if (/loja\s+padrão/.test(t)) {
    return { href: "/geradores/lojas", label: "Gerar loja (padrão)" };
  }
  if (/loja\s+refinada/.test(t)) {
    return { href: "/geradores/lojas", label: "Gerar loja (refinada)" };
  }
  if (/taverna\s+precária|taverna\s+padrão|taverna\s+refinada/.test(t)) {
    return {
      href: "/regras/tabelas#tabela-taverna-nome",
      label: "Tabelas de tavernas (Livro)",
    };
  }
  return { href: null, label: null };
}

export function rollDistritos(
  count: number,
  distritoTable: RollTableData,
): DistritoRolado[] {
  const out: DistritoRolado[] = [];
  for (let i = 0; i < count; i++) {
    const r = rollOnTable(distritoTable);
    const row = distritoTable.rows[r.linha];
    const cells = row ? rowAsCells(row) : [];
    const nome = (cells[1] ?? r.texto).trim();
    const face = rollDie("d8");
    out.push({
      index: i,
      valor: r.valor,
      faixa: r.faixa ?? String(r.valor),
      nome,
      face,
    });
  }
  return out;
}

export function rollPoiOnTable(poiTable: RollTableData): PoiRolado {
  const r = rollOnTable(poiTable);
  const { href, label } = poiDeepLink(r.texto);
  return {
    texto: r.texto,
    valor: r.valor,
    faixa: r.faixa ?? String(r.valor),
    linkHref: href,
    linkLabel: label,
  };
}

export function formatNomeExemploFromRow(
  row: RollTableRow,
  pick: number,
): string {
  const cells = rowAsCells(row);
  const idx = Math.min(Math.max(1, pick), 3);
  return (cells[idx] ?? cells[1] ?? "").trim();
}

export function rollNomeExemplo(nomeTable: RollTableData): string {
  const r = rollOnTable(nomeTable);
  const row = nomeTable.rows[r.linha];
  if (!row) return r.texto;
  const pick = rollDie("d4");
  const chosen = formatNomeExemploFromRow(row, pick <= 3 ? pick : 3);
  return chosen || r.texto;
}

export type GerarAssentamentoOptions = {
  alinhamentoPorDistrito: boolean;
  incluirNome: boolean;
  nomeUsarSilabas?: boolean;
};

export type GerarAssentamentoInput = {
  tipoTable: RollTableData;
  distritoTable: RollTableData;
  alinhamentoTable: RollTableData;
  nomeTable?: RollTableData | null;
  poiTables: Record<string, RollTableData>;
};

/** Uma rolagem de POI por distrito (Livro: 1d4 POIs — role mais vezes na mesa). */
export function gerarAssentamento(
  input: GerarAssentamentoInput,
  options: GerarAssentamentoOptions,
): AssentamentoGerado {
  const tipo = rollTipoAssentamento(input.tipoTable);
  const distritosBase = rollDistritos(tipo.diceCount, input.distritoTable);
  const governoIndex = pickGovernmentIndex(distritosBase);

  let alinhamentoGeral: string | undefined;
  if (!options.alinhamentoPorDistrito) {
    alinhamentoGeral = rollOnTable(input.alinhamentoTable).texto;
  }

  const distritos: DistritoCompleto[] = distritosBase.map((d) => {
    const poiId = poiTableIdForDistrito(d.nome);
    const poiTable = poiId ? input.poiTables[poiId] : undefined;
    const pois: PoiRolado[] = poiTable ? [rollPoiOnTable(poiTable)] : [];
    const alinhamento = options.alinhamentoPorDistrito
      ? rollOnTable(input.alinhamentoTable).texto
      : undefined;
    return { ...d, alinhamento, pois };
  });

  let nome: string | undefined;
  if (options.incluirNome && input.nomeTable) {
    nome = rollNomeExemplo(input.nomeTable);
  }

  return {
    tipo,
    nome,
    alinhamentoGeral,
    distritos,
    governoIndex,
  };
}

/** Soma faces de um pool físico (ex. 3d4) — útil para exibir no card de tipo. */
export function rollPhysicalPool(formula: string): number {
  return rollDiceFormula(formula);
}
