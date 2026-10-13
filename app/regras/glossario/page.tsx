"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { getEscudo, sortGlossary } from "@/lib/escudo";
import type { EscudoData, GlossaryItem } from "@/lib/escudo";
import { SortOrderButtons, SORT_FIELD_NOME } from "@/components/ui/SortOrderButtons";
import type { SortOrderValue } from "@/lib/sortOrder";
import MarkdownContent from "@/components/ui/MarkdownContent";
import InlineBold from "@/components/ui/InlineBold";
import { RegrasGlossarioSkeleton } from "@/components/skeletons";
import {
  FilterPanel,
  FilterSearchInput,
  FilterPanelSortRow,
  FilterResultCount,
} from "@/components/ui/ListFilters";
import { decodeSortOrder, encodeSortOrder } from "@/lib/listFilterQuery";
import { useListFiltersInUrl } from "@/hooks/useListFiltersInUrl";
import { PageContainer } from "@/components/layout/PageContainer";


const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: 600;
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Item = styled.div`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
`;

const Term = styled.strong`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.primary};
`;

const FullName = styled.span`
  margin-left: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const DescWrap = styled.div`
  margin: ${({ theme }) => theme.spacing.xs} 0 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.5;

  p {
    margin: 0;
  }
`;

const GLOSSARIO_FILTER_DEFAULTS = { q: "", ord: "nome:asc" };
const DEFAULT_SORT: SortOrderValue = { por: "nome", sentido: "asc" };

export default function GlossarioPage() {
  const [data, setData] = useState<EscudoData | null>(null);
  const [loading, setLoading] = useState(true);
  const filterDefaults = useMemo(() => GLOSSARIO_FILTER_DEFAULTS, []);
  const { values, setField } = useListFiltersInUrl(filterDefaults);
  const ordenar = decodeSortOrder(values.ord, DEFAULT_SORT);

  useEffect(() => {
    getEscudo()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <RegrasGlossarioSkeleton />;

  const glossary = data.glossary ?? [];
  const q = values.q.trim().toLowerCase();
  const filtered = sortGlossary(
    q
      ? glossary.filter(
          (g) =>
            g.term.toLowerCase().includes(q) ||
            g.fullName.toLowerCase().includes(q) ||
            g.description.toLowerCase().includes(q),
        )
      : [...glossary],
    ordenar.sentido,
  );

  return (
    <PageContainer>
      <BackLink href="/regras">← Regras</BackLink>
      <Title>Glossário</Title>
      <FilterPanel aria-label="Filtros do glossário">
        <FilterSearchInput
          type="search"
          placeholder="Buscar termo (ex.: AGI, PD, DT…)"
          value={values.q}
          onChange={(e) => setField("q", e.target.value)}
          aria-label="Buscar no glossário"
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
        {filtered.length === glossary.length
          ? `${filtered.length} termos`
          : `${filtered.length} de ${glossary.length} termos`}
      </FilterResultCount>
      <List>
        {filtered.length === 0 ? (
          <p>Nenhum termo encontrado.</p>
        ) : (
          filtered.map((g: GlossaryItem) => (
            <Item key={g.term}>
              <Term>
                <InlineBold>{g.term}</InlineBold>
              </Term>
              <FullName>
                {g.fullName != null && g.fullName !== "" ? (
                  <>
                    — <InlineBold>{g.fullName}</InlineBold>
                  </>
                ) : null}
              </FullName>
              {g.description && (
                <DescWrap>
                  <MarkdownContent>{g.description}</MarkdownContent>
                </DescWrap>
              )}
            </Item>
          ))
        )}
      </List>
    </PageContainer>
  );
}
