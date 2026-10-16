import { assetUrl } from "@/lib/basePath";

/**
 * Dimensões intrínsecas de cada ícone WebP em /public/icons.
 * Ícones PWA (192/512) e header: regenerar com `yarn icons:pwa` a partir de public/icons/pwa-icon-source.png.
 * Ícones do app (home/header/PWA) são KEEP em ambos os builds (com e sem COPYRIGHT_FREE).
 */
export const RASTER_ICON_META = {
  "ameacas-icon": { w: 512, h: 512 },
  "header-icon": { w: 50, h: 50 },
  "home-icon": { w: 512, h: 512 },
  "icon-192": { w: 192, h: 192 },
  "icon-512": { w: 512, h: 512 },
  "icon-exception": { w: 512, h: 512 },
  "geradores-icon": { w: 512, h: 512 },
  "itens-magicos-icon": { w: 512, h: 512 },
  "regras-icon": { w: 512, h: 512 },
} as const;

export type RasterIconName = keyof typeof RASTER_ICON_META;

export function rasterIconHref(name: RasterIconName): string {
  return assetUrl(`/icons/${name}.webp`);
}

/** Paths de favicon/PWA (png ou webp). */
export function pwaIconPath(file: string): string {
  return assetUrl(`/icons/${file}`);
}
