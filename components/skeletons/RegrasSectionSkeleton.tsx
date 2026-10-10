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
  width: 70%;
  height: 1.5rem;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Subsection = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
`;

const Subtitle = styled(SkeletonBox)`
  width: 180px;
  height: 1.125rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Line = styled(SkeletonBox)`
  height: 0.875rem;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export function RegrasSectionSkeleton() {
  return (
    <Page>
      <BackLink aria-hidden />
      <Title aria-hidden />
      <Subsection>
        <Subtitle aria-hidden />
        <Line $width="100%" aria-hidden />
        <Line $width="95%" aria-hidden />
        <Line $width="80%" aria-hidden />
        <Line $width="90%" aria-hidden />
      </Subsection>
      <Subsection>
        <Subtitle aria-hidden />
        <Line $width="100%" aria-hidden />
        <Line $width="70%" aria-hidden />
      </Subsection>
    </Page>
  );
}
