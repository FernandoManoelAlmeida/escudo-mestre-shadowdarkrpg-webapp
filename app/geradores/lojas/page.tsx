"use client";

import { GeradoresRouteGate } from "@/components/copyright/GeradoresRouteGate";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { getTabelaById } from "@/lib/tabelas";
import {
  rollOnTable,
  effectiveRolagem,
  rollDie,
  type RollTableData,
} from "@/lib/rollTable";
import {
  LOJA_QUALIDADE_TABLE_IDS,
  LOJA_NOME_TABLE_ID,
  LOJA_CLIENTES_TABLE_ID,
  formatLojaNomeFromRow,
  formatLojaClienteFromRow,
  type LojaQualidade,
} from "@/lib/lojasGenerator";
import { regrasTabelaHref } from "@/lib/geradoresConfig";
import { GeneratorLayout } from "@/components/geradores/GeneratorLayout";
import {
  GeneratorActionRow,
  GeneratorSecondaryLink,
} from "@/components/geradores/GeneratorActionRow";
import { RollResultCard } from "@/components/geradores/RollResultCard";
import { FilterClearButton } from "@/components/ui/FilterClearButton";
import {
  FilterPanel,
  FilterGrid,
  FilterPanelClearRow,
} from "@/components/ui/ListFilters";
import { useListFiltersInUrl } from "@/hooks/useListFiltersInUrl";
import { SelectField } from "@/components/ui/SelectField";

const Btn = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.rollButton};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  min-height: 44px;
`;

const Section = styled.section`
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const StepTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
`;

const Hint = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.45;
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
`;

const InlineLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
`;

const CheckRow = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: ${({ theme }) => theme.spacing.sm} 0;
  cursor: pointer;
`;

type StepResult = {
  label: string;
  valor: number;
  texto: string;
  faixa?: string;
  diceLabel?: string;
};

const QUALIDADE_LABELS: Record<LojaQualidade, string> = {
  precaria: "Precária",
  padrao: "Padrão",
  refinada: "Refinada",
};

const LOJAS_FILTER_DEFAULTS = { qualidade: "padrao", clientes: "0" };

export default function LojasPage() {
  const filterDefaults = useMemo(() => LOJAS_FILTER_DEFAULTS, []);
  const { values, setField, clear, hasActive } = useListFiltersInUrl(
    filterDefaults,
    { debouncedKeys: [] },
  );
  const qualidade = values.qualidade as LojaQualidade;
  const incluirClientes = values.clientes === "1";
  const [tipoTable, setTipoTable] = useState<RollTableData | null>(null);
  const [nomeTable, setNomeTable] = useState<RollTableData | null>(null);
  const [clientesTable, setClientesTable] = useState<RollTableData | null>(null);
  const [steps, setSteps] = useState<StepResult[]>([]);

  const tipoId = LOJA_QUALIDADE_TABLE_IDS[qualidade];

  useEffect(() => {
    getTabelaById(tipoId).then(setTipoTable);
  }, [tipoId]);

  useEffect(() => {
    getTabelaById(LOJA_NOME_TABLE_ID).then(setNomeTable);
    getTabelaById(LOJA_CLIENTES_TABLE_ID).then(setClientesTable);
  }, []);

  function runRoll() {
    if (!tipoTable || !nomeTable) return;
    const next: StepResult[] = [];

    const tipoRoll = rollOnTable(tipoTable);
    next.push({
      label: "Tipo de loja",
      valor: tipoRoll.valor,
      texto: tipoRoll.texto,
      faixa: tipoRoll.faixa,
      diceLabel: effectiveRolagem(tipoTable),
    });

    const nomeRoll = rollOnTable(nomeTable);
    const nomeRow = nomeTable.rows[nomeRoll.linha];
    const { nome, conhecidaPor } = nomeRow
      ? formatLojaNomeFromRow(nomeRow)
      : { nome: nomeRoll.texto, conhecidaPor: "" };
    const nomeTexto = conhecidaPor
      ? `${nome} — Conhecida por: ${conhecidaPor}`
      : nome;
    next.push({
      label: "Nome",
      valor: nomeRoll.valor,
      texto: nomeTexto,
      faixa: nomeRoll.faixa,
      diceLabel: effectiveRolagem(nomeTable),
    });

    if (incluirClientes && clientesTable) {
      const linhaRoll = rollOnTable(clientesTable);
      const clienteRow = clientesTable.rows[linhaRoll.linha];
      const pick = rollDie("d4");
      const cliente =
        clienteRow
          ? formatLojaClienteFromRow(clienteRow, pick)
          : linhaRoll.texto;
      next.push({
        label: "Cliente interessante",
        valor: pick,
        texto: cliente,
        faixa: `${linhaRoll.faixa} · opção ${pick}`,
        diceLabel: `${effectiveRolagem(clientesTable)} + d4`,
      });
    }

    setSteps(next);
  }

  return (
    <GeradoresRouteGate>
    <GeneratorLayout
      title="Lojas"
      description="Escolha a qualidade do estabelecimento, role o tipo e o nome (duas partes + «conhecida por»). Clientes opcionais: d4 na linha e d4 na opção."
    >
      <Section>
        <StepTitle>Qualidade</StepTitle>
        <Hint>
          Precária, padrão ou refinada conforme o Livro.{" "}
          <InlineLink href={regrasTabelaHref(LOJA_NOME_TABLE_ID)}>
            Tabela de nomes
          </InlineLink>
          .
        </Hint>
        <FilterPanel aria-label="Qualidade da loja">
          <FilterGrid $columns={1} $minWidth={0}>
            <SelectField
              id="loja-qualidade"
              label="Qualidade"
              value={qualidade}
              onChange={(v) => setField("qualidade", v)}
            >
              {(Object.keys(QUALIDADE_LABELS) as LojaQualidade[]).map((q) => (
                <option key={q} value={q}>
                  {QUALIDADE_LABELS[q]}
                </option>
              ))}
            </SelectField>
          </FilterGrid>
          <CheckRow>
            <input
              type="checkbox"
              checked={incluirClientes}
              onChange={(e) =>
                setField("clientes", e.target.checked ? "1" : "0")
              }
            />
            Incluir cliente interessante (d4 + d4)
          </CheckRow>
          <FilterPanelClearRow>
            <FilterClearButton onClick={clear} disabled={!hasActive} />
          </FilterPanelClearRow>
        </FilterPanel>
        <GeneratorActionRow>
          <Btn
            type="button"
            disabled={!tipoTable || !nomeTable}
            onClick={() => runRoll()}
          >
            Rolar loja
          </Btn>
          <GeneratorSecondaryLink href={regrasTabelaHref(tipoId)}>
            Ver tabela do tipo
          </GeneratorSecondaryLink>
        </GeneratorActionRow>
      </Section>

      {steps.map((s, i) => (
        <RollResultCard
          key={i}
          titulo={s.label}
          diceLabel={s.diceLabel}
          valor={s.valor}
          faixa={s.faixa}
          texto={s.texto}
        />
      ))}
    </GeneratorLayout>
  
    </GeradoresRouteGate>
  );
}
