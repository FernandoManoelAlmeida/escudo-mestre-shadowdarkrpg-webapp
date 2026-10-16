"use client";

import { assetUrl } from "@/lib/basePath";
import { isCopyrightFree } from "@/lib/copyrightFree";

const VIEWBOX_W = 700;
const VIEWBOX_H = 400;

type ShadowdarkSpotArtLogoProps = {
  className?: string;
  alt?: string;
};

/** Spot art Shadowdark. Fonte: shadowdark.dnddeutsch.de — ver public/icons/src/. */
export function ShadowdarkSpotArtLogo({
  className,
  alt = "Shadowdark RPG",
}: ShadowdarkSpotArtLogoProps) {
  if (isCopyrightFree()) return null;

  const href = assetUrl("/logo-shadowdark-spot-art.webp");

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
