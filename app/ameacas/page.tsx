"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import {
  getAmeacas,
  filterAmeacas,
  tipoParaListagem,
  type AmeacasData,
  type Criatura,
  type OrigemCriatura,
} from "@/lib/ameacas";
import { OrigemBadge } from "@/components/ameacas/OrigemBadge";
import { SelectField } from "@/components/ui/SelectField";
import {
  FilterPanel,
  FilterSearchInput,
  FilterSortRow,
  FilterResultCount,
} from "@/components/ui/ListFilters";
import {
  SortOrderButtons,
  SORT_FIELD_NOME,
  sortFieldNv,
} from "@/components/ui/SortOrderButtons";
import type { SortOrderValue } from "@/lib/sortOrder";
import { AmeacasPageSkeleton } from "@/components/skeletons";

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
  const [texto, setTexto] = useState("");
  const [origem, setOrigem] = useState<OrigemCriatura | "todas">("todas");
  const [ordenar, setOrdenar] = useState<SortOrderValue>({
    por: "nome",
    sentido: "asc",
  });

  useEffect(() => {
    getAmeacas().then(setData);
  }, []);

  if (!data) return <AmeacasPageSkeleton />;

  const list = filterAmeacas(data, {
    texto,
    origem,
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
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          aria-label="Buscar criaturas"
        />
        <FilterSortRow>
          <SortOrderButtons
            fields={[SORT_FIELD_NOME, sortFieldNv()]}
            value={ordenar}
            onChange={setOrdenar}
          />
          <SelectField
            id="filtro-origem-ameacas"
            label="Origem"
            value={origem}
            onChange={(v) => setOrigem(v as OrigemCriatura | "todas")}
          >
            <option value="todas">Todas</option>
            <option value="oficial">Oficial</option>
            <option value="homebrew">Homebrew</option>
          </SelectField>
        </FilterSortRow>
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
