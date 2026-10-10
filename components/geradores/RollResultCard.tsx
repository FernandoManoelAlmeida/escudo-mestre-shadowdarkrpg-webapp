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
  /** Ex.: d100, 2d6 */
  diceLabel?: string;
  valor?: string | number;
  faixa?: string;
  texto: string;
};

export function RollResultCard({
  titulo,
  diceLabel,
  valor,
  faixa,
  texto,
}: RollResultCardProps) {
  const rollLine =
    valor !== undefined && diceLabel
      ? `Rolagem ${diceLabel}: ${valor}`
      : valor !== undefined
        ? `Resultado: ${valor}`
        : undefined;

  return (
    <Card>
      {titulo && <Label>{titulo}</Label>}
      {rollLine && <Label>{rollLine}</Label>}
      {faixa && <Label>Faixa: {faixa}</Label>}
      <Text>{texto}</Text>
    </Card>
  );
}
