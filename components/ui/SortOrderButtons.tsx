"use client";

import styled from "styled-components";
import type { OrdenarSentido, SortOrderValue } from "@/lib/sortOrder";

export type { OrdenarSentido, SortOrderValue };

export type SortOrderField = {
  key: string;
  label: string;
  ascShort: string;
  descShort: string;
  defaultSentido: OrdenarSentido;
  ascAriaLabel: string;
  descAriaLabel: string;
  inactiveAriaLabel: string;
};

const SortLabel = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const OrderGroup = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
  align-items: center;
  min-height: 40px;
`;

const OrderBtn = styled.button<{ $active?: boolean }>`
  padding: 0 ${({ theme }) => theme.spacing.sm};
  height: 32px;
  min-width: 32px;
  background: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.background};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.background : theme.colors.text};
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.primary : theme.colors.border};
  border-radius: 6px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: ${({ theme, $active }) =>
      $active ? theme.colors.primary : theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.borderHighlight};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 0;
`;

type SortOrderButtonsProps = {
  id?: string;
  label?: string;
  fields: SortOrderField[];
  value: SortOrderValue;
  onChange: (next: SortOrderValue) => void;
};

export function SortOrderButtons({
  id = "ordenar-label",
  label = "Ordenar",
  fields,
  value,
  onChange,
}: SortOrderButtonsProps) {
  function handleClick(field: SortOrderField) {
    if (value.por === field.key) {
      onChange({
        por: field.key,
        sentido: value.sentido === "asc" ? "desc" : "asc",
      });
      return;
    }
    onChange({ por: field.key, sentido: field.defaultSentido });
  }

  return (
    <Wrap>
      <SortLabel id={id}>{label}</SortLabel>
      <OrderGroup role="group" aria-labelledby={id}>
        {fields.map((field) => {
          const active = value.por === field.key;
          const display = active
            ? value.sentido === "asc"
              ? field.ascShort
              : field.descShort
            : field.label;
          const ariaLabel = active
            ? value.sentido === "asc"
              ? field.ascAriaLabel
              : field.descAriaLabel
            : field.inactiveAriaLabel;

          return (
            <OrderBtn
              key={field.key}
              type="button"
              $active={active}
              aria-pressed={active}
              aria-label={ariaLabel}
              title={ariaLabel}
              onClick={() => handleClick(field)}
            >
              {display}
            </OrderBtn>
          );
        })}
      </OrderGroup>
    </Wrap>
  );
}

export const SORT_FIELD_NOME: SortOrderField = {
  key: "nome",
  label: "Nome",
  ascShort: "A→Z",
  descShort: "Z→A",
  defaultSentido: "asc",
  ascAriaLabel: "Nome (A → Z)",
  descAriaLabel: "Nome (Z → A)",
  inactiveAriaLabel: "Ordenar por nome; clique para A → Z",
};

export function sortFieldNv(): SortOrderField {
  return {
    key: "nv",
    label: "NV",
    ascShort: "NV ↑",
    descShort: "NV ↓",
    defaultSentido: "desc",
    ascAriaLabel: "NV (menor → maior)",
    descAriaLabel: "NV (maior → menor)",
    inactiveAriaLabel: "Ordenar por NV; clique para maior primeiro",
  };
}

export function sortFieldGrau(): SortOrderField {
  return {
    key: "grau",
    label: "Grau",
    ascShort: "Grau ↑",
    descShort: "Grau ↓",
    defaultSentido: "asc",
    ascAriaLabel: "Grau (menor → maior)",
    descAriaLabel: "Grau (maior → menor)",
    inactiveAriaLabel: "Ordenar por grau; clique para menor primeiro",
  };
}
