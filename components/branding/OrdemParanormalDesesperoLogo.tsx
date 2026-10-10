"use client";

import { assetUrl } from "@/lib/basePath";

const VIEWBOX_W = 700;
const VIEWBOX_H = 400;

type OrdemParanormalDesesperoLogoProps = {
  className?: string;
  /** Texto acessível (título dentro do SVG) */
  alt?: string;
};

/**
 * Logo da página inicial como SVG com bitmap lossless embutido por referência.
 * O desenho em si é raster (WebP lossless gerado a partir do PNG original), então
 * não há perda visual; o ficheiro é menor e escala nítido a qualquer tamanho.
 */
export function OrdemParanormalDesesperoLogo({
  className,
  alt = "Ordem Paranormal Desespero",
}: OrdemParanormalDesesperoLogoProps) {
  const href = assetUrl("/logo-ordem-paranormal-desespero.webp");

  return (
    <svg
      className={className}
      viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
      width={VIEWBOX_W}
      height={VIEWBOX_H}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={alt}
    >
      <title>{alt}</title>
      <image
        href={href}
        width={VIEWBOX_W}
        height={VIEWBOX_H}
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}
