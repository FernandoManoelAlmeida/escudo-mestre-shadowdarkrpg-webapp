"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import {
  getEscudo,
  getSection,
  getTable,
  formatEscudoSectionHeading,
} from "@/lib/escudo";
import type { EscudoData, EscudoTable } from "@/lib/escudo";
import { getTabelaById } from "@/lib/tabelas";
import { rowAsCells, type RollTableRow } from "@/lib/rollTable";
import MarkdownContent from "@/components/ui/MarkdownContent";
import { ResponsiveTable } from "@/components/ui/ResponsiveTable";
import { Accordion } from "@/components/ui/Accordion";
import { RegrasSectionSkeleton } from "@/components/skeletons";
import { PageContainer } from "@/components/layout/PageContainer";
import { CondicoesSection } from "@/components/regras/CondicoesSection";
import { condicoesFromSection } from "@/lib/condicoes";


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
  margin: 0 0 ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.25;
`;

const Subsection = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};

  &:last-child {
    margin-bottom: 0;
  }
`;

const Subtitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: 600;
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ContentWrap = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};

  &:last-child {
    margin-bottom: 0;
  }
`;

const HomebrewNotice = styled.p`
  padding: ${({ theme }) => theme.spacing.md};
  margin: 0 0 ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background: ${({ theme }) => theme.colors.surface};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const FormulaList = styled.ul`
  margin: ${({ theme }) => theme.spacing.sm} 0 0;
  padding-left: 1.25rem;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};

  li {
    margin-top: ${({ theme }) => theme.spacing.xs};
  }
`;

type RegrasSectionClientProps = { sectionId: string };

function rollJsonToEscudo(
  headers: string[],
  rows: RollTableRow[],
): EscudoTable {
  const keys = headers.map((h, i) =>
    h
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/\u0300-\u036f/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "") || `col${i}`,
  );
  return {
    headers,
    rows: rows.map((tableRow) => {
      const cells = rowAsCells(tableRow);
      const row: Record<string, string> = {};
      keys.forEach((k, i) => {
        row[k] = cells[i] ?? "";
      });
      return row;
    }),
  };
}

/** Tabelas de consulta imediata nas secções de regras — sem acordeão. */
const TABLES_ALWAYS_VISIBLE = new Set([
  "testes_e_cds",
  "distancias",
  "teste-encontro",
  "nivel-perigo",
  "xp-tesouro",
]);

function SubsectionTable({ data, tableRef }: { data: EscudoData; tableRef: string }) {
  const alwaysVisible = TABLES_ALWAYS_VISIBLE.has(tableRef);
  const [table, setTable] = useState<EscudoTable | null>(
    () => getTable(data, tableRef) ?? null,
  );

  useEffect(() => {
    const local = getTable(data, tableRef);
    if (local) {
      setTable(local);
      return;
    }
    let cancelled = false;
    getTabelaById(tableRef).then((t) => {
      if (cancelled) return;
      if (!t?.headers?.length || !Array.isArray(t.rows)) return;
      setTable(rollJsonToEscudo(t.headers, t.rows));
    });
    return () => {
      cancelled = true;
    };
  }, [data, tableRef]);

  if (!table) return null;

  if (alwaysVisible) {
    return <ResponsiveTable table={table} />;
  }

  return (
    <Accordion id={`tabela-${tableRef}`} title="Ver tabela">
      <ResponsiveTable table={table} />
    </Accordion>
  );
}

export function RegrasSectionClient({ sectionId }: RegrasSectionClientProps) {
  const [data, setData] = useState<EscudoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEscudo()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <RegrasSectionSkeleton />;

  const section = getSection(data, sectionId);
  if (!section) {
    return (
      <PageContainer>
        <BackLink href="/regras">← Regras</BackLink>
        <Title>§ {sectionId}</Title>
        <p>Seção não encontrada.</p>
      </PageContainer>
    );
  }

  const isCondicoes = sectionId === "7" || section.title === "Condições";
  const condicoes = isCondicoes ? condicoesFromSection(section) : [];

  return (
    <PageContainer>
      <BackLink href="/regras">← Regras</BackLink>
      <Title>{formatEscudoSectionHeading(section)}</Title>
      {section.homebrew ? (
        <HomebrewNotice>
          Homebrew de mesa — confirme com o grupo antes de usar na campanha.
        </HomebrewNotice>
      ) : null}
      {isCondicoes ? (
        <CondicoesSection entradas={condicoes} />
      ) : (
        section.subsections.map((sub) => (
          <Subsection key={sub.id}>
            <Subtitle>{sub.title}</Subtitle>
            {sub.content && (
              <ContentWrap>
                <MarkdownContent>{sub.content}</MarkdownContent>
              </ContentWrap>
            )}
            {sub.formulas && sub.formulas.length > 0 && (
              <FormulaList>
                {sub.formulas.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </FormulaList>
            )}
            {sub.tableRef && (
              <SubsectionTable data={data} tableRef={sub.tableRef} />
            )}
          </Subsection>
        ))
      )}
    </PageContainer>
  );
}
