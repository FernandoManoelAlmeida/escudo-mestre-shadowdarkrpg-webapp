"use client";

import Link from "next/link";
import styled from "styled-components";
import { PageContainer } from "@/components/layout/PageContainer";


const Back = styled(Link)`
  display: inline-block;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-decoration: none;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
`;

const Desc = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: 0 0 ${({ theme }) => theme.spacing.lg};
`;

type GeneratorLayoutProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function GeneratorLayout({
  title,
  description,
  children,
}: GeneratorLayoutProps) {
  return (
    <PageContainer>
      <Back href="/geradores">← Geradores</Back>
      <Title>{title}</Title>
      {description && <Desc>{description}</Desc>}
      {children}
    </PageContainer>
  );
}
