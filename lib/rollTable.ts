export type RollTableLine = {
  min: number;
  max: number;
  texto: string;
  creatureSlug?: string;
};

export type RollTableData = {
  id: string;
  titulo: string;
  categoria: string;
  rolagem: string;
  headers: string[];
  rows: string[][];
};

export type RollOnTableOptions = {
  /** Soma ao total de dados (ex. MOD CAR em 2d6 + MOD CAR). */
  modifier?: number;
};

export type RollOnTableResult = {
  valor: number;
  diceTotal: number;
  modifier: number;
  texto: string;
  linha: number;
};

const DICE_RE = /(\d*)d(\d+)/i;

/** Extrai a primeira expressão NdM de uma string de rolagem. */
export function parseDiceFormula(rolagem: string): string | null {
  const m = rolagem.match(DICE_RE);
  if (!m) return null;
  const count = m[1] ? parseInt(m[1], 10) : 1;
  return `${count}d${m[2]}`;
}

export function rollDiceFormula(formula: string): number {
  const parsed = parseDiceFormula(formula);
  if (!parsed) {
    throw new Error(`Fórmula de dados inválida: ${formula}`);
  }
  const m = parsed.match(/^(\d+)d(\d+)$/i);
  if (!m) throw new Error(`Fórmula de dados inválida: ${formula}`);
  const count = parseInt(m[1], 10);
  const sides = parseInt(m[2], 10);
  let sum = 0;
  for (let i = 0; i < count; i++) {
    sum += Math.floor(Math.random() * sides) + 1;
  }
  return sum;
}

function normalizeDash(s: string): string {
  return s.replace(/\u2013|\u2014/g, "-").trim();
}

/** Converte célula de faixa (01, 40-41, 12+, 00) em min/max. */
export function parseRangeCell(cell: string): { min: number; max: number } | null {
  const raw = normalizeDash(cell);
  if (!raw) return null;

  if (/^\d{2}$/.test(raw) && raw === "00") {
    return { min: 100, max: 100 };
  }

  const plus = raw.match(/^(\d+)\+$/);
  if (plus) {
    const min = parseInt(plus[1], 10);
    return { min, max: 9999 };
  }

  const range = raw.match(/^(\d+)\s*-\s*(\d+)$/);
  if (range) {
    return {
      min: parseInt(range[1], 10),
      max: parseInt(range[2], 10),
    };
  }

  const single = raw.match(/^(\d+)$/);
  if (single) {
    const n = parseInt(single[1], 10);
    return { min: n, max: n };
  }

  return null;
}

function firstColumnLooksLikeRanges(rows: string[][]): boolean {
  return rows.some((row) => parseRangeCell(row[0] ?? "") !== null);
}

export function findRowIndexForValue(
  rows: string[][],
  value: number,
): number {
  if (!rows.length) return 0;

  if (firstColumnLooksLikeRanges(rows)) {
    for (let i = 0; i < rows.length; i++) {
      const range = parseRangeCell(rows[i][0] ?? "");
      if (range && value >= range.min && value <= range.max) return i;
    }
    return rows.length - 1;
  }

  const idx = Math.min(Math.max(0, value - 1), rows.length - 1);
  return idx;
}

/** Infere d100 quando faixas percentis; senão usa cabeçalho ou NdM explícito. */
export function inferRolagemFromTable(
  headers: string[],
  rows: string[][],
  explicit?: string,
): string {
  if (explicit && parseDiceFormula(explicit)) return parseDiceFormula(explicit)!;

  const h = headers.join(" ").toLowerCase();
  if (h.includes("d100") || h.includes("1d100")) return "d100";

  let maxInCol = 0;
  let hasDoubleDigitRange = false;
  let has00 = false;
  for (const row of rows) {
    const range = parseRangeCell(row[0] ?? "");
    if (!range) continue;
    maxInCol = Math.max(maxInCol, range.max);
    if (range.min >= 20 || range.max >= 20) hasDoubleDigitRange = true;
    if (row[0]?.trim() === "00") has00 = true;
  }
  if (has00 || maxInCol > 20 || hasDoubleDigitRange) return "d100";

  if (/d20/i.test(h)) return "d20";
  if (/d12/i.test(h)) return "d12";
  if (/d8/i.test(h)) return "d8";
  if (/d6/i.test(h)) return "d6";
  if (/d4/i.test(h)) return "d4";

  const rowCount = rows.length;
  if (rowCount === 4) return "d4";
  if (rowCount <= 6) return "d6";
  if (rowCount <= 8) return "d8";
  if (rowCount <= 12) return "d12";
  return "d20";
}

export function effectiveRolagem(table: RollTableData): string {
  const fromMeta = parseDiceFormula(table.rolagem);
  if (fromMeta) return fromMeta;
  return inferRolagemFromTable(table.headers, table.rows, table.rolagem);
}

export function rollOnTable(
  table: RollTableData,
  options?: RollOnTableOptions,
): RollOnTableResult {
  const formula = effectiveRolagem(table);
  const diceTotal = rollDiceFormula(formula);
  const modifier = options?.modifier ?? 0;
  const valor = diceTotal + modifier;
  const linha = findRowIndexForValue(table.rows, valor);
  const row = table.rows[linha] ?? [];
  const texto = row.slice(1).join(" — ") || row.join(" — ") || String(valor);
  return { valor, diceTotal, modifier, texto, linha };
}

/** Compat: rolagem livre só com fórmula NdM. */
export function rollDie(formula: string): number {
  return rollDiceFormula(formula);
}
