"use client";

import styled from "styled-components";
import { SkeletonBox } from "@/components/ui/Skeleton";
import { PageContainer } from "@/components/layout/PageContainer";


const BackLink = styled(SkeletonBox)`
  width: 90px;
  height: 1rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Title = styled(SkeletonBox)`
  width: 120px;
  height: 1.5rem;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const TableBlock = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
`;

const TableTitle = styled(SkeletonBox)`
  width: 200px;
  height: 1.125rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const TableRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

export function RegrasTabelasSkeleton() {
  return (
    <PageContainer>
      <BackLink aria-hidden />
      <Title aria-hidden />
      <TableBlock>
        <TableTitle aria-hidden />
        {[1, 2, 3, 4, 5].map((i) => (
          <TableRow key={i}>
            <SkeletonBox $width="30%" $height="2rem" aria-hidden />
            <SkeletonBox $width="70%" $height="2rem" aria-hidden />
          </TableRow>
        ))}
      </TableBlock>
      <TableBlock>
        <TableTitle aria-hidden />
        {[1, 2, 3, 4].map((i) => (
          <TableRow key={i}>
            <SkeletonBox $width="25%" $height="2rem" aria-hidden />
            <SkeletonBox $width="75%" $height="2rem" aria-hidden />
          </TableRow>
        ))}
      </TableBlock>
    </PageContainer>
  );
}
