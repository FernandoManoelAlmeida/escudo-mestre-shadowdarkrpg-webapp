import { theme } from "@/lib/theme";
import type { Theme } from "@/lib/theme";
import type { OrigemCriatura } from "@/lib/ameacas";

/** Shadowdark: ficha usa tema global OSR; origem distingue-se via OrigemBadge. */
export function getCreatureSheetTheme(_origem: OrigemCriatura | null): Theme {
  return theme;
}
