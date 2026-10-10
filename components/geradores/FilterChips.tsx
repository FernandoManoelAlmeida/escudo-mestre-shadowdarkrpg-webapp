"use client";

import styled from "styled-components";

const Wrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Chip = styled.button<{ $active?: boolean }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  border-radius: 999px;
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.primary : theme.colors.border};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceHover : theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  min-height: 36px;
`;

type FilterChipsProps<T extends string> = {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
};

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: FilterChipsProps<T>) {
  return (
    <Wrap role="tablist" aria-label="Filtrar tabelas">
      {options.map((o) => (
        <Chip
          key={o.id}
          type="button"
          role="tab"
          aria-selected={value === o.id}
          $active={value === o.id}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </Chip>
      ))}
    </Wrap>
  );
}
