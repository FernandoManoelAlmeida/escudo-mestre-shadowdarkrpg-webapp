"use client";

import { DiceRollIconButton } from "@/components/ui/DiceRollIconButton";

type D20RollButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "default" | "small";
  formula?: string;
};

export function D20RollButton({
  "aria-label": ariaLabel,
  size = "default",
  formula,
  ...props
}: D20RollButtonProps) {
  return (
    <DiceRollIconButton
      size={size}
      formula={formula}
      rolagem={formula ? undefined : "d20"}
      aria-label={ariaLabel ?? "Rolar d20"}
      {...props}
    />
  );
}
