"use client";

import styled from "styled-components";

const RoundButton = styled.button<{ $size?: "default" | "small" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $size }) => ($size === "small" ? "1.5em" : "44px")};
  height: ${({ $size }) => ($size === "small" ? "1.5em" : "44px")};
  padding: 0;
  background: ${({ theme }) => theme.colors.rollButton};
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
  font-size: ${({ theme, $size }) =>
    $size === "small" ? theme.typography.fontSize.xs : theme.typography.fontSize.sm};
  font-weight: 700;
  line-height: 1;

  &:hover {
    background: ${({ theme }) => theme.colors.rollButtonHover};
  }
`;

type D20RollButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "default" | "small";
};

export function D20RollButton({
  "aria-label": ariaLabel,
  size = "default",
  ...props
}: D20RollButtonProps) {
  return (
    <RoundButton
      type="button"
      $size={size}
      aria-label={ariaLabel ?? "Rolar d20"}
      {...props}
    >
      d20
    </RoundButton>
  );
}
