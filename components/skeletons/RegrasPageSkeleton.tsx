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

const Title = styled(SkeletonBox)`
  width: 100px;
  height: 1.5rem;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Intro = styled(SkeletonBox)`
  width: 100%;
  height: 0.875rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Search = styled(SkeletonBox)`
  width: 100%;
  height: 44px;
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const QuickLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const LinkItem = styled(SkeletonBox)`
  width: 90px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ListItem = styled.div`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
`;

const ItemLine = styled(SkeletonBox)`
  height: 1rem;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

export function RegrasPageSkeleton() {
  return (
    <Page>
      <Title aria-hidden />
      <Intro aria-hidden />
      <Intro $width="85%" aria-hidden />
      <Search aria-hidden />
      <QuickLinks>
        <LinkItem aria-hidden />
        <LinkItem aria-hidden />
      </QuickLinks>
      <List>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <ListItem key={i}>
            <ItemLine $width={i % 2 === 0 ? "90%" : "75%"} aria-hidden />
          </ListItem>
        ))}
      </List>
    </Page>
  );
}
