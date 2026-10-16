"use client";

import styled from "styled-components";
import { assetUrl } from "@/lib/basePath";
import { diceIconSides } from "@/lib/diceDisplay";
import { isCopyrightFree } from "@/lib/copyrightFree";

const Img = styled.img<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  display: block;
  flex-shrink: 0;
`;

const TextFallback = styled.span<{ $size: number }>`
  font-size: ${({ $size }) => Math.max(10, Math.round($size * 0.55))}px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.02em;
  flex-shrink: 0;
`;

type DiceIconProps = {
  sides: number;
  size?: number;
  className?: string;
};

export function DiceIcon({ sides, size = 20, className }: DiceIconProps) {
  const s = diceIconSides(sides);

  if (isCopyrightFree()) {
    return (
      <TextFallback $size={size} className={className} aria-hidden>
        d{s}
      </TextFallback>
    );
  }

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
