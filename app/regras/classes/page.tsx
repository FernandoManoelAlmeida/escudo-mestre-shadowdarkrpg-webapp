"use client";

import { useCallback } from "react";
import { getClasses } from "@/lib/classes";
import { CatalogoPersonagemListPage } from "@/components/regras/CatalogoPersonagemListPage";

export default function RegrasClassesPage() {
  const load = useCallback(() => getClasses(), []);
  return (
    <CatalogoPersonagemListPage
      title="Classes"
      basePath="/regras/classes"
      load={load}
      catalogKind="classe"
    />
  );
}
