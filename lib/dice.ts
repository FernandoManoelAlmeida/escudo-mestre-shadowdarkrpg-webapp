/**
 * Parser de fórmula de dados: 3d20+15, 4d8+8, 2d6, d20, -2d20 (negativo = usar o menor)
 * Regex: (-?\d*)d(\d+)([+-]\d+)?
 */
const DICE_REGEX = /^(-?\d*)d(\d+)([+-]\d+)?$/i;

/** Conjunto de dados permitidos no jogo: d3, d4, d6, d8, d10, d12, d20, d100 */
export const ALLOWED_DICE_SIDES = [3, 4, 6, 8, 10, 12, 20, 100] as const;

export function isAllowedDiceSides(sides: number): boolean {
  return (ALLOWED_DICE_SIDES as readonly number[]).includes(sides);
}

export type RollResult = {
  formula: string;
  rolls: number[];
  modifier: number;
  total: number;
  display: string;
  /** Valor do d20 usado quando é "melhor de" ou "pior de" (para destacar no toaster) */
  chosenD20?: number;
  /** Texto entre os dados e o total (ex.: "use o pior") */
  displayHint?: string;
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function parseFormula(
  formula: string,
): { count: number; sides: number; modifier: number } | null {
  const trimmed = formula.trim().replace(/\s/g, "");
  const match = trimmed.match(DICE_REGEX);
  if (!match) return null;
  const countRaw = match[1];
  const count =
    countRaw === "" || countRaw === undefined ? 1 : parseInt(countRaw, 10);
  const sides = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;
  if (Number.isNaN(count) || count === 0 || Math.abs(count) > 100) return null;
  if (sides < 1 || sides > 1000) return null;
  if (count < 0 && sides !== 20) return null;
  return { count, sides, modifier };
}

export function rollDice(
  count: number,
  sides: number,
  modifier: number,
): RollResult {
  const actualCount = Math.abs(count);
  const rolls: number[] = [];
  for (let i = 0; i < actualCount; i++) {
    rolls.push(randomInt(1, sides));
  }
  const modStr = modifier >= 0 ? `+${modifier}` : String(modifier);
  const useBestD20 = sides === 20 && count > 1;
  const useWorstD20 = sides === 20 && count < -1;
  const total = useBestD20
    ? Math.max(...rolls) + modifier
    : useWorstD20
      ? Math.min(...rolls) + modifier
      : rolls.reduce((a, b) => a + b, 0) + modifier;
  const chosenD20 = useBestD20
    ? Math.max(...rolls)
    : useWorstD20
      ? Math.min(...rolls)
      : undefined;
  const displayHint = useWorstD20 ? "use o pior" : undefined;
  const display = useBestD20
    ? modifier !== 0
      ? `[${rolls.join(", ")}]  ${modStr} = ${total}`
      : `[${rolls.join(", ")}]  = ${total}`
    : useWorstD20
      ? modifier !== 0
        ? `[${rolls.join(", ")}] use o pior ${modStr} = ${total}`
        : `[${rolls.join(", ")}] use o pior = ${total}`
      : modifier !== 0
        ? `[${rolls.join(", ")}] ${modStr} = ${total}`
        : `[${rolls.join(", ")}] = ${total}`;
  return {
    formula: `${count}d${sides}${modStr}`,
    rolls,
    modifier,
    total,
    display,
    chosenD20,
    displayHint,
  };
}

/** Extrai a primeira fórmula de dados em um texto (ex.: "4d8 mental" -> "4d8", "4d8+8 perfuração" -> "4d8+8") */
const DICE_FORMULA_IN_TEXT = /\d*d\d+([+-]\d+)?/gi;
export function extractDiceFormula(text: string): string | null {
  const match = text.trim().match(DICE_FORMULA_IN_TEXT);
  if (!match || !match[0]) return null;
  const formula = match[0];
  return parseFormula(formula) ? formula : null;
}

/** Retorna todas as fórmulas de dados válidas no texto, sem repetir (ex.: "DT 20 e 1d6+1 mental" -> ["1d6+1"]) */
export function extractAllDiceFormulas(text: string): string[] {
  if (!text || !text.trim()) return [];
  const matches = text.trim().match(/\d*d\d+([+-]\d+)?/gi);
  if (!matches) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of matches) {
    const formula = m;
    if (parseFormula(formula) && !seen.has(formula.toLowerCase())) {
      seen.add(formula.toLowerCase());
      out.push(formula);
    }
  }
  return out;
}

export function rollFormula(formula: string): RollResult | null {
  const parsed = parseFormula(formula);
  if (!parsed) return null;
  return rollDice(parsed.count, parsed.sides, parsed.modifier);
}

/** Teste Shadowdark: d20 + modificador (opcional CD para sucesso no toaster). */
export function rollTesteShadowdark(
  modificador: number,
  cd?: number,
): RollResult & { cd?: number; success?: boolean } {
  const r = rollDice(1, 20, modificador);
  const success = cd != null ? r.total >= cd : undefined;
  return { ...r, cd, success };
}

