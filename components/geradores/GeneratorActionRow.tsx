"use client";

import Link from "next/link";
import styled from "styled-components";

/** Agrupa botão primário de rolagem e links secundários (regras/tabelas) com respiro claro. */
export const GeneratorActionRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

/** Link auxiliar abaixo do botão — alvo de toque confortável em mesa. */
export const GeneratorSecondaryLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: ${({ theme }) => theme.spacing.xs} 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
`;
