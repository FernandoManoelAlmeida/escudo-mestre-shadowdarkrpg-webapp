"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  isCatalogoPersonagemRouteEnabled,
  type CatalogoPersonagemKind,
} from "@/lib/copyrightFreeRoutes";
import { CopyrightFreeRouteGate } from "@/components/copyright/CopyrightFreeRouteGate";

type Props = {
  kind: CatalogoPersonagemKind;
  children: ReactNode;
};

/** Esconde/redireciona catálogo personagem se a lista filtrada estiver vazia. */
export function CatalogoPersonagemRouteGate({ kind, children }: Props) {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    isCatalogoPersonagemRouteEnabled(kind).then((ok) => {
      if (!cancelled) setEnabled(ok);
    });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  if (enabled === null) return null;

  return (
    <CopyrightFreeRouteGate enabled={enabled} fallback="/regras">
      {children}
    </CopyrightFreeRouteGate>
  );
}
