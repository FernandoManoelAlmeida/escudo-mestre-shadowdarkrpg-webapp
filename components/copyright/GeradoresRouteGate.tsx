"use client";

import type { ReactNode } from "react";
import { areGeradoresEnabled } from "@/lib/copyrightFreeRoutes";
import { CopyrightFreeRouteGate } from "@/components/copyright/CopyrightFreeRouteGate";

export function GeradoresRouteGate({ children }: { children: ReactNode }) {
  return (
    <CopyrightFreeRouteGate enabled={areGeradoresEnabled()} fallback="/">
      {children}
    </CopyrightFreeRouteGate>
  );
}
