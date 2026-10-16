"use client";

import { useCallback } from "react";
import { getAncestralidades } from "@/lib/ancestralidades";
import { CatalogoPersonagemListPage } from "@/components/regras/CatalogoPersonagemListPage";
import { CatalogoPersonagemRouteGate } from "@/components/copyright/CatalogoPersonagemRouteGate";

export default function RegrasAncestralidadesPage() {
  const load = useCallback(() => getAncestralidades(), []);
  return (
    <CatalogoPersonagemRouteGate kind="ancestralidades">
      <CatalogoPersonagemListPage
        title="Ancestralidades"
        basePath="/regras/ancestralidades"
        load={load}
      />
    </CatalogoPersonagemRouteGate>
  );
}
