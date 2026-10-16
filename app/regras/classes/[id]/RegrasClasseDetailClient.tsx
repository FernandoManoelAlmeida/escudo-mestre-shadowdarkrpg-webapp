"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getClasseById, type Classe } from "@/lib/classes";
import { CatalogoPersonagemDetail } from "@/components/regras/CatalogoPersonagemListPage";
import { CatalogoPersonagemRouteGate } from "@/components/copyright/CatalogoPersonagemRouteGate";

export default function RegrasClasseDetailClient() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [entrada, setEntrada] = useState<Classe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    getClasseById(id)
      .then(setEntrada)
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <CatalogoPersonagemRouteGate kind="classes">
      <CatalogoPersonagemDetail
        title="Classes"
        listPath="/regras/classes"
        entrada={entrada}
        loading={loading}
        catalogKind="classe"
      />
    </CatalogoPersonagemRouteGate>
  );
}
