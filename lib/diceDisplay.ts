import { parseFormula, isAllowedDiceSides } from "@/lib/dice";
import { parseDiceFormula } from "@/lib/rollTable";

export type DiceToken = {
  count: number;
  sides: number;
};

export type ParsedRollFormula = {
  tokens: DiceToken[];
  modifier: number;
};

const FORMULA_CHUNK_RE = /(-?\d*)d(\d+)([+-]\d+)?/gi;

export function parseDiceTokensFromRolagem(rolagem: string): ParsedRollFormula | null {
  const trimmed = rolagem.trim();
  const base = trimmed.replace(/\s*\+\s*MOD\s+\w+/gi, "").trim();
  const single = parseDiceFormula(base);
  if (!single) return null;
  const parsed = parseFormula(single);
  if (!parsed) return null;
  return {
    tokens: [{ count: Math.abs(parsed.count), sides: parsed.sides }],
    modifier: 0,
  };
}

export function parseDiceTokensFromFormula(formula: string): ParsedRollFormula | null {
  const trimmed = formula.trim().replace(/\s/g, "");
  const tokens: DiceToken[] = [];
  let modifier = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(FORMULA_CHUNK_RE.source, "gi");
  while ((match = re.exec(trimmed)) !== null) {
    const countRaw = match[1];
    const count =
      countRaw === "" || countRaw === undefined ? 1 : parseInt(countRaw, 10);
    const sides = parseInt(match[2], 10);
    if (!isAllowedDiceSides(sides) || count === 0 || Math.abs(count) > 100) {
      continue;
    }
    tokens.push({ count: Math.abs(count), sides });
    if (match[3]) {
      modifier += parseInt(match[3], 10);
    }
  }
  const tail = trimmed.replace(FORMULA_CHUNK_RE, "");
  const tailMod = tail.match(/^[+-]\d+$/);
  if (tailMod) modifier += parseInt(tailMod[0], 10);
  if (!tokens.length) return null;
  return { tokens, modifier };
}

const SIDES_LABEL: Record<number, string> = {
  3: "três faces",
  4: "quatro faces",
  6: "seis faces",
  8: "oito faces",
  10: "dez faces",
  12: "doze faces",
  20: "vinte faces",
  100: "cem faces",
};

function tokenAriaLabel(token: DiceToken): string {
  const label = SIDES_LABEL[token.sides] ?? `${token.sides} faces`;
  if (token.count === 1) return `um dado de ${label}`;
  return `${token.count} dados de ${label}`;
}

export function ariaLabelForRoll(source: string, kind: "rolagem" | "formula"): string {
  const parsed =
    kind === "rolagem"
      ? parseDiceTokensFromRolagem(source)
      : parseDiceTokensFromFormula(source);
  if (!parsed || !parsed.tokens.length) return "Rolar dados";
  const parts = parsed.tokens.map(tokenAriaLabel);
  let label = `Rolar ${parts.join(" e ")}`;
  if (parsed.modifier > 0) label += ` mais ${parsed.modifier}`;
  if (parsed.modifier < 0) label += ` menos ${Math.abs(parsed.modifier)}`;
  return label;
}

export function diceIconSides(sides: number): number {
  return isAllowedDiceSides(sides) ? sides : 20;
}
