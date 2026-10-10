"use client";

import styled from "styled-components";
import { SkeletonBox } from "@/components/ui/Skeleton";

const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 1000px;
  margin: 0 auto;
`;

const LogoSkeleton = styled(SkeletonBox)`
  width: 100%;
  max-width: 500px;
  aspect-ratio: 4 / 1.5;
  margin: ${({ theme }) => theme.spacing.md} auto;
  display: block;
`;

const DescriptionSkeleton = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Line = styled(SkeletonBox)`
  height: 0.875rem;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const SectionTitle = styled(SkeletonBox)`
  width: 160px;
  height: 1.25rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
`;

const GridItem = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background: ${({ theme }) => theme.colors.surface};
`;

export function HomePageSkeleton() {
  return (
    <Page>
      <LogoSkeleton aria-hidden />

      <DescriptionSkeleton>
        <Line $width="100%" aria-hidden />
        <Line $width="95%" aria-hidden />
        <Line $width="98%" aria-hidden />
        <Line $width="40%" aria-hidden />
      </DescriptionSkeleton>

      <SectionTitle aria-hidden />
      <Grid>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <GridItem key={i}>
            <SkeletonBox
              $width="50%"
              $height="1rem"
              $margin="0 0 0.5rem 0"
              aria-hidden
            />
            <Line $width="100%" aria-hidden />
            <Line $width="85%" aria-hidden />
          </GridItem>
        ))}
      </Grid>
    </Page>
  );
}
