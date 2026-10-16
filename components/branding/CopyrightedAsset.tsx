"use client";

import type { ReactNode } from "react";
import { isCopyrightFree } from "@/lib/copyrightFree";

type Props = {
  children: ReactNode;
  /** Se true, mostra filhos só quando COPYRIGHT_FREE=1 (conteúdo TPL-conforme). */
  whenCopyrightFree?: boolean;
};

/**
 * Por defeito: oculta filhos quando COPYRIGHT_FREE=1 (arte/dados fora da TPL).
 * with whenCopyrightFree: mostra só no build conforme (ex. logo Creator Kit).
 */
export function CopyrightedAsset({
  children,
  whenCopyrightFree = false,
}: Props) {
  const free = isCopyrightFree();
  if (whenCopyrightFree) {
    return free ? <>{children}</> : null;
  }
  return free ? null : <>{children}</>;
}
