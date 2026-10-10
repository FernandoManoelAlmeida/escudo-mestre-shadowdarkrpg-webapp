"use client";

import styled from "styled-components";

const Card = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.borderHighlight};
  border-radius: ${({ theme }) => theme.borderRadius};
  background: ${({ theme }) => theme.colors.surface};
`;

const Label = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Text = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  line-height: 1.45;
`;

type RollResultCardProps = {
  titulo?: string;
  valor?: string | number;
  texto: string;
};

export function RollResultCard({ titulo, valor, texto }: RollResultCardProps) {
  return (
    <Card>
      {titulo && <Label>{titulo}</Label>}
      {valor !== undefined && <Label>Resultado: {valor}</Label>}
      <Text>{texto}</Text>
    </Card>
  );
}
