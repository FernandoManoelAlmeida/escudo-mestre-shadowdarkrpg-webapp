"use client";

import type { RasterIconName } from "@/lib/rasterIcons";
import { RASTER_ICON_META, rasterIconHref } from "@/lib/rasterIcons";

export type RasterIconSvgProps = {
  name: RasterIconName;
  className?: string;
  alt?: string;
  /** Se true, trata como decorativo (aria-hidden, role presentation) */
  decorative?: boolean;
};

/**
 * Ícone como SVG com bitmap lossless (WebP) por referência — mesmo padrão do logo da home.
 */
export function RasterIconSvg({
  name,
  className,
  alt = "",
  decorative,
}: RasterIconSvgProps) {
  const { w, h } = RASTER_ICON_META[name];
  const href = rasterIconHref(name);
  const isDecorative = decorative ?? alt === "";

  return (
    <svg
      className={className}
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      xmlns="http://www.w3.org/2000/svg"
      role={isDecorative ? "presentation" : "img"}
      aria-hidden={isDecorative ? true : undefined}
      aria-label={isDecorative ? undefined : alt}
    >
      {!isDecorative ? <title>{alt}</title> : null}
      <image
        href={href}
        width={w}
        height={h}
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}
