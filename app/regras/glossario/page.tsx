"use client";

import { useEffect, useState } from "react";
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
  FilterResultCount,
} from "@/components/ui/ListFilters";

const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 1000px;
  margin: 0 auto;
  padding-bottom: calc(
    ${({ theme }) => theme.bottomNavHeight} + ${({ theme }) => theme.spacing.xl}
  );
`;

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

export default function GlossarioPage() {
  const [data, setData] = useState<EscudoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [ordenar, setOrdenar] = useState<SortOrderValue>({
    por: "nome",
    sentido: "asc",
  });

  useEffect(() => {
    getEscudo()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <RegrasGlossarioSkeleton />;

  const glossary = data.glossary ?? [];
  const q = query.trim().toLowerCase();
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
    <Page>
      <BackLink href="/regras">← Regras</BackLink>
      <Title>Glossário</Title>
      <FilterPanel aria-label="Filtros do glossário">
        <FilterSearchInput
          type="search"
          placeholder="Buscar termo (ex.: AGI, PD, DT…)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar no glossário"
        />
        <SortOrderButtons
          fields={[SORT_FIELD_NOME]}
          value={ordenar}
          onChange={setOrdenar}
        />
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
    </Page>
  );
}
