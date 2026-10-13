"use client";

import Link from "next/link";
import styled from "styled-components";
import { PageContainer } from "@/components/layout/PageContainer";


const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: 600;
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
`;

const Intro = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: 0 0 ${({ theme }) => theme.spacing.lg};
  line-height: 1.5;
`;

const QuickLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const QuickLink = styled(Link)`
  display: block;
  flex: 1 1 200px;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  font-weight: 500;
  min-height: 48px;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

export default function ArcanosHubPage() {
  return (
    <PageContainer>
      <Title>Arcanos</Title>
      <Intro>
        Catálogo de itens mágicos e grimório de magias do Shadowdark (livro,
        Astraldark e suplementos).
      </Intro>
      <QuickLinks>
        <QuickLink href="/arcanos/itens">Itens mágicos</QuickLink>
        <QuickLink href="/arcanos/grimorio">Grimório de magias</QuickLink>
      </QuickLinks>
    </PageContainer>
  );
}
