"use client";

import { AntecedentesPage } from "@/components/regras/AntecedentesPage";
import { CatalogoPersonagemRouteGate } from "@/components/copyright/CatalogoPersonagemRouteGate";

export default function RegrasAntecedentesRoute() {
  return (
    <CatalogoPersonagemRouteGate kind="antecedentes">
      <AntecedentesPage />
    </CatalogoPersonagemRouteGate>
  );
}
