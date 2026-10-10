"use client";

import styled from "styled-components";
import { DiceFormulaIcons } from "@/components/ui/DiceFormulaIcons";
import type { ParsedRollFormula } from "@/lib/diceDisplay";

const Btn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.rollButton};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  min-height: 44px;
  filter: none;

  img {
    filter: brightness(0) invert(1);
  }
`;

type RollButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  parsed: ParsedRollFormula | null;
  label?: string;
};

export function RollButton({
  parsed,
  label = "Rolar",
  children,
  ...props
}: RollButtonProps) {
  return (
    <Btn type="button" {...props}>
      <span>{children ?? label}</span>
      <DiceFormulaIcons parsed={parsed} iconSize={22} />
    </Btn>
  );
}
