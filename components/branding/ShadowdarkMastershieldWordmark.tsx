"use client";

import styled from "styled-components";

const Wordmark = styled.p`
  margin: 0 auto;
  max-width: 100%;
  font-family: "JSL Blackletter", "Times New Roman", serif;
  font-weight: normal;
  letter-spacing: 0.02em;
  line-height: 1.15;
  text-align: center;
  text-transform: none;
  color: ${({ theme }) => theme.colors.text};
`;

const LineShadowdark = styled.span`
  display: block;
  font-size: 52px;
`;

const LineMastershield = styled.span`
  display: block;
  font-size: 72px;
`;

type Props = {
  className?: string;
};

/** Wordmark do build com conteúdo fora da TPL (flag COPYRIGHT_FREE off). */
export function ShadowdarkMastershieldWordmark({ className }: Props) {
  return (
    <Wordmark
      className={className}
      aria-label="Shadowdark Mastershield"
      role="img"
    >
      <LineShadowdark>Shadowdark</LineShadowdark>
      <LineMastershield>Mastershield</LineMastershield>
    </Wordmark>
  );
}
