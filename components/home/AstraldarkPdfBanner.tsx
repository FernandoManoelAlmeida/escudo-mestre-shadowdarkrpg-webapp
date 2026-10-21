"use client";

import styled from "styled-components";
import { assetUrl } from "@/lib/basePath";

const ASTRALDARK_PDF_URL =
  "https://github.com/FernandoManoelAlmeida/public-rpg-repo/blob/master/SD-RPG/Astraldark%20pt-BR.pdf";

const Wrap = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 0;
  margin: 0;
  padding: ${({ theme }) => theme.spacing.md};
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid ${({ theme }) => theme.colors.borderHighlight};
  /* Mesmo fundo dos restantes cartões da home (grafite do tema) — antes era
     um preto azulado fixo (#03070f) que destoava da paleta do app. */
  background-color: ${({ theme }) => theme.colors.surface};
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
  max-width: 100%;
  height: auto;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
  /* O asset já traz o logótipo claro com fundo transparente (sem invert). */
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
