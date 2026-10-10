"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import styled from "styled-components";
import { getTabelasIndex } from "@/lib/tabelas";
import { GERADOR_MODULES, tablesForModule } from "@/lib/geradoresConfig";
import { TableGeneratorModule } from "@/components/geradores/TableGeneratorModule";

const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 720px;
  margin: 0 auto;
`;

export default function GeradorModuloPage() {
  const router = useRouter();
  const params = useParams<{ modulo: string }>();
  const slug = params.modulo;
  const mod = GERADOR_MODULES.find((m) => m.slug === slug);
  const [tables, setTables] = useState<Awaited<ReturnType<typeof getTabelasIndex>>>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug === "encontros") {
      router.replace("/geradores/encontros");
      return;
    }
    if (slug === "pnjs") {
      router.replace("/geradores/pnjs");
      return;
    }
    getTabelasIndex()
      .then((idx) => {
        if (mod) setTables(tablesForModule(mod, idx));
      })
      .finally(() => setLoading(false));
  }, [mod, slug, router]);

  if (slug === "encontros" || slug === "pnjs") {
    return <Page><p>Redirecionando…</p></Page>;
  }

  if (!mod) {
    return (
      <Page>
        <p>Módulo não encontrado.</p>
        <Link href="/geradores">← Geradores</Link>
      </Page>
    );
  }

  if (loading) return <Page><p>Carregando…</p></Page>;

  return (
    <TableGeneratorModule
      title={mod.title}
      description={mod.description}
      tables={tables}
    />
  );
}
