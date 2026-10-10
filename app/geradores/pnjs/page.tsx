"use client";

import { useCallback, useState } from "react";
import styled from "styled-components";
import { GeneratorLayout } from "@/components/geradores/GeneratorLayout";
import { RollResultCard } from "@/components/geradores/RollResultCard";
import { getTabelaById } from "@/lib/tabelas";
import {
  rollOnTable,
  rowAsCells,
  type RollTableData,
  type RollTableRow,
} from "@/lib/rollTable";

const Tabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

const Tab = styled.button<{ $active?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: 999px;
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.borderHighlight : theme.colors.border};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceHover : theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  min-height: 44px;
`;

const Btn = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.rollButton};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  min-height: 44px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ANCESTRY_COLUMN: Record<string, number> = {
  Humano: 5,
  Elfo: 2,
  Anão: 1,
  Halfling: 4,
  "Meio-orc": 6,
  Goblin: 3,
};

async function loadTable(id: string): Promise<RollTableData | null> {
  return getTabelaById(id);
}

function cellFromRow(row: RollTableRow, col: number): string {
  const cells = rowAsCells(row);
  return cells[col] ?? cells[cells.length - 1] ?? "";
}

export default function GeradorPnjsPage() {
  const [tab, setTab] = useState<"pnj" | "rivais">("pnj");
  const [ficha, setFicha] = useState<string | null>(null);
  const [rivais, setRivais] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const gerarPnj = useCallback(async () => {
    setLoading(true);
    try {
      const [
        anc,
        idade,
        riqueza,
        carac,
        nomes,
        ocup,
      ] = await Promise.all([
        loadTable("pnj-ancestralidade"),
        loadTable("pnj-idade"),
        loadTable("pnj-riqueza"),
        loadTable("pnj-caracteristicas"),
        loadTable("pnj-nome-ancestralidade"),
        loadTable("pnj-ocupacao"),
      ]);
      if (!anc || !idade || !riqueza || !carac || !nomes || !ocup) {
        setFicha("Tabelas PNJ ausentes. Execute migrate no vault.");
        return;
      }
      const rAnc = rollOnTable(anc);
      const ancestralidade =
        rAnc.texto.split("—").pop()?.trim() || rAnc.texto;
      const col = ANCESTRY_COLUMN[ancestralidade] ?? 5;

      const rNome = rollOnTable(nomes);
      const nomeRow = nomes.rows[rNome.linha];
      const nome = nomeRow ? cellFromRow(nomeRow, col) : rNome.texto;

      const rIdade = rollOnTable(idade);
      const rRiq = rollOnTable(riqueza);
      const rCar = rollOnTable(carac);
      const carCells = rowAsCells(carac.rows[rCar.linha] ?? []);

      const rOcp = rollOnTable(ocup);
      const ocpRow = ocup.rows[rOcp.linha];
      const ocupacao = ocpRow ? cellFromRow(ocpRow, col) : rOcp.texto;

      setFicha(
        [
          `Nome: ${nome}`,
          `Ancestralidade: ${ancestralidade}`,
          `Idade: ${rIdade.texto}`,
          `Riqueza: ${rRiq.texto}`,
          `Ocupação: ${ocupacao}`,
          `Aparência: ${carCells[1] ?? ""}`,
          `Trejeito: ${carCells[2] ?? ""}`,
          `Segredo: ${carCells[3] ?? ""}`,
        ].join("\n"),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const gerarRivais = useCallback(async () => {
    setLoading(true);
    try {
      const [nivel, renome, segredo] = await Promise.all([
        loadTable("rival-nivel"),
        loadTable("rival-renome"),
        loadTable("rival-segredo"),
      ]);
      if (!nivel || !renome || !segredo) {
        setRivais("Tabelas de rivais ausentes. Execute migrate.");
        return;
      }
      const rN = rollOnTable(nivel);
      const rR = rollOnTable(renome);
      const rS = rollOnTable(segredo);
      setRivais(
        [
          `Nível inicial (cada membro): ${rN.texto}`,
          `Renome: ${rR.texto}`,
          `Segredo do grupo: ${rS.texto}`,
          "Monte o grupo com 1d4+1 exploradores do mesmo alinhamento (livro).",
        ].join("\n"),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <GeneratorLayout
      title="PNJs"
      description="Mini-ficha rápida e exploradores rivais (Livro de Regras)."
    >
      <Tabs>
        <Tab type="button" $active={tab === "pnj"} onClick={() => setTab("pnj")}>
          PNJ rápido
        </Tab>
        <Tab
          type="button"
          $active={tab === "rivais"}
          onClick={() => setTab("rivais")}
        >
          Exploradores rivais
        </Tab>
      </Tabs>
      {tab === "pnj" ? (
        <>
          <Btn type="button" disabled={loading} onClick={() => gerarPnj()}>
            Gerar PNJ
          </Btn>
          {ficha && (
            <RollResultCard titulo="Mini-ficha" texto={ficha} />
          )}
        </>
      ) : (
        <>
          <Btn type="button" disabled={loading} onClick={() => gerarRivais()}>
            Gerar grupo rival
          </Btn>
          {rivais && <RollResultCard titulo="Exploradores rivais" texto={rivais} />}
        </>
      )}
    </GeneratorLayout>
  );
}
