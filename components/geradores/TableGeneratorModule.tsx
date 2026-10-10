"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { getTabelaById } from "@/lib/tabelas";
import type { TabelaIndexEntry } from "@/lib/tabelas";
import { rollOnTable, effectiveRolagem, type RollTableData } from "@/lib/rollTable";
import { GeneratorLayout } from "@/components/geradores/GeneratorLayout";
import {
  GeneratorActionRow,
  GeneratorSecondaryLink,
} from "@/components/geradores/GeneratorActionRow";
import { RollResultCard } from "@/components/geradores/RollResultCard";
import { FilterChips } from "@/components/geradores/FilterChips";
import { FilterPanel, FilterGrid } from "@/components/ui/ListFilters";
import { SelectField } from "@/components/ui/SelectField";
import { regrasTabelaHref } from "@/lib/geradoresConfig";
import {
  chipLabelForTable,
  isPlaceholderRolagem,
  isFalhaMagicaModule,
  isTesourosFaixaModule,
  falhaMagicaSelectLabel,
  falhaMagicaTables,
  labelForFalhaMagica,
  labelForTesourosFaixa,
  moduleDescriptionForDisplay,
  resultCardTitle,
  rollButtonLabel,
  rollButtonAriaLabel,
  tesourosFaixaSelectLabel,
  tesourosFaixaTables,
} from "@/lib/geradoresUi";
import { RollButton } from "@/components/ui/RollButton";
import { parseDiceTokensFromRolagem } from "@/lib/diceDisplay";

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
  const tesourosFaixa = isTesourosFaixaModule(tables);
  const falhaMagica = isFalhaMagicaModule(tables);
  const displayTables = tesourosFaixa
    ? tesourosFaixaTables(tables)
    : falhaMagica
      ? falhaMagicaTables(tables)
      : tables;

  const [selectedId, setSelectedId] = useState(displayTables[0]?.id ?? "");
  const [data, setData] = useState<RollTableData | null>(null);
  const [modCar, setModCar] = useState(0);
  const [result, setResult] = useState<{
    valor: number;
    texto: string;
    detail?: string;
    faixa?: string;
    diceLabel?: string;
  } | null>(null);

  const singleTable = displayTables.length === 1;
  const layoutDescription = moduleDescriptionForDisplay(title, description);

  useEffect(() => {
    if (
      displayTables.length &&
      !displayTables.some((t) => t.id === selectedId)
    ) {
      setSelectedId(displayTables[0].id);
    }
  }, [displayTables, selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setData(null);
      return;
    }
    getTabelaById(selectedId).then(setData);
  }, [selectedId]);

  const selected = displayTables.find((t) => t.id === selectedId);
  const needsModCar =
    selected?.rolagem?.toUpperCase().includes("MOD CAR") ?? false;

  const previewRolagem =
    selected?.rolagem && !isPlaceholderRolagem(selected.rolagem)
      ? selected.rolagem
      : data?.rolagem && !isPlaceholderRolagem(data.rolagem)
        ? data.rolagem
        : undefined;

  const rolagemForUi = data ? effectiveRolagem(data) : previewRolagem;

  if (displayTables.length === 0) {
    return (
      <GeneratorLayout title={title} description={layoutDescription}>
        <p>Nenhuma tabela migrada para este módulo. Execute migrate no vault.</p>
      </GeneratorLayout>
    );
  }

  const useChips =
    !tesourosFaixa &&
    !falhaMagica &&
    displayTables.length > 1 &&
    displayTables.length <= 6;

  function optionLabel(entry: TabelaIndexEntry): string {
    if (tesourosFaixa) return labelForTesourosFaixa(entry);
    if (falhaMagica) return labelForFalhaMagica(entry);
    return chipLabelForTable(entry, title);
  }

  function selectFieldLabel(): string {
    if (tesourosFaixa) return tesourosFaixaSelectLabel(tables);
    if (falhaMagica) return falhaMagicaSelectLabel();
    return "Tabela";
  }

  function selectTable(id: string) {
    setSelectedId(id);
    setResult(null);
  }

  const rollLabel = rollButtonLabel(rolagemForUi);
  const rollAria = rolagemForUi
    ? rollButtonAriaLabel(rolagemForUi)
    : "Rolar tabela";
  const rollParsed = rolagemForUi
    ? parseDiceTokensFromRolagem(rolagemForUi)
    : null;

  return (
    <GeneratorLayout title={title} description={layoutDescription}>
      {(useChips || !singleTable) && (
        <FilterPanel aria-label="Escolher tabela">
          {useChips ? (
            <FilterChips
              options={displayTables.map((t) => ({
                id: t.id,
                label: optionLabel(t),
              }))}
              value={selectedId}
              onChange={selectTable}
            />
          ) : (
            <FilterGrid $columns={1} $minWidth={0}>
              <SelectField
                id="tabela-gerador"
                label={selectFieldLabel()}
                value={selectedId}
                onChange={selectTable}
              >
                {displayTables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {optionLabel(t)}
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
      <GeneratorActionRow>
        <RollButton
          parsed={rollParsed}
          disabled={!data}
          aria-label={rollAria}
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
            setResult({
              valor: r.valor,
              texto: r.texto,
              detail,
              faixa: r.faixa,
              diceLabel: effectiveRolagem(data),
            });
          }}
        >
          {rollLabel}
        </RollButton>
        <GeneratorSecondaryLink href={regrasTabelaHref(selectedId)}>
          Ver tabela completa
        </GeneratorSecondaryLink>
      </GeneratorActionRow>
      {result && (
        <RollResultCard
          titulo={resultCardTitle(title, singleTable, selected?.titulo)}
          diceLabel={result.diceLabel}
          valor={result.valor}
          faixa={result.faixa}
          texto={
            result.detail ? `${result.detail}\n${result.texto}` : result.texto
          }
        />
      )}
    </GeneratorLayout>
  );
}
