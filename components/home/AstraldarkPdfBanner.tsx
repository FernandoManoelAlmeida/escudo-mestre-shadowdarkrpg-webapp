"use client";

import styled from "styled-components";
import { assetUrl } from "@/lib/basePath";

const ASTRALDARK_PDF_URL =
  "https://github.com/FernandoManoelAlmeida/public-rpg-repo/blob/master/SD-RPG/Astraldark%20pt-BR.pdf";

const Wrap = styled.a`
  display: block;
  max-width: 720px;
  margin: ${({ theme }) => theme.spacing.lg} auto;
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
  transition:
    opacity 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    opacity: 0.95;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Img = styled.img`
  display: block;
  width: 100%;
  height: auto;
`;

export function AstraldarkPdfBanner() {
  const label =
    "Astraldark — Suplemento de Navegação Astral (abre PDF em nova aba)";
  return (
    <Wrap
      href={ASTRALDARK_PDF_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
    >
      <Img
        src={assetUrl("/branding/astraldark-supplement-banner.png")}
        alt={label}
        width={720}
        height={360}
        decoding="async"
      />
    </Wrap>
  );
}
