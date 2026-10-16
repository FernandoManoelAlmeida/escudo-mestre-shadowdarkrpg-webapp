"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { getTabelasIndex } from "@/lib/tabelas";
import { GERADOR_MODULES, tablesForModule } from "@/lib/geradoresConfig";
import { TableGeneratorModule } from "@/components/geradores/TableGeneratorModule";
import { PageContainer } from "@/components/layout/PageContainer";
import { HistoryBackLink } from "@/components/ui/HistoryBackLink";


type Props = { slug: string };

export function GeradorModuloClient({ slug }: Props) {
  const router = useRouter();
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
    if (slug === "lojas") {
      router.replace("/geradores/lojas");
      return;
    }
    if (slug === "assentamentos") {
      router.replace("/geradores/assentamentos");
      return;
    }
    getTabelasIndex()
      .then((idx) => {
        if (mod) setTables(tablesForModule(mod, idx));
      })
      .finally(() => setLoading(false));
  }, [mod, slug, router]);

  if (
    slug === "encontros" ||
    slug === "pnjs" ||
    slug === "lojas" ||
    slug === "assentamentos"
  ) {
    return <PageContainer><p>Redirecionando…</p></PageContainer>;
  }

  if (!mod) {
    return (
      <PageContainer>
        <p>Módulo não encontrado.</p>
        <HistoryBackLink href="/geradores">← Geradores</HistoryBackLink>
      </PageContainer>
    );
  }

  if (loading) return <PageContainer><p>Carregando…</p></PageContainer>;

  return (
    <TableGeneratorModule
      title={mod.title}
      description={mod.description}
      tables={tables}
    />
  );
}
