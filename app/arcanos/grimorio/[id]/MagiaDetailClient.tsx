"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { getMagias, getMagiaById, type Magia } from "@/lib/magias";
import { HistoryBackLink } from "@/components/ui/HistoryBackLink";
import {
  formatMagiaClassesGrau,
  formatMagiaOrigensBlock,
} from "@/lib/magiasFormat";
import { MarkdownBody } from "@/components/catalogo/MarkdownBody";
import { PageContainer } from "@/components/layout/PageContainer";


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

  if (magia === undefined) return <PageContainer>Carregando…</PageContainer>;
  if (magia === null)
    return (
      <PageContainer>
        <HistoryBackLink href="/arcanos/grimorio">← Grimório</HistoryBackLink>
        <p>Magia não encontrada.</p>
      </PageContainer>
    );

  const classesGrau = formatMagiaClassesGrau(magia);

  return (
    <PageContainer>
      <HistoryBackLink href="/arcanos/grimorio">← Grimório</HistoryBackLink>
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
    </PageContainer>
  );
}
