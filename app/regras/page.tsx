"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { getEscudo, filterRegrasIndex } from "@/lib/escudo";
import type { EscudoData } from "@/lib/escudo";
import { RasterIconSvg } from "@/components/ui/RasterIconSvg";
import { RegrasPageSkeleton } from "@/components/skeletons";
import {
  FilterPanel,
  FilterSearchInput,
  FilterResultCount,
} from "@/components/ui/ListFilters";

const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 1000px;
  margin: 0 auto;
  padding-bottom: calc(
    ${({ theme }) => theme.bottomNavHeight} + ${({ theme }) => theme.spacing.xl}
  );
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: 600;
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text};
`;

const Intro = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  line-height: 1.5;
`;

const QuickLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const QuickLink = styled(Link)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-decoration: none;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const Links = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const StyledLink = styled(Link)`
  display: block;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  min-height: 48px;
  font-weight: 500;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const SectionPreview = styled.span`
  display: block;
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.4;
`;

const FeedbackWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin: 0;
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
`;

const FeedbackIcon = styled(RasterIconSvg)`
  width: 80px;
  height: auto;
  display: block;
`;

const FeedbackText = styled.p`
  margin: 0;
  white-space: pre-line;
`;

function FeedbackBlock({
  children,
  showIcon,
}: {
  children: React.ReactNode;
  showIcon?: boolean;
}) {
  return (
    <FeedbackWrapper>
      {showIcon && <FeedbackIcon name="icon-exception" decorative />}
      <FeedbackText>{children}</FeedbackText>
    </FeedbackWrapper>
  );
}

export default function RegrasPage() {
  const [data, setData] = useState<EscudoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    getEscudo()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <RegrasPageSkeleton />;
  if (error)
    return (
      <Page>
        <Title>Regras</Title>
        <FeedbackBlock
          showIcon
        >{`Não foi possível carregar os dados.\n${error}`}</FeedbackBlock>
      </Page>
    );
  if (!data)
    return (
      <Page>
        <Title>Regras</Title>
        <FeedbackBlock showIcon>
          Nenhuma regra disponível no momento.
        </FeedbackBlock>
      </Page>
    );

  const filtered = filterRegrasIndex(data, { texto: busca || undefined });

  return (
    <Page>
      <Title>Regras</Title>
      <Intro>
        Índice do Escudo do Mestre. Use os atalhos abaixo para tabelas e
        glossário.
      </Intro>
      <FilterPanel aria-label="Filtros das regras">
        <FilterSearchInput
          type="search"
          placeholder="Buscar nas regras (seções, tabelas, glossário…)"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar texto nas regras"
        />
        <QuickLinks>
          <QuickLink href="/regras/tabelas">Tabelas</QuickLink>
          <QuickLink href="/regras/glossario">Glossário</QuickLink>
        </QuickLinks>
      </FilterPanel>
      {busca.trim() ? (
        <FilterResultCount>
          {filtered.length === data.index.length
            ? `${filtered.length} seções`
            : `${filtered.length} de ${data.index.length} seções`}
        </FilterResultCount>
      ) : null}
      <Links>
        {filtered.length === 0 ? (
          <FeedbackBlock showIcon>
            {busca.trim()
              ? "Nenhum resultado encontrado."
              : "Nenhuma regra disponível no momento."}
          </FeedbackBlock>
        ) : (
          filtered.map((item) => {
            const section = data.sections.find((s) => s.id === item.id);
            const preview = section?.subsections
              .slice(0, 3)
              .map((sub) => sub.title)
              .join(" · ");
            return (
              <StyledLink key={item.id} href={`/regras/${item.id}`}>
                § {item.id} — {item.title}
                {preview ? <SectionPreview>{preview}</SectionPreview> : null}
              </StyledLink>
            );
          })
        )}
      </Links>
    </Page>
  );
}
