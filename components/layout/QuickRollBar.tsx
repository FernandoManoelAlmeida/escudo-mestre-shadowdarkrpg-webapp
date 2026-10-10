"use client";

import { useState } from "react";
import styled from "styled-components";
import { rollFormula, parseFormula, isAllowedDiceSides } from "@/lib/dice";
import { useRollToast } from "@/context/RollToastContext";
import { D20RollButton } from "@/components/ui/D20RollButton";

const Wrap = styled.div`
  position: relative;
  width: 100%;
`;

const RollRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
  width: 100%;
`;

const Input = styled.input`
  flex: 1;
  min-width: 0;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  min-height: 40px;
`;

const Hint = styled.p<{ $floating?: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: ${({ theme }) => theme.spacing.xs} 0 0;
  width: 100%;

  ${({ theme, $floating }) =>
    $floating &&
    `
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 2px;
    width: max-content;
    max-width: 320px;
    padding: 4px 8px;
    background: ${theme.colors.surface};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.borderRadius};
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    z-index: 101;
  `}
`;

type QuickRollBarProps = {
  /** Controlled: valor da fórmula (quando fornecido, usa em vez do state interno). */
  formula?: string;
  /** Controlled: chamado ao alterar o input (quando fornecido junto com formula). */
  onFormulaChange?: (value: string) => void;
  /** Exibir mensagens de validação no fluxo (abaixo do input). Default true no mobile. */
  showHint?: boolean;
  /** Exibir mensagens de validação em popover flutuante (não desloca o layout). Para desktop. */
  hintFloating?: boolean;
};

export function QuickRollBar({
  formula: controlledFormula,
  onFormulaChange,
  showHint = true,
  hintFloating = false,
}: QuickRollBarProps = {}) {
  const [internalFormula, setInternalFormula] = useState("");
  const formula =
    controlledFormula !== undefined ? controlledFormula : internalFormula;
  const setFormula = onFormulaChange ?? setInternalFormula;
  const { addRoll } = useRollToast();

  const parsed = formula ? parseFormula(formula) : null;
  const validFormat = parsed !== null;
  const validDice = validFormat && isAllowedDiceSides(parsed.sides);

  const handleRoll = () => {
    if (!validDice) return;
    const r = rollFormula(formula);
    if (r) addRoll(r);
  };

  const showFeedback = showHint || hintFloating;
  const hintInvalidFormat = formula && !validFormat;
  const hintInvalidDice = formula && validFormat && !validDice;

  return (
    <Wrap>
      <RollRow>
        <Input
          type="text"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRoll();
          }}
          placeholder="ex: 4d8, 2d20+5"
          aria-label="Fórmula de dados"
        />
        <D20RollButton
          size="small"
          onClick={handleRoll}
          aria-label="Rolar dados"
        />
      </RollRow>
      {showFeedback && hintInvalidFormat && (
        <Hint $floating={hintFloating}>
          Fórmula inválida. Use algo como 2d20+5 ou 4d8.
        </Hint>
      )}
      {showFeedback && hintInvalidDice && (
        <Hint $floating={hintFloating}>
          Use apenas dados do jogo: d3, d4, d6, d8, d10, d12, d20, d100.
        </Hint>
      )}
    </Wrap>
  );
}
