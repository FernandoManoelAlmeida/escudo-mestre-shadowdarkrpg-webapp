"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { getTabelaById } from "@/lib/tabelas";
import type { TabelaIndexEntry } from "@/lib/tabelas";
import { rollOnTable, type RollTableData } from "@/lib/rollTable";
import { GeneratorLayout } from "@/components/geradores/GeneratorLayout";
import { RollResultCard } from "@/components/geradores/RollResultCard";
import { FilterChips } from "@/components/geradores/FilterChips";
import { FilterPanel, FilterGrid } from "@/components/ui/ListFilters";
import { SelectField } from "@/components/ui/SelectField";
import { regrasTabelaHref } from "@/lib/geradoresConfig";
import {
  chipLabelForTable,
  isPlaceholderRolagem,
  moduleDescriptionForDisplay,
  resultCardTitle,
  rollButtonLabel,
} from "@/lib/geradoresUi";

const Btn = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.rollButton};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  min-height: 44px;
`;

const Hint = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: ${({ theme }) => theme.spacing.sm} 0;
`;

const ModInput = styled.input`
  width: 4rem;
  margin-left: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xs};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 6px;
  min-height: 44px;
`;

const RefLink = styled(Link)`
  display: inline-block;
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
`;

type TableGeneratorModuleProps = {
  title: string;
  description?: string;
  tables: TabelaIndexEntry[];
};

export function TableGeneratorModule({
  title,
  description,
  tables,
}: TableGeneratorModuleProps) {
  const [selectedId, setSelectedId] = useState(tables[0]?.id ?? "");
  const [data, setData] = useState<RollTableData | null>(null);
  const [modCar, setModCar] = useState(0);
  const [result, setResult] = useState<{
    valor: number;
    texto: string;
    detail?: string;
  } | null>(null);

  const singleTable = tables.length === 1;
  const layoutDescription = moduleDescriptionForDisplay(title, description);

  useEffect(() => {
    if (tables.length && !tables.some((t) => t.id === selectedId)) {
      setSelectedId(tables[0].id);
    }
  }, [tables, selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setData(null);
      return;
    }
    getTabelaById(selectedId).then(setData);
  }, [selectedId]);

  const selected = tables.find((t) => t.id === selectedId);
  const needsModCar =
    selected?.rolagem?.toUpperCase().includes("MOD CAR") ?? false;

  const effectiveRolagem =
    selected?.rolagem && !isPlaceholderRolagem(selected.rolagem)
      ? selected.rolagem
      : data?.rolagem && !isPlaceholderRolagem(data.rolagem)
        ? data.rolagem
        : undefined;

  if (tables.length === 0) {
    return (
      <GeneratorLayout title={title} description={layoutDescription}>
        <p>Nenhuma tabela migrada para este módulo. Execute migrate no vault.</p>
      </GeneratorLayout>
    );
  }

  const useChips = tables.length > 1 && tables.length <= 6;

  function selectTable(id: string) {
    setSelectedId(id);
    setResult(null);
  }

  const rollLabel = effectiveRolagem ? rollButtonLabel(effectiveRolagem) : "Rolar";

  return (
    <GeneratorLayout title={title} description={layoutDescription}>
      {(useChips || !singleTable) && (
        <FilterPanel aria-label="Escolher tabela">
          {useChips ? (
            <FilterChips
              options={tables.map((t) => ({
                id: t.id,
                label: chipLabelForTable(t, title),
              }))}
              value={selectedId}
              onChange={selectTable}
            />
          ) : (
            <FilterGrid $columns={1} $minWidth={0}>
              <SelectField
                id="tabela-gerador"
                label="Tabela"
                value={selectedId}
                onChange={selectTable}
              >
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {chipLabelForTable(t, title)}
                  </option>
                ))}
              </SelectField>
            </FilterGrid>
          )}
        </FilterPanel>
      )}
      {needsModCar && (
        <Hint>
          MOD CAR
          <ModInput
            type="number"
            aria-label="MOD CAR"
            value={modCar}
            onChange={(e) => setModCar(parseInt(e.target.value, 10) || 0)}
          />
        </Hint>
      )}
      <Btn
        type="button"
        disabled={!data}
        onClick={() => {
          if (!data) return;
          const r = rollOnTable(data, {
            modifier: needsModCar ? modCar : 0,
          });
          const detail =
            r.modifier !== 0
              ? `Dados: ${r.diceTotal} + MOD ${r.modifier} = ${r.valor}`
              : r.diceTotal !== r.valor
                ? `Dados: ${r.diceTotal}`
                : undefined;
          setResult({ valor: r.valor, texto: r.texto, detail });
        }}
      >
        {rollLabel}
      </Btn>
      <RefLink href={regrasTabelaHref(selectedId)}>Ver tabela completa</RefLink>
      {result && (
        <RollResultCard
          titulo={resultCardTitle(title, selected?.titulo, singleTable)}
          valor={result.valor}
          texto={
            result.detail ? `${result.detail}\n${result.texto}` : result.texto
          }
        />
      )}
    </GeneratorLayout>
  );
}
