"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type Props = {
  /** false = rota desligada (redirect). */
  enabled: boolean;
  fallback?: string;
  children: ReactNode;
};

/**
 * Com COPYRIGHT_FREE, redireciona rotas sem conteúdo em vez de mostrar página vazia.
 * Export estático: gate no cliente (sem middleware).
 */
export function CopyrightFreeRouteGate({
  enabled,
  fallback = "/regras",
  children,
}: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) {
      router.replace(fallback);
    }
  }, [enabled, fallback, router]);

  if (!enabled) return null;
  return <>{children}</>;
}
