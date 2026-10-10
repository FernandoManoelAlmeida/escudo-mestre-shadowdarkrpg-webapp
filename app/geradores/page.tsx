"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { getTabelasIndex } from "@/lib/tabelas";
import { modulesWithData } from "@/lib/geradoresConfig";

const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 720px;
  margin: 0 auto;
  padding-bottom: calc(
    ${({ theme }) => theme.bottomNavHeight} + ${({ theme }) => theme.spacing.xl}
  );
`;

const Card = styled(Link)`
  display: block;
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  color: inherit;
  text-decoration: none;

  strong {
    display: block;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  span {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
`;

const Intro = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export default function GeradoresPage() {
  const [modules, setModules] = useState<ReturnType<typeof modulesWithData>>([]);

  useEffect(() => {
    getTabelasIndex().then((idx) => setModules(modulesWithData(idx)));
  }, []);

  return (
    <Page>
      <Title>Geradores</Title>
      <Intro>
        Ferramentas de mesa — cada rolagem usa tabelas migradas do vault. Resultados
        não são guardados.
      </Intro>
      {modules.map((mod) => (
        <Card key={mod.slug} href={`/geradores/${mod.slug}`}>
          <strong>{mod.title}</strong>
          <span>{mod.description}</span>
        </Card>
      ))}
      <Card href="/arcanos/itens">
        <strong>Catálogo de itens mágicos</strong>
        <span>Consulta — use Itens mágicos aleatórios para sortear.</span>
      </Card>
      {modules.length === 0 && <p>Carregando módulos…</p>}
    </Page>
  );
}
