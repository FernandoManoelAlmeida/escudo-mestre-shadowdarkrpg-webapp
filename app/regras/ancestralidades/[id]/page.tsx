"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAncestralidadeById, type Ancestralidade } from "@/lib/ancestralidades";
import { CatalogoPersonagemDetail } from "@/components/regras/CatalogoPersonagemListPage";

export default function RegrasAncestralidadeDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [entrada, setEntrada] = useState<Ancestralidade | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    getAncestralidadeById(id)
      .then(setEntrada)
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <CatalogoPersonagemDetail
      title="Ancestralidades"
      listPath="/regras/ancestralidades"
      entrada={entrada}
      loading={loading}
    />
  );
}
