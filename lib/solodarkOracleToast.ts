import type { RollResult } from "@/lib/dice";
import type { RollToastContextValue } from "@/context/RollToastContext";
import {
  effectiveRolagem,
  type RollOnTableResult,
  type RollTableData,
} from "@/lib/rollTable";

export function buildOracleSuffix(
  texto: string,
  nuance?: string | null,
): string {
  const parts = [`· ${texto}`];
  if (nuance) parts.push(`— ${nuance}`);
  return parts.join(" ");
}

export function tableRollToRollResult(
  table: RollTableData,
  roll: RollOnTableResult,
): RollResult {
  const formula = effectiveRolagem(table);
  const rolls = [roll.diceTotal];
  const modifier = roll.modifier;
  const total = roll.valor;
  const modStr =
    modifier !== 0 ? (modifier >= 0 ? `+${modifier}` : String(modifier)) : "";
  const display =
    modifier !== 0
      ? `[${rolls.join(", ")}] ${modStr} = ${total}`
      : `[${rolls.join(", ")}] = ${total}`;
  return {
    formula,
    rolls,
    modifier,
    total,
    display,
  };
}

type AddRollFn = RollToastContextValue["addRoll"];

export function emitSolodarkOracleRolls(
  addRoll: AddRollFn,
  oracleTable: RollTableData,
  simNao: RollOnTableResult,
  opts?: {
    algoTable?: RollTableData;
    algoRoll?: RollOnTableResult;
    nuance?: string | null;
  },
): void {
  if (opts?.algoTable && opts.algoRoll) {
    addRoll(tableRollToRollResult(opts.algoTable, opts.algoRoll), {
      label: "Algo acontece",
      suffix: `· ${opts.algoRoll.texto}`,
    });
  }
  addRoll(tableRollToRollResult(oracleTable, simNao), {
    label: "Oráculo",
    suffix: buildOracleSuffix(simNao.texto, opts?.nuance),
  });
}
