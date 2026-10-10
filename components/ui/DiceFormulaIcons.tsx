"use client";

import styled from "styled-components";
import { DiceIcon } from "@/components/ui/DiceIcon";
import type { ParsedRollFormula } from "@/lib/diceDisplay";

const Row = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  vertical-align: middle;
`;

const Count = styled.span`
  font-size: 0.85em;
  font-weight: 700;
  margin-right: 1px;
`;

const Mod = styled.span`
  font-size: 0.9em;
  font-weight: 600;
  margin-left: 4px;
`;

type DiceFormulaIconsProps = {
  parsed: ParsedRollFormula | null;
  iconSize?: number;
};

export function DiceFormulaIcons({
  parsed,
  iconSize = 20,
}: DiceFormulaIconsProps) {
  if (!parsed?.tokens.length) {
    return <DiceIcon sides={20} size={iconSize} />;
  }

  return (
    <Row>
      {parsed.tokens.map((token, ti) => (
          <Row key={`${ti}-${token.sides}`}>
            {token.count > 1 && <Count>{token.count}×</Count>}
            <DiceIcon sides={token.sides} size={iconSize} />
          </Row>
        ))}
      {parsed.modifier !== 0 && (
        <Mod>
          {parsed.modifier > 0 ? `+${parsed.modifier}` : parsed.modifier}
        </Mod>
      )}
    </Row>
  );
}
