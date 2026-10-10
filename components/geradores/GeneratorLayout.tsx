"use client";

import Link from "next/link";
import styled from "styled-components";

const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 720px;
  margin: 0 auto;
  padding-bottom: calc(
    ${({ theme }) => theme.bottomNavHeight} + ${({ theme }) => theme.spacing.xl}
  );
`;

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
    <Page>
      <Back href="/geradores">← Geradores</Back>
      <Title>{title}</Title>
      {description && <Desc>{description}</Desc>}
      {children}
    </Page>
  );
}
