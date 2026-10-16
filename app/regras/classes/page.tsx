"use client";

import { useCallback } from "react";
import { getClasses } from "@/lib/classes";
import { CatalogoPersonagemListPage } from "@/components/regras/CatalogoPersonagemListPage";
import { CatalogoPersonagemRouteGate } from "@/components/copyright/CatalogoPersonagemRouteGate";

export default function RegrasClassesPage() {
  const load = useCallback(() => getClasses(), []);
  return (
    <CatalogoPersonagemRouteGate kind="classes">
      <CatalogoPersonagemListPage
        title="Classes"
        basePath="/regras/classes"
        load={load}
        catalogKind="classe"
      />
    </CatalogoPersonagemRouteGate>
  );
}
