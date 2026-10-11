"use client";

import { useCallback } from "react";
import { getAncestralidades } from "@/lib/ancestralidades";
import { CatalogoPersonagemListPage } from "@/components/regras/CatalogoPersonagemListPage";

export default function RegrasAncestralidadesPage() {
  const load = useCallback(() => getAncestralidades(), []);
  return (
    <CatalogoPersonagemListPage
      title="Ancestralidades"
      basePath="/regras/ancestralidades"
      load={load}
    />
  );
}
