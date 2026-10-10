"use client";

import styled from "styled-components";

/** Painel unificado para busca e filtros (grimório, bestiário, regras, geradores). */
export const FilterPanel = styled.section`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const FilterSearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  min-height: 44px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

export const FilterGrid = styled.div<{ $columns?: number; $minWidth?: number }>`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: ${({ $minWidth = 520 }) => $minWidth}px) {
    grid-template-columns: repeat(
      ${({ $columns = 3 }) => $columns},
      minmax(0, 1fr)
    );
  }
`;

/** Linha ordenar + filtros (paridade OPRPG). */
export const FilterSortRow = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  align-items: end;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

export const FilterResultCount = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

export function filteredCountLabel(
  filtered: number,
  total: number,
  labelWhenEqual: string,
  labelWhenFiltered: (filtered: number, total: number) => string,
): string {
  if (filtered === total) return labelWhenEqual;
  return labelWhenFiltered(filtered, total);
}
