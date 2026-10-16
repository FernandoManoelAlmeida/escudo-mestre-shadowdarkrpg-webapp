"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { HistoryBackLink } from "@/components/ui/HistoryBackLink";
import { MarkdownBody } from "@/components/catalogo/MarkdownBody";
import {
  FilterPanel,
  FilterSearchInput,
  FilterPanelSortRow,
  FilterResultCount,
} from "@/components/ui/ListFilters";
import { SortOrderButtons, SORT_FIELD_NOME } from "@/components/ui/SortOrderButtons";
import type { SortOrderValue } from "@/lib/sortOrder";
import { sortCatalogoItens } from "@/lib/itensMagicos";
import { keepItemMagicoForCopyrightFree } from "@/lib/copyrightFreeFilter";
import { decodeSortOrder, encodeSortOrder } from "@/lib/listFilterQuery";
import { useListFiltersInUrl } from "@/hooks/useListFiltersInUrl";
import { PageContainer } from "@/components/layout/PageContainer";
import { areGeradoresEnabled } from "@/lib/copyrightFreeRoutes";

const ITENS_FILTER_DEFAULTS = { q: "", ord: "nome:asc" };
const DEFAULT_SORT: SortOrderValue = { por: "nome", sentido: "asc" };


const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  margin: ${({ theme }) => theme.spacing.sm} 0;
`;

const Item = styled.article`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
`;

type ItemEntry = { nome: string; descricao: string; origem?: string };

type Catalogo = { itens: ItemEntry[] };

export default function ArcanosItensPage() {
  const [data, setData] = useState<Catalogo | null>(null);
  const filterDefaults = useMemo(() => ITENS_FILTER_DEFAULTS, []);
  const { values, setField } = useListFiltersInUrl(filterDefaults);
  const ordenar = decodeSortOrder(values.ord, DEFAULT_SORT);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
    fetch(`${base}/data/catalogo/itens-magicos.json`)
      .then((r) => r.json())
      .then(setData);
  }, []);

  const filtered = useMemo(() => {
    if (!data?.itens) return [];
    const allowed = data.itens.filter((it) =>
      keepItemMagicoForCopyrightFree(it),
    );
    const q = values.q.trim().toLowerCase();
    const list = q
      ? allowed.filter(
          (it) =>
            it.nome.toLowerCase().includes(q) ||
            it.descricao.toLowerCase().includes(q),
        )
      : [...allowed];
    return sortCatalogoItens(list, ordenar.sentido);
  }, [data, values.q, ordenar.sentido]);

  return (
    <PageContainer>
      <p>
        <HistoryBackLink href="/arcanos">← Arcanos</HistoryBackLink>
      </p>
      <Title>Itens mágicos</Title>
      {areGeradoresEnabled() && (
        <p>
          <Link href="/geradores/itens-magicos-aleatorios">
            Sortear item mágico aleatório →
          </Link>
        </p>
      )}
      <FilterPanel aria-label="Filtros de itens mágicos">
        <FilterSearchInput
          type="search"
          placeholder="Buscar por nome ou texto…"
          value={values.q}
          onChange={(e) => setField("q", e.target.value)}
          aria-label="Buscar itens mágicos"
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
      <FilterResultCount>
        {data?.itens && filtered.length === data.itens.length
          ? `${filtered.length} itens`
          : `${filtered.length} de ${data?.itens?.length ?? 0} itens`}
      </FilterResultCount>
      {filtered.map((it) => (
        <Item key={it.nome}>
          <h2>{it.nome}</h2>
          {it.origem && it.origem !== "livro" ? (
            <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>{it.origem}</p>
          ) : null}
          <MarkdownBody>{it.descricao}</MarkdownBody>
        </Item>
      ))}
    </PageContainer>
  );
}
