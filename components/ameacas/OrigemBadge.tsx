"use client";

import styled from "styled-components";
import type { OrigemCriatura } from "@/lib/ameacas";

const Badge = styled.span<{ $origem: OrigemCriatura }>`
  display: inline-block;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 8px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textMuted};
  border: 1px solid
    ${({ theme, $origem }) =>
      $origem === "oficial"
        ? theme.colors.badgeOficial
        : theme.colors.badgeHomebrew};
`;

type Props = { origem: OrigemCriatura };

export function OrigemBadge({ origem }: Props) {
  const label = origem === "oficial" ? "Oficial" : "Homebrew";
  return (
    <Badge $origem={origem} aria-label={`Origem: ${origem}`}>
      {label}
    </Badge>
  );
}
