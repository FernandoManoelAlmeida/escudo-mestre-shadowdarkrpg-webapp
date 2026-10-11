"use client";

import styled, { css } from "styled-components";

const Btn = styled.button<{ $variant: "full" | "aside" }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.borderHighlight};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  ${({ $variant }) =>
    $variant === "aside"
      ? css`
          flex: 1 1 auto;
          min-width: 0;
          width: auto;
          height: 32px;
          min-height: 32px;
          padding-top: 0;
          padding-bottom: 0;

          @media (min-width: 520px) {
            flex: 0 0 auto;
            margin-left: auto;
          }
        `
      : css`
          width: 100%;
          min-height: 44px;

          @media (min-width: 520px) {
            width: auto;
            margin-left: auto;
            display: block;
          }
        `}
`;

type Props = {
  onClick: () => void;
  disabled?: boolean;
  variant?: "full" | "aside";
};

export function FilterClearButton({
  onClick,
  disabled,
  variant = "full",
}: Props) {
  return (
    <Btn
      type="button"
      $variant={variant}
      onClick={onClick}
      disabled={disabled}
      aria-label="Limpar filtros"
    >
      Limpar filtros
    </Btn>
  );
}
