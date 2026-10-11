"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { getTabelasIndex } from "@/lib/tabelas";
import {
  geradorCardsFromModules,
  matchesGeradorCard,
  modulesWithData,
  sortGeradorCards,
} from "@/lib/geradoresConfig";
import { SortOrderButtons, SORT_FIELD_NOME } from "@/components/ui/SortOrderButtons";
import type { SortOrderValue } from "@/lib/sortOrder";
import {
  FilterPanel,
  FilterSearchInput,
  FilterPanelSortRow,
  FilterResultCount,
} from "@/components/ui/ListFilters";
import { decodeSortOrder, encodeSortOrder } from "@/lib/listFilterQuery";
import { useListFiltersInUrl } from "@/hooks/useListFiltersInUrl";

const GERADORES_FILTER_DEFAULTS = { q: "", ord: "nome:asc" };
const DEFAULT_SORT: SortOrderValue = { por: "nome", sentido: "asc" };

const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 720px;
  margin: 0 auto;
  padding-bottom: calc(
    ${({ theme }) => theme.bottomNavHeight} + ${({ theme }) => theme.spacing.xl}
  );
`;

const Card = styled(Link)`
  display: block;
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  color: inherit;
  text-decoration: none;

  strong {
    display: block;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  span {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
`;

const Intro = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export default function GeradoresPage() {
  const [allCards, setAllCards] = useState(() => geradorCardsFromModules([]));
  const [loading, setLoading] = useState(true);
  const filterDefaults = useMemo(() => GERADORES_FILTER_DEFAULTS, []);
  const { values, setField } = useListFiltersInUrl(filterDefaults);
  const ordenar = decodeSortOrder(values.ord, DEFAULT_SORT);

  useEffect(() => {
    getTabelasIndex()
      .then((idx) => setAllCards(geradorCardsFromModules(modulesWithData(idx))))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = values.q;
    const list = q
      ? allCards.filter((c) => matchesGeradorCard(c, q))
      : [...allCards];
    return sortGeradorCards(list, ordenar.sentido);
  }, [allCards, values.q, ordenar.sentido]);

  return (
    <Page>
      <Title>Geradores</Title>
      <Intro>
        Ferramentas de mesa — cada rolagem usa tabelas migradas do vault. Resultados
        não são guardados.
      </Intro>
      <FilterPanel aria-label="Filtros dos geradores">
        <FilterSearchInput
          type="search"
          placeholder="Buscar gerador (nome, descrição…)"
          value={values.q}
          onChange={(e) => setField("q", e.target.value)}
          aria-label="Buscar geradores"
        />
        <FilterPanelSortRow>
          <SortOrderButtons
            fields={[SORT_FIELD_NOME]}
            value={ordenar}
            onChange={(next) =>
              setField("ord", encodeSortOrder(next.por, next.sentido))
            }
          />
        </FilterPanelSortRow>
      </FilterPanel>
      {!loading && (
        <FilterResultCount>
          {filtered.length === allCards.length
            ? `${filtered.length} geradores`
            : `${filtered.length} de ${allCards.length} geradores`}
        </FilterResultCount>
      )}
      {loading && <p>Carregando módulos…</p>}
      {!loading && filtered.length === 0 && (
        <p>Nenhum gerador encontrado.</p>
      )}
      {filtered.map((mod) => (
        <Card key={mod.slug} href={mod.href}>
          <strong>{mod.title}</strong>
          <span>{mod.description}</span>
        </Card>
      ))}
    </Page>
  );
}
