"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import {
  getAntecedentes,
  groupAntecedentesPorLista,
  type AntecedenteEntrada,
} from "@/lib/antecedentes";
import {
  antecedenteLinhaTitulo,
  antecedenteListaFiltroLabel,
  catalogoFonteBadgeLabel,
  fonteLabel,
  sortAntecedentesPorNumero,
  sortCatalogoPersonagem,
} from "@/lib/catalogoPersonagem";
import {
  FilterPanel,
  FilterSearchInput,
  FilterGrid,
  FilterResultCount,
} from "@/components/ui/ListFilters";
import { FilterClearButton } from "@/components/ui/FilterClearButton";
import { SelectField } from "@/components/ui/SelectField";
import {
  SortOrderButtons,
  SORT_FIELD_NOME,
  SORT_FIELD_NUMERO_DADO,
} from "@/components/ui/SortOrderButtons";
import type { SortOrderValue } from "@/lib/sortOrder";
import { decodeSortOrder, encodeSortOrder } from "@/lib/listFilterQuery";
import { useListFiltersInUrl } from "@/hooks/useListFiltersInUrl";
import { PageContainer } from "@/components/layout/PageContainer";

const BackLink = styled(Link)`
  display: inline-flex;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-decoration: none;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: 600;
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
`;

const Intro = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  line-height: 1.5;
`;

const Section = styled.section`
  margin: 0 0 ${({ theme }) => theme.spacing.xl};
`;

const SectionHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.xs};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: 600;
  margin: 0;
`;

const FonteBadge = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const EntryList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Entry = styled.li`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.5;
`;

const EntryName = styled.span`
  display: block;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const EntryDesc = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
`;

const FILTER_DEFAULTS = { q: "", fonte: "", lista: "", ord: "numero:asc" };
const DEFAULT_SORT: SortOrderValue = { por: "numero", sentido: "asc" };

function matchesFilters(e: AntecedenteEntrada, q: string, fonte: string, lista: string) {
  if (fonte && e.fonte !== fonte) return false;
  if (lista && e.lista !== lista) return false;
  if (!q) return true;
  const hay = `${e.nome} ${e.descricao} ${e.lista}`.toLowerCase();
  return hay.includes(q);
}

export function AntecedentesPage() {
  const [entradas, setEntradas] = useState<AntecedenteEntrada[] | null>(null);
  const filterDefaults = useMemo(() => FILTER_DEFAULTS, []);
  const { values, setField, clear, hasActive } = useListFiltersInUrl(filterDefaults);
  const ordenar = decodeSortOrder(values.ord, DEFAULT_SORT);

  useEffect(() => {
    getAntecedentes().then(setEntradas);
  }, []);

  const filtered = useMemo(() => {
    if (!entradas) return [];
    const q = values.q.trim().toLowerCase();
    return entradas.filter((e) =>
      matchesFilters(e, q, values.fonte, values.lista),
    );
  }, [entradas, values.q, values.fonte, values.lista]);

  const sections = useMemo(() => {
    const grouped = groupAntecedentesPorLista(filtered);
    return grouped.map(({ lista, entradas: grupo }) => {
      let sorted = grupo;
      if (ordenar.por === "nome") {
        sorted = sortCatalogoPersonagem(grupo, ordenar.sentido);
      } else if (ordenar.por === "numero") {
        sorted = sortAntecedentesPorNumero(grupo, ordenar.sentido);
      }
      return { lista, entradas: sorted };
    });
  }, [filtered, ordenar.por, ordenar.sentido]);

  const fontes = useMemo(() => {
    if (!entradas) return [];
    return [...new Set(entradas.map((e) => e.fonte).filter(Boolean))].sort();
  }, [entradas]);

  const listas = useMemo(() => {
    if (!entradas) return [];
    return [...new Set(entradas.map((e) => e.lista).filter(Boolean))].sort(
      (a, b) => a.localeCompare(b, "pt-BR"),
    );
  }, [entradas]);

  if (!entradas) {
    return (
      <PageContainer>
        <BackLink href="/regras">← Regras</BackLink>
        <Title>Antecedentes</Title>
        <p>Carregando…</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BackLink href="/regras">← Regras</BackLink>
      <Title>Antecedentes</Title>
      <Intro>
        O conhecimento e as habilidades do passado podem ser úteis nas aventuras.
        Converse com o MJ para saber se o antecedente garante Vantagem em
        situações específicas.
      </Intro>
      <FilterPanel aria-label="Filtros de antecedentes">
        <FilterSearchInput
          type="search"
          placeholder="Buscar por nome ou texto…"
          value={values.q}
          onChange={(e) => setField("q", e.target.value)}
          aria-label="Buscar antecedentes"
        />
        <FilterGrid $columns={2} $minWidth={140}>
          {fontes.length > 1 ? (
            <SelectField
              id="filtro-fonte-antecedentes"
              label="Fonte"
              value={values.fonte}
              onChange={(v) => setField("fonte", v)}
            >
              <option value="">Todas</option>
              {fontes.map((f) => (
                <option key={f} value={f}>
                  {fonteLabel(f) ?? f}
                </option>
              ))}
            </SelectField>
          ) : null}
          {listas.length > 1 ? (
            <SelectField
              id="filtro-lista-antecedentes"
              label="Lista"
              value={values.lista}
              onChange={(v) => setField("lista", v)}
            >
              <option value="">Todas</option>
              {listas.map((l) => (
                <option key={l} value={l}>
                  {antecedenteListaFiltroLabel(l)}
                </option>
              ))}
            </SelectField>
          ) : null}
        </FilterGrid>
        <SortOrderButtons
          fields={[SORT_FIELD_NUMERO_DADO, SORT_FIELD_NOME]}
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
        {filtered.length === entradas.length
          ? `${filtered.length} entradas`
          : `${filtered.length} de ${entradas.length} entradas`}
      </FilterResultCount>
      {sections.length === 0 ? (
        <p>Nenhum resultado encontrado.</p>
      ) : (
        sections.map(({ lista, entradas: grupo }) => {
          const ref = grupo[0];
          const fonteBadge = ref ? catalogoFonteBadgeLabel(ref) : null;
          return (
            <Section key={lista} aria-labelledby={`sec-${lista}`}>
              <SectionHead>
                <SectionTitle id={`sec-${lista}`}>
                  {antecedenteListaFiltroLabel(lista)}
                </SectionTitle>
                {fonteBadge ? (
                  <FonteBadge>{fonteBadge}</FonteBadge>
                ) : null}
              </SectionHead>
              <EntryList>
                {grupo.map((e) => (
                  <Entry key={e.id}>
                    <EntryName>{antecedenteLinhaTitulo(e)}</EntryName>
                    {e.descricao ? <EntryDesc>{e.descricao}</EntryDesc> : null}
                  </Entry>
                ))}
              </EntryList>
            </Section>
          );
        })
      )}
    </PageContainer>
  );
}
