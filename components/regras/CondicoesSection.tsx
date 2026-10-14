"use client";

import styled from "styled-components";
import type { CondicaoEntrada } from "@/lib/condicoes";

const EntryList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Entry = styled.li`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.5;
`;

const EntryName = styled.span`
  display: block;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const EntryDesc = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
`;

type CondicoesSectionProps = {
  entradas: CondicaoEntrada[];
};

export function CondicoesSection({ entradas }: CondicoesSectionProps) {
  if (entradas.length === 0) {
    return <p>Nenhuma condição disponível.</p>;
  }

  return (
    <EntryList aria-label="Condições">
      {entradas.map((e) => (
        <Entry key={e.id}>
          <EntryName>{e.nome}</EntryName>
          <EntryDesc>{e.descricao}</EntryDesc>
        </Entry>
      ))}
    </EntryList>
  );
}
