"use client";

import styled from "styled-components";
import type { EscudoTable } from "@/lib/escudo";
import InlineBold from "@/components/ui/InlineBold";
import { DICE_HEADER } from "@/lib/geradoresConfig";

function rowEmpty(row: Record<string, unknown>): boolean {
  return Object.values(row).every((v) => String(v ?? "").trim() === "");
}

function isDiceColumnHeader(label: string): boolean {
  return DICE_HEADER.test(label.trim());
}

const TableWrap = styled.div`
  overflow-x: auto;
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing.md} 0 0;

  @media (max-width: 767px) {
    display: none;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const Th = styled.th`
  text-align: left;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surfaceHover};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-weight: 600;
`;

const Td = styled.td`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const CardsWrap = styled.div`
  display: none;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => theme.spacing.md} 0 0;

  @media (max-width: 767px) {
    display: flex;
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CardRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const CardLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const CardValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
`;

type ResponsiveTableProps = {
  table: EscudoTable;
};

const RollMeta = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
`;

export function ResponsiveTable({ table }: ResponsiveTableProps) {
  const headers = table.headers;
  const rows = (Array.isArray(table.rows) ? table.rows : []).filter(
    (row) => !rowEmpty(row as Record<string, unknown>),
  );
  const colKeys = rows.length
    ? Object.keys(rows[0] as Record<string, unknown>)
    : headers.map((_, i) => `col${i}`);

  const firstHeader = String(headers[0] ?? colKeys[0] ?? "");
  const twoColDiceLayout =
    colKeys.length === 2 && isDiceColumnHeader(firstHeader);
  const resultHeader = String(headers[1] ?? colKeys[1] ?? "Resultado");

  return (
    <>
      <TableWrap>
        <StyledTable>
          <thead>
            <tr>
              {colKeys.map((key, i) => (
                <Th key={key}>
                  <InlineBold>{String(headers[i] ?? key)}</InlineBold>
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {colKeys.map((key) => {
                  const val = (row as Record<string, string | number>)[key];
                  return (
                    <Td key={key}>
                      {typeof val === "number" ? (
                        val
                      ) : (
                        <InlineBold>{String(val ?? "")}</InlineBold>
                      )}
                    </Td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </TableWrap>

      <CardsWrap
        role="region"
        aria-label="Conteúdo da tabela em formato de cartões"
      >
        {twoColDiceLayout && <RollMeta>Rolagem: {firstHeader}</RollMeta>}
        {rows.map((row, i) => {
          const r = row as Record<string, string | number>;
          if (twoColDiceLayout) {
            return (
              <Card key={i}>
                <CardRow>
                  <CardLabel>Faixa</CardLabel>
                  <CardValue>
                    <InlineBold>{String(r[colKeys[0]] ?? "")}</InlineBold>
                  </CardValue>
                </CardRow>
                <CardRow>
                  <CardLabel>{resultHeader}</CardLabel>
                  <CardValue>
                    <InlineBold>{String(r[colKeys[1]] ?? "")}</InlineBold>
                  </CardValue>
                </CardRow>
              </Card>
            );
          }
          return (
            <Card key={i}>
              {colKeys.map((key, colIndex) => {
                const val = r[key];
                const label = headers[colIndex] ?? key;
                return (
                  <CardRow key={key}>
                    <CardLabel>
                      <InlineBold>{String(label)}</InlineBold>
                    </CardLabel>
                    <CardValue>
                      {typeof val === "number" ? (
                        val
                      ) : (
                        <InlineBold>{String(val ?? "")}</InlineBold>
                      )}
                    </CardValue>
                  </CardRow>
                );
              })}
            </Card>
          );
        })}
      </CardsWrap>
    </>
  );
}
