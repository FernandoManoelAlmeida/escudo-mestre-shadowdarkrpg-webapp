"use client";

import styled from "styled-components";
import { assetUrl } from "@/lib/basePath";
import { diceIconSides } from "@/lib/diceDisplay";

const Img = styled.img<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  display: block;
  flex-shrink: 0;
`;

type DiceIconProps = {
  sides: number;
  size?: number;
  className?: string;
};

export function DiceIcon({ sides, size = 20, className }: DiceIconProps) {
  const s = diceIconSides(sides);
  const src = assetUrl(`/icons/dice/d${s}.svg`);
  return (
    <Img
      $size={size}
      src={src}
      alt=""
      aria-hidden
      className={className}
      draggable={false}
    />
  );
}
