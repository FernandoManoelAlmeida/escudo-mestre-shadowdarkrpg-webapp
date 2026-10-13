"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { getTabelaById } from "@/lib/tabelas";
import { rollOnTable, type RollTableData } from "@/lib/rollTable";
import { regrasTabelaHref } from "@/lib/geradoresConfig";
import { D20RollButton } from "@/components/ui/D20RollButton";
import { useRollToast } from "@/context/RollToastContext";
import { emitSolodarkOracleRolls } from "@/lib/solodarkOracleToast";

const Card = styled.section`
  margin: ${({ theme }) => theme.spacing.lg} 0;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.borderHighlight};
  border-radius: ${({ theme }) => theme.borderRadius};
  background: ${({ theme }) => theme.colors.surface};
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

const Hint = styled.p`
  margin: ${({ theme }) => theme.spacing.xs} 0 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.45;
`;

const LinksRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const TableLink = styled(Link)`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
`;

const ORACLE_ID = "solodark-oraculo";
const ALGO_ID = "algo-acontece";

function solodarkNuanceHint(valor: number): string | null {
  if (valor === 10) return null;
  if (valor === 1 || valor === 20) {
    return "Resultado extremo — interprete a versão mais intensa do Não ou do Sim.";
  }
  if (valor % 2 === 1 && valor >= 11 && valor <= 19) {
    return "Adicione um «mas» que altere o desfecho sem negar a resposta.";
  }
  return null;
}

export function SolodarkOracleWidget() {
  const [oracleTable, setOracleTable] = useState<RollTableData | null>(null);
  const [algoTable, setAlgoTable] = useState<RollTableData | null>(null);
  const { addRoll } = useRollToast();

  useEffect(() => {
    getTabelaById(ORACLE_ID).then(setOracleTable);
    getTabelaById(ALGO_ID).then(setAlgoTable);
  }, []);

  function roll() {
    if (!oracleTable) return;
    const simNao = rollOnTable(oracleTable);
    let algoRoll;
    if (simNao.valor === 10 && algoTable) {
      algoRoll = rollOnTable(algoTable);
    }
    const nuance = solodarkNuanceHint(simNao.valor);
    emitSolodarkOracleRolls(addRoll, oracleTable, simNao, {
      algoTable: algoRoll ? algoTable : undefined,
      algoRoll,
      nuance,
    });
  }

  const ready = Boolean(oracleTable);

  return (
    <Card aria-labelledby="solodark-oracle-title">
      <HeaderRow>
        <div>
          <Title id="solodark-oracle-title">Oráculo (d20)</Title>
          <Hint>
            SoloDark: 1–9 Não · 10 Reviravolta (algo acontece) · 11–20 Sim. Em
            ímpares (11–19), acrescente um «mas». Máximo de três perguntas por
            situação.
          </Hint>
        </div>
        <D20RollButton
          type="button"
          aria-label="Rolar oráculo"
          disabled={!ready}
          onClick={() => roll()}
        />
      </HeaderRow>

      <LinksRow>
        <TableLink href={regrasTabelaHref(ORACLE_ID)}>
          Tabela sim/não →
        </TableLink>
        <TableLink href={regrasTabelaHref(ALGO_ID)}>
          Algo acontece →
        </TableLink>
      </LinksRow>
    </Card>
  );
}
