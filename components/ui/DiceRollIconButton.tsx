"use client";

import styled from "styled-components";
import { DiceFormulaIcons } from "@/components/ui/DiceFormulaIcons";
import {
  parseDiceTokensFromFormula,
  parseDiceTokensFromRolagem,
  type ParsedRollFormula,
} from "@/lib/diceDisplay";

const RoundButton = styled.button<{ $size?: "default" | "small" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $size }) => ($size === "small" ? "1.75em" : "44px")};
  height: ${({ $size }) => ($size === "small" ? "1.75em" : "44px")};
  padding: 0;
  background: ${({ theme }) => theme.colors.rollButton};
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;

  img {
    filter: brightness(0) invert(1);
  }

  &:hover {
    background: ${({ theme }) => theme.colors.rollButtonHover};
  }
`;

type DiceRollIconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "default" | "small";
  /** Fórmula livre (ex. 2d20+5). */
  formula?: string;
  /** Rolagem de tabela (ex. d100, 2d6 + MOD CAR). */
  rolagem?: string;
  parsed?: ParsedRollFormula | null;
};

function resolveParsed(props: DiceRollIconButtonProps): ParsedRollFormula | null {
  if (props.parsed) return props.parsed;
  if (props.formula) return parseDiceTokensFromFormula(props.formula);
  if (props.rolagem) return parseDiceTokensFromRolagem(props.rolagem);
  return { tokens: [{ count: 1, sides: 20 }], modifier: 0 };
}

export function DiceRollIconButton({
  "aria-label": ariaLabel,
  size = "default",
  formula,
  rolagem,
  parsed: parsedProp,
  ...props
}: DiceRollIconButtonProps) {
  const parsed = resolveParsed({ formula, rolagem, parsed: parsedProp });
  const iconSize = size === "small" ? 16 : 22;

  return (
    <RoundButton
      type="button"
      $size={size}
      aria-label={ariaLabel ?? "Rolar dados"}
      {...props}
    >
      <DiceFormulaIcons parsed={parsed} iconSize={iconSize} />
    </RoundButton>
  );
}
