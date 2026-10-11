"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import {
  getAmeacas,
  filterAmeacas,
  getAlinhamentosParaFiltro,
  labelAlinhamento,
  tipoParaListagem,
  type AmeacasData,
  type Criatura,
  type OrigemCriatura,
} from "@/lib/ameacas";
import { OrigemBadge } from "@/components/ameacas/OrigemBadge";
import { SelectField } from "@/components/ui/SelectField";
import { FilterClearButton } from "@/components/ui/FilterClearButton";
import {
  FilterPanel,
  FilterSearchInput,
  FilterGrid,
  FilterResultCount,
} from "@/components/ui/ListFilters";
import {
  SortOrderButtons,
  SORT_FIELD_NOME,
  sortFieldNv,
} from "@/components/ui/SortOrderButtons";
import type { SortOrderValue } from "@/lib/sortOrder";
import { decodeSortOrder, encodeSortOrder } from "@/lib/listFilterQuery";
import { useListFiltersInUrl } from "@/hooks/useListFiltersInUrl";
import { AmeacasPageSkeleton } from "@/components/skeletons";

const AMEACAS_FILTER_DEFAULTS = {
  q: "",
  origem: "todas",
  al: "todas",
  ord: "nome:asc",
};

const DEFAULT_SORT: SortOrderValue = { por: "nome", sentido: "asc" };

const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  padding-bottom: calc(
    ${({ theme }) => theme.bottomNavHeight} + ${({ theme }) => theme.spacing.xl}
  );
  max-width: 1000px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  margin: 0 0 ${({ theme }) => theme.spacing.xs};
`;

const Sub = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const Card = styled(Link)`
  display: block;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  text-decoration: none;
  color: inherit;
  &:hover {
    border-color: ${({ theme }) => theme.colors.borderHighlight};
  }
`;

const CardHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Meta = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

export default function AmeacasPage() {
  const [data, setData] = useState<AmeacasData | null>(null);
  const filterDefaults = useMemo(() => AMEACAS_FILTER_DEFAULTS, []);
  const { values, setField, clear, hasActive } =
    useListFiltersInUrl(filterDefaults);

  const ordenar = decodeSortOrder(values.ord, DEFAULT_SORT);

  useEffect(() => {
    getAmeacas().then(setData);
  }, []);

  if (!data) return <AmeacasPageSkeleton />;

  const alinhamentos = getAlinhamentosParaFiltro(data);
  const origem = values.origem as OrigemCriatura | "todas";
  const al = values.al;
  const list = filterAmeacas(data, {
    texto: values.q,
    origem,
    al: al === "todas" ? undefined : al,
    ordenarPor: ordenar.por as "nome" | "nv",
    ordenarSentido: ordenar.sentido,
  });
  const oficial = data.ameacas.filter((a) => a.origem === "oficial").length;
  const homebrew = data.ameacas.length - oficial;

  return (
    <Page>
      <Title>Bestiário</Title>
      <Sub>
        Oficial + homebrew · {oficial} oficial · {homebrew} homebrew
      </Sub>
      <FilterPanel aria-label="Filtros do bestiário">
        <FilterSearchInput
          type="search"
          placeholder="Buscar nome, traço, tipo…"
          value={values.q}
          onChange={(e) => setField("q", e.target.value)}
          aria-label="Buscar criaturas"
        />
        <FilterGrid $columns={2} $minWidth={400}>
          <SelectField
            id="filtro-origem-ameacas"
            label="Origem"
            value={origem}
            onChange={(v) => setField("origem", v)}
          >
            <option value="todas">Todas</option>
            <option value="oficial">Oficial</option>
            <option value="homebrew">Homebrew</option>
          </SelectField>
          <SelectField
            id="filtro-al-ameacas"
            label="Alinhamento (AL)"
            value={al}
            onChange={(v) => setField("al", v)}
          >
            <option value="todas">Todos</option>
            {alinhamentos.map((code) => (
              <option key={code} value={code}>
                {labelAlinhamento(code)}
              </option>
            ))}
          </SelectField>
        </FilterGrid>
        <SortOrderButtons
          fields={[SORT_FIELD_NOME, sortFieldNv()]}
          value={ordenar}
          onChange={(next) =>
            setField("ord", encodeSortOrder(next.por, next.sentido))
          }
          trailing={
            <FilterClearButton
              variant="aside"
              onClick={clear}
              disabled={!hasActive}
            />
          }
        />
      </FilterPanel>
      <FilterResultCount>
        {list.length === data.ameacas.length
          ? `${list.length} criaturas`
          : `${list.length} de ${data.ameacas.length} criaturas`}
      </FilterResultCount>
      {list.map((c: Criatura) => (
        <Card key={c.id} href={`/ameacas/${c.id}`}>
          <CardHead>
            <strong>{c.nome}</strong>
            <OrigemBadge origem={c.origem} />
          </CardHead>
          <Meta>
            NV {c.nv} · AL {c.al}
            {(() => {
              const tipo = tipoParaListagem(c);
              return tipo ? ` · ${tipo}` : "";
            })()}
          </Meta>
        </Card>
      ))}
    </Page>
  );
}
