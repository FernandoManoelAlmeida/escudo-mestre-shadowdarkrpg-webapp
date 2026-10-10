"use client";

import styled from "styled-components";
import { SkeletonBox } from "@/components/ui/Skeleton";

const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 1000px;
  margin: 0 auto;
  padding-bottom: calc(
    ${({ theme }) => theme.bottomNavHeight} + ${({ theme }) => theme.spacing.xl}
  );
`;

const BackLink = styled(SkeletonBox)`
  width: 90px;
  height: 1rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Title = styled(SkeletonBox)`
  width: 110px;
  height: 1.5rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Search = styled(SkeletonBox)`
  width: 100%;
  height: 44px;
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Item = styled.div`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
`;

const TermLine = styled(SkeletonBox)`
  width: 40%;
  height: 1.125rem;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  display: inline-block;
`;

const DescLine = styled(SkeletonBox)`
  height: 0.875rem;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

export function RegrasGlossarioSkeleton() {
  return (
    <Page>
      <BackLink aria-hidden />
      <Title aria-hidden />
      <Search aria-hidden />
      <List>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Item key={i}>
            <TermLine aria-hidden />
            <DescLine $width="100%" aria-hidden />
            <DescLine $width="85%" aria-hidden />
          </Item>
        ))}
      </List>
    </Page>
  );
}
