"use client";

import styled from "styled-components";
import { rowAsCells, type RollTableData } from "@/lib/rollTable";

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

export function TabelaRollTableView({ table }: { table: RollTableData }) {
  return (
    <GridTable>
      <thead>
        <tr>
          {table.headers.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {table.rows.map((row, i) => {
          const cells = rowAsCells(row);
          return (
            <tr key={i}>
              {cells.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </GridTable>
  );
}
