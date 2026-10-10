import type { MetadataRoute } from "next";
import { assetUrl } from "@/lib/basePath";
import { pwaInstallSolidColors } from "@/lib/pwaColors";

export const dynamic = "force-static";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function manifest(): MetadataRoute.Manifest {
  const icons: NonNullable<MetadataRoute.Manifest["icons"]> = [
    {
      src: assetUrl("/icons/icon-192.png"),
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: assetUrl("/icons/icon-512.png"),
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: assetUrl("/icons/icon-192.webp"),
      sizes: "192x192",
      type: "image/webp",
      purpose: "any",
    },
    {
      src: assetUrl("/icons/icon-192.webp"),
      sizes: "192x192",
      type: "image/webp",
      purpose: "maskable",
    },
    {
      src: assetUrl("/icons/icon-512.webp"),
      sizes: "512x512",
      type: "image/webp",
      purpose: "any",
    },
    {
      src: assetUrl("/icons/icon-512.webp"),
      sizes: "512x512",
      type: "image/webp",
      purpose: "maskable",
    },
  ];

  return {
    id: `${base}/`,
    name: "Escudo do Mestre — Shadowdark",
    short_name: "Escudo SD",
    description:
      "Regras, bestiário e geradores do Escudo Shadowdark (Mundo Fraturado).",
    start_url: `${base}/`,
    scope: `${base}/`,
    display: "standalone",
    orientation: "portrait-primary",
    lang: "pt-BR",
    icons,
    /**
     * String única: suportada em todos os UAs que leem o manifest (Android, Chrome desktop,
     * Edge, Samsung, Firefox). Listas com `media` são ignoradas por vários sistemas.
     */
    theme_color: pwaInstallSolidColors.themeColor,
    background_color: pwaInstallSolidColors.backgroundColor,
  };
}
