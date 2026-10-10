"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { getMagias, getMagiaById, type Magia } from "@/lib/magias";
import {
  formatMagiaClassesGrau,
  formatMagiaOrigensBlock,
} from "@/lib/magiasFormat";
import { MarkdownBody } from "@/components/catalogo/MarkdownBody";

const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 720px;
  margin: 0 auto;
  padding-bottom: calc(
    ${({ theme }) => theme.bottomNavHeight} + ${({ theme }) => theme.spacing.xl}
  );
`;

const MetaBlock = styled.dl`
  margin: ${({ theme }) => theme.spacing.md} 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.5;

  dt {
    font-weight: 600;
    display: inline;
    &::after {
      content: ": ";
    }
  }
  dd {
    display: inline;
    margin: 0;
  }
  div + div {
    margin-top: ${({ theme }) => theme.spacing.xs};
  }
`;

type Props = { id: string };

export function MagiaDetailClient({ id }: Props) {
  const [magia, setMagia] = useState<Magia | null | undefined>(undefined);

  useEffect(() => {
    getMagias().then((data) => {
      setMagia(getMagiaById(data, id) ?? null);
    });
  }, [id]);

  if (magia === undefined) return <Page>Carregando…</Page>;
  if (magia === null)
    return (
      <Page>
        <Link href="/arcanos/grimorio">← Grimório</Link>
        <p>Magia não encontrada.</p>
      </Page>
    );

  const classesGrau = formatMagiaClassesGrau(magia);

  return (
    <Page>
      <Link href="/arcanos/grimorio">← Grimório</Link>
      <h1>{magia.nome}</h1>
      <MetaBlock>
        <div>
          <dt>Origem</dt>
          <dd>{formatMagiaOrigensBlock(magia)}</dd>
        </div>
        {classesGrau ? (
          <div>
            <dt>Grau</dt>
            <dd>{classesGrau}</dd>
          </div>
        ) : null}
        {magia.ritual ? (
          <div>
            <dt>Ritual</dt>
            <dd>sim</dd>
          </div>
        ) : null}
        {magia.duracao ? (
          <div>
            <dt>Duração</dt>
            <dd>{magia.duracao}</dd>
          </div>
        ) : null}
        {magia.alcance ? (
          <div>
            <dt>Alcance</dt>
            <dd>{magia.alcance}</dd>
          </div>
        ) : null}
      </MetaBlock>
      <MarkdownBody>{magia.descricao}</MarkdownBody>
    </Page>
  );
}
