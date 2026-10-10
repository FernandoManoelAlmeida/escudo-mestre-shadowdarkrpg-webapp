"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { getEscudo } from "@/lib/escudo";
import type { EscudoData } from "@/lib/escudo";
import { getTabelasIndex, getTabelaById } from "@/lib/tabelas";
import type { TabelaIndexEntry } from "@/lib/tabelas";
import type { RollTableData } from "@/lib/rollTable";
import { ResponsiveTable } from "@/components/ui/ResponsiveTable";
import { Accordion } from "@/components/ui/Accordion";
import { RegrasTabelasSkeleton } from "@/components/skeletons";
import {
  geradorHrefForTabela,
  parseRegrasTabelaHash,
} from "@/lib/geradoresConfig";
import { scrollToTabelaElement } from "@/lib/scrollToTabelaHash";

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
              {row.map((cell, j) => (
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
        title={entry.titulo}
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

  if (loading || !escudo) return <RegrasTabelasSkeleton />;

  const escudoTables = escudo.tables ? Object.entries(escudo.tables) : [];

  return (
    <Page>
      <BackLink href="/regras">← Regras</BackLink>
      <Title>Tabelas</Title>
      <Meta>Consulta integral — rolagem apenas em Geradores.</Meta>

      {index.length > 0 && (
        <>
          <Meta>Tabelas de mesa (conteúdo integral do vault)</Meta>
          {index.map((entry) => (
            <TabelaMigradaBlock
              key={entry.id}
              entry={entry}
              openFromHash={entry.id === hashTableId}
            />
          ))}
        </>
      )}

      {escudoTables.length > 0 && (
        <>
          <Meta style={{ marginTop: "1.5rem" }}>Tabelas no compêndio</Meta>
          {escudoTables.map(([key, table]) => (
            <TableBlock key={key} id={`tabela-escudo-${key}`}>
              <Accordion id={`tabela-escudo-${key}`} title={key.replace(/_/g, " ")}>
                <ResponsiveTable table={table} />
              </Accordion>
            </TableBlock>
          ))}
        </>
      )}

      {index.length === 0 && escudoTables.length === 0 && (
        <p>Nenhuma tabela disponível.</p>
      )}
    </Page>
  );
}
