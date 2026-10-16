"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { CatalogoPersonagemFicha } from "@/components/regras/CatalogoPersonagemFicha";
import { HistoryBackLink } from "@/components/ui/HistoryBackLink";
import {
  FilterPanel,
  FilterSearchInput,
  FilterGrid,
  FilterPanelSortRow,
  FilterResultCount,
} from "@/components/ui/ListFilters";
import { SelectField } from "@/components/ui/SelectField";
import { SortOrderButtons, SORT_FIELD_NOME } from "@/components/ui/SortOrderButtons";
import type { SortOrderValue } from "@/lib/sortOrder";
import { decodeSortOrder, encodeSortOrder } from "@/lib/listFilterQuery";
import { useListFiltersInUrl } from "@/hooks/useListFiltersInUrl";
import {
  ancestralidadeDisplayNome,
  classeDetailSubtitle,
  classeListBadge,
  classeListTitle,
  fonteLabel,
  sortCatalogoClasse,
  sortCatalogoPersonagem,
  type CatalogoPersonagemEntrada,
} from "@/lib/catalogoPersonagem";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  grimorioLinkLabelForClasse,
  grimorioPathForClasse,
} from "@/lib/classeGrimorio";


const BackLink = styled(HistoryBackLink)`
  display: inline-flex;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-decoration: none;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  margin: 0 0 ${({ theme }) => theme.spacing.md};
`;

const DetailSubtitle = styled.p`
  margin: -${({ theme }) => theme.spacing.sm} 0 ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const GrimorioLink = styled(Link)`
  display: inline-block;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
    text-decoration: underline;
  }
`;

const Row = styled(Link)`
  display: block;
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const RowTitle = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

const Badge = styled.span`
  display: inline-block;
  margin-left: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const FILTER_DEFAULTS = { q: "", ord: "nome:asc", fonte: "" };
const DEFAULT_SORT: SortOrderValue = { por: "nome", sentido: "asc" };

type CatalogKind = "ancestralidade" | "classe";

type Props = {
  title: string;
  basePath: string;
  load: () => Promise<CatalogoPersonagemEntrada[]>;
  catalogKind?: CatalogKind;
};

export function CatalogoPersonagemListPage({
  title,
  basePath,
  load,
  catalogKind = "ancestralidade",
}: Props) {
  const [entradas, setEntradas] = useState<CatalogoPersonagemEntrada[] | null>(null);
  const filterDefaults = useMemo(() => FILTER_DEFAULTS, []);
  const { values, setField } = useListFiltersInUrl(filterDefaults);
  const ordenar = decodeSortOrder(values.ord, DEFAULT_SORT);

  useEffect(() => {
    load().then(setEntradas);
  }, [load]);

  const fontes = useMemo(() => {
    if (!entradas) return [];
    return [...new Set(entradas.map((e) => e.fonte).filter(Boolean))].sort();
  }, [entradas]);

  const filtered = useMemo(() => {
    if (!entradas) return [];
    const q = values.q.trim().toLowerCase();
    let list = entradas;
    if (values.fonte) {
      list = list.filter((e) => e.fonte === values.fonte);
    }
    if (q) {
      list = list.filter(
        (e) =>
          e.nome.toLowerCase().includes(q) ||
          e.descricao.toLowerCase().includes(q),
      );
    }
    return catalogKind === "classe"
      ? sortCatalogoClasse(list, ordenar.sentido)
      : sortCatalogoPersonagem(list, ordenar.sentido);
  }, [entradas, values.q, values.fonte, ordenar.sentido, catalogKind]);

  if (!entradas) {
    return (
      <PageContainer>
        <BackLink href="/regras">← Regras</BackLink>
        <Title>{title}</Title>
        <p>Carregando…</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BackLink href="/regras">← Regras</BackLink>
      <Title>{title}</Title>
      <FilterPanel aria-label={`Filtros de ${title.toLowerCase()}`}>
        <FilterSearchInput
          type="search"
          placeholder="Buscar por nome ou texto…"
          value={values.q}
          onChange={(e) => setField("q", e.target.value)}
          aria-label={`Buscar ${title.toLowerCase()}`}
        />
        {fontes.length > 1 ? (
          <FilterGrid $columns={1} $minWidth={0}>
            <SelectField
              id="filtro-fonte-catalogo-personagem"
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
          </FilterGrid>
        ) : null}
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
        {filtered.length === entradas.length
          ? `${filtered.length} entradas`
          : `${filtered.length} de ${entradas.length} entradas`}
      </FilterResultCount>
      {filtered.map((e) => {
        const rowTitle =
          catalogKind === "classe"
            ? classeListTitle(e)
            : ancestralidadeDisplayNome(e.nome);
        const badge =
          catalogKind === "classe" ? classeListBadge(e) : fonteLabel(e.fonte);
        return (
          <Row key={e.id} href={`${basePath}/${e.id}`}>
            <RowTitle>{rowTitle}</RowTitle>
            {badge ? <Badge>{badge}</Badge> : null}
          </Row>
        );
      })}
    </PageContainer>
  );
}


type DetailProps = {
  title: string;
  listPath: string;
  entrada: CatalogoPersonagemEntrada | null;
  loading: boolean;
  catalogKind?: CatalogKind;
};

export function CatalogoPersonagemDetail({
  title,
  listPath,
  entrada,
  loading,
  catalogKind = "ancestralidade",
}: DetailProps) {
  if (loading) {
    return (
      <PageContainer>
        <BackLink href={listPath}>← {title}</BackLink>
        <p>Carregando…</p>
      </PageContainer>
    );
  }
  if (!entrada) {
    return (
      <PageContainer>
        <BackLink href={listPath}>← {title}</BackLink>
        <p>Entrada não encontrada.</p>
      </PageContainer>
    );
  }
  const subtitle =
    catalogKind === "classe" ? classeDetailSubtitle(entrada) : null;
  const grimorioPath =
    catalogKind === "classe" ? grimorioPathForClasse(entrada.id) : null;
  const grimorioLabel =
    catalogKind === "classe" ? grimorioLinkLabelForClasse(entrada.id) : null;

  return (
    <PageContainer>
      <BackLink href={listPath}>← {title}</BackLink>
      <Title>
        {catalogKind === "ancestralidade"
          ? ancestralidadeDisplayNome(entrada.nome)
          : entrada.nome}
      </Title>
      {subtitle ? <DetailSubtitle>{subtitle}</DetailSubtitle> : null}
      {grimorioPath && grimorioLabel ? (
        <GrimorioLink href={grimorioPath}>{grimorioLabel} →</GrimorioLink>
      ) : null}
      <CatalogoPersonagemFicha
        descricao={entrada.descricao}
        descricaoKind={catalogKind}
      />
    </PageContainer>
  );
}
