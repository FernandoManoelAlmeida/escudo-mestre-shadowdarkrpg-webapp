"use client";

import { DiceRollIconButton } from "@/components/ui/DiceRollIconButton";

type D6RollButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "default" | "small";
};

export function D6RollButton({
  "aria-label": ariaLabel,
  size = "default",
  ...props
}: D6RollButtonProps) {
  return (
    <DiceRollIconButton
      size={size}
      rolagem="d6"
      aria-label={ariaLabel ?? "Rolar d6"}
      {...props}
    />
  );
}
