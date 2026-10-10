import type { RollTableRow } from "./rollTable";
import { rowAsCells } from "./rollTable";

export const LOJA_QUALIDADE_TABLE_IDS = {
  precaria: "loja-precaria",
  padrao: "loja-padrao",
  refinada: "loja-refinada",
} as const;

export type LojaQualidade = keyof typeof LOJA_QUALIDADE_TABLE_IDS;

export const LOJA_NOME_TABLE_ID = "loja-nome-conhecida";
export const LOJA_CLIENTES_TABLE_ID = "loja-clientes-interessantes";

/** Nome completo + traço «conhecida por» a partir da linha d20 (4 células). */
export function formatLojaNomeFromRow(row: RollTableRow): {
  nome: string;
  conhecidaPor: string;
} {
  const cells = rowAsCells(row);
  const parte1 = (cells[1] ?? "").trim();
  const parte2 = (cells[2] ?? "").trim();
  const nome = [parte1, parte2].filter(Boolean).join(" ");
  const conhecidaPor = (cells[3] ?? "").trim();
  return { nome, conhecidaPor };
}

/** Escolhe uma das quatro opções da linha (pick 1–4). */
export function formatLojaClienteFromRow(
  row: RollTableRow,
  pick: number,
): string {
  const cells = rowAsCells(row);
  const idx = Math.min(Math.max(1, pick), 4);
  return (cells[idx] ?? "").trim();
}
