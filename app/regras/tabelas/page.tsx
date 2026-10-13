"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { getEscudo } from "@/lib/escudo";
import type { EscudoData } from "@/lib/escudo";
import {
  ensureTabelaIndexEntry,
  getTabelasIndex,
  getTabelaById,
  matchesEscudoTableKey,
  matchesTabelaIndexEntry,
  sortEscudoTableKeys,
  sortTabelaIndexEntries,
  formatTabelaTituloExibicao,
  escudoTableDisplayName,
} from "@/lib/tabelas";
import type { TabelaIndexEntry } from "@/lib/tabelas";
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
import { rowAsCells, type RollTableData } from "@/lib/rollTable";
import { ResponsiveTable } from "@/components/ui/ResponsiveTable";
import { Accordion } from "@/components/ui/Accordion";
import { RegrasTabelasSkeleton } from "@/components/skeletons";
import {
  geradorHrefForTabela,
  parseRegrasTabelaHash,
} from "@/lib/geradoresConfig";
import { scrollToTabelaElement } from "@/lib/scrollToTabelaHash";
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
  margin: 0 0 ${({ theme }) => theme.spacing.lg};
`;

const TableBlock = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  scroll-margin-top: 4rem;
`;

const Meta = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
`;

const GridTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};

  th,
  td {
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: ${({ theme }) => theme.spacing.sm};
    text-align: left;
  }

  th {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const TABELAS_FILTER_DEFAULTS = { q: "", ord: "nome:asc" };
const DEFAULT_SORT: SortOrderValue = { por: "nome", sentido: "asc" };

const GeradorLink = styled(Link)`
  display: inline-block;
  margin-top: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
`;

function MarkdownTableView({ table, entryId }: { table: RollTableData; entryId: string }) {
  const gerador = geradorHrefForTabela(entryId);
  return (
    <>
      <GridTable>
        <thead>
          <tr>
            {table.headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i}>
              {rowAsCells(row).map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </GridTable>
      {gerador && (
        <GeradorLink href={gerador}>Rolar na mesa →</GeradorLink>
      )}
    </>
  );
}

function TabelaMigradaBlock({
  entry,
  openFromHash,
}: {
  entry: TabelaIndexEntry;
  openFromHash: boolean;
}) {
  const [table, setTable] = useState<RollTableData | null>(null);

  useEffect(() => {
    getTabelaById(entry.id).then(setTable);
  }, [entry.id]);

  useEffect(() => {
    if (!openFromHash || !table) return;
    return scrollToTabelaElement(entry.id, { behavior: "auto" });
  }, [openFromHash, table, entry.id]);

  if (!table) return null;

  return (
    <TableBlock id={`tabela-${entry.id}`}>
      <Accordion
        id={`tabela-${entry.id}`}
        title={formatTabelaTituloExibicao(entry.titulo)}
        defaultOpen={openFromHash}
      >
        <Meta>
          {entry.categoria}
          {entry.subcategoria ? ` · ${entry.subcategoria}` : ""} · rolagem:{" "}
          {entry.rolagem}
        </Meta>
        <MarkdownTableView table={table} entryId={entry.id} />
      </Accordion>
    </TableBlock>
  );
}

export default function TabelasPage() {
  const [escudo, setEscudo] = useState<EscudoData | null>(null);
  const [index, setIndex] = useState<TabelaIndexEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hashTableId, setHashTableId] = useState<string | null>(null);
  const filterDefaults = useMemo(() => TABELAS_FILTER_DEFAULTS, []);
  const { values, setField } = useListFiltersInUrl(filterDefaults);
  const ordenar = decodeSortOrder(values.ord, DEFAULT_SORT);

  const syncHash = useCallback(() => {
    setHashTableId(parseRegrasTabelaHash(window.location.hash));
  }, []);

  useEffect(() => {
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [syncHash]);

  useEffect(() => {
    Promise.all([getEscudo(), getTabelasIndex()])
      .then(([e, idx]) => {
        setEscudo(e);
        setIndex(idx);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || !hashTableId) return;
    const behavior =
      typeof window !== "undefined" && window.location.hash
        ? "auto"
        : "smooth";
    return scrollToTabelaElement(hashTableId, { behavior });
  }, [loading, hashTableId]);

  const filteredIndex = useMemo(() => {
    const q = values.q;
    let list = q
      ? index.filter((e) => matchesTabelaIndexEntry(e, q))
      : [...index];
    list = ensureTabelaIndexEntry(list, index, hashTableId);
    return sortTabelaIndexEntries(list, ordenar.sentido);
  }, [index, values.q, hashTableId, ordenar.sentido]);

  const filteredEscudoKeys = useMemo(() => {
    const keys = escudo?.tables ? Object.keys(escudo.tables) : [];
    const q = values.q;
    let list = q
      ? keys.filter((key) => matchesEscudoTableKey(key, q))
      : [...keys];
    if (hashTableId?.startsWith("escudo-")) {
      const escKey = hashTableId.slice("escudo-".length);
      if (escKey && !list.includes(escKey)) list = [...list, escKey];
    }
    return sortEscudoTableKeys(list, ordenar.sentido);
  }, [escudo, values.q, hashTableId, ordenar.sentido]);

  if (loading || !escudo) return <RegrasTabelasSkeleton />;

  const totalCount = index.length + (escudo.tables ? Object.keys(escudo.tables).length : 0);
  const visibleCount = filteredIndex.length + filteredEscudoKeys.length;

  return (
    <PageContainer>
      <BackLink href="/regras">← Regras</BackLink>
      <Title>Tabelas</Title>
      <Meta>Consulta integral — rolagem apenas em Geradores.</Meta>

      <FilterPanel aria-label="Filtros das tabelas">
        <FilterSearchInput
          type="search"
          placeholder="Buscar tabela (título, categoria, rolagem…)"
          value={values.q}
          onChange={(e) => setField("q", e.target.value)}
          aria-label="Buscar nas tabelas"
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
        {visibleCount === totalCount
          ? `${visibleCount} tabelas`
          : `${visibleCount} de ${totalCount} tabelas`}
      </FilterResultCount>

      {filteredIndex.length > 0 && (
        <>
          <Meta>Tabelas de mesa (conteúdo integral do vault)</Meta>
          {filteredIndex.map((entry) => (
            <TabelaMigradaBlock
              key={entry.id}
              entry={entry}
              openFromHash={entry.id === hashTableId}
            />
          ))}
        </>
      )}

      {filteredEscudoKeys.length > 0 && (
        <>
          <Meta style={{ marginTop: "1.5rem" }}>Tabelas no compêndio</Meta>
          {filteredEscudoKeys.map((key) => {
            const table = escudo.tables[key];
            if (!table) return null;
            return (
              <TableBlock key={key} id={`tabela-escudo-${key}`}>
                <Accordion
                  id={`tabela-escudo-${key}`}
                  title={formatTabelaTituloExibicao(escudoTableDisplayName(key))}
                >
                  <ResponsiveTable table={table} />
                </Accordion>
              </TableBlock>
            );
          })}
        </>
      )}

      {totalCount === 0 && <p>Nenhuma tabela disponível.</p>}
      {totalCount > 0 && visibleCount === 0 && (
        <p>Nenhuma tabela encontrada.</p>
      )}
    </PageContainer>
  );
}
